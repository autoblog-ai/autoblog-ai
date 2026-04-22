const token = process.env.GITHUB_TOKEN;
console.log(`🔑 Токен получен: ${token ? 'ДА' : 'НЕТ'}`);  // Отладка

const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4.1-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Ты профессиональный технический блогер. Пиши полезные, подробные статьи с примерами кода.' 
      },
      { 
        role: 'user', 
        content: `Напиши подробную статью на тему "${topic}". Используй заголовки H1, H2, примеры кода. Длина: 1500+ слов.` 
      }
    ],
    temperature: 0.7,
    max_tokens: 3000
  })
});
