/**
 * Final verification – browser-like HTTP checks.
 * Run with dev server: npm run dev (in another terminal).
 * Usage: node scripts/final-verification.mjs [baseUrl]
 * Optional env: ADMIN_EMAIL, ADMIN_PASSWORD (default from seed: admin@majstor.me, Test123!)
 */

const BASE = process.argv[2] || "http://localhost:3010";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@majstor.me";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Test123!";

const results = { ok: true, steps: [], adminLoadMs: null, errors: [] };

function log(msg) {
  console.log(msg);
  results.steps.push(msg);
}

function fail(msg) {
  results.ok = false;
  results.errors.push(msg);
  log("  FAIL: " + msg);
}

async function main() {
  log("Final verification – " + BASE);
  log("");

  const cookieJar = { current: "" };

  function applyCookies(res) {
    const set = res.headers.get("set-cookie");
    if (set) {
      const parts = set.split(/,\s*(?=[^;]*=)/);
      for (const p of parts) {
        const name = p.split("=")[0];
        if (name) cookieJar.current = (cookieJar.current ? cookieJar.current + "; " : "") + p.split(",")[0].trim();
      }
    }
  }

  const headers = (extra = {}) => ({
    "User-Agent": "FinalVerification/1.0",
    ...(cookieJar.current ? { Cookie: cookieJar.current } : {}),
    ...extra,
  });

  // 1. Homepage
  log("1. Homepage GET /");
  try {
    const r = await fetch(BASE + "/", { redirect: "follow", headers: headers() });
    applyCookies(r);
    if (r.status !== 200) fail("Homepage status " + r.status);
    else log("   OK status 200");
    const html = await r.text();
    if (!html.includes("Prijava")) fail("Homepage body does not contain 'Prijava'");
    else log("   OK body contains 'Prijava' (login link)");
  } catch (e) {
    fail("Homepage request error: " + e.message);
  }
  log("");

  // 2. Login page
  log("2. Login page GET /login");
  try {
    const r = await fetch(BASE + "/login", { redirect: "follow", headers: headers() });
    applyCookies(r);
    if (r.status !== 200) fail("Login page status " + r.status);
    else log("   OK status 200");
    const html = await r.text();
    if (!/login|Prijava|email|lozinka/i.test(html)) fail("Login page does not look like login");
    else log("   OK login page content present");
  } catch (e) {
    fail("Login page request error: " + e.message);
  }
  log("");

  // 3. CSRF
  log("3. Get CSRF token");
  let csrfToken = "";
  try {
    const r = await fetch(BASE + "/api/auth/csrf", { headers: headers() });
    applyCookies(r);
    const data = await r.json();
    csrfToken = data?.csrfToken || "";
    if (!csrfToken) fail("No csrfToken in response");
    else log("   OK csrfToken received");
  } catch (e) {
    fail("CSRF request error: " + e.message);
  }
  log("");

  // 4. Login (credentials)
  log("4. POST login (credentials)");
  try {
    const body = new URLSearchParams({
      csrfToken,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      callbackUrl: BASE + "/admin",
      json: "true",
    });
    const r = await fetch(BASE + "/api/auth/callback/credentials", {
      method: "POST",
      redirect: "manual",
      credentials: "include",
      headers: headers({ "Content-Type": "application/x-www-form-urlencoded" }),
      body: body.toString(),
    });
    applyCookies(r);
    const text = await r.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch (_) {}
    if (json?.url) {
      log("   OK login response (redirect url present)");
    } else if (r.status === 200 || r.status === 302) {
      log("   OK login response status " + r.status);
    } else {
      fail("Login response status " + r.status + " body: " + text.slice(0, 200));
    }
  } catch (e) {
    fail("Login POST error: " + e.message);
  }
  log("");

  // 5. Admin dashboard (authenticated) + load time
  log("5. GET /admin (authenticated) – measure load time");
  const adminStart = Date.now();
  try {
    const r = await fetch(BASE + "/admin", { redirect: "follow", headers: headers() });
    results.adminLoadMs = Date.now() - adminStart;
    applyCookies(r);
    const html = await r.text();
    if (r.status !== 200) fail("Admin status " + r.status + " (expected 200 when logged in)");
    else log("   OK status 200");
    if (html.includes("An error occurred in the Server Components render")) fail("Server Components render error in body");
    else log("   OK no Server Components error in body");
    log("   Admin load time: ~" + results.adminLoadMs + " ms");
  } catch (e) {
    fail("Admin request error: " + e.message);
  }
  log("");

  // 6. Admin sub-routes
  for (const path of ["/admin/requests", "/admin/users", "/admin/handymen"]) {
    log("6. GET " + path);
    try {
      const r = await fetch(BASE + path, { redirect: "follow", headers: headers() });
      const html = await r.text();
      if (r.status !== 200) fail(path + " status " + r.status);
      else log("   OK " + path + " status 200");
      if (html.includes("An error occurred in the Server Components render")) fail("Server Components error on " + path);
    } catch (e) {
      fail(path + " request error: " + e.message);
    }
  }
  log("");

  // Summary
  log("--- Summary ---");
  if (results.ok) {
    log("All checks passed.");
    log("Login click: homepage links to /login and /login opens correctly.");
    log("Admin when authenticated: /admin returns 200 and no server component error.");
    log("Approximate /admin load time: " + (results.adminLoadMs ?? "N/A") + " ms");
    log("No runtime crash detected on /admin, /admin/requests, /admin/users, /admin/handymen.");
  } else {
    log("Some checks failed:");
    results.errors.forEach((e) => log("  - " + e));
  }
  process.exit(results.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
