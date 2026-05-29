'use strict';
const { chromium } = require('playwright');

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

async function run(channelUrl) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'pt-BR' });
  const page = await ctx.newPage();

  // Normalize URL
  let url = channelUrl;
  if (!url.startsWith('http')) {
    url = `https://www.youtube.com/@${url.replace('@', '')}`;
  }

  console.log(`\n  Navegando para ${url}...`);

  // Channel home
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  const channelData = await page.evaluate(() => {
    const name = document.querySelector('#channel-name, yt-formatted-string#text.ytd-channel-name')?.textContent?.trim()
      || document.title.replace(' - YouTube', '').trim();

    const subs = document.querySelector('#subscriber-count, yt-formatted-string#subscriber-count')?.textContent?.trim();

    const description = document.querySelector('#description-container, #description')?.textContent?.trim()?.slice(0, 500);

    const links = [...document.querySelectorAll('#links-holder a, #link-list-container a')]
      .map(a => a.href).filter(Boolean);

    return { name, subs, description, links };
  });

  // Navigate to Videos tab
  await page.goto(`${url}/videos`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Scroll to load more videos
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(800);
  }

  const videos = await page.evaluate(() => {
    return [...document.querySelectorAll('ytd-rich-item-renderer, ytd-grid-video-renderer')].slice(0, 12).map(el => {
      const title = el.querySelector('#video-title, a#video-title')?.textContent?.trim();
      const views = el.querySelector('.ytd-video-meta-block span:first-child, #metadata-line span:first-child')?.textContent?.trim();
      const date = el.querySelector('.ytd-video-meta-block span:last-child, #metadata-line span:last-child')?.textContent?.trim();
      const duration = el.querySelector('ytd-thumbnail-overlay-time-status-renderer span, span.ytd-thumbnail-overlay-time-status-renderer')?.textContent?.trim();
      const url = el.querySelector('a#thumbnail, a[href*="/watch"]')?.href;
      const isShort = url?.includes('/shorts/');

      return { title, views, date, duration, url, isShort };
    }).filter(v => v.title);
  });

  await browser.close();

  return {
    platform: 'youtube',
    handle: url,
    fullName: channelData.name,
    bio: channelData.description,
    stats: [{ label: 'inscritos', value: channelData.subs }],
    links: channelData.links,
    posts: videos.map(v => ({
      url: v.url,
      imgAlt: v.title,
      isShort: v.isShort,
      likes: null,
      views: v.views,
      date: v.date,
      duration: v.duration,
    })),
    scrapedAt: new Date().toISOString(),
  };
}

module.exports = { run };
