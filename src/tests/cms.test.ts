/**
 * CMS contract tests — pure functions + graceful degradation when Supabase
 * is unconfigured (no env vars in this environment). No network calls.
 */
import { slugify, estimateReadingMinutes, buildPostMetadata, postJsonLd } from '../lib/cms/seo';
import { listPosts, getPostBySlug } from '../lib/cms/posts';
import { getSiteSettings } from '../lib/cms/settings';
import { isSupabaseConfigured, SupabaseNotConfigured } from '../lib/supabase/admin';
import { requireAdmin } from '../lib/cms/auth';
import { getSupabaseAdmin } from '../lib/supabase/admin';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`❌ TEST FAILED: ${message}`);
  console.log(`✅ PASS: ${message}`);
}

async function runCmsTests() {
  console.log('\n======================================================');
  console.log('🧩 CMS CONTRACT TESTS (Supabase unconfigured → graceful)');
  console.log('======================================================\n');

  // --- config detection ---
  assert(isSupabaseConfigured() === false, 'isSupabaseConfigured() is false without env vars');

  // --- slugify ---
  assert(slugify('Hello, World!') === 'hello-world', 'slugify basic');
  assert(slugify('  FBR Tax Slabs 2026/27  ') === 'fbr-tax-slabs-202627', 'slugify trims/slashes');
  assert(slugify('') === '', 'slugify empty');

  // --- reading time ---
  assert(estimateReadingMinutes('word '.repeat(400)) === 2, 'reading time 400 words = 2 min');
  assert(estimateReadingMinutes('hi') === 1, 'reading time minimum 1 min');

  // --- metadata builder with fallbacks ---
  const post: any = {
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'An excerpt',
    content: 'Hello',
    cover_image_url: null,
    category: 'blog',
    tags: ['a'],
    status: 'published',
    published_at: '2026-10-01T00:00:00Z',
    author_name: 'Pak Calc Hub',
    meta_title: null,
    meta_description: null,
    og_image_url: null,
    canonical_url: null,
    noindex: false,
    featured: false,
    views: 0,
    reading_minutes: 1,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z',
  };
  const md = buildPostMetadata(post, 'https://pakcalchub.com', {
    default_meta_description: 'Site default description',
    site_name: 'Pak Calc Hub',
  });
  assert(md.title === 'Test Post', 'metadata falls back to post title');
  assert(md.description === 'An excerpt', 'metadata prefers excerpt over site default');
  assert(md.alternates.canonical === 'https://pakcalchub.com/blog/test-post', 'metadata canonical URL');
  assert(md.openGraph.type === 'article', 'metadata openGraph type article');

  const noindexed = buildPostMetadata({ ...post, noindex: true }, 'https://pakcalchub.com', {});
  assert(noindexed.robots.index === false, 'metadata respects noindex');

  // --- JSON-LD ---
  const ld = postJsonLd(post, 'https://pakcalchub.com');
  assert(ld['@type'] === 'Article', 'JSON-LD Article type');
  assert(ld.url === 'https://pakcalchub.com/blog/test-post', 'JSON-LD url');
  assert(ld.datePublished === '2026-10-01T00:00:00Z', 'JSON-LD datePublished');

  // --- graceful degradation (no env vars) ---
  const listed = await listPosts({ status: 'published' });
  assert(listed.posts.length === 0 && listed.total === 0, 'listPosts returns empty when unconfigured');
  assert((await getPostBySlug('anything')) === null, 'getPostBySlug returns null when unconfigured');
  assert(Object.keys(await getSiteSettings()).length === 0, 'getSiteSettings returns {} when unconfigured');

  const adminCheck = await requireAdmin();
  assert(adminCheck.ok === false && (adminCheck as any).reason === 'not-configured', 'requireAdmin → not-configured');

  let threw = false;
  try {
    getSupabaseAdmin();
  } catch (e) {
    threw = e instanceof SupabaseNotConfigured;
  }
  assert(threw, 'getSupabaseAdmin throws SupabaseNotConfigured when unconfigured');

  console.log('\n🎉 ALL CMS CONTRACT TESTS PASSED\n');
}

runCmsTests().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

async function runDtoTests() {
  console.log('\n======================================================');
  console.log('🧩 CMS DTO MAPPING TESTS (snake_case DB ↔ camelCase API)');
  console.log('======================================================\n');

  const { toPostDTO, fromPostDTO } = await import('../lib/cms/posts');
  const { toSettingsDTO, fromSettingsDTO } = await import('../lib/cms/settings');

  const dbRow: any = {
    id: 'abc123',
    slug: 'test-post',
    title: 'Test Post',
    excerpt: 'Excerpt',
    content: '# Hello',
    cover_image_url: 'https://x/y.png',
    category: 'news',
    tags: ['fbr', 'tax'],
    status: 'published',
    published_at: '2026-10-04T00:00:00Z',
    author_name: 'Admin',
    meta_title: 'MT',
    meta_description: 'MD',
    og_image_url: 'https://x/og.png',
    canonical_url: null,
    noindex: false,
    featured: true,
    views: 42,
    reading_minutes: 5,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z',
  };

  const dto = toPostDTO(dbRow);
  assert(dto.coverImage === 'https://x/y.png', 'toPostDTO maps cover_image_url → coverImage');
  assert(dto.publishedAt === '2026-10-04T00:00:00Z', 'toPostDTO maps published_at → publishedAt');
  assert(dto.author === 'Admin', 'toPostDTO maps author_name → author');
  assert(dto.metaTitle === 'MT' && dto.metaDescription === 'MD', 'toPostDTO maps meta fields');
  assert(dto.ogImage === 'https://x/og.png' && dto.canonicalUrl === null, 'toPostDTO maps og/canonical');
  assert(dto.readingTimeMinutes === 5 && dto.views === 42, 'toPostDTO maps reading time + views');
  assert((dto as any).cover_image_url === undefined, 'toPostDTO exposes no snake_case keys');

  const back = fromPostDTO({
    title: 'New',
    coverImage: 'https://x/z.png',
    publishedAt: '2026-10-05T00:00:00Z',
    author: 'Editor',
    metaTitle: 'T',
    noindex: true,
    id: 'must-not-pass',
    views: 999,
    createdAt: 'x',
  });
  assert(back.cover_image_url === 'https://x/z.png', 'fromPostDTO maps coverImage → cover_image_url');
  assert(back.published_at === '2026-10-05T00:00:00Z', 'fromPostDTO maps publishedAt → published_at');
  assert(back.author_name === 'Editor', 'fromPostDTO maps author → author_name');
  assert((back as any).id === undefined, 'fromPostDTO strips read-only id');
  assert((back as any).views === undefined, 'fromPostDTO strips read-only views');
  assert((back as any).createdAt === undefined, 'fromPostDTO strips read-only createdAt');

  // Round-trip: UI payload → DB → UI is stable
  const uiPayload = { title: 'T', slug: 's', content: 'c', coverImage: 'u', author: 'A', tags: ['x'] };
  const rt = toPostDTO({ ...dbRow, ...fromPostDTO(uiPayload) } as any);
  assert(rt.coverImage === 'u' && rt.author === 'A', 'DTO round-trip preserves UI fields');

  // Settings DTO
  const sDto = toSettingsDTO({ site_name: 'Pak Calc Hub', default_meta_title: 'MT', announcement_enabled: true });
  assert(sDto.siteName === 'Pak Calc Hub', 'toSettingsDTO maps site_name → siteName');
  assert(sDto.defaultMetaTitle === 'MT', 'toSettingsDTO maps default_meta_title → defaultMetaTitle');
  assert(sDto.announcementEnabled === true, 'toSettingsDTO maps announcement_enabled → announcementEnabled');
  const sBack = fromSettingsDTO({ siteName: 'X', announcementText: 'Hi', footerText: 'F' });
  assert(sBack.site_name === 'X' && sBack.announcement_text === 'Hi' && sBack.footer_text === 'F', 'fromSettingsDTO maps camelCase → snake_case');

  console.log('\n🎉 All DTO mapping tests passed!\n');
}

runDtoTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
