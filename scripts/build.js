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

// Minimal template engine:
// {{var}} - escaped variable
// {{{var}}} - raw (unescaped) variable
// {{#list}}...{{/list}} - iterate over array
// {{^list}}...{{/list}} - empty array fallback
// {{.}} - current item (scalar), {{.prop}} - item property
function render(template, data) {
  function processBlock(tpl, ctx) {
    // Handle {{#list}}...{{/list}} blocks with nested loop support
    const sectionRe = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    let result = tpl.replace(sectionRe, (match, key, inner) => {
      const arr = ctx[key];
      if (!arr || arr.length === 0) return '';

      return arr
        .map(item => {
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
          // Recursively process nested loops with item as context
          return processBlock(r, item);
        })
        .join('');
    });

    // Handle {{^list}}...{{/list}} (empty fallback)
    const emptyRe = /\{\{\^(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    result = result.replace(emptyRe, (match, key, fb) => {
      const val = ctx[key];
      return val && val.length > 0 ? '' : fb;
    });

    // Replace {{{var}}} (raw) and {{var}} (escaped)
    result = result.replace(/\{\{\{(\w+)\}\}\}/g, (match, key) => ctx[key] ?? '');
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => esc(ctx[key] ?? ''));

    return result;
  }

  return processBlock(template, data);
}

function build() {
  console.log('Building...');

  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true });
  }

  const baseTemplate = readFile(path.join(TEMPLATES_DIR, 'base.html'));
  const indexTemplate = readFile(path.join(TEMPLATES_DIR, 'index.html'));
  const postTemplate = readFile(path.join(TEMPLATES_DIR, 'post.html'));
  const tagTemplate = readFile(path.join(TEMPLATES_DIR, 'tag.html'));

  // Read and parse all posts
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
      tags: attributes.tags || [],
      excerpt: attributes.excerpt || '',
      body: htmlBody,
    };
  });

  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // Collect all tags
  const tagMap = {};
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagMap[tag]) tagMap[tag] = [];
      tagMap[tag].push(post);
    }
  }

  // Generate index page
  const indexContent = render(indexTemplate, { posts });
  const indexHtml = render(baseTemplate, {
    title: 'My Blog',
    content: indexContent,
  });
  writeFile(path.join(OUT_DIR, 'index.html'), indexHtml);

  // Generate post pages
  for (const post of posts) {
    const postContent = render(postTemplate, post);
    const postHtml = render(baseTemplate, {
      title: `${post.title} - My Blog`,
      content: postContent,
    });
    writeFile(path.join(OUT_DIR, 'posts', `${post.slug}.html`), postHtml);
  }

  // Generate tag pages
  const tagsDir = path.join(OUT_DIR, 'tags');
  for (const [tag, tagPosts] of Object.entries(tagMap)) {
    const tagContent = render(tagTemplate, { tag, posts: tagPosts });
    const tagHtml = render(baseTemplate, {
      title: `#${tag} - My Blog`,
      content: tagContent,
    });
    writeFile(path.join(tagsDir, `${tag}.html`), tagHtml);
  }

  // Generate search index
  const searchIndex = posts.map(p => ({
    title: p.title,
    slug: p.slug,
    date: p.date,
    tags: p.tags,
    excerpt: p.excerpt,
  }));
  writeFile(path.join(OUT_DIR, 'search-index.json'), JSON.stringify(searchIndex));

  // Copy static assets
  copyDir(path.join(SRC_DIR, 'css'), path.join(OUT_DIR, 'css'));
  copyDir(path.join(SRC_DIR, 'js'), path.join(OUT_DIR, 'js'));

  console.log(`Built ${posts.length} post(s), ${Object.keys(tagMap).length} tag(s).`);
  console.log('Output:', OUT_DIR);
}

build();
