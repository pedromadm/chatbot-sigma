// /api/chat.js
// Função serverless para Vercel – aceita tanto secret keys sk-… como project keys sk-proj-…
// Se usar project key, define também OPENAI_PROJECT_ID nos env vars.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" });
  }

  const { prompt } = req.body ?? {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt ausente" });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return res.status(500).json({ message: "OPENAI_API_KEY não configurada." });
  }

  // construir cabeçalhos
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${openaiKey}`
  };

  // se for project key, acrescenta o header necessário
  if (openaiKey.startsWith("sk-proj-")) {
    const projectId = process.env.OPENAI_PROJECT_ID;
    if (!projectId) {
      return res.status(500).json({
        message:
          "Estás a usar uma project key (sk-proj-…) mas falta definir OPENAI_PROJECT_ID."
      });
    }
    headers["OpenAI-Project"] = projectId;
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que responde a dúvidas sobre SIGMA (declarações, circuitos, etc.) em português de Portugal. Seja claro e conciso. Se não souber, diga que não sabe."
          },
          { role: "user", content: prompt.trim() }
        ]
      })
    });

    const maybeJson = await openaiRes.json().catch(() => ({}));

    if (!openaiRes.ok) {
      console.error("Erro da OpenAI:", maybeJson);
      return res
        .status(openaiRes.status)
        .json({ message: maybeJson.error?.message || "Erro da OpenAI" });
    }

    const resposta =
      maybeJson.choices?.[0]?.message?.content?.trim() ||
      "Sem resposta da OpenAI.";
    res.status(200).json({ resposta });
  } catch (err) {
    console.error("Falha geral:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
}
