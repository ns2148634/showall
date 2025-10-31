"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ⚠️ 請改成自己的密碼
const ADMIN_PASSWORD = "nhpelomf5137";

type Payment = {
  id: number;
  card_id: number;
  email: string;
  amount: number;
  code: string;
  time: string;
  receipt_url?: string;
  status: string;
  created_at: string;
};

type Card = {
  id: number;
  name?: string;
  email?: string;
  published: boolean;
  payment_status?: string;
  created_at?: string;
  payments?: Payment[];
};

export default function AdminCardsPage() {
  const [authed, setAuthed] = useState(false);
  const [inputPass, setInputPass] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authed) {
      fetchAllCards();
    }
  }, [authed]);

  async function fetchAllCards() {
    const { data } = await supabase
      .from('cards')
      .select('*, payments:payments(*)')
      .order('created_at', { ascending: false });
    setCards(data as Card[] || []);
  }

  async function approveCard(cardId: number) {
    if (!confirm('確定要讓這張名片上線嗎？')) return;
    setLoading(true);
    const { error } = await supabase
      .from('cards')
      .update({ published: true })
      .eq('id', cardId);
    setLoading(false);
    if (error) {
      alert('審查通過失敗');
    } else {
      alert('✅ 名片已上線');
      fetchAllCards();
    }
  }

  async function confirmPayment(cardId: number, paymentId?: number) {
    setLoading(true);
    const { error: cardErr } = await supabase
      .from('cards')
      .update({ payment_status: 'confirmed' })
      .eq('id', cardId);

    let paymentErr = null;
    if (paymentId) {
      const { error: pe } = await supabase
        .from('payments')
        .update({ status: 'confirmed' })
        .eq('id', paymentId);
      paymentErr = pe;
    }
    setLoading(false);

    if (cardErr || paymentErr) {
      alert('收款確認失敗');
    } else {
      alert('收款狀態已設為 confirmed');
      fetchAllCards();
    }
  }

  async function deleteCard(cardId: number) {
    if (!confirm('確定要刪除此名片？')) return;
    setLoading(true);
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId);
    setLoading(false);
    if (error) {
      alert('刪除失敗');
    } else {
      alert('已刪除');
      fetchAllCards();
    }
  }

  // 登入介面
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">後台管理登入</h1>
          <input
            type="password"
            className="border rounded px-4 py-3 w-full mb-4"
            placeholder="輸入管理密碼"
            value={inputPass}
            onChange={e => setInputPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setAuthed(inputPass === ADMIN_PASSWORD)}
          />
          <button
            onClick={() => {
              if (inputPass === ADMIN_PASSWORD) {
                setAuthed(true);
              } else {
                alert('❌ 密碼錯誤');
              }
            }}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            登入
          </button>
        </div>
      </div>
    );
  }

  // 名片管理頁面
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">名片管理</h1>
          <button
            onClick={() => setAuthed(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            登出
          </button>
        </div>
        {cards.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            目前沒有名片資料
          </div>
        )}
        <div className="space-y-4">
          {cards.map(card => (
            <div key={card.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">姓名</div>
                  <div className="font-bold">{card.name || "(未填)"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-bold">{card.email || "(未填)"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">狀態</div>
                  <div className="font-bold">{card.published ? "已上線" : "待審核"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">付款狀態</div>
                  <div className="font-bold">{card.payment_status || "未付款"}</div>
                </div>
                {/* Payment 區塊有 join 才顯示 */}
                {card.payments && card.payments.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600">匯款金額</div>
                    <div className="font-bold">{card.payments[0].amount} 元</div>
                  </div>
                )}
                {card.payments && card.payments.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600">匯款帳號後五碼</div>
                    <div className="font-bold">{card.payments[0].code}</div>
                  </div>
                )}
                {card.payments && card.payments.length > 0 && card.payments[0].receipt_url && (
                  <div>
                    <div className="text-sm text-gray-600">匯款憑證</div>
                    <a
                      href={card.payments[0].receipt_url}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      查看圖片
                    </a>
                  </div>
                )}
              </div>
              {/* 操作按鈕 */}
              <div className="flex gap-3">
                <button
                  onClick={() => approveCard(card.id)}
                  disabled={loading || card.published}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  上架
                </button>
                <button
                  onClick={() => confirmPayment(
                    card.id,
                    card.payments && card.payments.length > 0 ? card.payments[0].id : undefined
                  )}
                  disabled={loading || !card.payments || card.payment_status === 'confirmed'}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                >
                  收款確認
                </button>
                <button
                  onClick={() => deleteCard(card.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  刪除
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
