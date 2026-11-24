// 砂糖惑星・トップページ用スクリプト
const c = window.siteContent;

document.getElementById('name').textContent = c.name;
document.getElementById('bio').innerHTML = c.bio;

c.links.forEach((item, i) => {
  const row = document.createElement(item.url ? 'a' : 'div');
  row.className = 'link-row' + (item.url ? '' : ' pending');

  if (item.url) {
    const u = new URL(item.url);
    if (!['https:', 'http:'].includes(u.protocol)) {
      throw new Error('URLにはhttpsを指定してください');
    }
    row.href = u.href;
    row.target = u.origin === window.location.origin ? '_self' : '_blank';
    row.rel = 'noopener noreferrer';
  }

  const icon = document.createElement('img');
  icon.className = 'link-icon';
  icon.alt = '';
  icon.src = ['assets/stars.png', 'assets/cat.png', 'assets/vase.png', 'assets/heart.png'][i % 4];

  const text = document.createElement('div');
  text.className = 'link-copy';
  const title = document.createElement('h3');
  title.textContent = item.title;
  const sub = document.createElement('p');
  sub.textContent = item.subtitle;
  text.append(title, sub);

  const mark = document.createElement('span');
  mark.className = 'link-mark';
  mark.textContent = item.url ? '開く' : '準備中';
  row.append(icon, text, mark);
  document.getElementById('link-list').append(row);
});

// novels フォルダの小説を検出し、最初にGitHubへ登録された日付を取得する。
const githubAPI = 'https://api.github.com/repos/ZAkamisori/sugarplanet';
const newsList = document.getElementById('news-list');

async function getPublishedDate(filename) {
  const path = encodeURIComponent(`novels/${filename}`);
  const url = `${githubAPI}/commits?sha=main&path=${path}&per_page=100`;
  let response = await fetch(url);
  if (!response.ok) throw new Error(`${filename} の履歴を取得できませんでした`);

  let commits = await response.json();
  if (!Array.isArray(commits) || commits.length === 0) {
    throw new Error(`${filename} の公開履歴が見つかりません`);
  }

  // 100件以上の変更履歴があっても、最も古いコミットを探す。
  const lastPageUrl = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="last"/)?.[1];
  if (lastPageUrl) {
    response = await fetch(lastPageUrl);
    if (!response.ok) throw new Error('過去の履歴を取得できませんでした');
    commits = await response.json();
  }

  const oldest = commits[commits.length - 1];
  return new Date(oldest.commit.committer.date).getTime();
}

async function getNovel(filename) {
  const chapter = /^novel(\d+)?\.html$/i.exec(filename);
  const fallback = `第${chapter?.[1] || 1}話`;

  const [publishedAt, response] = await Promise.all([
    getPublishedDate(filename),
    fetch(`novels/${encodeURIComponent(filename)}`)
  ]);
  if (!response.ok) throw new Error(`${filename} を取得できませんでした`);

  const html = await response.text();
  const documentData = new DOMParser().parseFromString(html, 'text/html');
  const title = documentData.querySelector('h1')?.textContent?.trim() || fallback;

  return { filename, title, publishedAt };
}

async function showLatestNovels() {
  try {
    const response = await fetch(`${githubAPI}/contents/novels?ref=main`);
    if (!response.ok) throw new Error('小説一覧を取得できませんでした');
    const files = await response.json();
    if (!Array.isArray(files)) throw new Error('小説一覧の形式が不正です');

    const filenames = files
      .filter(file => file.type === 'file' && /^novel(\d+)?\.html$/i.test(file.name))
      .map(file => file.name);

    if (filenames.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'まだ公開されている小説はありません。';
      newsList.replaceChildren(li);
      return;
    }

    const novels = await Promise.all(filenames.map(getNovel));
    novels.sort((a, b) => b.publishedAt - a.publishedAt || b.filename.localeCompare(a.filename));

    const fragment = document.createDocumentFragment();
    const dateFormat = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
    });

    novels.slice(0, 2).forEach(novel => {
      const li = document.createElement('li');
      const date = document.createElement('span');
      date.className = 'date';
      date.textContent = dateFormat.format(new Date(novel.publishedAt)).replace(/\//g, '.');

      const link = document.createElement('a');
      link.href = `novels/${encodeURIComponent(novel.filename)}`;
      link.textContent = `『${novel.title}』を公開しました`;
      li.append(date, link);
      fragment.append(li);
    });
    newsList.replaceChildren(fragment);
  } catch (error) {
    console.error('小説のお知らせを取得できませんでした:', error);
    const li = document.createElement('li');
    li.textContent = 'お知らせを取得できませんでした。後ほど再読み込みしてください。';
    newsList.replaceChildren(li);
  }
}

showLatestNovels();
