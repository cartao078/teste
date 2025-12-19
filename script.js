// --- DADOS DO DASHBOARD ---
const DATA_GERAL = {
  resumo: {
    totalVendas: "R$ 142.500,00",
    metaMensal: "R$ 200.000,00",
    percentualMeta: "71%",
    totalColaboradores: 12,
    cashbackAcumulado: "R$ 4.250,00"
  },
  colaboradores: [
    { id: 1, nome: "Ana Silva", status: "Ativa", vendas: "R$ 12.400", cashback: "R$ 248" },
    { id: 2, nome: "Bruno Costa", status: "Ativa", vendas: "R$ 15.100", cashback: "R$ 302" },
    { id: 3, nome: "Carla Souza", status: "Inativa", vendas: "R$ 0", cashback: "R$ 0" },
    { id: 4, nome: "Diego Lima", status: "Ativa", vendas: "R$ 9.800", cashback: "R$ 196" }
  ]
};

// --- FUNÇÃO PARA ATUALIZAR A DATA ---
function updateLastTimestamp() {
    const agora = new Date();
    const texto = agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('last-update-time').innerText = texto;
}

// --- FUNÇÕES DE NAVEGAÇÃO ---
function setupButtons() {
  const btns = document.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      renderContent(tab);
    });
  });
}

function renderContent(tab) {
  if (tab === 'resumo') renderResumo();
  else if (tab === 'colaboradores') renderColaboradores();
  else {
    document.getElementById('tab-content').innerHTML = `
      <div class="card">
        <div class="title">Aviso</div>
        <div class="value">Conteúdo de ${tab} em desenvolvimento.</div>
      </div>`;
  }
}

// --- RENDERIZADORES ---
function renderResumo() {
  const content = document.getElementById('tab-content');
  const d = DATA_GERAL.resumo;
  content.innerHTML = `
    <div class="grid">
      <div class="big-card">
        <h2>Total de Vendas do Mês</h2>
        <div class="val">${d.totalVendas}</div>
        <div style="font-size:13px; opacity:0.8">Meta: ${d.metaMensal} (${d.percentualMeta})</div>
      </div>
      <div class="card"><div class="title">Colaboradores</div><div class="value">${d.totalColaboradores}</div></div>
      <div class="card"><div class="title">Cashback Gerado</div><div class="value">${d.cashbackAcumulado}</div></div>
    </div>
  `;
}

function renderColaboradores() {
  const content = document.getElementById('tab-content');
  let html = `<div class="card" style="margin-top:10px;"><h3>Lista de Equipa</h3>`;
  DATA_GERAL.colaboradores.forEach(c => {
    const statusClass = c.status === 'Ativa' ? 'badge-active' : 'badge-inactive';
    html += `
      <div class="collaborator-item">
        <div class="info-group">
          <span class="info-label">Nome</span>
          <span class="info-val">${c.nome}</span>
        </div>
        <div class="info-group">
          <span class="info-label">Vendas</span>
          <span class="info-val">${c.vendas}</span>
        </div>
        <span class="badge ${statusClass}">${c.status}</span>
      </div>`;
  });
  html += `</div>`;
  content.innerHTML = html;
}

// --- UTILITÁRIOS ---
function downloadDashboard() {
  const target = document.getElementById('dashboard-content');
  html2canvas(target).then(canvas => {
    const link = document.createElement('a');
    link.download = 'dashboard-report.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

function adjustFixedElements() {
  const header = document.querySelector('header');
  const tabsContainer = document.querySelector('.tabs-container');
  const body = document.querySelector('body');
  if(!header || !tabsContainer) return;
  
  const headerHeight = header.offsetHeight;
  tabsContainer.style.top = `${headerHeight}px`;
  const fixedHeight = headerHeight + tabsContainer.offsetHeight;
  body.style.paddingTop = `${fixedHeight + 18}px`;
}

// --- INICIALIZAÇÃO ---
function init() {
  renderResumo();
  updateLastTimestamp();
  setupButtons();
  adjustFixedElements();
  window.addEventListener('resize', adjustFixedElements);
}

document.addEventListener('DOMContentLoaded', init);
