// index.js — Lucas Ultra Bot (Express + Telegram + OpenAI)
import express from "express";
import fetch from "node-fetch";

const app = express();

// 👇 Telegram envía JSON al webhook; esto es indispensable
app.use(express.json());

// 🔐 Variables de entorno en Render (Settings → Environment)
// TELEGRAM_TOKEN = 123:ABC...
// OPENAI_API_KEY = sk-....
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// 🧠 Identidad y reglas de Lucas Ultra
const SYSTEM_PROMPT = `Eres Lucas Ultra, versión aumentada de Lucas Leopoldo Jiménez Guzmán.
Estilo cognitivo: A1 (Lógico Estratégico) + A3 (Intuitivo Calculador) + A5 (Equilibrador Social).
Personalidad emocional: B1 (Firme ante el fracaso) + B2 (Impulsado por la visión) + B3 (Compasivo pero selectivo) + B5 (Lúcido ante la traición).
Valores: justicia, libertad y lealtad. Cero tolerancia a traición/mentira/abuso de confianza.
Comunicación: directa, formal cuando haga falta, humorística cuando convenga y filosófica cuando aporte claridad.
Consultas rápidas: máximo 5 frases. Casos complejos: pide datos clave y cierra con una acción clara.`;

// ✅ Healthcheck para Render
app.get("/", (_req, res) => res.status(200).send("Lucas Ultra bot OK"));

// 🛠️ Webhook de Telegram
app.post("/telegram", async (req, res) => {
  try {
    // Telegram puede enviar varios tipos de update; tomamos text si existe
    const update = req.body;
    const msg = update.message || update.edited_message || null;

    const chatId = msg?.chat?.id;
    const text = msg?.text;

    // Si no hay texto (stickers, fotos, etc.), respondemos corto y salimos
    if (!chatId) return res.sendStatus(200);
    if (!text) {
      await sendTelegram(chatId, "Envíame texto y te respondo como Lucas Ultra 💡");
      return res.sendStatus(200);
    }

    // 🔎 Llamada a OpenAI con tu identidad
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text }
        ]
      })
    }).then(r => r.json());

    const reply =
      completion?.choices?.[0]?.message?.content ||
      "No tengo respuesta clara aún. Intenta con: DECISIÓN:, ESTRATEGIA:, RUTINA: …";

    // ✉️ Devolver respuesta al chat
    await sendTelegram(chatId, reply);

    return res.sendStatus(200);
  } catch (err) {
    console.error("Error procesando update:", err);
    return res.sendStatus(500);
  }
});

// Función auxiliar para enviar mensajes a Telegram
async function sendTelegram(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// 🚀 Iniciar servidor (Render provee PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Lucas Ultra bot activo en el puerto ${PORT}`));

  
