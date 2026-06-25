import { Resend } from 'resend'

let _resend: Resend | null = null
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!)
  return _resend
}

export async function sendWelcomeEmail({
  to,
  name,
  slug,
  raceName,
  goalTime,
}: {
  to: string
  name: string
  slug: string
  raceName: string
  goalTime: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://racepace.com'
  const campaignUrl = `${appUrl}/r/${slug}`
  const dashboardUrl = `${appUrl}/dashboard`
  const firstName = name.split(' ')[0]

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Welcome to RacePace</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#0d0d0d;color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-weight:300;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding:0 0 40px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0;font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;letter-spacing:0.08em;color:#ffffff;">
              RACE<span style="color:#b8ff57;">PACE</span>
            </p>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:48px 0 32px 0;">
            <p style="margin:0 0 12px 0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b8ff57;">${raceName}</p>
            <h1 style="margin:0 0 24px 0;font-family:'Bebas Neue',Arial,sans-serif;font-size:52px;line-height:0.95;letter-spacing:0.02em;color:#ffffff;">
              YOU'RE IN,<br/><span style="color:#b8ff57;">${firstName.toUpperCase()}.</span>
            </h1>
            <p style="margin:0;font-size:16px;line-height:1.8;color:#888888;max-width:420px;">
              Welcome to RacePace. Your campaign is set up and your goal time of
              <strong style="color:#ffffff;font-weight:400;">${goalTime}</strong> is locked in.
              Now go train like your supporters' money depends on it — because it does.
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="height:1px;background:rgba(255,255,255,0.08);"></td></tr>

        <!-- Stats -->
        <tr>
          <td style="padding:32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding-right:16px;">
                  <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888888;">Your goal time</p>
                  <p style="margin:0;font-family:'Bebas Neue',Arial,sans-serif;font-size:32px;color:#b8ff57;">${goalTime}</p>
                </td>
                <td width="50%">
                  <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#888888;">Your race</p>
                  <p style="margin:0;font-family:'Bebas Neue',Arial,sans-serif;font-size:20px;color:#ffffff;line-height:1.2;">${raceName}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="height:1px;background:rgba(255,255,255,0.08);"></td></tr>

        <!-- Next steps -->
        <tr>
          <td style="padding:32px 0;">
            <p style="margin:0 0 20px 0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b8ff57;">What happens next</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['01', 'Complete your bank setup', 'If you haven\'t finished Stripe onboarding yet, complete it so payouts can land on race day.'],
                ['02', 'Share your campaign link', `Send ${campaignUrl} to friends, family, and anyone who believes in you.`],
                ['03', 'Train. Track. Update.', 'Keep your supporters in the loop. Every update reminds them their money is on the line.'],
                ['04', 'Cross the line', 'Payouts happen within 24 hours of official results. Hit your goal, collect everything.'],
              ].map(([num, title, body]) => `
              <tr>
                <td style="padding:0 0 20px 0;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="40" valign="top">
                        <p style="margin:0;font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;color:rgba(255,255,255,0.08);line-height:1;">${num}</p>
                      </td>
                      <td valign="top">
                        <p style="margin:0 0 4px 0;font-size:14px;font-weight:500;color:#ffffff;">${title}</p>
                        <p style="margin:0;font-size:13px;line-height:1.7;color:#888888;">${body}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`).join('')}
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="height:1px;background:rgba(255,255,255,0.08);"></td></tr>

        <!-- CTAs -->
        <tr>
          <td style="padding:32px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${campaignUrl}" style="display:inline-block;padding:14px 28px;background:#b8ff57;color:#0d0d0d;font-family:'DM Sans',Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;">View my campaign</a>
                </td>
                <td>
                  <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;background:transparent;color:#ffffff;font-family:'DM Sans',Arial,sans-serif;font-size:12px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;text-decoration:none;border:1px solid rgba(255,255,255,0.2);">Go to dashboard</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Quote -->
        <tr>
          <td style="padding:32px;background:#111111;border-left:2px solid #b8ff57;margin-bottom:32px;">
            <p style="margin:0 0 8px 0;font-size:16px;line-height:1.8;color:#ffffff;font-style:italic;font-weight:300;">"The accountability wasn't a side effect. It was the whole point."</p>
            <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#b8ff57;">— Floris van Katwijk, Founder RacePace</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:32px 0 0 0;border-top:1px solid rgba(255,255,255,0.08);">
            <p style="margin:0 0 8px 0;font-family:'Bebas Neue',Arial,sans-serif;font-size:20px;letter-spacing:0.08em;">RACE<span style="color:#b8ff57;">PACE</span></p>
            <p style="margin:0;font-size:12px;color:#888888;">© 2026 RacePace — Amsterdam · <a href="mailto:hello@racepace.com" style="color:#888888;">hello@racepace.com</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return getResend().emails.send({
    from: 'RacePace <hello@racepace.com>',
    to,
    subject: `You're in, ${firstName}. Now go train.`,
    html,
  })
}
