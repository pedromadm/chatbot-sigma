- const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', { … });
- const data = await openaiRes.json();
- const resposta = data.choices?.[0]?.message?.content || 'Erro ao gerar resposta.';
- res.status(200).json({ resposta });

+ const openaiKey = process.env.OPENAI_API_KEY;
+ if (!openaiKey) {
+   return res.status(500).json({ message: 'OPENAI_API_KEY não configurada no ambiente.' });
+ }

+ const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', { … });
+
+ if (!openaiRes.ok) {          // ← captura erros da API
+   const err = await openaiRes.json().catch(() => ({}));
+   console.error('Erro da OpenAI:', err);
+   return res.status(openaiRes.status)
+             .json({ message: err.error?.message || 'Erro da OpenAI' });
+ }
+
+ const data = await openaiRes.json();
+ const resposta = data.choices?.[0]?.message?.content?.trim() || 'Sem resposta da OpenAI.';
+ res.status(200).json({ resposta });
