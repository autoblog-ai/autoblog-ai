import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BASE_PATH = '/autoblog-ai';  // ← Для GitHub Pages

// БАЗА ТЕМ (расширяй сколько хочешь)
const TOPICS = {
  programming: [
    "Как начать программировать с нуля в 2025",
    "10 ошибок junior разработчика",
    "Принципы SOLID простыми словами"
  ],
  python: [
    "Как использовать генераторы в Python",
    "Декораторы в Python: полное руководство"
  ],
  javascript: [
    "Замыкания в JavaScript: понятное объяснение",
    "Promise и async/await: полный гайд"
  ]
};

// Загрузка опубликованных статей
function loadPublished() {
  const file = path.join(ROOT, 'data', 'published.json');
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return { articles: [], lastRun: null };
}

// Сохранение опубликованных статей
function savePublished(data) {
  const dir = path.join(ROOT, 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'published.json'), JSON.stringify(data, null, 2));
}

// Создание URL из заголовка
function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^а-яa-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Генерация статьи через GitHub Models
async function generateArticle(topic, category) {
  console.log(`📝 Генерация: ${topic}`);
  
  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
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
    
    if (!response.ok) {
      console.error(`❌ Ошибка API: ${response.status}`);
      return `# ${topic}\n\nСтатья временно недоступна. Пожалуйста, зайдите позже.`;
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error(`❌ Ошибка: ${error.message}`);
    return `# ${topic}\n\nСтатья временно недоступна.`;
  }
}

// Преобразование Markdown в HTML
function markdownToHtml(content, topic, category) {
  let html = content
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${topic} — AutoBlog AI</title>
  <meta name="description" content="Подробное руководство: ${topic}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #333; background: #f5f7fa; }
    .container { max-width: 900px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    article { background: white; border-radius: 12px; padding: 40px; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    h1 { color: #2c3e50; margin-bottom: 20px; }
    h2 { color: #34495e; margin: 30px 0 15px; padding-bottom: 10px; border-bottom: 2px solid #ecf0f1; }
    h3 { color: #7f8c8d; margin: 20px 0 10px; }
    p { margin-bottom: 20px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 0.9em; color: #e74c3c; }
    pre { background: #2d2d2d; color: #f8f8f2; padding: 20px; border-radius: 8px; overflow-x: auto; margin: 20px 0; }
    pre code { background: none; color: inherit; padding: 0; }
    ul, ol { margin: 15px 0 15px 30px; }
    li { margin: 8px 0; }
    .meta { color: #95a5a6; font-size: 0.9em; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #ecf0f1; }
    .category { display: inline-block; background: #3498db; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8em; margin-right: 10px; }
    .back-link { margin-top: 30px; text-align: center; }
    .back-link a { color: #667eea; text-decoration: none; }
    footer { text-align: center; padding: 40px; color: #95a5a6; font-size: 0.9em; border-top: 1px solid #ecf0f1; margin-top: 40px; }
    @media (max-width: 768px) { article { padding: 20px; } header h1 { font-size: 1.8em; } }
  </style>
</head>
<body>
  <header>
    <h1>🤖 AutoBlog AI</h1>
    <p>Автоматические статьи о программировании и IT</p>
  </header>
  <div class="container">
    <article>
      <div class="meta">
        <span class="category">${category}</span>
        <span>📅 ${new Date().toLocaleDateString('ru-RU')}</span>
        <span>📖 ${Math.ceil(content.split(' ').length / 200)} мин чтения</span>
      </div>
      ${html}
      <div class="back-link">
        <a href="${BASE_PATH}/">← На главную</a>
      </div>
    </article>
  </div>
  <footer>
    <p>AutoBlog AI — автоматически сгенерированные статьи с помощью искусственного интеллекта</p>
  </footer>
</body>
</html>`;
}

// Основная функция
async function main() {
  console.log('🚀 Запуск генератора контента...');
  console.log(`📅 ${new Date().toLocaleString()}`);
  
  const published = loadPublished();
  const today = new Date().toISOString().split('T')[0];
  
  // Проверяем, не запускались ли сегодня
  if (published.lastRun === today) {
    console.log('⚠️ Сегодня уже запускались. Пропускаем...');
    return;
  }
  
  // Собираем неопубликованные темы
  const toGenerate = [];
  for (const [category, topics] of Object.entries(TOPICS)) {
    for (const topic of topics) {
      if (!published.articles.some(a => a.topic === topic)) {
        toGenerate.push({ topic, category });
      }
    }
  }
  
  // Берём 2 темы на сегодня
  const toGenerateToday = toGenerate.slice(0, 2);
  
  if (toGenerateToday.length === 0) {
    console.log('✅ Все темы уже опубликованы!');
    return;
  }
  
  console.log(`📚 Будет сгенерировано: ${toGenerateToday.length} статей`);
  
  // Генерируем статьи
  for (const item of toGenerateToday) {
    const content = await generateArticle(item.topic, item.category);
    const slug = createSlug(item.topic);
    const html = markdownToHtml(content, item.topic, item.category);
    
    // Создаём директорию
    const dir = path.join(ROOT, 'output', 'articles', item.category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // Сохраняем статью
    fs.writeFileSync(path.join(dir, `${slug}.html`), html);
    
    // Записываем в опубликованные
    published.articles.push({
      topic: item.topic,
      category: item.category,
      slug: slug,
      date: today,
      url: `/articles/${item.category}/${slug}.html`
    });
    
    console.log(`✅ Сохранено: ${item.topic}`);
    
    // Задержка между запросами
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Генерируем главную страницу
  let categoriesHtml = '';
  const articlesByCategory = {};
  
  for (const article of published.articles) {
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = [];
    }
    articlesByCategory[article.category].push(article);
  }
  
  for (const [category, articles] of Object.entries(articlesByCategory)) {
    const articlesList = articles.map(a => 
      `<li><a href="${BASE_PATH}${a.url}">${a.topic}</a> <small>${a.date}</small></li>`
    ).join('');
    
    categoriesHtml += `
      <div class="category-section">
        <h2>📁 ${category.toUpperCase()}</h2>
        <ul>${articlesList}</ul>
      </div>
    `;
  }
  
  const indexHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoBlog AI — Статьи о программировании</title>
  <meta name="description" content="Автоматически генерируемые статьи о программировании, Python, JavaScript и IT">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
    .container { max-width: 1000px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 60px 20px; text-align: center; border-radius: 0 0 20px 20px; }
    header h1 { font-size: 2.5em; margin-bottom: 10px; }
    .stats { background: white; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .stats-number { font-size: 2em; font-weight: bold; color: #667eea; }
    .category-section { background: white; padding: 25px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    .category-section h2 { color: #667eea; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ecf0f1; }
    ul { list-style: none; }
    li { padding: 10px 0; border-bottom: 1px solid #ecf0f1; }
    li:last-child { border-bottom: none; }
    a { color: #333; text-decoration: none; }
    a:hover { color: #667eea; text-decoration: underline; }
    small { color: #95a5a6; font-size: 0.85em; }
    footer { text-align: center; padding: 40px; color: #95a5a6; font-size: 0.9em; margin-top: 30px; }
    @media (max-width: 768px) { header h1 { font-size: 1.8em; } .category-section { padding: 15px; } }
  </style>
</head>
<body>
  <header>
    <h1>🤖 AutoBlog AI</h1>
    <p>Автоматические статьи о программировании, Python, JavaScript и IT</p>
  </header>
  <div class="container">
    <div class="stats">
      <div class="stats-number">${published.articles.length}</div>
      <div>статей опубликовано</div>
      <div><small>Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}</small></div>
    </div>
    ${categoriesHtml}
  </div>
  <footer>
    <p>🤖 Сайт автоматически обновляется каждый день с помощью AI</p>
    <p><small>AutoBlog AI — программирование, Python, JavaScript, IT</small></p>
  </footer>
</body>
</html>`;
  
  fs.writeFileSync(path.join(ROOT, 'output', 'index.html'), indexHtml);
  
  // Сохраняем дату последнего запуска
  published.lastRun = today;
  savePublished(published);
  
  console.log(`✨ Генерация завершена! Всего статей: ${published.articles.length}`);
}

main().catch(console.error);
