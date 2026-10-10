import { formatPKR, safeNumber } from '../utils/formatters';
import { CalculatorOutput } from '../../types/calculator';

/**
 * CREATOR TOOLS — YouTube creator toolkit engines.
 * Zero per-use running cost: every number below is a static 2026 benchmark
 * compiled into the bundle. No external APIs, no AI calls.
 */

// ---------------------------------------------------------------------------
// Shared data
// ---------------------------------------------------------------------------

export interface YouTubeNiche {
  id: string;
  label: string;
  /** Average US CPM (advertiser payout per 1,000 ad impressions), 2026 benchmarks. */
  avgCpm: number;
  lowCpm: number;
  highCpm: number;
}

/** Long-form average CPM benchmarks (USD), 2026 — compiled from published
 *  creator-economy reports (see the tool's FAQ for the per-niche ranges). */
export const YOUTUBE_NICHES: YouTubeNiche[] = [
  { id: 'finance', label: 'Finance & Investing', avgCpm: 15, lowCpm: 12, highCpm: 22 },
  { id: 'technology', label: 'Technology & Software', avgCpm: 10, lowCpm: 8, highCpm: 14 },
  { id: 'business', label: 'Business & Entrepreneurship', avgCpm: 10, lowCpm: 8, highCpm: 12 },
  { id: 'education', label: 'Education & Courses', avgCpm: 6, lowCpm: 4, highCpm: 9 },
  { id: 'health', label: 'Health & Fitness', avgCpm: 6, lowCpm: 4, highCpm: 8 },
  { id: 'entertainment', label: 'Entertainment & Comedy', avgCpm: 5, lowCpm: 3, highCpm: 7 },
  { id: 'lifestyle', label: 'Lifestyle & Vlogging', avgCpm: 4, lowCpm: 3, highCpm: 6 },
  { id: 'gaming', label: 'Gaming', avgCpm: 3, lowCpm: 1, highCpm: 5 },
  { id: 'travel', label: 'Travel', avgCpm: 5, lowCpm: 4, highCpm: 10 },
  { id: 'food', label: 'Food & Cooking', avgCpm: 3.5, lowCpm: 3, highCpm: 8 },
];

export interface YouTubeCountry {
  id: string;
  label: string;
  /** Advertiser-demand multiplier relative to the US (1.0). */
  multiplier: number;
}

export const YOUTUBE_COUNTRIES: YouTubeCountry[] = [
  { id: 'us', label: 'United States', multiplier: 1.0 },
  { id: 'uk', label: 'United Kingdom', multiplier: 0.75 },
  { id: 'canada', label: 'Canada', multiplier: 0.75 },
  { id: 'australia', label: 'Australia', multiplier: 0.8 },
  { id: 'germany', label: 'Germany', multiplier: 0.6 },
  { id: 'uae', label: 'UAE', multiplier: 0.6 },
  { id: 'india', label: 'India', multiplier: 0.12 },
  { id: 'pakistan', label: 'Pakistan', multiplier: 0.1 },
  { id: 'indonesia', label: 'Indonesia', multiplier: 0.08 },
  { id: 'philippines', label: 'Philippines', multiplier: 0.1 },
  { id: 'brazil', label: 'Brazil', multiplier: 0.15 },
  { id: 'south-africa', label: 'South Africa', multiplier: 0.2 },
  { id: 'global', label: 'Global mix', multiplier: 0.5 },
];

/** Shorts revenue-pool RPM (creator earnings per 1,000 Shorts views, USD). */
export const SHORTS_RPM = { low: 0.03, avg: 0.07, high: 0.15 };

/** YouTube's creator share of ad revenue (long-form). */
const CREATOR_SHARE = 0.55;

export interface YouTubeTimezone {
  id: string;
  label: string;
  abbr: string;
}

export const YOUTUBE_TIMEZONES: YouTubeTimezone[] = [
  { id: 'pkt', label: 'Pakistan (PKT, UTC+5)', abbr: 'PKT' },
  { id: 'ist', label: 'India (IST, UTC+5:30)', abbr: 'IST' },
  { id: 'gst', label: 'UAE (GST, UTC+4)', abbr: 'GST' },
  { id: 'gmt', label: 'UK (GMT, UTC+0)', abbr: 'GMT' },
  { id: 'est', label: 'US Eastern (EST, UTC−5)', abbr: 'EST' },
  { id: 'pst', label: 'US Pacific (PST, UTC−8)', abbr: 'PST' },
  { id: 'aedt', label: 'Australia Eastern (AEDT, UTC+11)', abbr: 'AEDT' },
];

function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return '$0';
  const rounded = n < 10 ? Math.round(n * 100) / 100 : Math.round(n);
  return '$' + rounded.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtMoney(usd: number, currency: string, usdPkr: number): string {
  return currency === 'PKR' ? formatPKR(usd * usdPkr) : fmtUSD(usd);
}

// ---------------------------------------------------------------------------
// TOOL 1 — YouTube Earnings Estimator (DynamicCalculator engine)
// ---------------------------------------------------------------------------

export function calculateYouTubeEarnings(inputs: Record<string, any>): CalculatorOutput {
  const monthlyViews = Math.max(0, safeNumber(inputs.monthlyViews, 100000));
  const contentType = inputs.contentType === 'shorts' ? 'shorts' : 'longform';
  const niche = YOUTUBE_NICHES.find((n) => n.id === inputs.niche) || YOUTUBE_NICHES[0];
  const country = YOUTUBE_COUNTRIES.find((c) => c.id === inputs.audienceCountry) || YOUTUBE_COUNTRIES[YOUTUBE_COUNTRIES.length - 1];
  const currency = inputs.currency === 'PKR' ? 'PKR' : 'USD';
  const liveFx = inputs.liveFxRates && typeof inputs.liveFxRates === 'object' ? inputs.liveFxRates : undefined;
  const liveUsd = liveFx && typeof liveFx.USD === 'number' && liveFx.USD > 0 ? liveFx.USD : undefined;
  const usdPkr = liveUsd || 280;

  const thousands = monthlyViews / 1000;
  let monthlyLow: number;
  let monthlyHigh: number;
  let per1kLow: number;
  let per1kHigh: number;
  let rateLabel: string;

  if (contentType === 'shorts') {
    monthlyLow = thousands * SHORTS_RPM.low * country.multiplier;
    monthlyHigh = thousands * SHORTS_RPM.high * country.multiplier;
    per1kLow = SHORTS_RPM.low * country.multiplier;
    per1kHigh = SHORTS_RPM.high * country.multiplier;
    rateLabel = `Shorts RPM $${SHORTS_RPM.low}–$${SHORTS_RPM.high} / 1k views`;
  } else {
    monthlyLow = thousands * niche.lowCpm * country.multiplier * CREATOR_SHARE;
    monthlyHigh = thousands * niche.highCpm * country.multiplier * CREATOR_SHARE;
    per1kLow = niche.lowCpm * country.multiplier * CREATOR_SHARE;
    per1kHigh = niche.highCpm * country.multiplier * CREATOR_SHARE;
    rateLabel = `${niche.label} CPM $${niche.lowCpm}–$${niche.highCpm}`;
  }

  const range = `${fmtMoney(monthlyLow, currency, usdPkr)} – ${fmtMoney(monthlyHigh, currency, usdPkr)}`;
  const per1kRange = `${fmtMoney(per1kLow, currency, usdPkr)} – ${fmtMoney(per1kHigh, currency, usdPkr)}`;
  const yearlyRange = `${fmtMoney(monthlyLow * 12, currency, usdPkr)} – ${fmtMoney(monthlyHigh * 12, currency, usdPkr)}`;
  const typeLabel = contentType === 'shorts' ? 'YouTube Shorts' : 'Long-form videos';

  return {
    primaryResult: {
      id: 'monthlyEarnings',
      label: 'Estimated Monthly Earnings',
      value: range,
      type: 'text',
      highlight: true,
      color: 'success',
      subtext: `${typeLabel} · ${niche.label} · ${country.label} audience`,
    },
    secondaryResults: [
      { id: 'yearlyEarnings', label: 'Estimated Yearly Earnings', value: yearlyRange, type: 'text' },
      { id: 'per1k', label: 'Earnings per 1,000 Views', value: per1kRange, type: 'text' },
      {
        id: 'rateUsed',
        label: 'Rate Basis',
        value: `${rateLabel} × ${country.multiplier}× country`,
        type: 'text',
        subtext: contentType === 'longform' ? 'Includes YouTube’s 55% creator share' : 'Shorts pool — no separate creator-share cut',
      },
    ],
    breakdown: [
      { label: 'Monthly Views', amount: monthlyViews.toLocaleString('en-US') },
      { label: 'Content Type', amount: typeLabel },
      { label: 'Niche Benchmark (US CPM)', amount: contentType === 'shorts' ? `$${SHORTS_RPM.low}–$${SHORTS_RPM.high} RPM` : `$${niche.lowCpm}–$${niche.highCpm}` },
      { label: `${country.label} Advertiser Multiplier`, amount: `${country.multiplier}×` },
      ...(contentType === 'longform' ? [{ label: 'YouTube Creator Share', amount: '55%' }] : []),
      { label: 'Estimated Monthly Earnings', amount: range, isTotal: true },
    ],
    notes: [
      'Rough estimate, not a promise: real RPM moves with watch time, video length, season (Q4 pays 30–50% more), ad-block usage and the share of views that are actually monetized.',
      'Long-form formula: (views ÷ 1,000) × niche CPM × country multiplier × 55% creator share. Shorts formula: (views ÷ 1,000) × Shorts RPM × country multiplier.',
      contentType === 'shorts'
        ? 'Shorts pay roughly 30–100× less per view than long-form — use them for subscriber growth, not as your main income.'
        : 'On Shorts the same views would earn roughly 30–100× less (Shorts RPM is only $0.03–$0.15 per 1,000 views).',
      ...(currency === 'PKR'
        ? [liveUsd
            ? `Converted with the live USD/PKR mid-market rate of Rs. ${liveUsd.toFixed(2)}.`
            : 'Converted at a fallback Rs. 280 per USD — check the live interbank rate for today’s figure.']
        : []),
      'Want the full rate table? See “What are average YouTube CPM rates by niche?” in the FAQs below.',
    ],
  };
}

// Stub engines for the three interactive (custom-UI) tools. The tool page
// renders bespoke client components for these ids, so DynamicCalculator never
// calls these — but categories.ts requires every tool to register a function.
function interactiveStub(toolName: string): CalculatorOutput {
  return {
    primaryResult: {
      id: 'interactive',
      label: toolName,
      value: 'Use the interactive workspace above',
      type: 'text',
    },
    notes: ['This is a fully interactive, client-side tool — every keystroke is processed in your browser. No data leaves your device.'],
  };
}

export function calculateYouTubeTagGenerator(): CalculatorOutput {
  return interactiveStub('YouTube Tag & Hashtag Generator');
}

export function calculateYouTubeDescriptionGenerator(): CalculatorOutput {
  return interactiveStub('YouTube Description Generator');
}

export function calculateBestTimeToPost(): CalculatorOutput {
  return interactiveStub('Best Time to Post on YouTube');
}

// ---------------------------------------------------------------------------
// TOOL 2 — Tag & hashtag generation (pure, client-side)
// ---------------------------------------------------------------------------

export interface TagGenerationResult {
  tags: string[];
  hashtags: string[];
  totalChars: number;
}

const QUESTION_WORDS = ['how', 'what', 'why', 'when', 'where', 'which', 'who'];

function capWord(w: string): string {
  return w.length === 0 ? w : w[0].toUpperCase() + w.slice(1).toLowerCase();
}

export function generateYouTubeTags(
  rawKeyword: string,
  contentType: 'video' | 'shorts' = 'video',
  count: number = 15
): TagGenerationResult {
  const keyword = rawKeyword.trim().replace(/\s+/g, ' ');
  if (!keyword) return { tags: [], hashtags: [], totalChars: 0 };
  const K = keyword;
  const lower = K.toLowerCase();
  const startsQuestion = QUESTION_WORDS.some((w) => lower === w || lower.startsWith(w + ' '));

  const candidates: string[] = [
    K,
    `${K} 2026`,
    `best ${K}`,
    `${K} tutorial`,
    `${K} for beginners`,
    `${K} tips`,
    `${K} explained`,
    `${K} review`,
    ...(startsQuestion ? [] : [`how to ${lower}`]),
    `${K} guide`,
    `${K} tricks`,
    `${K} full video`,
    `${K} step by step`,
    `${K} for you`,
    `${K} 2025`,
    `${K} tips and tricks`,
    `learn ${K}`,
    `${K} masterclass`,
    `${K} secrets`,
    `${K} do's and don'ts`,
  ];
  if (contentType === 'shorts') {
    candidates.splice(1, 0, `${K} shorts`, `${K} short video`);
  }

  const seen = new Set<string>();
  const tags: string[] = [];
  for (const c of candidates) {
    const key = c.toLowerCase();
    if (seen.has(key) || c.length > 60) continue;
    seen.add(key);
    tags.push(c);
    if (tags.length >= count) break;
  }

  const words = K.split(' ');
  const camel = words.map((w, i) => (i === 0 ? w.toLowerCase() : capWord(w))).join('');
  const noSpace = words.map((w) => w.toLowerCase()).join('');
  const hashtagCandidates = [
    `#${camel}`,
    `#${noSpace}`,
    `#${words[0].toLowerCase()}`,
    ...(contentType === 'shorts' ? ['#shorts', '#short'] : ['#youtube', '#newvideo']),
  ];
  const hSeen = new Set<string>();
  const hashtags: string[] = [];
  for (const h of hashtagCandidates) {
    const key = h.toLowerCase();
    if (hSeen.has(key) || h.length < 3) continue;
    hSeen.add(key);
    hashtags.push(h);
    if (hashtags.length >= 6) break;
  }

  const totalChars = tags.join(',').length;
  return { tags, hashtags, totalChars };
}

// ---------------------------------------------------------------------------
// TOOL 3 — Description builder (pure, client-side)
// ---------------------------------------------------------------------------

export interface DescriptionOptions {
  title: string;
  keyword: string;
  keyPoints: string[];
  tone: 'friendly' | 'professional' | 'exciting';
  includeChapters: boolean;
  includeHashtags: boolean;
  cta: 'subscribe' | 'comment' | 'link';
}

const TONE_HOOKS: Record<DescriptionOptions['tone'], (kw: string) => string> = {
  friendly: (kw) => `Welcome back! In this video we're breaking down ${kw} in the simplest way possible — no fluff, just what actually works.`,
  professional: (kw) => `This video provides a structured, in-depth overview of ${kw}, covering the key concepts every viewer should understand.`,
  exciting: (kw) => `You won't believe how much changes once you understand ${kw} — this video reveals everything you need to know!`,
};

const TONE_PARAGRAPHS: Record<DescriptionOptions['tone'], (kw: string) => string> = {
  friendly: (kw) => `Whether you're just getting started with ${kw} or looking to sharpen your skills, this video walks you through each step with clear examples. By the end, you'll have a practical understanding of ${kw} that you can apply right away.`,
  professional: (kw) => `We examine ${kw} from first principles: definitions, best practices, common mistakes, and measurable outcomes. Timestamps below let you jump to the section most relevant to your work on ${kw}.`,
  exciting: (kw) => `We packed this video with the most powerful insights on ${kw} — the strategies, the shortcuts, and the mistakes to avoid. If ${kw} matters to you, watch this all the way through!`,
};

const CTA_LINES: Record<DescriptionOptions['cta'], string> = {
  subscribe: 'If this helped you, subscribe and hit the bell 🔔 so you never miss an upload!',
  comment: 'Got questions? Drop them in the comments below — I read and reply to every single one!',
  link: 'Links and resources mentioned in this video: [add your links here]',
};

function fmtTimestamp(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const mm = String(m).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:00` : `${mm}:00`;
}

export function buildYouTubeDescription(opts: DescriptionOptions): string {
  const title = opts.title.trim() || 'My New Video';
  const keyword = opts.keyword.trim() || title;
  const points = opts.keyPoints.map((p) => p.trim()).filter(Boolean).slice(0, 12);
  const words = keyword.split(/\s+/);
  const camel = words.map((w, i) => (i === 0 ? w.toLowerCase() : capWord(w))).join('');

  const lines: string[] = [];
  lines.push(`🎬 ${title}`);
  lines.push('');
  lines.push(TONE_HOOKS[opts.tone](keyword));
  lines.push('');
  lines.push(TONE_PARAGRAPHS[opts.tone](keyword));
  if (points.length > 0) {
    lines.push('');
    lines.push('📌 In this video:');
    for (const p of points) lines.push(`✅ ${p}`);
  }
  if (opts.includeChapters && points.length > 0) {
    lines.push('');
    lines.push('⏱️ Chapters:');
    lines.push('00:00 Intro');
    points.forEach((p, i) => {
      lines.push(`${fmtTimestamp((i + 1) * 2)} ${p}`);
    });
  }
  lines.push('');
  lines.push(CTA_LINES[opts.cta]);
  if (opts.includeHashtags) {
    lines.push('');
    lines.push(`#${camel} #youtube #newvideo`);
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// TOOL 4 — Best-time-to-post heatmap data (pure, client-side)
// ---------------------------------------------------------------------------

export interface TimeSlot {
  label: string;
  score: 0 | 1 | 2 | 3; // 0 avoid, 1 low, 2 good, 3 best
  isBest: boolean;
}

export interface DayRow {
  day: string;
  slots: TimeSlot[];
}

const SLOT_LABELS = ['Morning\n6–11 AM', 'Afternoon\n12–4 PM', 'Evening\n5–9 PM', 'Night\n10 PM–2 AM'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LONGFORM_BASE: number[][] = [
  // Mon..Sun × [morning, afternoon, evening, night]
  [0, 1, 1, 0],
  [1, 2, 1, 0],
  [1, 2, 1, 0],
  [2, 3, 2, 1],
  [2, 3, 2, 1],
  [3, 2, 1, 1],
  [1, 1, 1, 0],
];

const SHORTS_BASE: number[][] = [
  [1, 2, 1, 0],
  [2, 3, 2, 1],
  [2, 3, 2, 1],
  [2, 3, 2, 1],
  [1, 2, 2, 1],
  [2, 2, 1, 1],
  [2, 2, 1, 0],
];

const EVENING_NICHES = ['gaming', 'entertainment', 'lifestyle'];
const MORNING_NICHES = ['business', 'education', 'finance', 'technology', 'health'];

export interface BestTimeResult {
  days: DayRow[];
  recommendation: string;
  bestCells: string[];
}

export function getBestTimeGrid(
  timezoneId: string,
  nicheId: string,
  contentType: 'longform' | 'shorts'
): BestTimeResult {
  const tz = YOUTUBE_TIMEZONES.find((t) => t.id === timezoneId) || YOUTUBE_TIMEZONES[0];
  const niche = YOUTUBE_NICHES.find((n) => n.id === nicheId) || YOUTUBE_NICHES[0];
  const base = contentType === 'shorts' ? SHORTS_BASE : LONGFORM_BASE;
  const label = contentType === 'shorts' ? 'Shorts' : 'long-form videos';

  let bestDay = '';
  let bestSlot = '';
  let bestScore = -1;
  const days: DayRow[] = DAYS.map((day, di) => {
    const slots: TimeSlot[] = SLOT_LABELS.map((slotLabel, si) => {
      let score = base[di][si];
      // Niche flavour: entertainment/gaming skew evening, business/education skew weekday mornings.
      if (EVENING_NICHES.includes(niche.id) && si === 2 && (di === 4 || di === 5)) score = Math.min(3, score + 1);
      if (MORNING_NICHES.includes(niche.id) && si === 0 && di >= 1 && di <= 4) score = Math.min(3, score + 1);
      const s = score as 0 | 1 | 2 | 3;
      if (score > bestScore) {
        bestScore = score;
        bestDay = day;
        bestSlot = slotLabel.replace('\n', ' ');
      }
      return { label: slotLabel, score: s, isBest: false };
    });
    return { day, slots };
  });

  // Mark the top-scoring cell(s) as best.
  const topScore = bestScore;
  const bestCells: string[] = [];
  days.forEach((d) =>
    d.slots.forEach((s) => {
      if (s.score === topScore && topScore >= 2) {
        s.isBest = true;
        bestCells.push(`${d.day} ${s.label.replace('\n', ' ')}`);
      }
    })
  );

  const recDay = bestDay || 'Thursday';
  const recSlot = bestSlot || 'Afternoon 12–4 PM';
  const recommendation =
    contentType === 'shorts'
      ? `Post your ${label} on ${recDay} around ${recSlot} (${tz.abbr}) — midday is when ${niche.label.toLowerCase()} viewers scroll most. Post 1–2 hours before the peak so the algorithm has time to test your Short.`
      : `Upload ${label} on ${recDay} around ${recSlot} (${tz.abbr}) — that's when your ${niche.label.toLowerCase()} audience is most active. Publish 2–3 hours before peak viewing so YouTube can index the video first.`;

  return { days, recommendation, bestCells };
}
