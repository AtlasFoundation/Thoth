import nodemailer from 'nodemailer'

let transporter: any
async function createEmailer() {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port:
      process.env.EMAIL_PORT !== null &&
      process.env.EMAIL_PORT !== undefined &&
      (process.env.EMAIL_PORT as string)?.length > 0
        ? parseInt(process.env.EMAIL_PORT as string)
        : 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  isHTML: boolean
) {
  if (!transporter || transporter === undefined) {
    createEmailer()
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: isHTML ? '' : text,
    html: isHTML ? text : '',
  })

  console.log('Message sent: %s', info.messageId)
}
