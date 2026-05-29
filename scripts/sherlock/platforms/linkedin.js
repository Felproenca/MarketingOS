'use strict';
const { getReadyContext, waitForLogin } = require('../session');

const PLATFORM = 'linkedin';
const LOGIN_URL = 'https://www.linkedin.com/login';

async function isLoggedIn(page) {
  try {
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    const feed = await page.$('.feed-shared-update-v2, [data-view-name="feed-home"]');
    const loginForm = await page.$('#username');
    return !!feed && !loginForm;
  } catch {
    return false;
  }
}

async function extractCompany(page, target) {
  const slug = target.replace('@', '').replace(/.*linkedin\.com\/company\//, '');
  const url = `https://www.linkedin.com/company/${slug}/`;

  console.log(`\n  Navegando para ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const name = document.querySelector('h1.org-top-card-summary__title, .org-top-card__primary-content h1')?.textContent?.trim();
    const tagline = document.querySelector('.org-top-card-summary__tagline')?.textContent?.trim();
    const followers = document.querySelector('.org-top-card-summary-info-list__info-item')?.textContent?.trim();
    const industry = document.querySelector('.org-top-card-summary-info-list__info-item + li, .org-top-card-summary-info-list li:nth-child(2)')?.textContent?.trim();
    const about = document.querySelector('.org-top-card-summary__profile-container p, .about-us-organization-description__text')?.textContent?.trim()?.slice(0, 500);

    return { name, tagline, followers, industry, about };
  });

  // Navigate to posts
  await page.goto(`${url}posts/`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(2000);

  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(600);
  }

  const posts = await page.evaluate(() => {
    return [...document.querySelectorAll('.org-updates__update-content, .feed-shared-update-v2')].slice(0, 10).map(el => {
      const text = el.querySelector('.feed-shared-text, .feed-shared-inline-show-more-text')?.textContent?.trim()?.slice(0, 300);
      const reactions = el.querySelector('[aria-label*="reação"], .social-counts-reactions__count-value')?.textContent?.trim();
      const comments = el.querySelector('[aria-label*="comentário"], .comments-comments-list__count')?.textContent?.trim();
      const date = el.querySelector('.feed-shared-actor__sub-description time, time[datetime]')?.textContent?.trim();
      const hasImage = !!el.querySelector('img.ivm-view-attr__img--centered');
      const hasVideo = !!el.querySelector('video');

      return { text, reactions, comments, date, hasImage, hasVideo };
    }).filter(p => p.text);
  });

  return {
    platform: PLATFORM,
    handle: slug,
    fullName: data.name,
    bio: data.about,
    category: data.industry,
    stats: [
      { label: 'seguidores', value: data.followers },
      { label: 'setor', value: data.industry },
    ],
    posts: posts.map(p => ({
      imgAlt: p.text,
      likes: p.reactions,
      commentCount: p.comments,
      date: p.date,
      isImage: p.hasImage,
      isVideo: p.hasVideo,
    })),
    scrapedAt: new Date().toISOString(),
  };
}

async function run(target) {
  const { ctx, page, needsLogin } = await getReadyContext(PLATFORM, isLoggedIn);

  if (needsLogin) {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await waitForLogin(page, isLoggedIn, 'LinkedIn');
  }

  try {
    const data = await extractCompany(page, target);
    return data;
  } finally {
    await ctx.close();
  }
}

module.exports = { run };
