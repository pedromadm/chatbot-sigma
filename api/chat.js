// arquivo: /api/chat.js
// Função serverless (Vercel) que chama a OpenAI API

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { prompt } = req.body ?? {};
  if (!prompt) {
    return res.status(400).json({ message: "Prompt ausente" });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ message: "OPENAI_API_KEY não configurada." });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que responde a dúvidas sobre SIGMA (declarações, circuitos, etc.) em português de Portugal. Seja claro e conciso. Se não souber, diga que não sabe."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!openaiRes.ok) {
      const err = await openaiRes.json().catch(() => ({}));
      console.error("Erro da OpenAI:", err);
      return res.status(openaiRes.status).json({
        message: err.error?.message || "Erro da OpenAI"
      });
    }

    const data = await openaiRes.json();
    const resposta =
      data.choices?.[0]?.message?.content?.trim() ||
      "Sem resposta da OpenAI.";

    res.status(200).json({ resposta });
  } catch (e) {
    console.error("Erro inesperado:", e);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}
