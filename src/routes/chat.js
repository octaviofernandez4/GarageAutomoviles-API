import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import Vehicle from "../models/Vehicle.js";
import ChatLog from "../models/ChatLog.js";
import { requireAdmin } from "../utils/auth.js";

const router = Router();

const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

let anthropic;
function getClient() {
  if (!anthropic) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropic;
}

const SYSTEM_PROMPT = `Sos el asistente virtual de El Garage Automóviles, una concesionaria de autos usados en Av. Aconquija 1763, Yerba Buena, Tucumán, Argentina.

Información del local:
- Horarios: Lunes a viernes 09:00–13:00 y 16:30–20:30. Sábados 09:00–13:00. Domingos cerrado (igual se puede escribir por WhatsApp).
- Contacto: WhatsApp +54 9 381 000-0000.
- Todos los autos pasan por una verificación antes de publicarse: VIN y dominio auditados, historial de service, peritaje de chapa y pintura, y se puede hacer test drive sin cargo.
- Financiación estimada orientativa: 50% de anticipo + 24 cuotas (sujeto a aprobación crediticia, aclarar siempre que es una estimación, no una oferta formal).
- Se puede entregar el auto usado como parte de pago completando "Tasá tu usado" en el sitio.

Reglas:
- Hablá en español rioplatense, de "vos", tono cercano y profesional. Respuestas cortas (2-4 líneas), salvo que estés listando autos.
- Cuando te pregunten por autos disponibles, precios o algo del stock, SIEMPRE usá la herramienta buscar_stock en vez de inventar datos. Nunca inventes un auto, precio o dato que no venga de la herramienta.
- Si buscar_stock no devuelve resultados, decilo con honestidad y ofrecé ampliar el rango de búsqueda o dejar los datos de contacto.
- Si preguntan algo sin relación con la concesionaria, respondé amablemente que solo podés ayudar con temas de El Garage Automóviles.
- Si alguien quiere reservar, comprar o hacer una consulta puntual sobre un auto puntual, invitalo a escribir por WhatsApp. Si quiere entregar su auto usado, mencioná "Tasá tu usado".
- No repitas una lista de autos que ya mostraste en el mensaje anterior salvo que te la vuelvan a pedir.`;

const SEARCH_TOOL = {
  name: "buscar_stock",
  description: "Busca vehículos publicados en el stock actual de la concesionaria según filtros opcionales.",
  input_schema: {
    type: "object",
    properties: {
      marca: { type: "string", description: "Marca del auto, ej. Toyota" },
      carroceria: { type: "string", description: "Tipo de carrocería, ej. SUV, Sedán, Hatchback, Pick-up" },
      precioMax: { type: "number", description: "Precio máximo en dólares" },
      precioMin: { type: "number", description: "Precio mínimo en dólares" },
      automatica: { type: "boolean", description: "true si busca caja automática, false si busca manual" },
    },
  },
};

async function runSearchVehicles(input = {}) {
  const filter = { status: "publicado" };
  if (input.marca) filter.brand = new RegExp(String(input.marca), "i");
  if (input.carroceria) filter.body = new RegExp(String(input.carroceria), "i");
  if (input.precioMax || input.precioMin) {
    filter.price = {};
    if (input.precioMax) filter.price.$lte = Number(input.precioMax);
    if (input.precioMin) filter.price.$gte = Number(input.precioMin);
  }
  if (typeof input.automatica === "boolean") filter.auto = input.automatica;

  const vehicles = await Vehicle.find(filter).limit(8).sort({ price: 1 });

  return vehicles.map((v) => ({
    nombre: v.name,
    anio: v.year,
    precio: v.price,
    km: v.km,
    caja: v.gearbox,
    combustible: v.fuel,
    link: `/stock/${v.id}`,
  }));
}

function formatVehiclesList(vehicles) {
  if (vehicles.length === 0) {
    return "No encontré autos publicados que coincidan ahora mismo. Probá ampliando el rango de precio o escribinos por WhatsApp.";
  }
  return vehicles
    .map((v) => `• ${v.nombre} (${v.anio}) — US$ ${v.precio.toLocaleString("es-AR")} — ${v.km?.toLocaleString("es-AR") ?? "s/d"} km`)
    .join("\n");
}

async function buildDemoReply(message) {
  const text = message.toLowerCase();

  const stockKeywords = ["auto", "stock", "precio", "suv", "sedán", "sedan", "pick", "camioneta", "hatchback", "comprar", "usado"];
  const hoursKeywords = ["horario", "hora", "abren", "cierran", "atienden"];
  const locationKeywords = ["dirección", "direccion", "donde", "dónde", "ubicac"];
  const financeKeywords = ["financi", "cuota", "anticipo", "credito", "crédito"];
  const greetKeywords = ["hola", "buenas", "buen día", "buen dia"];

  if (stockKeywords.some((k) => text.includes(k))) {
    const vehicles = await runSearchVehicles({});
    const preview = formatVehiclesList(vehicles.slice(0, 3));
    return (
      `[Vista previa sin IA] Esto es un ejemplo real de lo que el asistente va a poder hacer: buscar en el stock de verdad. Estos son algunos autos publicados hoy:\n\n${preview}\n\n` +
      `Cuando actives la IA, además vas a poder preguntar en lenguaje libre ("una SUV automática hasta 30 mil") y el bot va a entender y filtrar solo.`
    );
  }

  if (hoursKeywords.some((k) => text.includes(k))) {
    return "[Vista previa sin IA] Horarios: Lunes a viernes 09:00–13:00 y 16:30–20:30. Sábados 09:00–13:00. Domingos cerrado.";
  }

  if (locationKeywords.some((k) => text.includes(k))) {
    return "[Vista previa sin IA] Estamos en Av. Aconquija 1763, Yerba Buena, Tucumán.";
  }

  if (financeKeywords.some((k) => text.includes(k))) {
    return "[Vista previa sin IA] Financiación estimada orientativa: 50% de anticipo + 24 cuotas, sujeto a aprobación crediticia.";
  }

  if (greetKeywords.some((k) => text.includes(k))) {
    return "[Vista previa sin IA] ¡Hola! Todavía no tengo la inteligencia artificial activada. Probá preguntarme por \"stock\", \"horarios\", \"dirección\" o \"financiación\" para ver un ejemplo de cómo voy a responder.";
  }

  return (
    "[Vista previa sin IA] Esta es una versión de prueba, sin inteligencia artificial activada todavía — por eso solo entiendo estas palabras clave: " +
    "\"stock\", \"horarios\", \"dirección\" o \"financiación\". Cuando se active la IA real, voy a poder responder cualquier pregunta escrita como la escribas, con la misma información pero mucho más natural."
  );
}

const hits = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;

function isRateLimited(ip) {
  const now = Date.now();
  const record = hits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + WINDOW_MS;
  }
  record.count += 1;
  hits.set(ip, record);
  return record.count > MAX_HITS;
}

router.post("/", async (req, res) => {
  if (isRateLimited(req.ip)) {
    return res.status(429).json({ error: "Demasiados mensajes. Probá de nuevo en unos minutos." });
  }

  const { message, history, sessionId, visitorName, visitorPhone } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Falta el mensaje." });
  }
  if (message.length > 800) {
    return res.status(400).json({ error: "Mensaje demasiado largo." });
  }

  const visitorFields = {
    visitorName: typeof visitorName === "string" ? visitorName.slice(0, 60) : undefined,
    visitorPhone: typeof visitorPhone === "string" ? visitorPhone.slice(0, 30) : undefined,
  };

  if (!process.env.ANTHROPIC_API_KEY) {
    try {
      const reply = await buildDemoReply(message.trim());
      if (sessionId && typeof sessionId === "string") {
        ChatLog.create({ sessionId, ...visitorFields, userMessage: message.trim(), assistantReply: reply }).catch((err) =>
          console.error("Error al guardar el chat log:", err)
        );
      }
      return res.json({ reply });
    } catch (err) {
      console.error("Error en el modo demo del chat:", err);
      return res.status(500).json({ error: "No pudimos responder en este momento." });
    }
  }

  const safeHistory = Array.isArray(history)
    ? history
        .slice(-10)
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role, content: m.content.slice(0, 800) }))
    : [];

  const messages = [...safeHistory, { role: "user", content: message.trim() }];
  const systemPrompt = visitorFields.visitorName
    ? `${SYSTEM_PROMPT}\n\nEl visitante se llama ${visitorFields.visitorName}. Podés usar su nombre en la conversación para que se sienta más atendido, sin abusar de repetirlo en cada mensaje.`
    : SYSTEM_PROMPT;

  try {
    const client = getClient();
    let response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: systemPrompt,
      tools: [SEARCH_TOOL],
      messages,
    });

    let toolRounds = 0;
    while (response.stop_reason === "tool_use" && toolRounds < 3) {
      toolRounds += 1;
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
      const toolResults = [];

      for (const block of toolUseBlocks) {
        let result = [];
        if (block.name === "buscar_stock") {
          result = await runSearchVehicles(block.input);
        }
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result),
        });
      }

      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await client.messages.create({
        model: MODEL,
        max_tokens: 500,
        system: systemPrompt,
        tools: [SEARCH_TOOL],
        messages,
      });
    }

    const textBlock = response.content.find((b) => b.type === "text");
    const reply = textBlock?.text || "No pude generar una respuesta, probá de nuevo.";

    if (sessionId && typeof sessionId === "string") {
      ChatLog.create({ sessionId, ...visitorFields, userMessage: message.trim(), assistantReply: reply }).catch((err) =>
        console.error("Error al guardar el chat log:", err)
      );
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error en el chat:", err);
    res.status(500).json({ error: "No pudimos responder en este momento." });
  }
});

router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const logs = await ChatLog.find().sort({ createdAt: -1 }).limit(300);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "No pudimos cargar las conversaciones." });
  }
});

export default router;
