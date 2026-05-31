// ============================================================
// Civic Talk — i18n (Internationalization)
// 加到每個 HTML 頁面的 <head>：<script src="i18n.js"></script>
// ============================================================

const TRANSLATIONS = {
  zh: {
    // ── 共用 ─────────────────────────────────────────────────
    site_tagline: '公共議題審議平台',
    back_to_issues: '← 所有議題',
    loading: '載入中…',
    cancel: '取消',
    save: '儲存',
    delete: '刪除',
    edit: '編輯',
    status_collecting: '素材收集中',
    status_summarizing: '彙整中',
    status_published: '說明頁已發布',
    status_published_short: '已發布',

    // ── index.html ───────────────────────────────────────────
    idx_new_issue_btn: '＋ 新增議題',
    idx_page_title: '公共議題討論平台',
    idx_page_subtitle: '用 AI 降低參與門檻，讓更多人真正了解議題全貌，而不只是選邊站。',
    idx_form_title: '建立新議題',
    idx_label_title: '議題標題',
    idx_hint_title: '用一句話說清楚',
    idx_ph_title: '例：居住正義與囤房稅改革方向',
    idx_label_desc: '議題簡介',
    idx_hint_desc: '100字以內，說明議題背景',
    idx_ph_desc: '說明這個議題的來龍去脈，以及為什麼值得關注…',
    idx_submit: '建立議題',
    idx_empty: '還沒有議題，成為第一個建立者吧！',
    idx_materials_unit: '份素材',
    idx_toast_title_required: '請填寫議題標題',
    idx_toast_create_ok: '議題建立成功！',
    idx_toast_create_fail: '建立失敗，請再試一次',

    // ── issue.html — 分頁 ─────────────────────────────────────
    tab_briefing: '📋 議題說明',
    tab_materials: '📚 素材庫',
    tab_volunteer: '🤝 志願者工具',
    tab_opinions: '💬 民眾意見',

    // 素材
    mat_title: '素材庫',
    mat_submit_btn: '＋ 提交素材',
    mat_alert: '志願者可直接複製網頁原文貼到這裡。請盡量保留原文，不要篩選或改寫。相同素材由多人各自提交，平台會計算一致性。',
    mat_empty: '還沒有素材。成為第一位貢獻者！',
    mat_source_unknown: '未知來源',
    mat_link: '🔗 原始連結',
    mat_contributor: '人貢獻',
    stance_pro: '支持',
    stance_con: '反對',
    stance_neutral: '中立',
    stance_unknown: '立場未知',

    // 志願者工具
    vol_title: '志願者工具',
    vol_intro: '平台不直接呼叫 AI API。請用以下工具生成 prompt，貼到你自己的 Claude / ChatGPT / Gemini，再把輸出結果貼回平台。',
    vol_step1: '生成彙整 prompt',
    vol_step2: '貼到你的 AI',
    vol_step3: '把結果貼回來',
    vol_s1_title: 'Step 1｜彙整素材 → 生成共識/爭點/立場地圖',
    vol_s1_desc: '點擊「生成 Prompt」，複製後貼到你慣用的 AI chatbot。',
    vol_gen_summarize: '生成彙整 Prompt',
    vol_copy: '📋 複製 Prompt',
    vol_paste_title: '把 AI 的輸出貼回這裡：',
    vol_paste_desc: '請分別填入 AI 輸出的各個部分：',
    vol_label_consensus: '共識（大多數立場同意的事實）',
    vol_ph_consensus: '複製 AI 輸出的「共識」部分…',
    vol_label_disputes: '爭點（各方主要分歧）',
    vol_ph_disputes: '複製 AI 輸出的「爭點」部分…',
    vol_label_positions: '立場地圖（各方立場與論據）',
    vol_ph_positions: '複製 AI 輸出的「立場地圖」部分…',
    vol_submit_summarize: '送出彙整結果',
    vol_s2_title: 'Step 2｜生成一頁式說明頁',
    vol_s2_desc: '需要先完成彙整（Step 1）才能進行。',
    vol_gen_narrative: '生成說明頁 Prompt',
    vol_paste_narrative: '把 AI 生成的說明頁貼回這裡：',
    vol_ph_narrative: '複製 AI 生成的一頁式說明全文…',
    vol_submit_narrative: '送出說明頁',
    vol_s3_title: 'Step 3｜再彙整（意見回饋後）',
    vol_s3_desc: '累積足夠個人意見後，可以跑一次再彙整，更新立場地圖。',
    vol_gen_synthesis: '生成再彙整 Prompt',
    vol_toast_copied: '✅ 已複製到剪貼簿！',
    vol_toast_fill_one: '請至少填入一個欄位',
    vol_toast_summarize_ok: '✅ 彙整結果已儲存！',
    vol_toast_save_fail: '儲存失敗，請再試一次',
    vol_toast_narrative_ok: '✅ 說明頁已發布！',
    vol_toast_no_content: '請貼上說明頁內容',
    vol_toast_load_fail: '載入失敗',

    // 說明頁渲染
    brief_no_briefing_alert: '這個議題還沒有說明頁。志願者可以前往「志願者工具」頁面生成說明。',
    brief_go_volunteer: '素材足夠後，請前往「志願者工具」生成彙整與說明頁',
    brief_submit_material: '提交素材',
    brief_overview: '議題概覽',
    brief_consensus: '✅ 共識',
    brief_disputes: '⚔️ 爭點',
    brief_positions: '🗺️ 立場地圖',
    brief_opinion_alert: '想深入討論這個議題？下載 OPINION.md，貼到你慣用的 AI chatbot，讓 AI 引導你思考你自己的觀點。',
    brief_go_opinion: '前往下載 OPINION.md',
    brief_version_prefix: '說明頁版本 v',
    brief_updated: '最後更新',

    // 意見
    op_title: '民眾意見',
    op_alert: '先下載 <strong>OPINION.md</strong>，貼到你慣用的 AI chatbot 對話，聊完後把 AI 幫你整理的摘要貼回這裡。你的原始對話不需要上傳，只需要摘要。',
    op_download_btn: '⬇️ 下載 OPINION.md',
    op_submit_title: '提交你的意見摘要',
    op_label_summary: '請把 AI 幫你整理的意見摘要貼在這裡',
    op_hint_summary: '100~500 字為佳',
    op_ph_summary: '（AI 幫你整理的文字）我在這個議題上比較在乎的是……我的觀點是……',
    op_submit_btn: '送出意見',
    op_empty: '還沒有意見。讀完說明頁後，歡迎分享你的觀點！',
    op_count_prefix: '已收集 ',
    op_count_suffix: ' 份意見',
    op_toast_required: '請填入意見摘要',
    op_toast_too_short: '摘要太短了，請多寫一點',
    op_toast_submit_ok: '✅ 意見已提交，謝謝你的參與！',
    op_toast_submit_fail: '提交失敗，請再試一次',
    op_toast_download_ok: '✅ OPINION.md 已下載！',

    // issue header
    issue_created: '建立於',
    issue_materials_unit: '份素材',

    // ── admin.html ───────────────────────────────────────────
    adm_login_title: '管理後台',
    adm_login_desc: '請輸入管理密碼登入',
    adm_login_placeholder: '管理密碼',
    adm_login_btn: '登入',
    adm_login_err: '密碼錯誤，請再試一次',
    adm_badge: '管理後台',
    adm_back: '← 回前台',
    adm_logout: '登出',
    adm_stat_issues: '議題',
    adm_stat_materials: '素材',
    adm_stat_opinions: '民眾意見',
    adm_stat_briefings: '說明頁版本',
    adm_tab_issues: '📋 議題管理',
    adm_tab_materials: '📚 素材管理',
    adm_tab_opinions: '💬 意見管理',
    adm_issues_title: '所有議題',
    adm_new_issue_btn: '＋ 新增議題',
    adm_th_id: 'ID',
    adm_th_title: '標題',
    adm_th_status: '狀態',
    adm_th_materials: '素材數',
    adm_th_created: '建立時間',
    adm_th_actions: '操作',
    adm_btn_edit: '編輯',
    adm_btn_briefing: '說明頁',
    adm_btn_delete: '刪除',
    adm_mat_section_title: '素材管理',
    adm_op_section_title: '意見管理',
    adm_select_issue_label: '選擇議題',
    adm_select_placeholder: '請選擇議題…',
    adm_modal_edit_title: '編輯議題',
    adm_modal_new_title: '新增議題',
    adm_modal_briefing_title: '編輯說明頁',
    adm_label_title: '標題',
    adm_label_desc: '簡介',
    adm_label_status: '狀態',
    adm_label_consensus: '共識',
    adm_label_disputes: '爭點',
    adm_label_positions: '立場地圖',
    adm_label_narrative: '一頁式說明',
    adm_polis_label: '啟用 polis.tw 意見投票',
    adm_polis_hint: '勾選後，前台會自動嵌入本議題的 polis 投票',
    adm_polis_hint_new: '可之後在編輯議題中再開啟',
    adm_new_ph_title: '議題標題',
    adm_new_ph_desc: '議題背景說明…',
    adm_btn_save: '儲存',
    adm_btn_cancel: '取消',
    adm_btn_create: '建立',
    adm_mat_source_unknown: '未知來源',
    adm_mat_link: '🔗 原始連結',
    adm_empty_select: '👆 請先選擇議題',
    adm_empty_materials: '尚無素材',
    adm_empty_opinions: '尚無意見',
    adm_confirm_delete: '確定要刪除「{title}」及其所有素材、意見、說明頁嗎？此操作無法復原。',
    adm_confirm_mat: '確定要刪除這份素材嗎？',
    adm_confirm_op: '確定要刪除這份意見嗎？',
    adm_toast_create: '✅ 議題建立成功',
    adm_toast_save: '✅ 已儲存',
    adm_toast_delete: '✅ 已刪除',
    adm_toast_briefing_save: '✅ 說明頁已儲存',
    adm_toast_title_required: '請填寫標題',
    adm_mat_count_prefix: '共 ',
    adm_mat_count_suffix: ' 份素材',
    adm_op_count_prefix: '共 ',
    adm_op_count_suffix: ' 份意見',
  },

  en: {
    // ── Common ───────────────────────────────────────────────
    site_tagline: 'Public Deliberation Platform',
    back_to_issues: '← All Issues',
    loading: 'Loading…',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    status_collecting: 'Collecting',
    status_summarizing: 'Summarizing',
    status_published: 'Published',
    status_published_short: 'Published',

    // ── index.html ───────────────────────────────────────────
    idx_new_issue_btn: '+ New Issue',
    idx_page_title: 'Public Deliberation Platform',
    idx_page_subtitle: 'Using AI to lower barriers to participation — helping more people truly understand public issues, not just pick sides.',
    idx_form_title: 'Create New Issue',
    idx_label_title: 'Issue Title',
    idx_hint_title: 'Summarize in one sentence',
    idx_ph_title: 'e.g. Housing justice and property tax reform',
    idx_label_desc: 'Issue Description',
    idx_hint_desc: 'Under 100 words — provide background context',
    idx_ph_desc: 'Describe the context and why this issue matters…',
    idx_submit: 'Create Issue',
    idx_empty: 'No issues yet. Be the first to create one!',
    idx_materials_unit: 'materials',
    idx_toast_title_required: 'Please enter an issue title',
    idx_toast_create_ok: 'Issue created successfully!',
    idx_toast_create_fail: 'Failed to create. Please try again.',

    // ── issue.html — Tabs ─────────────────────────────────────
    tab_briefing: '📋 Briefing',
    tab_materials: '📚 Materials',
    tab_volunteer: '🤝 Volunteer Tools',
    tab_opinions: '💬 Public Opinions',

    // Materials
    mat_title: 'Materials',
    mat_submit_btn: '+ Submit Material',
    mat_alert: 'Volunteers can paste raw web content directly here. Please preserve the original text without filtering or rewriting. If multiple people submit the same material, the platform tracks consistency.',
    mat_empty: 'No materials yet. Be the first to contribute!',
    mat_source_unknown: 'Unknown source',
    mat_link: '🔗 Source',
    mat_contributor: 'contributor(s)',
    stance_pro: 'Pro',
    stance_con: 'Con',
    stance_neutral: 'Neutral',
    stance_unknown: 'Unknown',

    // Volunteer Tools
    vol_title: 'Volunteer Tools',
    vol_intro: 'This platform never calls AI APIs directly. Use the tools below to generate prompts, paste them into your own Claude / ChatGPT / Gemini, then paste the output back here.',
    vol_step1: 'Generate prompt',
    vol_step2: 'Paste into your AI',
    vol_step3: 'Paste results back',
    vol_s1_title: 'Step 1 — Summarize materials → Generate consensus / disputes / position map',
    vol_s1_desc: 'Click "Generate Prompt", copy it, then paste into your AI chatbot.',
    vol_gen_summarize: 'Generate Summarize Prompt',
    vol_copy: '📋 Copy Prompt',
    vol_paste_title: 'Paste the AI output here:',
    vol_paste_desc: 'Fill in each section from the AI output:',
    vol_label_consensus: 'Consensus (facts most positions agree on)',
    vol_ph_consensus: "Paste the AI's \"Consensus\" section here…",
    vol_label_disputes: 'Key Disputes (main points of disagreement)',
    vol_ph_disputes: "Paste the AI's \"Disputes\" section here…",
    vol_label_positions: "Position Map (each side's stance and arguments)",
    vol_ph_positions: "Paste the AI's \"Position Map\" section here…",
    vol_submit_summarize: 'Submit Summary',
    vol_s2_title: 'Step 2 — Generate one-page briefing',
    vol_s2_desc: 'Requires completing Step 1 first.',
    vol_gen_narrative: 'Generate Briefing Prompt',
    vol_paste_narrative: 'Paste the AI-generated briefing here:',
    vol_ph_narrative: 'Paste the full one-page briefing generated by your AI…',
    vol_submit_narrative: 'Publish Briefing',
    vol_s3_title: 'Step 3 — Re-synthesize (after opinion feedback)',
    vol_s3_desc: 'Once enough public opinions are collected, run a re-synthesis to update the position map.',
    vol_gen_synthesis: 'Generate Re-synthesis Prompt',
    vol_toast_copied: '✅ Copied to clipboard!',
    vol_toast_fill_one: 'Please fill in at least one field',
    vol_toast_summarize_ok: '✅ Summary saved!',
    vol_toast_save_fail: 'Save failed. Please try again.',
    vol_toast_narrative_ok: '✅ Briefing published!',
    vol_toast_no_content: 'Please paste the briefing content',
    vol_toast_load_fail: 'Load failed',

    // Briefing rendering
    brief_no_briefing_alert: 'No briefing yet for this issue. Volunteers can generate one using the Volunteer Tools tab.',
    brief_go_volunteer: 'Once enough materials are collected, use Volunteer Tools to generate the briefing.',
    brief_submit_material: 'Submit Material',
    brief_overview: 'Overview',
    brief_consensus: '✅ Consensus',
    brief_disputes: '⚔️ Key Disputes',
    brief_positions: '🗺️ Position Map',
    brief_opinion_alert: 'Want to explore this issue further? Download OPINION.md and paste it into your AI chatbot — let AI guide your thinking.',
    brief_go_opinion: 'Download OPINION.md',
    brief_version_prefix: 'Briefing v',
    brief_updated: 'last updated',

    // Opinions
    op_title: 'Public Opinions',
    op_alert: 'Download <strong>OPINION.md</strong>, paste it into your AI chatbot, then paste the AI-generated summary back here. You don\'t need to share your full conversation — just the summary.',
    op_download_btn: '⬇️ Download OPINION.md',
    op_submit_title: 'Submit Your Opinion Summary',
    op_label_summary: 'Paste your AI-generated opinion summary here',
    op_hint_summary: '100–500 words recommended',
    op_ph_summary: '(AI-generated text) What I care most about in this issue is… My view is…',
    op_submit_btn: 'Submit Opinion',
    op_empty: 'No opinions yet. Read the briefing and share your view!',
    op_count_prefix: '',
    op_count_suffix: ' opinions collected',
    op_toast_required: 'Please enter an opinion summary',
    op_toast_too_short: 'Your summary is too short. Please write a bit more.',
    op_toast_submit_ok: '✅ Opinion submitted. Thank you for participating!',
    op_toast_submit_fail: 'Submission failed. Please try again.',
    op_toast_download_ok: '✅ OPINION.md downloaded!',

    // Issue header
    issue_created: 'Created',
    issue_materials_unit: 'materials',

    // ── admin.html ───────────────────────────────────────────
    adm_login_title: 'Admin Panel',
    adm_login_desc: 'Enter admin password to sign in',
    adm_login_placeholder: 'Admin Password',
    adm_login_btn: 'Sign In',
    adm_login_err: 'Incorrect password. Please try again.',
    adm_badge: 'Admin',
    adm_back: '← Back to site',
    adm_logout: 'Sign Out',
    adm_stat_issues: 'Issues',
    adm_stat_materials: 'Materials',
    adm_stat_opinions: 'Opinions',
    adm_stat_briefings: 'Briefing Versions',
    adm_tab_issues: '📋 Issues',
    adm_tab_materials: '📚 Materials',
    adm_tab_opinions: '💬 Opinions',
    adm_issues_title: 'All Issues',
    adm_new_issue_btn: '+ New Issue',
    adm_th_id: 'ID',
    adm_th_title: 'Title',
    adm_th_status: 'Status',
    adm_th_materials: 'Materials',
    adm_th_created: 'Created',
    adm_th_actions: 'Actions',
    adm_btn_edit: 'Edit',
    adm_btn_briefing: 'Briefing',
    adm_btn_delete: 'Delete',
    adm_mat_section_title: 'Materials',
    adm_op_section_title: 'Opinions',
    adm_select_issue_label: 'Select Issue',
    adm_select_placeholder: 'Select an issue…',
    adm_modal_edit_title: 'Edit Issue',
    adm_modal_new_title: 'New Issue',
    adm_modal_briefing_title: 'Edit Briefing',
    adm_label_title: 'Title',
    adm_label_desc: 'Description',
    adm_label_status: 'Status',
    adm_label_consensus: 'Consensus',
    adm_label_disputes: 'Key Disputes',
    adm_label_positions: 'Position Map',
    adm_label_narrative: 'One-page Narrative',
    adm_polis_label: 'Enable polis.tw opinion poll',
    adm_polis_hint: 'When enabled, a polis poll will be embedded on the public issue page.',
    adm_polis_hint_new: 'Can be enabled later when editing the issue.',
    adm_new_ph_title: 'Issue title',
    adm_new_ph_desc: 'Issue background…',
    adm_btn_save: 'Save',
    adm_btn_cancel: 'Cancel',
    adm_btn_create: 'Create',
    adm_mat_source_unknown: 'Unknown source',
    adm_mat_link: '🔗 Source',
    adm_empty_select: '👆 Please select an issue first',
    adm_empty_materials: 'No materials yet',
    adm_empty_opinions: 'No opinions yet',
    adm_confirm_delete: 'Are you sure you want to delete "{title}" and all its materials, opinions, and briefings? This cannot be undone.',
    adm_confirm_mat: 'Are you sure you want to delete this material?',
    adm_confirm_op: 'Are you sure you want to delete this opinion?',
    adm_toast_create: '✅ Issue created',
    adm_toast_save: '✅ Saved',
    adm_toast_delete: '✅ Deleted',
    adm_toast_briefing_save: '✅ Briefing saved',
    adm_toast_title_required: 'Please enter a title',
    adm_mat_count_prefix: '',
    adm_mat_count_suffix: ' materials',
    adm_op_count_prefix: '',
    adm_op_count_suffix: ' opinions',
  }
};

// ── 核心函式 ──────────────────────────────────────────────────

window.LANG = localStorage.getItem('civic_lang') || 'zh';

function t(key) {
  return TRANSLATIONS[window.LANG]?.[key] ?? TRANSLATIONS['zh'][key] ?? key;
}

function setLang(lang) {
  window.LANG = lang;
  localStorage.setItem('civic_lang', lang);
  // 更新靜態元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  // 更新切換按鈕
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'zh' ? 'EN' : '中文';
  // 呼叫各頁面的重新渲染函式
  if (typeof window.rerender === 'function') window.rerender();
}

// DOMContentLoaded 時套用靜態翻譯
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'));
  });
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = window.LANG === 'zh' ? 'EN' : '中文';
});
