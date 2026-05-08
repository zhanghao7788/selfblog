(function () {
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  let index = [];
  let loaded = false;

  async function loadIndex() {
    try {
      const resp = await fetch('/search-index.json');
      index = await resp.json();
      loaded = true;
    } catch (e) {
      index = [];
    }
  }

  function match(query, text) {
    return text.toLowerCase().includes(query.toLowerCase());
  }

  function search(query) {
    if (!query.trim()) return [];
    const q = query.trim();
    return index
      .filter(p => match(q, p.title) || match(q, p.excerpt) || p.tags.some(t => match(q, t)))
      .slice(0, 10);
  }

  function showResults(items) {
    if (items.length === 0) {
      results.innerHTML = '<div class="search-no-result">没有找到相关文章</div>';
      results.classList.add('active');
      return;
    }

    results.innerHTML = items
      .map(
        item => `
        <a href="/posts/${item.slug}.html" class="search-result-item" style="text-decoration:none;display:block;">
          <div class="result-title">${esc(item.title)}</div>
          ${item.excerpt ? `<div class="result-excerpt">${esc(item.excerpt)}</div>` : ''}
          <div class="result-tags">${item.tags.map(t => '#' + esc(t)).join(' ')}</div>
        </a>`
      )
      .join('');
    results.classList.add('active');
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  input.addEventListener('input', function () {
    if (!loaded) return;
    const query = this.value;
    if (query.trim() === '') {
      results.innerHTML = '';
      results.classList.remove('active');
      return;
    }
    const items = search(query);
    showResults(items);
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      results.innerHTML = '';
      results.classList.remove('active');
      input.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (!input.contains(e.target) && !results.contains(e.target)) {
      results.innerHTML = '';
      results.classList.remove('active');
    }
  });

  loadIndex();
})();
