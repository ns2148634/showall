"use client";
import { useState } from "react";

type RewardWithdrawFormProps = {
  availableReward: number;
  email?: string;
  onSubmit?: (form: any) => Promise<any>;
};

const HANDLING_FEE = 30;

export default function RewardWithdrawForm({ availableReward, email = "", onSubmit }: RewardWithdrawFormProps) {
  const [form, setForm] = useState({
    name: "",
    id: "",
    bankCode: "",
    branch: "",
    accountName: "",
    account: "",
    mobile: "",
    email: email,
    amount: "", // 預設空，讓使用者可自填或一鍵填全額
    agree: false,
  });
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleAllAmount() {
    setForm(f => ({
      ...f,
      amount: `${availableReward - HANDLING_FEE > 0 ? availableReward - HANDLING_FEE : 0}`,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitted) return; // 已送出不可重複申請
    if (!form.name || !form.id || !form.bankCode || !form.account || !form.mobile || !form.email || !form.agree) {
      setMsg("請正確填寫所有欄位，並勾選同意所得申報。");
      return;
    }
    const amount = Number(form.amount);
    if (isNaN(amount) || amount > availableReward - HANDLING_FEE || amount <= 0) {
      setMsg("提領金額需大於0且不超過可提領獎勵金！");
      return;
    }

    setMsg("");
    setLoading(true);

    // API 送出
    try {
      if (onSubmit) {
        await onSubmit(form); // 外部 database/API
      } else {
        // 預設 API 範例
        await fetch("/api/withdrawApply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      setSubmitted(true);
      setMsg("申請已送出，預計3-5工作日內匯款。如有問題會Email或電話通知。");
    } catch (err: any) {
      setMsg("申請失敗：" + (err?.message || "請稍後再試"));
    }
    setLoading(false);
  }

  const disabled = submitted || loading;

  if (availableReward <= HANDLING_FEE) {
    return (
      <div className="bg-red-50 border border-red-200 rounded p-5 text-center text-red-700 font-bold">
        可提領金額不足（需超過 {HANDLING_FEE} 元手續費），暫無法申請提領。
      </div>
    );
  }

  return (
    <form className="space-y-5 bg-white rounded-lg p-6 shadow max-w-lg mx-auto mt-8" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold text-center mb-3">提領推薦回饋金</h2>
      <div className="text-sm text-red-600 mb-2">
        每次提領需扣除匯款手續費 <span className="font-bold">{HANDLING_FEE}元</span>，並須申報個人所得稅。
      </div>
      <div className="font-bold mb-3">
        可提領總額：<span className="text-blue-700">{availableReward} 元</span>
        （扣除手續費：剩 <span className="text-red-600">{availableReward - HANDLING_FEE}</span> 元可申請）
      </div>
      <div>
        <label className="block mb-1 font-medium">真實姓名 <span className="text-red-500">*</span></label>
        <input type="text" name="name" required value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">身分證字號 <span className="text-red-500">*</span></label>
        <input type="text" name="id" required value={form.id} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={10} disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">銀行代碼（三碼）<span className="text-red-500">*</span></label>
        <input type="text" name="bankCode" required value={form.bankCode} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={3} pattern="^[0-9]{3}$" disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">分行名稱/帳戶名稱（選填）</label>
        <input type="text" name="branch" value={form.branch} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20} disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">銀行帳號 <span className="text-red-500">*</span></label>
        <input type="text" name="account" required value={form.account} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20} disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">手機號碼 <span className="text-red-500">*</span></label>
        <input type="text" name="mobile" required value={form.mobile} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20} disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">Email <span className="text-red-500">*</span></label>
        <input type="email" name="email" required value={form.email} readOnly className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-400" disabled={disabled}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">提領金額 <span className="text-red-500">*</span></label>
        <div className="flex gap-2">
          <input
            type="number"
            name="amount"
            required
            min="1"
            max={availableReward - HANDLING_FEE}
            value={form.amount}
            onChange={handleChange}
            className="border rounded px-3 py-2 w-full"
            disabled={disabled}
          />
          <button
            type="button"
            className="py-2 px-4 bg-blue-100 text-blue-700 font-bold rounded hover:bg-blue-200 transition"
            onClick={handleAllAmount}
            disabled={disabled}
          >填全額</button>
        </div>
        <div className="text-sm text-gray-500 mt-1">不可超過可提領金額（已扣手續費）</div>
      </div>
      <div className="flex items-center py-3">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} id="agree" className="mr-2" disabled={disabled}/>
        <label htmlFor="agree" className="text-sm text-gray-800">同意個人資料送交並申報所得稅（必勾）</label>
      </div>
      <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded font-bold text-lg mt-2" disabled={disabled || loading}>
        {submitted ? "已送出" : loading ? "送出中..." : "申請提領"}
      </button>
      {msg && <div className="mt-4 text-center font-bold text-green-700">{msg}</div>}
      {submitted && (
        <div className="mt-4 text-center font-bold text-green-700">
          申請已送出，預計3-5工作日內匯款（如有問題會Email或電話通知）。
        </div>
      )}
    </form>
  );
}
