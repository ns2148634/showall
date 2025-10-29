// /app/pay-success/page.jsx
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Suspense } from "react";
import PaySuccessClient from "./PaySuccessClient";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
export default function PaySuccessPage() {
  return (
    <Suspense>
      <PaySuccessClient />
    </Suspense>
  );
}
export default function PaySuccessPage() {
  const searchParams = useSearchParams();
  const card_id = searchParams.get('card_id');
  const [status, setStatus] = useState('loading');
  const [card, setCard] = useState(null);

  useEffect(() => {
    if (!card_id) return setStatus('no-id');
    const fetchPaymentStatus = async () => {
      // 根據你的表設計查 payment 或 card table
      const { data, error } = await supabase
        .from('card')
        .select('id, name, opay_trade_no')
        .eq('id', card_id)
        .single();
      if (error || !data) return setStatus('not-found');
      setCard(data);
      setStatus(data.opay_trade_no ? 'paid' : 'pending');
    };
    fetchPaymentStatus();
  }, [card_id]);

  return (
    <main className="max-w-lg mx-auto p-8">
      <h1 className="text-3xl mb-6">感謝您的付款！</h1>
      {!card_id && <div>缺少訂單資訊，請確認付款流程。</div>}
      {status === 'loading' && <div>查詢付款狀態中...</div>}
      {status === 'no-id' && <div>缺少 card_id 參數。</div>}
      {status === 'not-found' && <div>找不到對應名片或訂單。</div>}
      {status === 'pending' && (
        <div>
          <p>付款成功資料尚未同步，請稍待 1~2 分鐘後再刷新頁面或聯絡客服。</p>
        </div>
      )}
      {status === 'paid' && card && (
        <div>
          <p>
            已完成付款，交易序號：
            <b className="ml-2">{card.opay_trade_no}</b>
          </p>
          <p className="mt-4">相關名片／服務將在審核後自動上線！如有問題請聯絡客服。</p>
        </div>
      )}
    </main>
  );
}
