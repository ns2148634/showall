"use client";
import { useState } from "react";

type RewardWithdrawFormProps = {
  availableReward: number; // 可提領金額，外部傳入
  onSubmit?: (form: any) => void; // API串接用（可選）
};

const HANDLING_FEE = 30;

export default function RewardWithdrawForm({ availableReward, onSubmit }: RewardWithdrawFormProps) {
  const [form, setForm] = useState({
    name: "",
    id: "",
    bankCode: "",
    branch: "",
    accountName: "",
    account: "",
    mobile: "",
    email: "",
    amount: availableReward - HANDLING_FEE > 0 ? availableReward - HANDLING_FEE : 0,
    agree: false,
  });
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // 基礎檢查
    if (!form.name || !form.id || !form.bankCode || !form.account || !form.mobile || !form.email || !form.agree) {
      setMsg("請正確填寫所有欄位，並勾選同意所得申報。");
      return;
    }
    if (Number(form.amount) > availableReward - HANDLING_FEE || Number(form.amount) <= 0) {
      setMsg("提領金額需大於0且不超過可提領獎勵金！");
      return;
    }
    setMsg("");
    setSubmitted(true);
    // 送出資料給父層/onSubmit
    if (onSubmit) onSubmit(form);
    // TODO: 這裡可API串接
  }

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
        <input type="text" name="name" required value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block mb-1 font-medium">身分證字號 <span className="text-red-500">*</span></label>
        <input type="text" name="id" required value={form.id} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={10}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">銀行代碼（三碼）<span className="text-red-500">*</span></label>
        <input type="text" name="bankCode" required value={form.bankCode} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={3}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">分行名稱/帳戶名稱（選填）</label>
        <input type="text" name="branch" value={form.branch} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">銀行帳號 <span className="text-red-500">*</span></label>
        <input type="text" name="account" required value={form.account} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">手機號碼 <span className="text-red-500">*</span></label>
        <input type="text" name="mobile" required value={form.mobile} onChange={handleChange} className="border rounded px-3 py-2 w-full" maxLength={20}/>
      </div>
      <div>
        <label className="block mb-1 font-medium">Email <span className="text-red-500">*</span></label>
        <input type="email" name="email" required value={form.email} onChange={handleChange} className="border rounded px-3 py-2 w-full"/>
      </div>
      <div>
        <label className="block mb-1 font-medium">提領金額 <span className="text-red-500">*</span></label>
        <input
          type="number"
          name="amount"
          required
          min="1"
          max={availableReward - HANDLING_FEE}
          value={form.amount}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
        <div className="text-sm text-gray-500 mt-1">不可超過可提領金額（已扣手續費）</div>
      </div>
      <div className="flex items-center py-3">
        <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} id="agree" className="mr-2"/>
        <label htmlFor="agree" className="text-sm text-gray-800">同意個人資料送交並申報所得稅（必勾）</label>
      </div>
      <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded font-bold text-lg mt-2">
        申請提領
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
