import { NextRequest } from 'next/server';
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import nodemailer from "nodemailer";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function POST(req: NextRequest) {
  const { to, slug } = await req.json();
  if (!to || !slug) {
    return new Response(JSON.stringify({ error: "缺少 email 或 slug" }), { status: 400 });
  }

  // 產生 token
  const token = nanoid(32);
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const expires_at = expires.toISOString();

  await supabase.from("edit_tokens").insert([{
    token,
    card_slug: slug,
    email: to,
    used: false,
    created_at: now.toISOString(),
    expires_at
  }]);

  const link = `${process.env.NEXT_PUBLIC_BASE_URL}/edit-card?token=${token}`;
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

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
