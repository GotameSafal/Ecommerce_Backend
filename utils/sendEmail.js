import nodemailer from "nodemailer"
export const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth:{
            email:process.env.SMTP_MAIL,
            pass : process.env.SMTP_PASS
        }
    })
    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        message:options.message
    }
    await transporter.sendMail(mailOptions)
}