/**
 * Civic Talk - Cloudflare Worker API
 * Routes:
 *   GET    /api/issues              → list all issues
 *   POST   /api/issues              → create issue
 *   GET    /api/issues/:id          → get issue detail
 *   GET    /api/issues/:id/materials → list materials
 *   POST   /api/issues/:id/materials → add material
 *   GET    /api/issues/:id/briefing  → get latest briefing
 *   POST   /api/issues/:id/briefing  → save briefing (volunteer submits AI output)
 *   POST   /api/issues/:id/opinions  → submit opinion
 *   GET    /api/issues/:id/opinions  → list opinions
 *   GET    /api/issues/:id/prompt    → generate summarization prompt for volunteer
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function error(msg, status = 400) {
  return json({ error: msg }, status);
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Route: GET /api/issues
    if (method === 'GET' && path === '/api/issues') {
      const { results } = await env.DB.prepare(
        'SELECT id, title, description, status, created_at FROM issues ORDER BY created_at DESC'
      ).all();
      // Attach material count
      for (const issue of results) {
        const { results: mats } = await env.DB.prepare(
          'SELECT COUNT(*) as cnt FROM materials WHERE issue_id = ?'
        ).bind(issue.id).all();
        issue.material_count = mats[0]?.cnt ?? 0;
      }
      return json(results);
    }

    // Route: POST /api/issues
    if (method === 'POST' && path === '/api/issues') {
      const body = await request.json();
      if (!body.title) return error('title is required');
      const { meta } = await env.DB.prepare(
        'INSERT INTO issues (title, description) VALUES (?, ?)'
      ).bind(body.title, body.description ?? '').run();
      return json({ id: meta.last_row_id, title: body.title }, 201);
    }

    // Match /api/issues/:id and sub-paths
    const issueMatch = path.match(/^\/api\/issues\/(\d+)(\/.*)?$/);
    if (!issueMatch) return error('Not found', 404);

    const issueId = parseInt(issueMatch[1]);
    const subPath = issueMatch[2] ?? '';

    // Route: GET /api/issues/:id
    if (method === 'GET' && subPath === '') {
      const issue = await env.DB.prepare(
        'SELECT * FROM issues WHERE id = ?'
      ).bind(issueId).first();
      if (!issue) return error('Issue not found', 404);

      const { results: materials } = await env.DB.prepare(
        'SELECT * FROM materials WHERE issue_id = ? ORDER BY created_at DESC'
      ).bind(issueId).all();

      const briefing = await env.DB.prepare(
        'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
      ).bind(issueId).first();

      const { results: opinions } = await env.DB.prepare(
        'SELECT id, summary, created_at FROM opinions WHERE issue_id = ? ORDER BY created_at DESC'
      ).bind(issueId).all();

      return json({ issue, materials, briefing, opinions });
    }

    // Route: GET /api/issues/:id/materials
    if (method === 'GET' && subPath === '/materials') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM materials WHERE issue_id = ? ORDER BY created_at DESC'
      ).bind(issueId).all();
      return json(results);
    }

    // Route: POST /api/issues/:id/materials
    if (method === 'POST' && subPath === '/materials') {
      const body = await request.json();
      if (!body.content) return error('content is required');
      const { meta } = await env.DB.prepare(
        `INSERT INTO materials (issue_id, source_name, source_url, stance, content)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(issueId, body.source_name ?? '', body.source_url ?? '', body.stance ?? 'unknown', body.content).run();
      return json({ id: meta.last_row_id }, 201);
    }

    // Route: GET /api/issues/:id/briefing
    if (method === 'GET' && subPath === '/briefing') {
      const briefing = await env.DB.prepare(
        'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
      ).bind(issueId).first();
      if (!briefing) return json(null);
      return json(briefing);
    }

    // Route: POST /api/issues/:id/briefing  (volunteer submits AI-generated briefing)
    if (method === 'POST' && subPath === '/briefing') {
      const body = await request.json();
      // Get current max version
      const existing = await env.DB.prepare(
        'SELECT MAX(version) as maxv FROM briefings WHERE issue_id = ?'
      ).bind(issueId).first();
      const nextVersion = (existing?.maxv ?? 0) + 1;

      await env.DB.prepare(
        `INSERT INTO briefings (issue_id, consensus, disputes, positions, narrative, opinion_prompt, version)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        issueId,
        body.consensus ?? '',
        body.disputes ?? '',
        body.positions ?? '',
        body.narrative ?? '',
        body.opinion_prompt ?? '',
        nextVersion
      ).run();

      // Update issue status to published if it was summarizing
      await env.DB.prepare(
        "UPDATE issues SET status = 'published' WHERE id = ? AND status = 'summarizing'"
      ).bind(issueId).run();

      return json({ version: nextVersion }, 201);
    }

    // Route: GET /api/issues/:id/opinions
    if (method === 'GET' && subPath === '/opinions') {
      const { results } = await env.DB.prepare(
        'SELECT id, summary, created_at FROM opinions WHERE issue_id = ? ORDER BY created_at DESC'
      ).bind(issueId).all();
      return json(results);
    }

    // Route: POST /api/issues/:id/opinions
    if (method === 'POST' && subPath === '/opinions') {
      const body = await request.json();
      if (!body.summary) return error('summary is required');
      const { meta } = await env.DB.prepare(
        'INSERT INTO opinions (issue_id, summary) VALUES (?, ?)'
      ).bind(issueId, body.summary).run();
      return json({ id: meta.last_row_id }, 201);
    }

    // Route: GET /api/issues/:id/prompt  (generate prompt for volunteer to run AI summarization)
    if (method === 'GET' && subPath === '/prompt') {
      const type = url.searchParams.get('type') ?? 'summarize';

      const { results: materials } = await env.DB.prepare(
        'SELECT source_name, source_url, stance, content FROM materials WHERE issue_id = ? ORDER BY created_at'
      ).bind(issueId).all();

      const issue = await env.DB.prepare(
        'SELECT title, description FROM issues WHERE id = ?'
      ).bind(issueId).first();

      if (materials.length === 0) return error('No materials yet. Please add materials first.');

      let materialsText = materials.map((m, i) =>
        `【素材 ${i + 1}】來源：${m.source_name || '未知'}（${m.source_url || '無連結'}）\n立場：${m.stance}\n內容：\n${m.content}`
      ).join('\n\n---\n\n');

      let prompt = '';

      if (type === 'summarize') {
        prompt = `你是一位公民審議助理。請根據以下關於「${issue.title}」的素材，整理出：

1. **共識**：大多數立場都同意的事實或前提（2-4 點）
2. **爭點**：各方有明顯分歧的核心問題（2-4 點）
3. **立場地圖**：誰在乎哪些面向、各自的論據是什麼（分立場描述）

要求：
- 忠實呈現原始素材的內容，不添加你自己的立場判斷
- 每個立場用原本素材的語言描述，不做可信度評判
- 格式使用繁體中文 Markdown

以下是素材：

${materialsText}`;
      } else if (type === 'narrative') {
        const briefing = await env.DB.prepare(
          'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
        ).bind(issueId).first();

        prompt = `你是一位擅長寫給一般讀者閱讀的公民議題編輯。請根據以下彙整結果，寫一份一頁式的議題說明，讓沒有背景知識的人在 5 分鐘內能掌握全貌。

格式要求：
- 開頭用一個具體的情境故事帶出議題（100-200 字）
- 接著說明背景與各方立場（300-500 字）
- 最後列出關鍵爭點供讀者思考
- 全程使用繁體中文，語氣平實，不選邊站
- 不超過 800 字

議題：${issue.title}

彙整結果：
共識：${briefing?.consensus ?? '（尚未彙整）'}

爭點：${briefing?.disputes ?? '（尚未彙整）'}

立場地圖：${briefing?.positions ?? '（尚未彙整）'}`;
      } else if (type === 'synthesis') {
        const { results: opinions } = await env.DB.prepare(
          'SELECT summary FROM opinions WHERE issue_id = ? ORDER BY created_at DESC LIMIT 50'
        ).bind(issueId).all();
        const briefing = await env.DB.prepare(
          'SELECT * FROM briefings WHERE issue_id = ? ORDER BY version DESC LIMIT 1'
        ).bind(issueId).first();

        const opinionsText = opinions.map((o, i) => `【意見 ${i + 1}】\n${o.summary}`).join('\n\n---\n\n');

        prompt = `你是一位公民審議分析師。平台已收集到 ${opinions.length} 份個人意見摘要，請分析：

1. 原有的共識與爭點是否仍然成立？
2. 個人意見中有沒有在原始素材沒有出現的新觀點或新面向？
3. 請更新立場地圖，加入新發現。

原本的彙整結果：
共識：${briefing?.consensus ?? ''}
爭點：${briefing?.disputes ?? ''}
立場地圖：${briefing?.positions ?? ''}

個人意見摘要：
${opinionsText}`;
      }

      return json({ prompt, type, material_count: materials.length });
    }

    return error('Not found', 404);
  },
};
