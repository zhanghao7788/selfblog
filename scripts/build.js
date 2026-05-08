const fs = require('fs');
const path = require('path');
const marked = require('marked');
const fm = require('front-matter');
const hljs = require('highlight.js');

const ROOT = path.resolve(__dirname, '..');
const POSTS_DIR = path.join(ROOT, 'posts');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const SRC_DIR = path.join(ROOT, 'src');
const OUT_DIR = path.join(ROOT, 'public');
const BASE_PATH = process.env.BASE_PATH || '/';

marked.setOptions({
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
});

function readFile(p) {
  return fs.readFileSync(p, 'utf-8');
}

function writeFile(p, content) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(p, content);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render(template, data) {
  function processBlock(tpl, ctx) {
    const sectionRe = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    let result = tpl.replace(sectionRe, (match, key, inner) => {
      const arr = ctx[key];
      if (!arr || arr.length === 0) return '';

      // If the value is a string (not an array), treat as conditional:
      // {{#var}}...{{/var}} renders the block once with {{.}} = the string value
      const items = Array.isArray(arr) ? arr : [arr];

      return items.map(item => {
        let r = inner;
        if (typeof item !== 'object') {
          r = r.replace(/\{\{\.\}\}/g, esc(item));
        } else {
          r = r.replace(/\{\{\.(\w+)\}\}/g, (m, prop) => esc(item[prop] ?? ''));
          r = r.replace(/\{\{(\w+)\}\}/g, (m, prop) => {
            if (prop in item) return esc(item[prop] ?? '');
            return m;
          });
        }
        return processBlock(r, item);
      }).join('');
    });

    const emptyRe = /\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    result = result.replace(emptyRe, (match, key, fb) => {
      const val = ctx[key];
      return val && val.length > 0 ? '' : fb;
    });

    result = result.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => ctx[key] ?? '');
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => esc(ctx[key] ?? ''));

    return result;
  }

  return processBlock(template, data);
}

function build() {
  console.log(`Building with base: ${BASE_PATH}`);

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
  }

  const baseTemplate = readFile(path.join(TEMPLATES_DIR, 'base.html'));
  const indexTemplate = readFile(path.join(TEMPLATES_DIR, 'index.html'));
  const postTemplate = readFile(path.join(TEMPLATES_DIR, 'post.html'));
  const tagTemplate = readFile(path.join(TEMPLATES_DIR, 'tag.html'));
  const categoryTemplate = readFile(path.join(TEMPLATES_DIR, 'category.html'));

  const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
  const posts = postFiles.map(file => {
    const raw = readFile(path.join(POSTS_DIR, file));
    const { attributes, body } = fm(raw);
    const slug = file.replace(/\.md$/, '');
    const htmlBody = marked.parse(body);
    return {
      slug,
      title: attributes.title || slug,
      date: attributes.date ? new Date(attributes.date).toISOString().split('T')[0] : '',
      category: attributes.category || '',
      tags: attributes.tags || [],
      excerpt: attributes.excerpt || '',
      body: htmlBody,
    };
  });

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Collect categories
  const categoryMap = {};
  for (const post of posts) {
    const cat = post.category || '未分类';
    if (!categoryMap[cat]) categoryMap[cat] = [];
    categoryMap[cat].push(post);
  }

  // Collect tags
  const tagMap = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(post);
    }
  }

  const baseCtx = { base: BASE_PATH };

  // Index page
  const indexHtml = render(baseTemplate, {
    ...baseCtx,
    title: 'My Blog',
    content: render(indexTemplate, { ...baseCtx, posts, categories: Object.keys(categoryMap).sort() }),
  });
  writeFile(path.join(OUT_DIR, 'index.html'), indexHtml);

  // Post pages
  for (const post of posts) {
    const postHtml = render(baseTemplate, {
      ...baseCtx,
      title: `${post.title} - My Blog`,
      content: render(postTemplate, { ...baseCtx, ...post }),
    });
    writeFile(path.join(OUT_DIR, 'posts', `${post.slug}.html`), postHtml);
  }

  // Category pages
  for (const [cat, catPosts] of Object.entries(categoryMap)) {
    const catHtml = render(baseTemplate, {
      ...baseCtx,
      title: `${cat} - My Blog`,
      content: render(categoryTemplate, { ...baseCtx, category: cat, posts: catPosts }),
    });
    writeFile(path.join(OUT_DIR, 'categories', `${cat}.html`), catHtml);
  }

  // Tag pages
  for (const [tag, tagPosts] of Object.entries(tagMap)) {
    const tagHtml = render(baseTemplate, {
      ...baseCtx,
      title: `#${tag} - My Blog`,
      content: render(tagTemplate, { ...baseCtx, tag, posts: tagPosts }),
    });
    writeFile(path.join(OUT_DIR, 'tags', `${tag}.html`), tagHtml);
  }

  // Search index
  const searchIndex = posts.map(p => ({
    title: p.title,
    slug: p.slug,
    date: p.date,
    category: p.category,
    tags: p.tags,
    excerpt: p.excerpt,
  }));
  writeFile(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex));

  copyDir(path.join(SRC_DIR, 'css'), path.join(OUT_DIR, 'css'));
  copyDir(path.join(SRC_DIR, 'js'), path.join(OUT_DIR, 'js'));

  console.log(`Built ${posts.length} post(s), ${Object.keys(categoryMap).length} categories, ${Object.keys(tagMap).length} tags.`);
  console.log('Output:', OUT_DIR);
}

build();
