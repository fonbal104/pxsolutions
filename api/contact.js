// Vercel serverless function: verifies reCAPTCHA, then sends mail through Resend
import { Resend } from 'resend'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { name, email, phone = '', message, token } = req.body || {}
  if (!name || !email || !message || !token) return res.status(400).json({ error: 'invalid' })
  const v = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET, response: token })
  }).then(r => r.json())
  if (!v.success) return res.status(400).json({ error: 'captcha' })
  const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: process.env.MAIL_FROM, to: 'info@pxsolutions.co.jp', replyTo: email,
    subject: `【お問い合わせ】${name}様`,
    text: `お名前: ${name}\nメール: ${email}\n電話: ${phone}\n\n${message}`
  })
  if (error) return res.status(500).json({ error: 'send' })
  res.json({ ok: true })
}
