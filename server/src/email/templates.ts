import type { Email } from './mailer.js'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

// Inline styles only: most email clients ignore <style> blocks
function layout({ heading, body, cta, url }: { heading: string; body: string; cta: string; url: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f4ede4;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#25252b">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:8px;padding:32px">
      <tr><td>
        <h1 style="margin:0 0 16px;font-size:22px">${heading}</h1>
        <p style="margin:0 0 24px;line-height:1.5">${body}</p>
        <a href="${url}" style="display:inline-block;padding:12px 20px;background:#8b2222;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600">${cta}</a>
        <p style="margin:24px 0 0;font-size:13px;color:#6b6b73;line-height:1.5">
          Or paste this link into your browser:<br><a href="${url}" style="color:#6b6b73;word-break:break-all">${url}</a>
        </p>
        <p style="margin:16px 0 0;font-size:13px;color:#6b6b73">This link expires in 1 hour. If you didn't request it, you can ignore this email.</p>
      </td></tr>
    </table>
  </body>
</html>`
}

export function verifyEmailTemplate({ to, name, url }: { to: string; name: string; url: string }): Email {
  return {
    to,
    subject: 'Verify your email for Mice & Mystics',
    text: `Hi ${name},\n\nConfirm your email address to finish creating your account:\n${url}\n\nThis link expires in 1 hour.`,
    html: layout({
      heading: `Welcome, ${escapeHtml(name)}!`,
      body: 'Confirm your email address to finish creating your Mice &amp; Mystics account.',
      cta: 'Verify email',
      url,
    }),
  }
}

export function resetPasswordTemplate({ to, name, url }: { to: string; name: string; url: string }): Email {
  return {
    to,
    subject: 'Reset your Mice & Mystics password',
    text: `Hi ${name},\n\nUse this link to choose a new password:\n${url}\n\nThis link expires in 1 hour. If you didn't ask for this, ignore this email.`,
    html: layout({
      heading: 'Reset your password',
      body: `Hi ${escapeHtml(name)}, use the button below to choose a new password.`,
      cta: 'Choose a new password',
      url,
    }),
  }
}
