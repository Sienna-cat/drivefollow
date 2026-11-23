import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('.', import.meta.url)));
await mkdir('dist', { recursive: true });
await cp('public', 'dist', { recursive: true });
for (const file of ['index.html', 'portfolio.html']) {
  const source = await readFile(`dist/${file}`, 'utf8');
  await writeFile(`dist/${file}`, source.replace('<html lang="zh-CN"', '<html data-hosting="static" lang="zh-CN"'));
}

const app = await readFile('dist/app.js', 'utf8');
await writeFile('dist/app.js', app.replace('默认规则模式 · 配置模型后可生成模型草稿', '浏览器规则演示 · 无需配置或登录'));

// The website download and repository document use the same verified PDF.
await cp('docs/portfolio/portfolio-v5.pdf', 'dist/portfolio/portfolio.pdf');
