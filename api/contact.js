export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  try {
    const { name, email, type, message, website } = req.body || {};

    // Campo trampa para bots. Una persona normal nunca lo completa.
    if (website) {
      return res.status(200).json({ ok: true });
    }

    if (!name || !email || !type || !message) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios"
      });
    }

    const cleanName = String(name).trim().slice(0, 100);
    const cleanEmail = String(email).trim().slice(0, 200);
    const cleanType = String(type).trim().slice(0, 100);
    const cleanMessage = String(message).trim().slice(0, 5000);

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        ok: false,
        error: "Email no válido"
      });
    }

    const nodemailer = await import("nodemailer");

    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    await transporter.sendMail({
      from: `"WeAreParty Web" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: cleanEmail,
      subject: `Nuevo contacto WeAreParty — ${cleanType}`,
      text: [
        "NUEVO MENSAJE DESDE WEAREPARTY.LIVE",
        "",
        `Nombre: ${cleanName}`,
        `Email: ${cleanEmail}`,
        `Contacto como: ${cleanType}`,
        "",
        "Mensaje:",
        cleanMessage
      ].join("\n")
    });

    return res.status(200).json({
      ok: true
    });

  } catch (error) {
    console.error("Contact form error:", error);

    return res.status(500).json({
      ok: false,
      error: "No se pudo enviar el mensaje"
    });
  }
}
