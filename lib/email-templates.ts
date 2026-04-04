export function applicationReceivedTemplate({ fullName, email }: { fullName?: string; email?: string }) {
  const name = fullName || 'Applicant'
  return `
  <html>
    <body style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
      <div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e6e9ee;border-radius:8px;">
        <h2 style="color:#0f172a">Thanks for applying, ${name}.</h2>
        <p>We received your application for Oasis Platform. Our team will review your submission and contact you about next steps.</p>
        <p style="margin-top:18px;font-size:13px;color:#64748b">If you have questions, reply to this email or visit the portal.</p>
        <hr style="margin:18px 0;border:none;border-top:1px solid #eef2ff" />
        <p style="font-size:12px;color:#94a3b8">Oasis Platform — Recruitment &amp; Cohort Management</p>
      </div>
    </body>
  </html>
  `
}

export function interviewScheduledTemplate({ name, slotStart, bookingUrl }: { name?: string; slotStart?: string; bookingUrl?: string }) {
  const n = name || 'Candidate'
  return `
  <html>
    <body style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
      <div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e6e9ee;border-radius:8px;">
        <h2 style="color:#0f172a">Interview scheduled</h2>
        <p>Hi ${n},</p>
        <p>Your interview is scheduled for <strong>${slotStart}</strong>.</p>
        ${bookingUrl ? `<p>Join or view details: <a href="${bookingUrl}">${bookingUrl}</a></p>` : ''}
        <p style="margin-top:18px;font-size:13px;color:#64748b">Please be available 5 minutes before your slot.</p>
        <hr style="margin:18px 0;border:none;border-top:1px solid #eef2ff" />
        <p style="font-size:12px;color:#94a3b8">Oasis Platform — Recruitment &amp; Cohort Management</p>
      </div>
    </body>
  </html>
  `
}

export function evaluationResultTemplate({ fullName, score, assessment }: { fullName?: string; score?: number; assessment?: string }) {
  const name = fullName || 'Applicant'
  return `
  <html>
    <body style="font-family: Inter, Arial, sans-serif; color: #0f172a;">
      <div style="max-width:600px;margin:0 auto;padding:24px;background:#ffffff;border:1px solid #e6e9ee;border-radius:8px;">
        <h2 style="color:#0f172a">Application evaluation</h2>
        <p>Hi ${name},</p>
        <p>Your application has been evaluated. Overall score: <strong>${score ?? 'N/A'}</strong>.</p>
        <p>${assessment ?? ''}</p>
        <p style="margin-top:18px;font-size:13px;color:#64748b">If you have questions about this result, please contact the team.</p>
        <hr style="margin:18px 0;border:none;border-top:1px solid #eef2ff" />
        <p style="font-size:12px;color:#94a3b8">Oasis Platform — Recruitment &amp; Cohort Management</p>
      </div>
    </body>
  </html>
  `
}

export default {
  applicationReceivedTemplate,
  interviewScheduledTemplate,
  evaluationResultTemplate,
}
