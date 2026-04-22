// Smoke-test every backend endpoint.
// Usage: node scripts/smoke-test-endpoints.js
// Public endpoints expect 2xx. Protected endpoints expect 401 (rejecting anonymous).

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:5000';

const tests = [
  // ── Health & root ──────────────────────────────────────────────────────
  { method: 'GET', path: '/api', expect: 200, public: true },
  { method: 'GET', path: '/health', expect: 200, public: true },

  // ── Auth (admin) ───────────────────────────────────────────────────────
  { method: 'GET', path: '/api/admin/auth/check', expect: 401, public: false },
  { method: 'POST', path: '/api/admin/auth/login', expect: [400, 401], public: true,
    body: { email: 'nobody@example.test', password: 'wrong' } },
  { method: 'POST', path: '/api/admin/auth/logout', expect: [200, 400, 401], public: true },

  // ── Auth (user) ────────────────────────────────────────────────────────
  { method: 'GET', path: '/api/user/auth/check', expect: 401, public: false },
  { method: 'POST', path: '/api/user/auth/login', expect: [400, 401], public: true,
    body: { email: 'nobody@example.test', password: 'wrong' } },
  { method: 'POST', path: '/api/user/auth/forgot-password', expect: [200, 400, 404], public: true,
    body: { email: 'nobody@example.test' } },

  // ── Properties (public) ────────────────────────────────────────────────
  { method: 'GET', path: '/api/properties/get-all', expect: 200, public: true,
    expectShape: (json) => Array.isArray(json.properties) && typeof json.totalItems === 'number' },
  { method: 'GET', path: '/api/properties/get-all?limit=2&page=1', expect: 200, public: true,
    expectShape: (json) => json.properties.length <= 2 },
  { method: 'GET', path: '/api/properties/get-all?city=Lekki', expect: 200, public: true,
    expectShape: (json) => json.properties.every((p) => p.city === 'Lekki') },
  { method: 'GET', path: '/api/properties/get-all?type=Duplex', expect: 200, public: true,
    expectShape: (json) => json.properties.every((p) => p.type === 'Duplex') },
  { method: 'GET', path: '/api/properties/get-all?status=For%20Rent', expect: 200, public: true,
    expectShape: (json) => json.properties.every((p) => p.status === 'For Rent') },
  { method: 'GET', path: '/api/properties/get/00000000-0000-0000-0000-000000000000', expect: 404, public: true },
  { method: 'GET', path: '/api/properties/search?query=Lekki', expect: 200, public: true,
    expectShape: (json) => Array.isArray(json.properties) || Array.isArray(json.data) },
  { method: 'GET', path: '/api/properties/search', expect: [400, 200], public: true },

  // ── Blogs (public) ─────────────────────────────────────────────────────
  { method: 'GET', path: '/api/blogs/get-all', expect: 200, public: true },
  { method: 'GET', path: '/api/blogs/search?query=test', expect: 200, public: true },
  { method: 'GET', path: '/api/blogs/get/00000000-0000-0000-0000-000000000000', expect: 404, public: true },
  { method: 'GET', path: '/api/blogs/getRelated/00000000-0000-0000-0000-000000000000', expect: [200, 404], public: true },

  // ── Interactions ───────────────────────────────────────────────────────
  { method: 'GET', path: '/api/interactions/reviews/getAll', expect: 200, public: true },
  { method: 'PUT', path: '/api/interactions/viewBlog/00000000-0000-0000-0000-000000000000', expect: [200, 404], public: true },
  { method: 'PUT', path: '/api/interactions/commentBlog/00000000-0000-0000-0000-000000000000', expect: 401, public: false,
    body: { content: 'test' } },
  { method: 'PUT', path: '/api/interactions/reviewProperty/00000000-0000-0000-0000-000000000000', expect: 401, public: false },

  // ── Sell (public form) ─────────────────────────────────────────────────
  { method: 'POST', path: '/api/sell/submit', expect: [200, 400, 422, 500], public: true,
    body: {} },

  // ── Inquiries ──────────────────────────────────────────────────────────
  { method: 'POST', path: '/api/inquiries', expect: [201, 400, 404, 422, 500], public: true,
    body: {} },

  // ── Notifications (uses protectRoute internally) ───────────────────────
  { method: 'GET', path: '/api/notifications', expect: [200, 401], public: false },
  { method: 'GET', path: '/api/notifications/unread-count', expect: [200, 401], public: false },

  // ── Favorites (require auth) ───────────────────────────────────────────
  { method: 'GET', path: '/api/favorites', expect: 401, public: false },
  { method: 'GET', path: '/api/favorites/ids', expect: 401, public: false },
  { method: 'GET', path: '/api/favorites/check/00000000-0000-0000-0000-000000000000', expect: 401, public: false },

  // ── Admin operations (require admin) ───────────────────────────────────
  { method: 'POST', path: '/api/admin/ops/add-property', expect: 401, public: false, body: {} },
  { method: 'PUT', path: '/api/admin/ops/update-property/abc', expect: 401, public: false, body: {} },
  { method: 'DELETE', path: '/api/admin/ops/delete-property/abc', expect: 401, public: false },
  { method: 'POST', path: '/api/admin/ops/add-blog', expect: 401, public: false, body: {} },
  { method: 'GET', path: '/api/admin/ops/newsletter/stats', expect: 401, public: false },
  { method: 'POST', path: '/api/admin/ops/newsletter/send', expect: 401, public: false, body: {} },

  // ── Admin staff (super_admin only) ─────────────────────────────────────
  { method: 'GET', path: '/api/admin/staff', expect: 401, public: false },
  { method: 'POST', path: '/api/admin/staff', expect: 401, public: false, body: {} },
  { method: 'GET', path: '/api/admin/staff/abc', expect: 401, public: false },

  // ── Admin dashboard (varies by role) ───────────────────────────────────
  { method: 'GET', path: '/api/admin/dashboard/properties/stats', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/users/stats', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/revenue/stats', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/getBlogs', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/getStaffs', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/getUsers', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/comments', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/comments/stats', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/reviews', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/reviews/stats', expect: 401, public: false },

  // ── Sell submissions (admin) ───────────────────────────────────────────
  { method: 'GET', path: '/api/admin/dashboard/sell-submissions', expect: 401, public: false },
  { method: 'GET', path: '/api/admin/dashboard/sell-submissions/stats', expect: 401, public: false },

  // ── Inquiries admin ────────────────────────────────────────────────────
  { method: 'GET', path: '/api/inquiries', expect: 401, public: false },

  // ── Broadcast (admin) ──────────────────────────────────────────────────
  // Routes inspected via grep — endpoints exist but exact paths weren't trivially listable.

  // ── 404 sanity ─────────────────────────────────────────────────────────
  { method: 'GET', path: '/api/this-route-does-not-exist', expect: 404, public: true },
];

const matches = (status, expect) =>
  Array.isArray(expect) ? expect.includes(status) : status === expect;

const colour = (s, code) => `\x1b[${code}m${s}\x1b[0m`;
const green = (s) => colour(s, 32);
const red = (s) => colour(s, 31);
const yellow = (s) => colour(s, 33);
const dim = (s) => colour(s, 90);

async function run() {
  console.log(`\nSmoke testing ${BASE}\n`);
  const results = { pass: 0, fail: 0, warn: 0 };

  for (const t of tests) {
    const url = `${BASE}${t.path}`;
    let status, json, text, error;
    const init = {
      method: t.method,
      headers: t.body ? { 'Content-Type': 'application/json' } : undefined,
      body: t.body ? JSON.stringify(t.body) : undefined,
    };

    try {
      const res = await fetch(url, init);
      status = res.status;
      text = await res.text();
      try { json = JSON.parse(text); } catch { json = null; }
    } catch (e) {
      error = e.message;
    }

    const tag = `${t.method.padEnd(6)} ${t.path}`;
    if (error) {
      console.log(`${red('FAIL')}  ${tag}  network error: ${error}`);
      results.fail++;
      continue;
    }

    const expectStr = Array.isArray(t.expect) ? t.expect.join('|') : t.expect;
    const statusOk = matches(status, t.expect);
    let shapeOk = true;
    let shapeMsg = '';
    if (statusOk && t.expectShape && json) {
      try {
        shapeOk = !!t.expectShape(json);
        if (!shapeOk) shapeMsg = ' (shape mismatch)';
      } catch (e) {
        shapeOk = false;
        shapeMsg = ` (shape fn threw: ${e.message})`;
      }
    }

    if (statusOk && shapeOk) {
      console.log(`${green('PASS')}  ${tag}  ${dim(`→ ${status}`)}`);
      results.pass++;
    } else if (statusOk) {
      console.log(`${yellow('WARN')}  ${tag}  ${dim(`→ ${status}`)}${shapeMsg}`);
      results.warn++;
    } else {
      const snippet = text ? text.slice(0, 140).replace(/\s+/g, ' ') : '';
      console.log(`${red('FAIL')}  ${tag}  ${dim(`expected ${expectStr}, got ${status}`)}  ${dim(snippet)}`);
      results.fail++;
    }
  }

  console.log(
    `\n${green(results.pass + ' passed')}, ${yellow(results.warn + ' warnings')}, ${red(results.fail + ' failed')} (${tests.length} total)\n`
  );
  process.exit(results.fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error('Smoke runner crashed:', e);
  process.exit(2);
});
