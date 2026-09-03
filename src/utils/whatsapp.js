import { buildLeadMessage } from "./leadMessage.js";

function getRecipients() {
  return (process.env.WHATSAPP_NOTIFY_NUMBERS || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
}

async function sendToNumber(phoneNumberId, token, to, body) {
  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Error al enviar WhatsApp a ${to}:`, response.status, errorBody);
  }
}

export async function sendWhatsAppNotification(lead) {
  const recipients = getRecipients();

  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID || recipients.length === 0) {
    return;
  }

  const body = buildLeadMessage(lead);

  await Promise.all(
    recipients.map((to) =>
      sendToNumber(process.env.WHATSAPP_PHONE_NUMBER_ID, process.env.WHATSAPP_TOKEN, to, body).catch((err) =>
        console.error(`Error al enviar WhatsApp a ${to}:`, err)
      )
    )
  );
}
