'use strict';
const { getReadyContext, waitForLogin } = require('../session');

const PLATFORM = 'instagram';
const LOGIN_URL = 'https://www.instagram.com/accounts/login/';

async function isLoggedIn(page) {
  try {
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    // Logged-in users see the home feed nav, not-logged users see login prompt
    const nav = await page.$('nav[role="navigation"] svg[aria-label="Instagram"]');
    const noLogin = await page.$('input[name="username"]');
    return !!nav && !noLogin;
  } catch {
    return false;
  }
}

async function extractProfile(page, username) {
  const handle = username.replace('@', '');
  const url = `https://www.instagram.com/${handle}/`;

  console.log(`\n  Navegando para ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const data = await page.evaluate(() => {
    // Profile header stats
    const statEls = [...document.querySelectorAll('header section ul li, header ul li')];
    const stats = statEls.map(li => {
      const numEl = li.querySelector('span[title], span > span, span[class*="x193iq5w"]');
      const labelEl = li.querySelectorAll('span')[1] || li.querySelector('span:last-child');
      return {
        value: numEl?.getAttribute('title') || numEl?.textContent?.trim(),
        label: labelEl?.textContent?.trim()?.toLowerCase(),
      };
    });

    // Bio text
    const bio = [...document.querySelectorAll('header section span, header section div > span')]
      .map(el => el.textContent?.trim())
      .filter(t => t && t.length > 10)
      .join('\n');

    // Full name
    const fullName = document.querySelector('header section h2, header h2, header h1')?.textContent?.trim();

    // Category
    const category = [...document.querySelectorAll('header div')]
      .map(el => el.textContent?.trim())
      .find(t => t && t.length < 40 && t.length > 3 && !t.includes('\n'));

    // External link
    const link = document.querySelector('header a[href*="http"]')?.textContent?.trim()
      || document.querySelector('header a[rel="me nofollow noopener noreferrer"]')?.href;

    // Posts in grid (visible)
    const posts = [...document.querySelectorAll('article a[href*="/p/"], div[style*="padding"] a[href*="/p/"]')]
      .slice(0, 12)
      .map(a => ({
        url: a.href,
        imgAlt: a.querySelector('img')?.alt?.trim() || '',
        isReel: !!a.querySelector('svg[aria-label*="Reel"], svg[aria-label*="reel"]'),
        isCarousel: !!a.querySelector('svg[aria-label*="álbum"], svg[aria-label*="Carousel"]'),
      }));

    return { fullName, bio, stats, category, link, posts };
  });

  // Try to get engagement from individual posts (sample first 3)
  const postDetails = [];
  for (const post of data.posts.slice(0, 6)) {
    try {
      await page.goto(post.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      const detail = await page.evaluate(() => {
        // Likes
        const likesEl = document.querySelector('section span[class*="html-span"] > span, a[href*="liked_by"] span');
        const likes = likesEl?.textContent?.trim();

        // Comments count
        const commentCount = document.querySelector('ul div span[aria-label], span[title*="comentário"]')?.getAttribute('aria-label')
          || document.querySelectorAll('ul > div[role="button"]').length;

        // Caption
        const caption = document.querySelector('div[class*="uo3d90"] span, article div > span > span')?.textContent?.trim()?.slice(0, 300);

        // Date
        const dateEl = document.querySelector('time[datetime]');
        const date = dateEl?.getAttribute('datetime');

        // Hashtags from caption
        const hashtagMatches = (caption || '').match(/#\w+/g) || [];

        return { likes, commentCount, caption, date, hashtags: hashtagMatches };
      });

      postDetails.push({ ...post, ...detail });
    } catch {
      postDetails.push(post);
    }
  }

  // Back to profile to go through remaining posts without detail
  const remaining = data.posts.slice(6).map(p => p);

  return {
    platform: PLATFORM,
    handle: `@${handle}`,
    fullName: data.fullName,
    bio: data.bio,
    category: data.category,
    link: data.link,
    stats: data.stats,
    posts: [...postDetails, ...remaining],
    scrapedAt: new Date().toISOString(),
  };
}

async function run(username) {
  const { ctx, page, needsLogin } = await getReadyContext(PLATFORM, isLoggedIn);

  if (needsLogin) {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await waitForLogin(page, isLoggedIn, 'Instagram');
  }

  try {
    const data = await extractProfile(page, username);
    return data;
  } finally {
    await ctx.close();
  }
}

module.exports = { run };
