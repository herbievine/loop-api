import nodemailer from 'nodemailer'

export const sendEmail = async (to: string, token: string) => {
    // const account = await nodemailer.createTestAccount()

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'ztenzk7x3low7mhh@ethereal.email',
            pass: 'rEz7bNRDDNuEqdmYDk'
        }
    })

    const info = await transporter.sendMail({
        from: "'Reset password' <email@test.com>",
        to,
        subject: 'Reset password',
        html: `<a href="http://localhost:4000/recovery/${token}">reset</a>`
    })

    console.log(info.messageId)
    console.log(nodemailer.getTestMessageUrl(info))
}
