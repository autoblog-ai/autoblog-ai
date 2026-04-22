import fs from 'fs';
import path from 'path';

const TOPICS = [
  "Как начать программировать с нуля",
  "10 ошибок junior разработчика",
  "Принципы SOLID простыми словами"
];

async function generate() {
  console.log('🚀 Генерация статей...');
  
  const outputDir = './output';
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
  let indexHtml = '<h1>AutoBlog AI</h1><ul>';
  
  for (const topic of TOPICS) {
    const slug = topic.toLowerCase().replace(/ /g, '-');
    const html = `<h1>${topic}</h1><p>Содержание статьи...</p>`;
    
    fs.writeFileSync(`${outputDir}/${slug}.html`, html);
    indexHtml += `<li><a href="${slug}.html">${topic}</a></li>`;
    console.log(`✅ ${topic}`);
  }
  
  indexHtml += '</ul>';
  fs.writeFileSync(`${outputDir}/index.html`, indexHtml);
  console.log('✨ Готово!');
}

generate();
