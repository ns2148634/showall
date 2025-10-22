import dotenv from "dotenv";
dotenv.config();
// /app/api/sendMail/route.ts
import nodemailer from "nodemailer";

export async function POST(req) {
  const { to, subject, html } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "service@showall.tw",
      pass: process.env.MAIL_PASS, // 改用環境變數更安全
    }
  });

  await transporter.sendMail({
    from: '"SHOWALL百業名片網" <service@showall.tw>',
    to,
    subject,
    html
  });

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
