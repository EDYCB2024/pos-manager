import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function test() {
    await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "edcastilloblanco@gmail.com",
        subject: "Prueba email",
        text: "Si recibes esto, SMTP funciona."
    });

    console.log("Email enviado");
}

test();