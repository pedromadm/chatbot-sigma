// Arquivo: /api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt ausente' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente que responde com base no manual da declaração de inexistência de conflitos de interesses. Seja claro e direto.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    const data = await openaiRes.json();
    const resposta = data.choices?.[0]?.message?.content || 'Erro ao gerar resposta.';

    res.status(200).json({ resposta });
  } catch (error) {
    console.error('Erro na API OpenAI:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
