const postingLabels = { open: '开放', needs_recheck: '需复核', closed: '已关闭' };
const personalLabels = { todo: '待核验', preparing: '准备投递', applied: '已投递', notfit: '不合适' };

const state = {
  site: { title: '公开社媒实习线索池', subtitle: '静态结果看板', storageKey: 'social-intern-leads-template-v1' },
  leads: [],
  scanMeta: { lastChecked: '尚未扫描', filteredTotal: 0, note: '暂无扫描数据。' },
  history: [],
  saved: {}
};

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '#';
  } catch {
    return '#';
  }
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

function populateSelect(id, values, allLabel) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="all">${esc(allLabel)}</option>` + values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
}

function loadSavedState() {
  try {
    state.saved = JSON.parse(localStorage.getItem(state.site.storageKey) || '{}');
  } catch {
    state.saved = {};
  }
}

function renderMeta() {
  document.title = state.site.title;
  document.getElementById('pageTitle').textContent = state.site.title;
  document.getElementById('pageSubtitle').textContent = state.site.subtitle;
  document.getElementById('acceptedCount').textContent = state.leads.length;
  document.getElementById('aCount').textContent = state.leads.filter(item => item.trust === 'A').length;
  document.getElementById('bCount').textContent = state.leads.filter(item => item.trust === 'B').length;
  document.getElementById('filteredCount').textContent = state.scanMeta.filteredTotal;
  document.getElementById('scanStatus').innerHTML = `<strong>最近检查：${esc(state.scanMeta.lastChecked)}</strong>｜${esc(state.scanMeta.note)}`;
  document.getElementById('scanLog').innerHTML = state.history.length
    ? state.history.slice().reverse().map(log => `<div class="log-item"><strong>${esc(log.time)}</strong>｜扫描 ${log.scanned}｜通过 ${log.accepted}｜过滤 ${log.filtered}<br>${esc(log.note)}</div>`).join('')
    : '<div class="log-item">尚无扫描记录。</div>';
}

function renderLeads() {
  const query = document.getElementById('query').value.trim().toLowerCase();
  const city = document.getElementById('city').value;
  const platform = document.getElementById('platform').value;
  const trust = document.getElementById('trust').value;
  const postingStatus = document.getElementById('postingStatus').value;

  const filtered = state.leads
    .filter(item => city === 'all' || item.city === city)
    .filter(item => platform === 'all' || item.platform === platform)
    .filter(item => trust === 'all' || item.trust === trust)
    .filter(item => postingStatus === 'all' || item.status === postingStatus)
    .filter(item => !query || [item.company, item.title, item.platform, item.summary, item.trustReason, ...item.risks].join(' ').toLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || a.trust.localeCompare(b.trust));

  const body = document.getElementById('leadBody');
  body.innerHTML = filtered.length ? filtered.map(item => {
    const personal = state.saved[item.id] || { status: 'todo', time: '' };
    const options = Object.entries(personalLabels).map(([value, label]) => `<option value="${value}" ${personal.status === value ? 'selected' : ''}>${label}</option>`).join('');
    const risks = item.risks.length ? item.risks.map(risk => `<span class="pill risk">${esc(risk)}</span>`).join('') : '<span class="pill">暂无已知风险，仍需核验</span>';
    const rowClasses = [item.status === 'closed' ? 'closed' : '', personal.status === 'notfit' ? 'closed' : ''].filter(Boolean).join(' ');
    return `<tr class="${rowClasses}">
      <td><span class="pill ${item.trust.toLowerCase()}">${item.trust}级</span><span class="pill ${item.status}">${esc(postingLabels[item.status])}</span><div class="sub">${esc(item.trustReason)}</div></td>
      <td><div class="title">${esc(item.company)}</div><div>${esc(item.title)}</div></td>
      <td>${esc(item.city)}</td>
      <td>${esc(item.platform)}<div class="sub">发布 ${esc(item.date)}<br>核验 ${esc(item.checked)}</div></td>
      <td>${esc(item.summary)}</td>
      <td>${risks}</td>
      <td><a class="source-link" href="${esc(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">打开原帖</a></td>
      <td><select class="status-select" data-id="${esc(item.id)}">${options}</select><div class="sub">${personal.time ? '记录 ' + esc(personal.time) : '尚未记录'}</div></td>
    </tr>`;
  }).join('') : '<tr><td colspan="8" class="empty">当前筛选条件下没有线索。</td></tr>';

  document.getElementById('resultCount').textContent = `${filtered.length} 条`;
  document.querySelectorAll('.status-select').forEach(select => select.addEventListener('change', event => {
    state.saved[event.target.dataset.id] = {
      status: event.target.value,
      time: new Date().toLocaleString('zh-CN', { hour12: false })
    };
    localStorage.setItem(state.site.storageKey, JSON.stringify(state.saved));
    renderLeads();
  }));
}

function exportCsv() {
  const rows = [['可信度', '开放状态', '公司', '岗位', '城市', '平台', '发布日期', '核验日期', '摘要', '风险', '原帖', '我的状态']];
  state.leads.forEach(item => {
    const personal = state.saved[item.id] || { status: 'todo' };
    rows.push([item.trust, postingLabels[item.status], item.company, item.title, item.city, item.platform, item.date, item.checked, item.summary, item.risks.join('；'), item.url, personalLabels[personal.status]]);
  });
  const csv = '\ufeff' + rows.map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  link.download = `公开实习线索_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function init() {
  try {
    const [site, leads, scan] = await Promise.all([
      fetch('data/site.json', { cache: 'no-store' }).then(response => response.json()),
      fetch('data/leads.json', { cache: 'no-store' }).then(response => response.json()),
      fetch('data/scan-history.json', { cache: 'no-store' }).then(response => response.json())
    ]);
    state.site = site;
    state.leads = leads;
    state.scanMeta = scan.scanMeta;
    state.history = scan.history;
    loadSavedState();
    populateSelect('city', uniqueSorted(state.leads.map(item => item.city)), '全部城市');
    populateSelect('platform', uniqueSorted(state.leads.map(item => item.platform)), '全部平台');
    renderMeta();
    renderLeads();
  } catch (error) {
    document.getElementById('scanStatus').innerHTML = `<strong class="error">加载失败：</strong>${esc(error.message)}。请通过 HTTP 服务打开本页，并先运行数据校验。`;
    document.getElementById('leadBody').innerHTML = '<tr><td colspan="8" class="empty error">无法加载 JSON 数据。</td></tr>';
  }
}

['query', 'city', 'platform', 'trust', 'postingStatus'].forEach(id => {
  document.getElementById(id).addEventListener(id === 'query' ? 'input' : 'change', renderLeads);
});
document.getElementById('export').addEventListener('click', exportCsv);
init();

