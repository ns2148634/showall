"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// ⚠️ 改成你自己的密碼
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

export default function AdminPaymentsPage() {
  const [authed, setAuthed] = useState(false);
  const [inputPass, setInputPass] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authed) {
      fetchPendingPayments();
    }
  }, [authed]);

  async function fetchPendingPayments() {
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    setPayments(data || []);
  }

  async function approvePayment(payment: Payment) {
    if (!confirm(`確認審核通過？\nEmail: ${payment.email}\n金額: ${payment.amount}`)) return;

    setLoading(true);

    try {
      // 1. 更新 card 為已發佈
      await supabase
        .from('cards')
        .update({ published: true })
        .eq('id', payment.card_id);

      // 2. 更新 payment 狀態
      await supabase
        .from('payments')
        .update({ status: 'completed' })
        .eq('id', payment.id);

      // 3. 更新 referral 狀態（如果有推薦人）
      await supabase
        .from('referrals')
        .update({ status: 'completed' })
        .eq('referee_card_id', payment.card_id);

      alert('✅ 審核完成！名片已上線');
      fetchPendingPayments(); // 重新載入列表
    } catch (err) {
      console.error(err);
      alert('❌ 審核失敗');
    } finally {
      setLoading(false);
    }
  }

  async function rejectPayment(payment: Payment) {
    if (!confirm(`確認拒絕此筆付款？\nEmail: ${payment.email}`)) return;

    await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', payment.id);

    alert('已拒絕');
    fetchPendingPayments();
  }

  // 未登入顯示密碼輸入頁面
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

  // 已登入顯示付款審核頁面
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">付款審核</h1>
          <button
            onClick={() => setAuthed(false)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            登出
          </button>
        </div>
        
        {payments.length === 0 && (
          <div className="text-center text-gray-500 py-10">
            目前沒有待審核的付款
          </div>
        )}

        <div className="space-y-4">
          {payments.map(payment => (
            <div key={payment.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-bold">{payment.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">金額</div>
                  <div className="font-bold">{payment.amount} 元</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">帳號後五碼</div>
                  <div className="font-bold">{payment.code}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">匯款時間</div>
                  <div className="font-bold">{new Date(payment.time).toLocaleString('zh-TW')}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">提交時間</div>
                  <div>{new Date(payment.created_at).toLocaleString('zh-TW')}</div>
                </div>
                {payment.receipt_url && (
                  <div>
                    <div className="text-sm text-gray-600">匯款憑證</div>
                    <a 
                      href={payment.receipt_url} 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                    >
                      查看圖片
                    </a>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => approvePayment(payment)}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  ✅ 審核通過
                </button>
                <button
                  onClick={() => rejectPayment(payment)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  ❌ 拒絕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
