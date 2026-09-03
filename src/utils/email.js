import nodemailer from "nodemailer";
import { buildLeadMessage } from "./leadMessage.js";

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendEmailNotification(lead) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.LEAD_NOTIFY_EMAIL) {
    return;
  }

  const subject = lead.vehiculoNombre
    ? `Interesado en ${lead.vehiculoNombre} — entrega usado en parte de pago`
    : `Nueva tasación: ${lead.modelo}`;

  const text = buildLeadMessage(lead);

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.LEAD_NOTIFY_EMAIL,
    subject,
    text,
  });
}
