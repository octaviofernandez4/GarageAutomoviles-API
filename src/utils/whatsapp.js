export async function sendWhatsAppNotification(lead) {
  try {
    const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const body = `Nueva tasación: ${lead.modelo} (${lead.anio}), ${lead.km ?? "s/d"} km. Teléfono: ${lead.telefono}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: process.env.WHATSAPP_TEST_RECIPIENT,
        type: "text",
        text: { body },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error al enviar notificación de WhatsApp:", response.status, errorBody);
    }
  } catch (err) {
    console.error("Error al enviar notificación de WhatsApp:", err);
  }
}
