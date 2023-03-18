require('dotenv').config()
const nodemailer = require('nodemailer')

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PSWD
            }
        })
    }

    async send_activation_mail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта на сайте localhost:5000',
            text: '',
            html:
                `
                    <div>
                        <h1>Для активации пройдите по ссылке</h1>
                        <a href="http://localhost:5000/api/activate/${link}/">http://localhost:5000/api/activate/${link}/</a>
                    </div>
                `
        })
    }
}

module.exports = new MailService()