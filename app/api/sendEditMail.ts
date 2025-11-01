// pages/api/sendEditMail.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer";

// 你的 Supabase 連線 config
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, slug } = req.body;
  if (!to || !slug) return res.status(400).json({ error: "缺少 email 或 slug" });

  // 1. 產生唯一 token
  const token = nanoid(32);
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24H
  const expires_at = expires.toISOString();

  // 2. 保存在 edit_tokens 表
  await supabase.from("edit_tokens").insert([{
    token,
    card_slug: slug,
    email: to,
    used: false,
    created_at: now.toISOString(),
    expires_at
  }]);

  // 3. 修改連結
  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/edit-card?token=${token}`;

  // 4. 寄信
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"SHOWALL名片+" <${process.env.MAIL_USER}>`,
    to,
    subject: "SHOWALL 名片修改連結",
    html: `
      <div style="font-family:Arial;">
        <h2 style="color:#2563eb;">名片資料修改申請</h2>
        <p>請點擊下方連結進行名片資料編輯，連結僅限使用一次且有效期 24 小時：</p>
        <a href="${link}" style="font-size:18px;color:#1868ca;">點擊開始編輯</a>
        <div style="margin-top:16px;color:#666;font-size:13px;">如非本人操作請忽略本信。</div>
        <div style="color:#999;font-size:12px;">有效期限至 ${expires.toLocaleString()}</div>
      </div>
    `
  });

  return res.status(200).json({ success: true });
}
