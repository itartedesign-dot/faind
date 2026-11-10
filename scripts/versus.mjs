/* =====================================================================
   FAIND — approfondimenti del confronto AI (confronto/en/<pagina>.html)
   ---------------------------------------------------------------------
   Poche pagine, ognuna con contenuto proprio e una domanda precisa:
   • ChatGPT o Claude, ChatGPT o Gemini, Claude o Gemini (sfide dirette);
   • vale la pena un piano da 100-200 dollari?
   Prezzi, piani e giudizi vengono da compare.mjs (SERVICES e TEXT), così
   restano in linea con la pagina principale. Il testo di confronto è
   scritto a mano qui sotto e va riletto quando cambiano i prodotti.
   Non si aggiungono altre coppie "per riempire": ogni pagina deve dire
   qualcosa che la pagina principale non dice.
   ===================================================================== */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SERVICES, TEXT, CHECKED, esc, shellEn } from './compare.mjs';

const SITE = 'https://faind.org/';
const DIR = 'confronto/en/';
const svc = (id) => SERVICES.find(s => s.id === id);
const usd = (n) => '$' + (Number.isInteger(n) ? n : n.toFixed(2));
const cheapest = (s) => s.plans.length ? s.plans.reduce((a, b) => (b[1] < a[1] ? b : a)) : null;
const standard = (s) => s.plans.find(p => p[1] >= 19 && p[1] <= 20) || null;
const top = (s) => s.plans.length ? s.plans.reduce((a, b) => (b[1] > a[1] ? b : a)) : null;
const planTxt = (p) => p ? `${p[0]} (${usd(p[1])}/month)` : 'none';

// Sfide dirette: introduzione, differenze scritte a mano, "scegli A se / B se", domande
const PAIRS = [
  {
    slug: 'chatgpt-vs-claude', a: 'chatgpt', b: 'claude',
    title: 'ChatGPT vs Claude: which one is worth paying for',
    desc: 'ChatGPT and Claude compared on price, writing, code, long documents and extra features, with the plans side by side and when to pick each.',
    h1: 'ChatGPT or Claude: which one should you pay for',
    lede: 'They cost the same at the standard level, so the choice is not about money. It is about what you do all day: ChatGPT is the broader tool, Claude is the one many people prefer when the work is writing, reading long documents or code.',
    differences: [
      ['Breadth', 'ChatGPT puts text, images, voice and tools in a single app, with a very large ecosystem of guides and integrations. Claude has fewer side features and concentrates on text, documents and code.'],
      ['Writing', 'Claude is the one people reach for when a text has to sound natural and precise, including long ones. ChatGPT writes well too, and is faster to get a general-purpose draft from.'],
      ['Documents and code', 'Claude is among the strongest at analysing long documents and at programming. ChatGPT can do both, but it is not where it stands out the most.'],
      ['Price ladder', 'ChatGPT starts cheaper, with the Go plan at $8 a month. Claude has nothing below $20, but offers a discount if you pay yearly.'],
      ['Limits', 'On Claude, usage limits depend on how long the conversations are and are reached quickly on heavy work. On ChatGPT the main complaint is the opposite: it is hard to tell what each plan includes.']
    ],
    pickA: ['You want one app for everything: chat, images, voice.', 'You are starting out and want the largest amount of guides and examples.', 'You want to start below $20, with the Go plan.', 'You use AI for many different small things, not for one heavy job.'],
    pickB: ['You write a lot and want texts that need less rewriting.', 'You work with long documents you need to understand or summarise.', 'You write code regularly.', 'You prefer fewer features and more depth, and you will pay yearly for the discount.'],
    faq: [
      ['Is Claude better than ChatGPT?', 'Not in general. Claude is stronger for careful writing, long documents and code, while ChatGPT is more versatile. The better one is the one that fits your main job.'],
      ['Do ChatGPT and Claude cost the same?', 'At the standard level yes: ChatGPT Plus and Claude Pro are both $20 a month. ChatGPT also has a cheaper Go plan at $8, and Claude lowers Pro to about $17 a month if you pay yearly.'],
      ['Can I use both?', 'Yes, many people do, using ChatGPT for everyday tasks and Claude for writing and code. Both have a free plan to test with before paying.']
    ]
  },
  {
    slug: 'chatgpt-vs-gemini', a: 'chatgpt', b: 'gemini',
    title: 'ChatGPT vs Gemini: prices, features and who each one suits',
    desc: 'ChatGPT and Gemini compared on price, Google integration, video, features and ecosystem, with their plans side by side and when to pick each.',
    h1: 'ChatGPT or Gemini: which one fits you',
    lede: 'The question is less about which model is smarter and more about where you already work. If your day runs in Gmail, Docs and Drive, Gemini is where you already are. If you want the widest set of features and guides in one app, ChatGPT is the safer start.',
    differences: [
      ['Where it lives', 'Gemini is built into Gmail, Docs and Drive, and its paid plans include storage. ChatGPT is a separate app that works anywhere, with a larger ecosystem of guides and integrations.'],
      ['Entry price', 'Gemini has the cheapest paid plan among the big names: Google AI Plus at $4.99 a month. ChatGPT Go costs $8. At the standard level they are the same: $19.99 and $20.'],
      ['Video and images', 'Gemini is very strong at video generation. ChatGPT is the more complete all-rounder, with text, images and voice together.'],
      ['Clarity', 'Gemini plan and model names have changed often, so finding your way is not easy, and some features reach the United States before Europe. ChatGPT has the opposite issue: many features, and it is not obvious what each plan includes.'],
      ['Ads', 'The ChatGPT free plan and Go show ads in some countries.']
    ],
    pickA: ['You want the widest set of features in one app.', 'You do not live in the Google ecosystem.', 'You want the largest amount of guides, examples and integrations.', 'You want voice, images and text together.'],
    pickB: ['You live in Gmail, Docs and Drive.', 'You want the cheapest paid plan to try, at $4.99.', 'You want to generate video.', 'You value storage included in the plan.'],
    faq: [
      ['Is Gemini cheaper than ChatGPT?', 'To start, yes: Google AI Plus is $4.99 a month and ChatGPT Go is $8. At the standard level they are almost identical, $19.99 for Google AI Pro and $20 for ChatGPT Plus.'],
      ['Which one is better if I use Gmail and Google Docs?', 'Gemini, because it works inside those apps and the plan includes storage. Outside Google services, it loses part of its advantage.'],
      ['Do ChatGPT and Gemini have free plans?', 'Yes, both have a free plan with limits on requests or models. It is the easiest way to compare them on your own tasks.']
    ]
  },
  {
    slug: 'claude-vs-gemini', a: 'claude', b: 'gemini',
    title: 'Claude vs Gemini: writing and code vs Google and price',
    desc: 'Claude and Gemini compared on writing, code, long documents, Google integration, video and price, with plans side by side and when to pick each.',
    h1: 'Claude or Gemini: depth or integration',
    lede: 'These two almost never compete for the same person. Claude is for those who write, read long documents and code. Gemini is for those who live in Google services and want the cheapest way into a paid AI.',
    differences: [
      ['What it is built for', 'Claude is valued for natural writing, careful reasoning and programming. Gemini is built into Gmail, Docs and Drive, with image and video generation.'],
      ['Entry price', 'Gemini starts at $4.99 a month with Google AI Plus. Claude has no paid plan below $20, with Pro at $17 a month if paid yearly.'],
      ['Extras', 'Claude has fewer side features, such as images and video. Gemini is very strong at video, and its plans include storage.'],
      ['Heavy use', 'Claude limits are reached quickly on heavy work, because they depend on conversation length. Gemini plans scale from $4.99 up to about $200, which makes it easier to find a size that fits.'],
      ['Outside its home', 'Gemini loses part of its edge outside the Google ecosystem. Claude does not depend on where you work.']
    ],
    pickA: ['You write or code for a living.', 'You analyse long documents.', 'You prefer substance to special effects.', 'You do not mind the $20 entry price.'],
    pickB: ['Your work runs in Gmail, Docs and Drive.', 'You want a paid AI for $4.99 to try.', 'You want video generation.', 'You want storage included.'],
    faq: [
      ['Is Claude better than Gemini for writing?', 'For careful, natural writing and long documents many people prefer Claude. Gemini is stronger when the job is inside Google apps or involves video.'],
      ['Which is cheaper, Claude or Gemini?', 'Gemini: Google AI Plus is $4.99 a month. Claude starts at $20, and about $17 a month with yearly billing.'],
      ['Which one should a beginner choose?', 'Whichever matches the tools you already use: Gemini if you live in Google services, Claude if your main work is writing or code. Both have a free plan.']
    ]
  }
];

const faqLd = (faq) => ({ '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) });
const crumb = (url, name) => ({ '@type': 'BreadcrumbList', itemListElement: [
  { '@type': 'ListItem', position: 1, name: 'FAIND', item: SITE },
  { '@type': 'ListItem', position: 2, name: 'AI assistants compared', item: SITE + DIR },
  { '@type': 'ListItem', position: 3, name, item: url }] });
const article = (url, h1, desc) => ({ '@type': 'Article', '@id': url + '#article', headline: h1, description: desc, inLanguage: 'en', dateModified: CHECKED, datePublished: CHECKED, mainEntityOfPage: url,
  author: { '@type': 'Person', name: 'Paolo Buono', url: SITE + 'about.html' }, publisher: { '@id': SITE + '#org' }, image: SITE + 'assets/og-image.png' });
const dateTxt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(CHECKED + 'T12:00:00Z'));
const ul = (arr) => `<ul>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const faqHtml = (faq) => faq.map(([q, a]) => `      <h3 style="font-size:17.5px;font-weight:760;color:var(--ink);margin:18px 0 6px">${esc(q)}</h3>\n      <p>${esc(a)}</p>`).join('\n');
const related = (current) => {
  const links = PAIRS.filter(p => p.slug !== current).map(p => `<li><a href="${p.slug}.html">${esc(p.h1)}</a></li>`);
  links.push(...(current === 'is-a-200-dollar-ai-plan-worth-it' ? [] : ['<li><a href="is-a-200-dollar-ai-plan-worth-it.html">Is a $100 or $200 AI plan worth it?</a></li>']));
  return `<section><h2>Keep reading</h2><ul>${links.join('')}<li><a href="./#chooser">Quick chooser: two questions, a recommendation</a></li><li><a href="./">All the assistants compared, with prices</a></li></ul></section>`;
};

function pairPage(p) {
  const A = svc(p.a), B = svc(p.b), TA = TEXT[p.a].en, TB = TEXT[p.b].en, url = `${SITE}${DIR}${p.slug}.html`;
  const row = (label, fa, fb) => `<tr><td><strong>${label}</strong></td><td>${esc(fa)}</td><td>${esc(fb)}</td></tr>`;
  const table = `<div class="cmp__scroll"><table class="cmp__t"><thead><tr><th></th><th>${esc(A.name)}</th><th>${esc(B.name)}</th></tr></thead><tbody>
${row('Made by', A.by, B.by)}
${row('Free plan', 'Yes, with limits', 'Yes, with limits')}
${row('Cheapest paid plan', planTxt(cheapest(A)), planTxt(cheapest(B)))}
${row('Standard plan', planTxt(standard(A)), planTxt(standard(B)))}
${row('Top plan', planTxt(top(A)), planTxt(top(B)))}
${row('Best for', TA.best, TB.best)}
</tbody></table></div>`;
  const diffs = p.differences.map(([h, t]) => `<h3 style="font-size:17.5px;font-weight:760;color:var(--ink);margin:18px 0 6px">${esc(h)}</h3><p>${esc(t)}</p>`).join('');
  const body = `    <p class="lsw"><a href="./">← AI assistants compared</a></p>
    <h1 class="legal__title">${esc(p.h1)}</h1>
    <p class="legal__updated">Prices checked on ${dateTxt}. US list prices in dollars, taxes excluded.</p>
    <p class="legal__lede">${esc(p.lede)}</p>
    <section><h2>${esc(A.name)} and ${esc(B.name)} side by side</h2>${table}
      <p style="font-size:13.5px;margin-top:10px">Prices: official US list prices. Full ranking in <a href="./#prezzi">the price table</a>.</p></section>
    <section><h2>Where they differ</h2>${diffs}</section>
    <section><h2>Strengths and weak points</h2>
      <div class="cmp__pc">
        <div><h4>${esc(A.name)}: strengths</h4>${ul(TA.pros)}<h4>${esc(A.name)}: weak points</h4>${ul(TA.cons)}</div>
        <div><h4>${esc(B.name)}: strengths</h4>${ul(TB.pros)}<h4>${esc(B.name)}: weak points</h4>${ul(TB.cons)}</div>
      </div></section>
    <section><h2>Which one to pick</h2>
      <div class="cmp__pc">
        <div><h4>Pick ${esc(A.name)} if</h4>${ul(p.pickA)}</div>
        <div><h4>Pick ${esc(B.name)} if</h4>${ul(p.pickB)}</div>
      </div>
      <blockquote style="margin:16px 0;padding:14px 16px;border-left:4px solid #4293B9;background:rgba(66,147,185,.08);border-radius:0 10px 10px 0"><strong>Paolo Buono's take</strong>
        <p style="margin:6px 0 0">«${esc(TA.verdict)}»</p><p style="margin:6px 0 0">«${esc(TB.verdict)}»</p></blockquote>
      <p style="font-size:13.5px">These are personal opinions of <a href="../../about.html">Paolo Buono</a>, who has used these tools since they launched, not lab tests. FAIND receives no payment from any of the companies named.</p></section>
    <section id="faq"><h2>Quick answers</h2>
${faqHtml(p.faq)}
    </section>
    ${related(p.slug)}
    <p class="legal__back"><a class="btn btn--primary" href="../../">Back to FAIND news</a></p>`;
  const jsonld = { '@context': 'https://schema.org', '@graph': [article(url, p.h1, p.desc), crumb(url, p.h1), faqLd(p.faq)] };
  return shellEn({ title: p.title, desc: p.desc, url, jsonld, body });
}

// Guida ai piani da 100-200 dollari
function highTierPage() {
  const slug = 'is-a-200-dollar-ai-plan-worth-it', url = `${SITE}${DIR}${slug}.html`;
  const rows = SERVICES.flatMap(s => s.plans.filter(p => p[1] >= 99).map(p => ({ s, p }))).sort((x, y) => x.p[1] - y.p[1] || x.s.name.localeCompare(y.s.name));
  const table = `<div class="cmp__scroll"><table class="cmp__t"><thead><tr><th>Plan</th><th>By</th><th>Per month</th><th>Cheapest paid plan of the same service</th></tr></thead><tbody>
${rows.map(({ s, p }) => `<tr><td><strong>${esc(p[0])}</strong></td><td>${esc(s.by)}</td><td class="cmp__p">${usd(p[1])}</td><td>${esc(planTxt(cheapest(s)))}</td></tr>`).join('\n')}
</tbody></table></div>`;
  const faq = [
    ['Is a $200 AI plan worth it?', 'Only if you hit the limits of the $20 plan every day. The most expensive plans are meant for people who work with AI many hours a day. For normal use they are money wasted.'],
    ['What is the difference between the $100 and $200 plans?', 'Within the same service, the $200 tier generally gives a larger usage allowance than the $100 one, not a different kind of product. Check what the service says each tier includes before paying.'],
    ['How can I test if I need a higher plan?', 'Stay on the $20 plan for a month and note how many times you are stopped by a limit. If it is every working day, upgrade for one month, not a year, and see if it changes your work.']
  ];
  const body = `    <p class="lsw"><a href="./">← AI assistants compared</a></p>
    <h1 class="legal__title">Is a $100 or $200 AI plan worth it?</h1>
    <p class="legal__updated">Prices checked on ${dateTxt}. US list prices in dollars, taxes excluded.</p>
    <p class="legal__lede">The standard AI plan costs about $20 a month. Every major service also sells tiers at $100, $200 or more. For most people the answer is no. This page helps you see if you are not most people.</p>
    <section><h2>The expensive plans, side by side</h2>${table}
      <p style="font-size:13.5px;margin-top:10px">Only plans of $99 or more are listed. See <a href="./#prezzi">the full price ranking</a> for the rest.</p></section>
    <section><h2>You probably need one if</h2>${ul(['You hit the usage limit of the $20 plan on most working days.', 'AI is part of your work for several hours a day: coding, research, writing, analysis.', 'Being stopped by a limit costs you more than the price difference.', 'You tried the $20 plan seriously first, and you know where it falls short.'])}</section>
    <section><h2>You probably do not if</h2>${ul(['You use AI a few times a day for questions, drafts and summaries.', 'You rarely or never see a limit message.', 'You want to try a feature: use the free plan or the $20 plan for that.', 'You are paying yearly for a higher tier without having tested it for a month.'])}</section>
    <section><h2>How to decide without wasting money</h2>
      <ol><li><strong>Stay on the $20 plan for a month</strong> and note each time a limit stops you.</li><li><strong>If it is almost every working day,</strong> upgrade for one month only, never yearly, and compare.</li><li><strong>Compare the alternative:</strong> two $20 plans from different services cost $40 and give you two separate allowances, and two different strengths. This is an opinion, not a rule, so test it.</li><li><strong>Go back down</strong> if you do not notice the difference.</li></ol></section>
    <section><h2>Where to start</h2><p>The $20 plans are compared in detail in <a href="./#schede">the assistant cards</a>. For the two most common choices see <a href="chatgpt-vs-claude.html">ChatGPT or Claude</a> and <a href="chatgpt-vs-gemini.html">ChatGPT or Gemini</a>.</p>
      <p style="font-size:13.5px">Opinions by <a href="../../about.html">Paolo Buono</a>. FAIND receives no payment from any of the companies named.</p></section>
    <section id="faq"><h2>Quick answers</h2>
${faqHtml(faq)}
    </section>
    ${related(slug)}
    <p class="legal__back"><a class="btn btn--primary" href="../../">Back to FAIND news</a></p>`;
  const h1 = 'Is a $100 or $200 AI plan worth it?', desc = 'ChatGPT Pro, Claude Max, Google AI Ultra, Perplexity Max and the other $100-$300 AI plans: who needs them, who does not, and how to test it without wasting money.';
  const jsonld = { '@context': 'https://schema.org', '@graph': [article(url, h1, desc), crumb(url, h1), faqLd(faq)] };
  return shellEn({ title: 'Is a $200 AI plan worth it? Who needs ChatGPT Pro or Claude Max', desc, url, jsonld, body });
}

export const VERSUS_LINKS = [...PAIRS.map(p => [p.slug + '.html', p.h1]), ['is-a-200-dollar-ai-plan-worth-it.html', 'Is a $100 or $200 AI plan worth it?']];

export async function buildVersus(root) {
  const dir = path.join(root, DIR);
  await mkdir(dir, { recursive: true });
  const urls = [];
  for (const p of PAIRS) { await writeFile(path.join(dir, p.slug + '.html'), pairPage(p)); urls.push(`${SITE}${DIR}${p.slug}.html`); }
  await writeFile(path.join(dir, 'is-a-200-dollar-ai-plan-worth-it.html'), highTierPage()); urls.push(`${SITE}${DIR}is-a-200-dollar-ai-plan-worth-it.html`);
  try {
    const file = path.join(root, 'sitemap.xml');
    const xml = await readFile(file, 'utf8');
    const extra = urls.filter(u => !xml.includes(`<loc>${u}</loc>`)).map(u => `<url><loc>${u}</loc><lastmod>${CHECKED}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`).join('\n');
    if (extra) await writeFile(file, xml.replace('</urlset>', extra + '\n</urlset>'));
  } catch (e) { console.warn('  sitemap non aggiornata con gli approfondimenti del confronto:', e.message); }
  console.log(`⚖️  approfondimenti confronto AI: ${urls.length} pagine`);
}
