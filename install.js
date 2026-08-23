#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const SKILL_NAME = 'Soso-self-media';
const GITHUB_RAW = 'https://raw.githubusercontent.com/shishuaituo/Soso-self-media/main';

const FILES = [
  { src: 'SKILL.md', dest: 'SKILL.md' },
  { src: 'README.md', dest: 'README.md' },
  { src: 'docs/01-视频方法论分析.md', dest: 'docs/01-视频方法论分析.md' },
  { src: 'docs/02-MCP能力分析与映射.md', dest: 'docs/02-MCP能力分析与映射.md' },
  { src: 'docs/03-Skill架构设计.md', dest: 'docs/03-Skill架构设计.md' },
  { src: 'docs/04-端到端工作流测试报告.md', dest: 'docs/04-端到端工作流测试报告.md' },
  { src: 'archive/README.md', dest: 'archive/README.md' },
  { src: 'archive/knowledge/hooks.md', dest: 'archive/knowledge/hooks.md' },
  { src: 'archive/knowledge/structures.md', dest: 'archive/knowledge/structures.md' },
  { src: 'archive/knowledge/quotes.md', dest: 'archive/knowledge/quotes.md' },
  { src: 'archive/knowledge/topics-trends.md', dest: 'archive/knowledge/topics-trends.md' },
  { src: 'archive/knowledge/insights.md', dest: 'archive/knowledge/insights.md' },
];

function getTraeSkillsDir() {
  const home = os.homedir();
  return path.join(home, '.trae-cn', 'skills');
}

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const skillsDir = getTraeSkillsDir();
  const targetDir = path.join(skillsDir, SKILL_NAME);

  console.log('\n  Soso-self-media Skill Installer');
  console.log('  ===============================\n');
  console.log(`  Target: ${targetDir}\n`);

  if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let success = 0;
  let failed = 0;

  for (const file of FILES) {
    const destPath = path.join(targetDir, file.dest);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const localPath = path.join(__dirname, file.src);
    let content;

    try {
      if (fs.existsSync(localPath)) {
        content = fs.readFileSync(localPath, 'utf8');
        console.log(`  [local]  ${file.dest}`);
      } else {
        const url = `${GITHUB_RAW}/${file.src}`;
        content = await download(url);
        console.log(`  [remote] ${file.dest}`);
      }
      fs.writeFileSync(destPath, content, 'utf8');
      success++;
    } catch (err) {
      console.log(`  [FAILED] ${file.dest} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  Done: ${success} installed, ${failed} failed.\n`);

  if (success > 0) {
    console.log('  Soso-self-media Skill installed successfully!');
    console.log('  Open TRAE / Vibo Coding and start a new conversation to use it.\n');
    console.log('  First time? You will need:');
    console.log('    1. Firefly API Key (register at https://firefly.qwjxqn.xyz)');
    console.log('    2. Your account persona (板材经销商/设计师/装修业主)');
    console.log('    3. Your product/brand info\n');
  }

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('  Install failed:', err.message);
  process.exit(1);
});
