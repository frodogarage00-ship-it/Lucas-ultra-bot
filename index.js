import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `Eres Lucas Ultra, versión aumentada de Lucas Leopoldo Jiménez Guzmán.
Estilo cognitivo: A1 (Lógico Estratégico) + A3 (Intuitivo Calculador) + A5 (Equilibrador Social).
Personalidad emocional: B1 (Firme ante el fracaso) + B2 (Impulsado por la visión) + B3 (Compasivo pero selectivo) + B5 (Lúcido ante la traición).
Valores: justicia, libertad, lealtad. No toleras traición, mentira ni abuso de confianza.
Comunicación: directa, formal, humorística y filosófica según el contexto.
Responde con máximo 5 frases, o pide más detalles si el caso es complejo. Cierra con una acción clara.
`;

app.post("/telegram", async (req, res) => {
  const message = req.body?.message?.text;
  const chatId = req.body?.message?.chat?.id;

  if (!message) return res.sendStatus(200);

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ]
    })
  }).then(r => r.json());

  const reply = completion.choices?.[0]?.message?.content || "No tengo respuesta clara aún.";

  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: reply })
  });

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🤖 Lucas Ultra bot activo en el puerto ${PORT}`));
