import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface SendInviteEmailParams {
  to: string
  inviterName: string
  officeName: string
  departmentName: string | null
  inviteUrl: string
}

export async function sendInviteEmail(params: SendInviteEmailParams): Promise<boolean> {
  if (!resend) return false

  const deptLine = params.departmentName ? ` (${params.departmentName} departmanı)` : ''

  try {
    await resend.emails.send({
      from: 'Ofis Uygulaması <noreply@ofisuygulamasi.com>',
      to: params.to,
      subject: `${params.officeName} ofisine davet edildiniz`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
          <h2 style="margin:0 0 16px">Ofis Davetiyesi</h2>
          <p style="margin:0 0 24px;color:#444">
            <strong>${params.inviterName}</strong> sizi
            <strong>${params.officeName}</strong>${deptLine} ofisine davet etti.
          </p>
          <a href="${params.inviteUrl}"
             style="display:inline-block;padding:12px 24px;background:#171717;color:#fff;text-decoration:none;border-radius:6px;font-weight:500">
            Daveti Kabul Et
          </a>
          <p style="margin:24px 0 0;color:#888;font-size:13px">Bu link 7 gün geçerlidir.</p>
        </div>
      `,
    })
    return true
  } catch {
    return false
  }
}
