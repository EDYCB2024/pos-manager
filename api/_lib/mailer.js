import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendActivationEmail(email, name, token) {
    const activationLink = `${process.env.APP_URL || 'https://tuapp.com'}/activate?token=${token}`;

    const mailOptions = {
        from: `"POS Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Activa tu cuenta en POS Manager',
        text: `Hola ${name},\n\nActiva tu cuenta aquí: ${activationLink}\n\nEste link expira en 1 hora.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Bienvenido a POS Manager</h2>
                <p>Hola <strong>${name}</strong>,</p>
                <p>Se ha creado una cuenta para ti. Para activarla y configurar tu contraseña, haz clic en el siguiente botón:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activar mi cuenta</a>
                </div>
                <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p><a href="${activationLink}">${activationLink}</a></p>
                <p>Este enlace expirará en 1 hora.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #666;">Si no esperabas este correo, puedes ignorarlo.</p>
            </div>
        `,
    };

    return transporter.sendMail(mailOptions);
}
