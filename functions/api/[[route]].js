/**
 * Civic Talk — Cloudflare Pages Functions API
 * 檔名：functions/api/[[route]].js
 *
 * 管理端點需在 Cloudflare Pages 設定環境變數：
 *   ADMIN_PASSWORD = 你設定的管理密碼
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
function error(msg, status = 400) { return json({ error: msg }, status); }

// 驗證管理員身份
function checkAdmin(request, env) {
  const token = request.headers.get('X-Admin-Token');
  const password = env.ADMIN_PASSWORD || 'admin';
  return token === password;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '') || '/';
  const method = request.method;
  const DB = env.DB;

  // ── 管理員驗證端點 ──────────────────────────────────────
  if (method === 'POST' && path === '/admin/login') {
    const body = await request.json();
    const password = env.ADMIN_PASSWORD || 'admin';
    if (body.password === password) return json({ ok: true });
    return json({ ok: false }, 401);
  }

  // ── 管理員統計 ──────────────────────────────────────────
  if (method === 'GET' && path === '/admin/stats') {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    const issues = await DB.prepare('SELECT COUNT(*) as cnt FROM issues').first();
    const materials = await DB.prepare('SELECT COUNT(*) as cnt FROM materials').first();
    const opinions = await DB.prepare('SELECT COUNT(*) as cnt FROM opinions').first();
    const briefings = await DB.prepare('SELECT COUNT(*) as cnt FROM briefings').first();
    return json({ issues: issues.cnt, materials: materials.cnt, opinions: opinions.cnt, briefings: briefings.cnt });
  }

  // ── GET /issues ─────────────────────────────────────────
  if (method === 'GET' && path === '/issues') {
    const { results } = await DB.prepare(
      'SELECT id, title, description, status, created_at FROM issues ORDER BY created_at DESC'
    ).all();
    for (const issue of results) {
      const { results: mats } = await DB.prepare(
        'SELECT COUNT(*) as cnt FROM materials WHERE issue_id = ?'
      ).bind(issue.id).all();
      issue.material_count = mats[0]?.cnt ?? 0;
    }
    return json(results);
  }

  // ── POST /issues ────────────────────────────────────────
  if (method === 'POST' && path === '/issues') {
    const body = await request.json();
    if (!body.title) return error('title is required');
    const { meta } = await DB.prepare(
      'INSERT INTO issues (title, description, polis_id) VALUES (?, ?, ?)'
    ).bind(body.title, body.description ?? '', body.polis_id ?? null).run();
    return json({ id: meta.last_row_id, title: body.title }, 201);
  }

  // ── 解析 /issues/:id ────────────────────────────────────
  const issueMatch = path.match(/^\/issues\/(\d+)(\/.*)?$/);

  // ── 管理：DELETE /materials/:id ─────────────────────────
  const matMatch = path.match(/^\/materials\/(\d+)$/);
  if (method === 'DELETE' && matMatch) {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    await DB.prepare('DELETE FROM materials WHERE id = ?').bind(parseInt(matMatch[1])).run();
    return json({ ok: true });
  }

  // ── 管理：DELETE /opinions/:id ──────────────────────────
  const opMatch = path.match(/^\/opinions\/(\d+)$/);
  if (method === 'DELETE' && opMatch) {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    await DB.prepare('DELETE FROM opinions WHERE id = ?').bind(parseInt(opMatch[1])).run();
    return json({ ok: true });
  }

  if (!issueMatch) return error('Not found', 404);

  const issueId = parseInt(issueMatch[1]);
  const subPath = issueMatch[2] ?? '';

  // ── GET /issues/:id ─────────────────────────────────────
  if (method === 'GET' && subPath === '') {
    const issue = await DB.prepare('SELECT * FROM issues WHERE id = ?').bind(issueId).first();
    if (!issue) return error('Issue not found', 404);
    const { results: materials } = await DB.prepare(
      'SELECT * FROM materials WHERE issue_id = ? ORDER BY created_at DESC'
    ).bind(issueId).all();
    const briefing = await DB.prepare(
      'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
    ).bind(issueId).first();
    const { results: opinions } = await DB.prepare(
      'SELECT id, summary, created_at FROM opinions WHERE issue_id = ? ORDER BY created_at DESC'
    ).bind(issueId).all();
    return json({ issue, materials, briefing: briefing ?? null, opinions });
  }

  // ── 管理：PUT /issues/:id（編輯議題）───────────────────
  if (method === 'PUT' && subPath === '') {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    const body = await request.json();
    await DB.prepare(
      'UPDATE issues SET title = ?, description = ?, status = ?, polis_id = ? WHERE id = ?'
    ).bind(body.title, body.description ?? '', body.status ?? 'collecting', body.polis_id ?? null, issueId).run();
    return json({ ok: true });
  }

  // ── 管理：DELETE /issues/:id ────────────────────────────
  if (method === 'DELETE' && subPath === '') {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    await DB.prepare('DELETE FROM opinions WHERE issue_id = ?').bind(issueId).run();
    await DB.prepare('DELETE FROM briefings WHERE issue_id = ?').bind(issueId).run();
    await DB.prepare('DELETE FROM materials WHERE issue_id = ?').bind(issueId).run();
    await DB.prepare('DELETE FROM issues WHERE id = ?').bind(issueId).run();
    return json({ ok: true });
  }

  // ── GET /issues/:id/materials ───────────────────────────
  if (method === 'GET' && subPath === '/materials') {
    const { results } = await DB.prepare(
      'SELECT * FROM materials WHERE issue_id = ? ORDER BY created_at DESC'
    ).bind(issueId).all();
    return json(results);
  }

  // ── POST /issues/:id/materials ──────────────────────────
  if (method === 'POST' && subPath === '/materials') {
    const body = await request.json();
    if (!body.content) return error('content is required');
    const { meta } = await DB.prepare(
      'INSERT INTO materials (issue_id, source_name, source_url, stance, content) VALUES (?, ?, ?, ?, ?)'
    ).bind(issueId, body.source_name ?? '', body.source_url ?? '', body.stance ?? 'unknown', body.content).run();
    await DB.prepare(
      "UPDATE issues SET status = 'summarizing' WHERE id = ? AND status = 'collecting'"
    ).bind(issueId).run();
    return json({ id: meta.last_row_id }, 201);
  }

  // ── GET /issues/:id/briefing ────────────────────────────
  if (method === 'GET' && subPath === '/briefing') {
    const briefing = await DB.prepare(
      'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
    ).bind(issueId).first();
    return json(briefing ?? null);
  }

  // ── POST /issues/:id/briefing ───────────────────────────
  if (method === 'POST' && subPath === '/briefing') {
    const body = await request.json();
    const existing = await DB.prepare(
      'SELECT MAX(version) as maxv FROM briefings WHERE issue_id = ?'
    ).bind(issueId).first();
    const nextVersion = (existing?.maxv ?? 0) + 1;
    await DB.prepare(
      'INSERT INTO briefings (issue_id, consensus, disputes, positions, narrative, opinion_prompt, version) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(issueId, body.consensus ?? '', body.disputes ?? '', body.positions ?? '', body.narrative ?? '', body.opinion_prompt ?? '', nextVersion).run();
    await DB.prepare(
      "UPDATE issues SET status = 'published' WHERE id = ? AND status IN ('collecting', 'summarizing')"
    ).bind(issueId).run();
    return json({ version: nextVersion }, 201);
  }

  // ── 管理：PUT /issues/:id/briefing（編輯說明頁）────────
  if (method === 'PUT' && subPath === '/briefing') {
    if (!checkAdmin(request, env)) return error('Unauthorized', 401);
    const body = await request.json();
    const existing = await DB.prepare(
      'SELECT id FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
    ).bind(issueId).first();
    if (!existing) return error('No briefing found', 404);
    await DB.prepare(
      'UPDATE briefings SET consensus = ?, disputes = ?, positions = ?, narrative = ? WHERE id = ?'
    ).bind(body.consensus ?? '', body.disputes ?? '', body.positions ?? '', body.narrative ?? '', existing.id).run();
    return json({ ok: true });
  }

  // ── GET /issues/:id/opinions ────────────────────────────
  if (method === 'GET' && subPath === '/opinions') {
    const { results } = await DB.prepare(
      'SELECT id, summary, created_at FROM opinions WHERE issue_id = ? ORDER BY created_at DESC'
    ).bind(issueId).all();
    return json(results);
  }

  // ── POST /issues/:id/opinions ───────────────────────────
  if (method === 'POST' && subPath === '/opinions') {
    const body = await request.json();
    if (!body.summary) return error('summary is required');
    const { meta } = await DB.prepare(
      'INSERT INTO opinions (issue_id, summary) VALUES (?, ?)'
    ).bind(issueId, body.summary).run();
    return json({ id: meta.last_row_id }, 201);
  }

  // ── GET /issues/:id/prompt ──────────────────────────────
  if (method === 'GET' && subPath === '/prompt') {
    const type = url.searchParams.get('type') ?? 'summarize';
    const { results: materials } = await DB.prepare(
      'SELECT source_name, source_url, stance, content FROM materials WHERE issue_id = ? ORDER BY created_at'
    ).bind(issueId).all();
    const issue = await DB.prepare('SELECT title FROM issues WHERE id = ?').bind(issueId).first();
    if (materials.length === 0) return error('尚無素材，請先新增素材再生成 Prompt。');

    const materialsText = materials.map((m, i) =>
      `【素材 ${i + 1}】來源：${m.source_name || '未知'}（${m.source_url || '無連結'}）\n立場：${m.stance}\n內容：\n${m.content}`
    ).join('\n\n---\n\n');

    let prompt = '';
    if (type === 'summarize') {
      prompt = `你是一位公民審議助理。請根據以下關於「${issue.title}」的素材，整理出：\n\n1. **共識**：大多數立場都同意的事實或前提（2-4 點）\n2. **爭點**：各方有明顯分歧的核心問題（2-4 點）\n3. **立場地圖**：誰在乎哪些面向、各自的論據是什麼（分立場描述）\n\n要求：忠實呈現原始素材的內容，不添加立場判斷。格式使用繁體中文 Markdown。\n\n以下是素材：\n\n${materialsText}`;
    } else if (type === 'narrative') {
      const briefing = await DB.prepare('SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1').bind(issueId).first();
      if (!briefing) return error('請先完成彙整再生成說明頁。');
      prompt = `你是一位公民議題編輯。請根據以下彙整結果，寫一份一頁式說明（800字以內，繁體中文）：\n\n議題：${issue.title}\n共識：${briefing.consensus}\n爭點：${briefing.disputes}\n立場地圖：${briefing.positions}`;
    } else if (type === 'synthesis') {
      const { results: opinions } = await DB.prepare('SELECT summary FROM opinions WHERE issue_id = ? ORDER BY created_at DESC LIMIT 50').bind(issueId).all();
      const briefing = await DB.prepare('SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1').bind(issueId).first();
      if (opinions.length === 0) return error('尚無民眾意見。');
      const opinionsText = opinions.map((o, i) => `【意見 ${i + 1}】\n${o.summary}`).join('\n\n---\n\n');
      prompt = `請分析以下 ${opinions.length} 份個人意見，與原有彙整比對，找出新觀點：\n\n原有共識：${briefing?.consensus ?? ''}\n原有爭點：${briefing?.disputes ?? ''}\n\n個人意見：\n${opinionsText}`;
    }
    return json({ prompt, type, material_count: materials.length });
  }

  return error('Not found', 404);
}
