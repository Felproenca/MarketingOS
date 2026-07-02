---
name: topic-intelligence
description: Research a topic directly across YouTube, TikTok, LinkedIn, Instagram, and Google Trends in multiple languages before content creation. Use when choosing themes, validating editorial demand, comparing how a subject is framed across markets, finding native language and audience tensions, or creating a new content thesis, campaign, calendar, post, carousel, or video about a theme that has not yet been researched.
---

# Topic Intelligence

Transform platform evidence into an editorial thesis. Do not generate content
from a loose topic, isolated trend, or single-channel observation.

Use `agent-roster.json` as the role map. The first three agents are dedicated
contracts; copy, creative execution and critique reuse existing MarketingOS
skills instead of duplicating them.

## Required inputs

- topic or problem;
- audience;
- acquisition objective;
- client slug;
- primary market and language;
- at least two comparison languages.

Default languages for Brazilian operations: `pt-BR`, `en`, `es`. Replace or add
languages when the niche has a stronger reference market.

## Workflow

1. Define 5-10 native search expressions per language. Translate intent, not
   words: include expert terms, colloquial phrasing, pain, desire and objection.
2. Check Google Trends for relative demand, geography, direction and
   seasonality. Treat it as market context, never as proof of content quality.
3. Research the topic directly on YouTube, TikTok, LinkedIn and Instagram.
   Read [references/channels.md](references/channels.md) before browsing.
4. Delegate collection to `agents/channel-researcher.md`.
5. Delegate comparison to `agents/cross-market-analyst.md`.
6. Delegate thesis selection to `agents/editorial-strategist.md`.
7. Capture evidence with URL, platform, language, date, author, format, hook,
   frame, proof, CTA and visible audience response.
8. Separate facts from inference. Quotes must be short and attributed; prefer
   structured paraphrase.
9. Compare channels and languages using
   [references/abstraction.md](references/abstraction.md).
10. Produce one thesis, not a list of disconnected ideas.
11. Save the dossier before handing off to the existing copy agent.

## Evidence floor

- Google Trends snapshot for the primary market;
- at least three of the four social platforms;
- at least three languages unless the operator records why two are sufficient;
- at least three recent artifacts per researched platform;
- at least one audience-response signal per platform;
- no artifact older than 180 days unless used as an explicit historical anchor.

If the evidence floor is not met, return `insufficient_evidence`. Do not fill
gaps with model memory.

## Output

Save:

`clients/[slug]/outputs/inteligencia/topic-dossiers/YYYY-MM-DD-[topic].json`

Use `templates/topic-dossier.template.json`.

The dossier must contain:

- query map by language;
- evidence ledger;
- platform grammar;
- cross-language frames;
- repeated claims and cliches;
- audience questions and objections;
- contradictions;
- whitespace;
- editorial thesis;
- acquisition relevance;
- recommended native execution per channel;
- informational value before any commercial transition;
- claims that require independent verification.

## Creation gate

Do not pass to `/criar` unless:

- every central claim traces to evidence;
- the thesis explains why the topic matters now;
- the output distinguishes platform grammar from topic popularity;
- adaptation preserves the brand voice instead of copying foreign creators;
- the proposed content has a commercial or perception job.

Research is interpretation infrastructure. It is not permission to clone hooks,
scripts, visuals or creator identity.

## Editorial posture

Default to informative content that creates interest. Teach what changed,
interpret what the market is saying, expose a contradiction or demonstrate a
process. Do not force the R$97 product or the total solution into every asset.

Direct selling belongs to a declared offer, outbound or conversion asset.
