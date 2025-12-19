// APIs INDEPENDENTES
const API_CONTAGEM_APP = "https://script.google.com/macros/s/AKfycby6ip-dZkmDIrG3GhutwY3t40DprmNlUxIf9kMBefFwzosOFri9nq2dSArTQVb1CUxF/exec";
const API_VENDAS = "https://script.google.com/macros/s/AKfycbz2iN8BFtjs0GHD1W84c0hNvRJIuJu3pmv-L0YcboGSgLhd2LQNOJMieJLTNWQC/exec";
const API_REFUTURIZA = "https://script.google.com/macros/s/AKfycbwjrD4H1nK8CTpSVT0n7T9BYonh-F5s7zx3E9QVeiJuO1vgFGMCqnWgYH0einPPjxYl/exec";
const API_RETENCAO = "https://script.google.com/macros/s/AKfycbzjQFDwj46u6Ymz33aT0SqVctD5Kvg4wkexeubg49rKl6OOXBoBdFnEASlFS5XRKhhZ/exec";
const API_ADIMPLENCIA = "https://script.google.com/macros/s/AKfycbzJ5TZAmTBpoZiT4Wss9RvdguIPaPHaJrakHvqz0qReCyC21oweNt84feMFMvmC118U/exec";
const API_CASHBACK = "https://script.google.com/macros/s/AKfycbxfI9vHstylYG7vjjf_5xDa_ElnBe9qcd6neiK4-bvoA6YrSK0MzY2Eq9jrAvOt2BnY/exec";

let lastDataContagemApp = null;
let lastDataVendas = null;
let lastDataRefuturiza = null;
let lastDataRetencao = null;
let lastDataAdimplencia = null;
let lastDataCashback = null;
let debugMode = false;

// SISTEMA DE ABAS
document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', function() {
    const tab = this.getAttribute('data-tab');
    switchTab(tab);
  });
});

function switchTab(tab) {
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  // A aba que será mostrada é um elemento irmão da área de botões
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(tab).classList.add('active');
}

// BOTÕES DE AÇÃO
function setupButtons() {
  const reloadBtn = document.getElementById('reload');
  const debugBtn = document.getElementById('debugBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  
  if(reloadBtn) {
    reloadBtn.onclick = function(e) {
      e.preventDefault();
      console.log('Recarregando dados...');
      init();
    };
  }
  
  if(debugBtn) {
    debugBtn.onclick = function(e) {
      e.preventDefault();
      debugMode = !debugMode;
      document.getElementById('debugPanel').classList.toggle('show');
      if(debugMode) {
        showDebug();
      }
    };
  }
  
  if(downloadBtn) {
    downloadBtn.onclick = function(e) {
      e.preventDefault();
      downloadTabAsImage();
    };
  }
}

// Executar quando o DOM estiver pronto
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupButtons);
} else {
  setupButtons();
}

function downloadTabAsImage() {
  const activePane = document.querySelector('.tab-pane.active');
  const activeTabBtn = document.querySelector('.tab-button.active');
  
  if (!activePane || !activeTabBtn) {
    alert('Nenhuma aba ativa encontrada!');
    return;
  }

  const tabName = activeTabBtn.textContent.trim();
  const fileName = `${tabName}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.png`;

  // Capturamos o elemento da aba ativa
  html2canvas(activePane, {
    backgroundColor: '#eef1f8',
    scale: 2,
    logging: false,
    useCORS: true,
    allowTaint: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = fileName;
    link.click();
  }).catch(err => {
    console.error('Erro ao capturar imagem:', err);
    alert('Erro ao baixar a imagem. Verifique o console para mais detalhes.');
  });
}

function showDebug() {
  const panel = document.getElementById('debugPanel');
  let html = '<strong>📊 DADOS RECEBIDOS:</strong><br><br>';
  html += '<strong>CONTAGEM APP:</strong><br>' + JSON.stringify(lastDataContagemApp, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  html += '<br><br><strong>VENDAS:</strong><br>' + JSON.stringify(lastDataVendas, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  html += '<br><br><strong>REFUTURIZA:</strong><br>' + JSON.stringify(lastDataRefuturiza, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  // Adicionando outros dados de debug
  html += '<br><br><strong>RETENÇÃO:</strong><br>' + JSON.stringify(lastDataRetencao, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  html += '<br><br><strong>ADIMPLÊNCIA:</strong><br>' + JSON.stringify(lastDataAdimplencia, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  html += '<br><br><strong>CASHBACK:</strong><br>' + JSON.stringify(lastDataCashback, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
  panel.innerHTML = html;
}

function safeNum(v) {
  if(v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Formata números como moeda brasileira (R$ 1.234,56)
function formatCurrency(value) {
  const num = safeNum(value);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

function pct(ok, total) {
  const o = safeNum(ok);
  const t = safeNum(total);
  return t > 0 ? Math.round((o / t) * 100) : 0;
}

function colorClass(p) {
  if(p >= 89) return 'green';
  if(p >= 85) return 'yellow';
  return 'red';
}

function isInactive(p) {
  const s = String(p.status || '').toLowerCase();
  return s === 'inativa' || s === 'ferias' || s === 'férias' || s === 'ausente';
}

function renderPersonCardContagem(p) {
  const total = safeNum(p.t);
  const sem = safeNum(p.s);
  const ok = safeNum(p.o);
  const percent = pct(ok, total);
  const cls = isInactive(p) ? 'card inativa' : 'card';
  const statusTag = isInactive(p) ? `<span class="status-label">${p.status.toUpperCase()}</span>` : '';
  
  let bar;
  if(isInactive(p)) {
    bar = '<div style="height:20px;background:#d1d5db;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:12px;font-weight:600">INATIVO</div>';
  } else if(total === 0) {
    bar = '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>';
  } else {
    bar = `<div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div>`;
  }
  
  return `<div class="${cls}"><h3>${p.nome || 'Sem nome'}${statusTag}</h3><div class="kv"><span>Total:</span><strong>${total}</strong></div><div class="kv"><span>Sem APP:</span><strong>${sem}</strong></div><div class="kv"><span>APP OK:</span><strong>${ok}</strong></div><div class="progress-wrap" style="margin-top:12px">${bar}</div></div>`;
}

function renderPersonCardVendas(p) {
  const total = safeNum(p.totalVendas);
  const qualidade = safeNum(p.qualidade);
  const cdtSonhos = safeNum(p.cdtSonhos);
  const pendenciaDocs = safeNum(p.pendenciaDocs);
  const pendenciaLig = safeNum(p.pendenciaLig);
  const cancelados = safeNum(p.cancelados);
  const cls = isInactive(p) ? 'card inativa' : 'card';
  const statusTag = isInactive(p) ? `<span class="status-label">${p.status.toUpperCase()}</span>` : '';
  
  let bar;
  if(isInactive(p)) {
    bar = '<div style="height:20px;background:#d1d5db;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:12px;font-weight:600">' + p.status.toUpperCase() + '</div>';
  } else if(total === 0) {
    bar = '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>';
  } else {
    bar = `<div class="progress"><div class="bar ${colorClass(qualidade)}" style="width:${Math.max(qualidade, 5)}%">${qualidade}%</div></div>`;
  }
  
  return `<div class="${cls}"><h3>${p.nome || 'Sem nome'}${statusTag}</h3><div class="kv"><span>Total Vendas:</span><strong>${total}</strong></div><div class="kv"><span>CDT Sonhos:</span><strong>${cdtSonhos}</strong></div><div class="kv"><span>Pend. Docs:</span><strong>${pendenciaDocs}</strong></div><div class="kv"><span>Pend. Lig:</span><strong>${pendenciaLig}</strong></div><div class="kv"><span>Cancelados:</span><strong>${cancelados}</strong></div><div class="kv"><span>Qualidade:</span><strong>${qualidade}%</strong></div><div class="progress-wrap" style="margin-top:8px">${bar}</div></div>`;
}

function renderSection(title, arr, isVendas = false) {
  if(!arr || !Array.isArray(arr) || arr.length === 0) return `<div class="section-title">${title} <span style="color:#9ca3af;font-size:14px;font-weight:400">(vazio)</span></div>`;
  const renderFunc = isVendas ? renderPersonCardVendas : renderPersonCardContagem;
  return `<div class="section-title">${title}</div><div class="cards-grid">${arr.map(renderFunc).join('')}</div>`;
}

async function init() {
  try {
    const resContagem = await fetch(API_CONTAGEM_APP + '?_=' + Date.now());
    if(resContagem.ok) {
      lastDataContagemApp = await resContagem.json();
      renderContagemApp();
    }
  } catch(err) {
    console.error('Erro ao carregar Contagem APP:', err);
  }
  
  try {
    const resVendas = await fetch(API_VENDAS + '?_=' + Date.now());
    if(resVendas.ok) {
      lastDataVendas = await resVendas.json();
      renderVendas();
    }
  } catch(err) {
    console.error('Erro ao carregar Vendas:', err);
  }
  
  try {
    const resRefuturiza = await fetch(API_REFUTURIZA + '?_=' + Date.now());
    if(resRefuturiza.ok) {
      lastDataRefuturiza = await resRefuturiza.json();
      renderRefuturiza();
    }
  } catch(err) {
    console.error('Erro ao carregar Refuturiza:', err);
  }
  
  try {
    const resRetencao = await fetch(API_RETENCAO + '?_=' + Date.now());
    if(resRetencao.ok) {
      lastDataRetencao = await resRetencao.json();
      renderRetencao();
    }
  } catch(err) {
    console.error('Erro ao carregar Retenção:', err);
  }
  
  try {
    const resAdimplencia = await fetch(API_ADIMPLENCIA + '?_=' + Date.now());
    if(resAdimplencia.ok) {
      lastDataAdimplencia = await resAdimplencia.json();
      renderAdimplencia();
    }
  } catch(err) {
    console.error('Erro ao carregar Adimplência:', err);
  }
  
  try {
    const resCashback = await fetch(API_CASHBACK + '?_=' + Date.now());
    if(resCashback.ok) {
      lastDataCashback = await resCashback.json();
      renderCashback();
    }
  } catch(err) {
    console.error('Erro ao carregar Cashback:', err);
  }
  
  renderDashboard();
  
  if(debugMode) {
    showDebug();
  }
}

function renderContagemApp() {
  const data = lastDataContagemApp?.data;
  if(!data) return;
  
  const ferias = ['MADALENA', 'INGRID', 'KAMYLA'];
  if(data.vendasInternas) {
    data.vendasInternas.forEach(p => {
      if(ferias.includes(p.nome?.toUpperCase())) p.status = 'férias';
    });
  }
  if(data.conciliacao) {
    data.conciliacao.forEach(p => {
      if(ferias.includes(p.nome?.toUpperCase())) p.status = 'férias';
    });
  }
  if(data.refiliacao) {
    data.refiliacao.forEach(p => {
      if(ferias.includes(p.nome?.toUpperCase())) p.status = 'férias';
    });
  }
  
  const gv = data.geral?.vendas || {total: 0, sem: 0, ok: 0};
  const gr = data.geral?.ref || {total: 0, sem: 0, ok: 0};
  const gtv = data.geral?.totalVendas || {total: 0, sem: 0, ok: 0};
  const gmc = data.geral?.metaCleonice || {total: 0, sem: 0, ok: 0};
  
  function renderBigCardWithBar(title, total, sem, ok) {
    const percent = pct(ok, total);
    const bar = total === 0 ? '' : `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
    return `<div class="big-card"><small>${title}</small><h2>${safeNum(total)}</h2><div>${safeNum(sem)} Sem APP | ${safeNum(ok)} APP OK</div>${bar}</div>`;
  }
  
  const topCards = document.getElementById('topCardsContagemApp');
  topCards.innerHTML = 
    renderBigCardWithBar('VENDAS', gv.total, gv.sem, gv.ok) +
    renderBigCardWithBar('REFILIAÇÃO', gr.total, gr.sem, gr.ok) +
    renderBigCardWithBar('TOTAL VENDAS', gtv.total, gtv.sem, gtv.ok) +
    renderBigCardWithBar('META CLEONICE', gmc.total, gmc.sem, gmc.ok);
  
  const sections = document.getElementById('sectionsContagemApp');
  sections.innerHTML = 
    renderSection('VENDAS INTERNAS', data.vendasInternas) +
    renderSection('RECEPÇÃO', data.recepcao) +
    renderSection('REFILIAÇÃO', data.refiliacao) +
    renderSection('WEB/TELEVENDAS/OUTROS', data.webTelevendasOutros) +
    renderSection('CONCILIAÇÃO', data.conciliacao);
}

function renderVendas() {
  const data = lastDataVendas?.data;
  if(!data) return;
  
  if(data.refiliacao) {
    data.refiliacao.forEach(p => {
      if(p.nome?.toUpperCase() === 'INGRID') p.status = 'férias';
    });
  }
  
  const geral = data.geral || {};
  
  function renderBigCardVendas(title, total, pendencia, ok) {
    const percent = pct(ok, total);
    const bar = total === 0 ? '' : `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
    return `<div class="big-card"><small>${title}</small><h2>${safeNum(total)}</h2><div>${safeNum(pendencia)} Pendências | ${safeNum(ok)} OK</div>${bar}</div>`;
  }
  
  const topCards = document.getElementById('topCardsVendas');
  topCards.innerHTML = 
    renderBigCardVendas('FILIADOS CTC LIG/DOC', geral.filiadosCTCLigDoc?.total, geral.filiadosCTCLigDoc?.pendencia, geral.filiadosCTCLigDoc?.ok) +
    renderBigCardVendas('WEB/TELEVENDAS LIG', geral.webTelevendasLig?.total, geral.webTelevendasLig?.pendencia, geral.webTelevendasLig?.ok) +
    renderBigCardVendas('VENDAS TOTAIS', geral.vendasTotais?.total, geral.vendasTotais?.pendencia, geral.vendasTotais?.ok) +
    `<div class="big-card"><small>TOTAL CANCELADOS</small><h2>${safeNum(geral.totalCancelados?.recepcao + geral.totalCancelados?.filiacao + geral.totalCancelados?.refiliacao + geral.totalCancelados?.webTelevendas + geral.totalCancelados?.outros)}</h2></div>`;
  
  const sections = document.getElementById('sectionsVendas');
  sections.innerHTML = 
    renderSection('RECEPÇÃO', data.recepcao, true) +
    renderSection('VENDAS', data.vendas, true) +
    renderSection('REFILIAÇÃO', data.refiliacao, true) +
    renderOutrosSection('OUTROS', data.outros) +
    renderOutrosSection('WEB', data.web) +
    renderOutrosSection('TELEVENDAS', data.televendas);
}

function renderOutrosSection(title, dados) {
  if(!dados) return '';
  const percent = pct(dados.total - dados.pendenciaDocs - dados.pendenciaLig, dados.total);
  const bar = dados.total === 0 ? '' : `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
  const html = `<div class="section-title">${title}</div><div class="cards-grid"><div class="card"><h3>${title}</h3><div class="kv"><span>Total:</span><strong>${safeNum(dados.total)}</strong></div><div class="kv"><span>CDT Sonhos:</span><strong>${safeNum(dados.cdtSonhos)}</strong></div><div class="kv"><span>Pend. Docs:</span><strong>${safeNum(dados.pendenciaDocs)}</strong></div><div class="kv"><span>Pend. Lig:</span><strong>${safeNum(dados.pendenciaLig)}</strong></div><div class="kv"><span>Cancelados:</span><strong>${safeNum(dados.cancelados)}</strong></div>${bar}</div></div>`;
  return html;
}

function renderRefuturiza() {
  const data = lastDataRefuturiza?.data;
  if(!data) return;
  
  const geral = data.geral || {totalRefuturiza: 0, comLigacao: 0, semLigacao: 0, porcentagem: 0, totalCancelados: 0};
  const consultores = data.consultores || [];
  
  function renderBigCardRefuturiza(title, total, comLigacao, semLigacao) {
    const percent = pct(comLigacao, total);
    const bar = total === 0 ? '' : `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
    return `<div class="big-card"><small>${title}</small><h2>${safeNum(total)}</h2><div>${safeNum(comLigacao)} Com Ligação | ${safeNum(semLigacao)} Sem Ligação</div>${bar}</div>`;
  }
  
  function renderConsultorCard(c) {
    const total = safeNum(c.total);
    const comLigacao = safeNum(c.comLigacao);
    const semLigacao = safeNum(c.semLigacao);
    const cancelados = safeNum(c.cancelados);
    const percent = safeNum(c.porcentagem);
    
    let bar;
    if(total === 0) {
      bar = '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>';
    } else {
      bar = `<div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div>`;
    }
    
    return `<div class="card"><h3>${c.nome || 'Sem nome'}</h3><div class="kv"><span>Total:</span><strong>${total}</strong></div><div class="kv"><span>Com Ligação:</span><strong>${comLigacao}</strong></div><div class="kv"><span>Sem Ligação:</span><strong>${semLigacao}</strong></div><div class="kv"><span>Cancelados:</span><strong>${cancelados}</strong></div><div class="progress-wrap" style="margin-top:8px">${bar}</div></div>`;
  }
  
  const topCards = document.getElementById('topCardsRefuturiza');
  if(topCards) {
    topCards.innerHTML = 
      renderBigCardRefuturiza('TOTAL REFUTURIZA', geral.totalRefuturiza, geral.comLigacao, geral.semLigacao) +
      `<div class="big-card"><small>TOTAL CANCELADOS</small><h2>${safeNum(geral.totalCancelados)}</h2></div>`;
  }
  
  const sections = document.getElementById('sectionsRefuturiza');
  if(sections) {
    if(consultores.length === 0) {
      sections.innerHTML = '<div class="section-title">CONSULTORES <span style="color:#9ca3af;font-size:14px;font-weight:400">(vazio)</span></div>';
    } else {
      sections.innerHTML = `<div class="section-title">CONSULTORES</div><div class="cards-grid">${consultores.map(renderConsultorCard).join('')}</div>`;
    }
  }
}

function renderRetencao() {
  if(!lastDataRetencao?.data) return;
  
  const data = lastDataRetencao.data;
  const geral = data.geral || {};
  const consultoras = data.consultoras || [];
  
  function renderBigCardRetencao(title, value, subtitle) {
    return `<div class="big-card"><small>${title}</small><h2>${value}</h2><div>${subtitle}</div></div>`;
  }
  
  function renderConsultoraCard(c) {
    const totalMes = safeNum(c.totalMes);
    const retidosMes = safeNum(c.retidosMes);
    const retidosOkMes = safeNum(c.retidosOkMes);

    const semDocumentos = retidosMes - retidosOkMes;
    const retidosOkCalculado = totalMes - semDocumentos;
    const qualidade = safeNum(c.qualidade);
    const totalUltimos3 = safeNum(c.totalUltimos3Meses);
    const retidosUltimos3 = safeNum(c.mensOkUltimos3Meses) + safeNum(c.emAtrasoUltimos3Meses);
    const canceladosUltimos3 = safeNum(c.canceladoUltimos3Meses);
    
    let bar;
    if(totalMes === 0) {
      bar = '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>';
    } else {
      bar = `<div class="progress"><div class="bar ${colorClass(qualidade)}" style="width:${Math.max(qualidade, 5)}%">${qualidade}%</div></div>`;
    }
    
    const pendenciasUltimos3 = safeNum(c.emAtrasoUltimos3Meses) + safeNum(c.canceladoUltimos3Meses);
    const okUltimos3 = totalUltimos3 - pendenciasUltimos3;
    const qualidadeUltimos3 = totalUltimos3 > 0 ? Math.round((okUltimos3 / totalUltimos3) * 100) : 0;
    const barUltimos3 = totalUltimos3 === 0 ? '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>' : `<div class="progress"><div class="bar ${colorClass(qualidadeUltimos3)}" style="width:${Math.max(qualidadeUltimos3, 5)}%">${qualidadeUltimos3}%</div></div>`;
    const ultimos3 = `<div style="font-size:12px;color:#6b7280;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e5e7eb"><strong>Ultimos 3 Meses</strong></div><div class="kv"><span>Total:</span><strong>${totalUltimos3}</strong></div><div class="kv"><span>Retidos:</span><strong>${retidosUltimos3}</strong></div><div class="kv"><span>Cancelados:</span><strong>${canceladosUltimos3}</strong></div><div class="kv"><span>Qualidade:</span><strong>${qualidadeUltimos3}%</strong></div><div class="progress-wrap" style="margin-top:6px">${barUltimos3}</div>`;
    
    const mesAtual = `<div style="font-size:12px;color:#6b7280;margin:10px 0 8px 0;padding-top:8px;border-top:1px solid #e5e7eb"><strong>Mes Atual</strong></div><div class="kv"><span>Total Mes:</span><strong>${totalMes}</strong></div><div class="kv"><span>Retidos OK:</span><strong>${retidosOkCalculado}</strong></div><div class="kv"><span>Cancelados:</span><strong>${safeNum(c.canceladoMes)}</strong></div><div class="kv"><span>Qualidade:</span><strong>${qualidade}%</strong></div>`;
    
    return `<div class="card"><h3>${c.nome || 'Sem nome'}</h3>${ultimos3}${mesAtual}<div class="progress-wrap" style="margin-top:8px">${bar}</div></div>`;
  }
  
  function renderConsultoraCardSemMesAtual(c) {
    const totalUltimos3 = safeNum(c.totalUltimos3Meses);
    const retidosUltimos3 = safeNum(c.mensOkUltimos3Meses) + safeNum(c.emAtrasoUltimos3Meses);
    const canceladosUltimos3 = safeNum(c.canceladoUltimos3Meses);
    
    const pendenciasUltimos3 = safeNum(c.emAtrasoUltimos3Meses) + safeNum(c.canceladoUltimos3Meses);
    const okUltimos3 = totalUltimos3 - pendenciasUltimos3;
    const qualidadeUltimos3 = totalUltimos3 > 0 ? Math.round((okUltimos3 / totalUltimos3) * 100) : 0;
    const barUltimos3 = totalUltimos3 === 0 ? '<div style="height:20px;background:#e5e7eb;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:11px">SEM DADOS</div>' : `<div class="progress"><div class="bar ${colorClass(qualidadeUltimos3)}" style="width:${Math.max(qualidadeUltimos3, 5)}%">${qualidadeUltimos3}%</div></div>`;
    const ultimos3 = `<div style="font-size:12px;color:#6b7280;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #e5e7eb"><strong>Ultimos 3 Meses</strong></div><div class="kv"><span>Total:</span><strong>${totalUltimos3}</strong></div><div class="kv"><span>Retidos:</span><strong>${retidosUltimos3}</strong></div><div class="kv"><span>Cancelados:</span><strong>${canceladosUltimos3}</strong></div><div class="kv"><span>Qualidade:</span><strong>${qualidadeUltimos3}%</strong></div><div class="progress-wrap" style="margin-top:6px">${barUltimos3}</div>`;
    
    return `<div class="card"><h3>${c.nome || 'Sem nome'}</h3>${ultimos3}</div>`;
  }
  
  const topCards = document.getElementById('topCardsRetencao');
  if(topCards) {
    const totalRetidos = safeNum(geral.totalRetidosMes);
    const totalCancelados = safeNum(geral.totalCanceladosMes);
    const taxaRetencao = (totalRetidos + totalCancelados) > 0 ? ((totalRetidos / (totalRetidos + totalCancelados)) * 100).toFixed(2) : 0;
    
    topCards.innerHTML = 
      renderBigCardRetencao('TAXA DE RETENÇÃO', taxaRetencao + '%', 'Retidos / (Retidos + Cancelados)') +
      renderBigCardRetencao('CHURN FRANQUIA', safeNum(geral.churnFranquia).toFixed(2) + '%', 'Cancelados dos consultores') + // ALTERAÇÃO SOLICITADA AQUI
      renderBigCardRetencao('CHURN RATE', safeNum(geral.churnRate).toFixed(2) + '%', 'Total de cancelados') +
      renderBigCardRetencao('TOTAL CANCELADOS MÊS', safeNum(geral.totalCanceladosMes), 'Cancelamentos do mês') +
      renderBigCardRetencao('TOTAL RETIDOS MÊS', safeNum(geral.totalRetidosMes), 'Clientes retidos');
  }
  
  const sections = document.getElementById('sectionsRetencao');
  if(sections) {
    if(consultoras.length === 0) {
      sections.innerHTML = '<div class="section-title">CONSULTORAS <span style="color:#9ca3af;font-size:14px;font-weight:400">(vazio)</span></div>';
    } else {
      const comMesAtual = consultoras.filter(c => c.tipo === 'retencao');
      const semMesAtual = consultoras.filter(c => c.tipo === 'refiliacao');
      
      let html = '';
      
      if(comMesAtual.length > 0) {
        html += `<div class="section-title">CONSULTORAS - ÚLTIMOS 3 MESES + MÊS ATUAL</div><div class="cards-grid">${comMesAtual.map(renderConsultoraCard).join('')}</div>`;
      }
      
      if(semMesAtual.length > 0) {
        html += `<div class="section-title" style="margin-top:30px">CONSULTORAS - ÚLTIMOS 3 MESES (Recorrência)</div><div class="cards-grid">${semMesAtual.map(renderConsultoraCardSemMesAtual).join('')}</div>`;
      }
      
      sections.innerHTML = html;
    }
  }
}

function renderAdimplencia() {
  if(!lastDataAdimplencia?.data) return;
  
  const data = lastDataAdimplencia.data;
  const geral = data.geral || {};
  const secoes = data.secoes || {};
  
  function renderBigCardAdimplencia(title, value, subtitle) {
    return `<div class="big-card"><small>${title}</small><h2>${value}</h2><div>${subtitle}</div></div>`;
  }
  
  function renderFaixaCard(titulo, total, percent) {
    const bar = `<div class="progress"><div class="bar green" style="width:${Math.max(percent, 5)}%">${percent}%</div></div>`;
    return `<div class="big-card"><small>${titulo}</small><h2>${total}</h2><div>${percent}% do total</div>${bar}</div>`;
  }
  
  function renderColaboradorCard(c) {
    const arrecadado = safeNum(c.arrecadado);
    const tk = safeNum(c.tk);
    const qia = safeNum(c.qia);
    const trocas = safeNum(c.totalTrocas);
    
    return `<div class="card"><h3>${c.nome}</h3><div class="kv"><span>Arrecadado:</span><strong>${formatCurrency(arrecadado)}</strong></div><div class="kv"><span>QIA:</span><strong>${qia}</strong></div><div class="kv"><span>TK:</span><strong>${formatCurrency(tk)}</strong></div><div class="kv"><span>Trocas:</span><strong>${trocas}</strong></div></div>`;
  }
  
  const topCards = document.getElementById('topCardsAdimplencia');
  if(topCards) {
    topCards.innerHTML = 
      renderBigCardAdimplencia('TOTAL MC', safeNum(geral.totalMC), 'Total de movimentações') +
      renderBigCardAdimplencia('TOTAL ARRECADADO', formatCurrency(geral.totalArrecadado), 'Valor total arrecadado') +
      renderBigCardAdimplencia('TKM', formatCurrency(geral.tkm), 'Ticket médio') +
      renderBigCardAdimplencia('TOTAL TROCAS', safeNum(geral.totalTrocas), 'Trocas realizadas') +
      renderFaixaCard('NOVOS REJEITADOS (NR)', safeNum(geral.totalNIR), safeNum(geral.percentNIR)) +
      renderFaixaCard('1 a 3 meses', safeNum(geral.total1a3), safeNum(geral.percent1a3)) +
      renderFaixaCard('4 a 6 meses', safeNum(geral.total4a6), safeNum(geral.percent4a6));
  }
  
  const sections = document.getElementById('sectionsAdimplencia');
  if(sections) {
    const nirColaboradores = secoes.nir || [];
    const um3Colaboradores = secoes.um_a_tres || [];
    const quatro6Colaboradores = secoes.quatro_a_seis || [];
    
    let html = '';
    
    if(nirColaboradores.length > 0) {
      html += `<div class="section-title">NOVOS REJEITADOS (NR)</div><div class="cards-grid">${nirColaboradores.map(renderColaboradorCard).join('')}</div>`;
    }
    
    if(um3Colaboradores.length > 0) {
      html += `<div class="section-title">1 A 3 MESES EM ABERTO</div><div class="cards-grid">${um3Colaboradores.map(renderColaboradorCard).join('')}</div>`;
    }
    
    if(quatro6Colaboradores.length > 0) {
      html += `<div class="section-title">4 A 6 MESES EM ABERTO</div><div class="cards-grid">${quatro6Colaboradores.map(renderColaboradorCard).join('')}</div>`;
    }
    
    sections.innerHTML = html;
  }
}

function renderCashback() {
  if(!lastDataCashback?.data) return;
  
  const data = lastDataCashback.data;
  const geral = data.geral || {};
  const metricas = data.metricas || {};
  const parceiros = data.parceiros || [];
  const colaboradores = data.colaboradores || [];
  const colabMetricas = data.colaboradoresMetricas || {};

  // Funções helper atualizadas
  function renderBigCard(title, value, subtitle, customClass = '', barHtml = '') {
    const cls = customClass ? `big-card ${customClass}` : 'big-card';
    return `<div class="${cls}"><small>${title}</small><h2>${value}</h2><div>${subtitle}</div>${barHtml}</div>`;
  }
  
  function getCorCashback(valor) {
    const v = safeNum(valor);
    if(v === 0) return '#ef4444'; // Vermelho (R$ 0,00)
    if(v > 0 && v < 3) return '#eab308'; // Âmbar (Entre R$ 0,01 e R$ 2,99)
    return '#22c55e'; // Verde (R$ 3,00 ou mais)
  }
  
  function renderParceiro(p) {
    if(p.nome === 'PARCEIROS') return '';
    const valor = safeNum(p.valorCashback);
    return `<div class="cashback-card"><h3>${p.nome}</h3><div class="kv"><span>Segmento:</span><strong>${p.segmento || '-'}</strong></div><div class="kv"><span>Cashback:</span><strong>${formatCurrency(valor)}</strong></div><div class="kv"><span>Tendência:</span><strong>${formatCurrency(safeNum(p.tendencia))}</strong></div></div>`;
  }
  
  function renderColaborador(c) {
    const valorBruto = safeNum(c.cashbackMes);
    const cor = getCorCashback(valorBruto);
    const almocoStatus = c.ganhouAlmoco ? '✓ Ganhou' : '-';
    
    let cashbackTexto;
    if (valorBruto > 0 && valorBruto < 3) {
        cashbackTexto = '> R$0,00 e < R$3,00';
    } else {
        cashbackTexto = formatCurrency(valorBruto);
    }
    
    return `<div class="cashback-card" style="border-left: 4px solid ${cor}"><h3>${c.nome}</h3><div class="kv"><span>Cashback:</span><strong style="color:${cor}">${cashbackTexto}</strong></div><div class="kv"><span>Almoço:</span><strong>${almocoStatus}</strong></div></div>`;
  }

  // --- TOP CARDS (Bloco 1) ---
  const topCards = document.getElementById('topCardsCashback');
  if(topCards) {
    // Apenas o TOTAL CASHBACK (os outros 3 foram removidos)
    topCards.innerHTML = 
      renderBigCard('TOTAL CASHBACK', formatCurrency(geral.totalCashback), 'Valor total gerado') +
      renderBigCard('USUÁRIOS ÚNICOS', safeNum(metricas.realizadoUsuarios), 'Usuários únicos realizados');
  }

  // --- SECTIONS (Bloco 2 e Colaboradores) ---
  const sections = document.getElementById('sectionsCashback');
  if(sections) {
    const parceirosValidos = parceiros.filter(p => p.nome !== 'PARCEIROS');
    const qtdParceiros = parceirosValidos.length;
    const qtdParceirosAcima20 = parceirosValidos.filter(p => safeNum(p.valorCashback) >= 20).length;
    
    // Cálculo do % >= R$ 20 (para card mesclado)
    const percentAcima20 = qtdParceiros > 0 ? ((qtdParceirosAcima20 / qtdParceiros) * 100) : 0;
    const mergedBarHtml = `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar green" style="width:${Math.max(percentAcima20, 5)}%">${percentAcima20.toFixed(2)}%</div></div></div>`;

    // Cálculo do novo card ENTRE > R$0,00 e < R$3,00
    const totalColab = safeNum(colabMetricas.totalColaboradores);
    const totalAcima3 = safeNum(colabMetricas.totalAcima3);
    const totalZerados = safeNum(colabMetricas.totalZerados);
    const totalEntre0e3 = Math.max(0, totalColab - totalAcima3 - totalZerados); // Garante que não é negativo
    const percentEntre0e3 = totalColab > 0 ? ((totalEntre0e3 / totalColab) * 100) : 0;

    const collabClass = 'collab-metric'; // Classe para cor laranja
    
    let html = '<div class="top-cards">';

    // Cards Gerais
    html += renderBigCard('QTD. PARCEIROS', qtdParceiros, 'Total de parceiros');
    // Card QTD. >= R$ 20 (Mesclado com %)
    html += renderBigCard('QTD. >= R$ 20', qtdParceirosAcima20, 'Parceiros com valor >= R$ 20', '', mergedBarHtml);
    html += renderBigCard('META DIÁRIA', formatCurrency(metricas.metaDiariaCashback), 'Meta diária');
    html += renderBigCard('TENDÊNCIA', formatCurrency(metricas.tendenciaRealizado), 'Tendência realizado');

    // ADICIONE ESTAS 2 LINHAS:
    const metaUsuarios = safeNum(metricas.metaUsuariosUnicos);
    const percentualUsuarios = metaUsuarios > 0 ? ((safeNum(metricas.realizadoUsuarios) / metaUsuarios) * 100) : 0;
    const barUsuariosHtml = `<div class="progress-wrap" style="margin-top:10px"><div class="progress"><div class="bar ${colorClass(percentualUsuarios)}" style="width:${Math.max(percentualUsuarios, 5)}%">${percentualUsuarios.toFixed(2)}%</div></div></div>`;
    html += renderBigCard('USUÁRIOS ÚNICOS', safeNum(metricas.realizadoUsuarios), `Meta: ${metaUsuarios} | ${percentualUsuarios.toFixed(2)}%`, '', barUsuariosHtml);

    // Cards Colaboradores (Cor Laranja)
    html += renderBigCard('TOTAL COLAB.', safeNum(colabMetricas.totalColaboradores), 'Total de colaboradores', collabClass);
    html += renderBigCard('ACIMA DE R$ 3', safeNum(colabMetricas.totalAcima3), safeNum(colabMetricas.percentAcima3) + '%', collabClass);
    // Novo Card
    html += renderBigCard('ENTRE > R$0,00 e < R$3,00', totalEntre0e3, percentEntre0e3.toFixed(2) + '%', collabClass);
    html += renderBigCard('ZERADOS', safeNum(colabMetricas.totalZerados), safeNum(colabMetricas.percentZerados) + '%', collabClass);

    html += '</div>';
    
    if(parceirosValidos.length > 0) {
      html += `<div class="section-title">PARCEIROS</div><div class="cashback-grid">${parceirosValidos.map(renderParceiro).join('')}</div>`;
    }
    
    if(colaboradores.length > 0) {
      html += `<div class="section-title">COLABORADORES</div><div class="cashback-grid">${colaboradores.map(renderColaborador).join('')}</div>`;
    }
    
    sections.innerHTML = html;
  }
}

function renderDashboard() {
  const content = document.getElementById('dashboardContent');
  let html = '<div class="dashboard-grid">';
  
  if(lastDataContagemApp?.data?.geral) {
    const gv = lastDataContagemApp.data.geral.vendas || {total: 0, ok: 0, sem: 0};
    const percent = pct(gv.ok, gv.total);
    const bar = gv.total === 0 ? '' : `<div class="progress-wrap"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
    html += `<div class="dashboard-section"><h3>📱 Contagem APP - Vendas</h3><div class="card"><div class="kv"><span>Total:</span><strong>${safeNum(gv.total)}</strong></div><div class="kv"><span>Sem APP:</span><strong>${safeNum(gv.sem)}</strong></div><div class="kv"><span>APP OK:</span><strong>${safeNum(gv.ok)}</strong></div>${bar}</div></div>`;
  }
  
  if(lastDataVendas?.data?.geral) {
    const gtv = lastDataVendas.data.geral.vendasTotais || {total: 0, ok: 0, pendencia: 0};
    const percent = pct(gtv.ok, gtv.total);
    const bar = gtv.total === 0 ? '' : `<div class="progress-wrap"><div class="progress"><div class="bar ${colorClass(percent)}" style="width:${Math.max(percent, 5)}%">${percent}%</div></div></div>`;
    html += `<div class="dashboard-section"><h3>💰 Vendas Totais</h3><div class="card"><div class="kv"><span>Total:</span><strong>${safeNum(gtv.total)}</strong></div><div class="kv"><span>Pendências:</span><strong>${safeNum(gtv.pendencia)}</strong></div><div class="kv"><span>OK:</span><strong>${safeNum(gtv.ok)}</strong></div>${bar}</div></div>`;
  }
  
  if(lastDataRefuturiza?.data?.geral) {
    const ref = lastDataRefuturiza.data.geral;
    html += `<div class="dashboard-section"><h3>🔄 Refuturiza</h3><div class="card"><div class="kv"><span>Total:</span><strong>${safeNum(ref.totalRefuturiza)}</strong></div><div class="kv"><span>Com Ligação:</span><strong>${safeNum(ref.comLigacao)}</strong></div></div></div>`;
  }
  
  // Alteração solicitada: Churn Rate por Churn Franquia
  if(lastDataRetencao?.data?.geral) {
    const ret = lastDataRetencao.data.geral;
    html += `<div class="dashboard-section"><h3>🔐 Retenção</h3><div class="card"><div class="kv"><span>Churn Franquia:</span><strong>${safeNum(ret.churnFranquia).toFixed(2)}%</strong></div><div class="kv"><span>Retidos OK:</span><strong>${safeNum(ret.totalRetidosMes)}</strong></div></div></div>`;
  }
  
  if(lastDataAdimplencia?.data?.geral) {
    const adim = lastDataAdimplencia.data.geral;
    html += `<div class="dashboard-section"><h3>✅ Adimplência</h3><div class="card"><div class="kv"><span>Arrecadado:</span><strong>${formatCurrency(adim.totalArrecadado)}</strong></div><div class="kv"><span>TKM:</span><strong>${formatCurrency(adim.tkm)}</strong></div></div></div>`;
  }
  
  if(lastDataCashback?.data?.geral) {
    const cash = lastDataCashback.data.geral;
    html += `<div class="dashboard-section"><h3>🎁 Cashback</h3><div class="card"><div class="kv"><span>Total:</span><strong>${formatCurrency(cash.totalCashback)}</strong></div><div class="kv"><span>Dias Restantes:</span><strong>${safeNum(cash.diasRestantes)}</strong></div></div></div>`;
  }
  
  html += '</div>';
  content.innerHTML = html;
}

// --- CÓDIGO DE CORREÇÃO DE POSICIONAMENTO FIXO ---
function adjustFixedElements() {
  const header = document.querySelector('header');
  const tabsContainer = document.querySelector('.tabs-container');
  const body = document.querySelector('body');

  // 1. Altura do Header
  const headerHeight = header.offsetHeight;
  
  // 2. Reposiciona o Tabs Container, logo abaixo do header
  // O tabsContainer agora SÓ tem os botões, é a parte fixa das abas
  tabsContainer.style.top = `${headerHeight}px`;

  // 3. Altura TOTAL DOS ELEMENTOS FIXOS
  const fixedHeight = headerHeight + tabsContainer.offsetHeight;

  // 4. Ajusta o padding-top do Body
  // Isso garante que o conteúdo do body comece ABAIXO dos elementos fixos.
  body.style.paddingTop = `${fixedHeight + 18}px`; // Adicionado +18px para o padding original do .wrap
}

// Inicialização
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    init();
    setupButtons(); 
    // Chama o ajuste DEPOIS que o DOM está pronto e os estilos calculados
    adjustFixedElements();
  });
} else {
  init();
  setupButtons();
  adjustFixedElements();
}

// Recalcula o posicionamento ao redimensionar (essencial para mobile/tablet e quebra do header)
window.addEventListener('resize', adjustFixedElements);

// Atualização de dados a cada 3 minutos (180000 ms)
setInterval(init, 180000);
