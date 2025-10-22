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
      pass: "zhZ40gU7m3"
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
