import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { to, subject, html } = await req.json();

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "service@showall.tw",
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: '"SHOWALL名片+" <service@showall.tw>',
    to,
    subject,
    html,
  });

  return Response.json({ ok: true });
}
