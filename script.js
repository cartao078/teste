// APIs INDEPENDENTES
const APICONTAGEMAPP = 'https://script.google.com/macros/s/AKfycby6ip-dZkmDIrG3GhutwY3t40DprmNlUxIf9kMBefFwzosOFri9nq2dSArTQVb1CUxF/exec';
const APIVENDAS = 'https://script.google.com/macros/s/AKfycbz2iN8BFtjs0GHD1W84c0hNvRJIuJu3pmv-L0YcboGSgLhd2LQNOJMieJLTNWQC/exec';
const APIREFUTURIZA = 'https://script.google.com/macros/s/AKfycbwjrD4H1nK8CTpSVT0n7T9BYonh-F5s7zx3E9QVeiJuO1vgFGMCqnWgYH0einPPjxYlexec';
const APIRETENCAO = 'https://script.google.com/macros/s/AKfycbzjQFDwj46u6Ymz33aT0SqVctD5Kvg4wkexeubg49rKl6OOXBoBdFnEASlFS5XRKhhZ/exec';
const APIADIMPLENCIA = 'https://script.google.com/macros/s/AKfycbzJ5TZAmTBpoZiT4Wss9RvdguIPaPHaJrakHvqz0qReCyC21oweNt84feMFMvmC118U/exec';
const APICASHBACK = 'https://script.google.com/macros/s/AKfycbxfI9vHstylYG7vjjf5xDaElnBe9qcd6neiK4-bvoA6YrSK0MzY2Eq9jrAvOt2BnY/exec';

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
    // Atualiza botões (MELHORADO: Acessibilidade)
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    document.querySelector(`[data-tab="${tab}"]`).setAttribute('aria-selected', 'true');
    
    // Mostra a aba
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

    if (reloadBtn) {
        reloadBtn.onclick = function(e) {
            e.preventDefault();
            console.log('Recarregando dados...');
            init();
        };
    }

    if (debugBtn) {
        debugBtn.onclick = function(e) {
            e.preventDefault();
            debugMode = !debugMode;
            document.getElementById('debugPanel').classList.toggle('show');
            if (debugMode) showDebug();
        };
    }

    if (downloadBtn) {
        downloadBtn.onclick = function(e) {
            e.preventDefault();
            downloadTabAsImage();
        };
    }
}

// CÓDIGO DE CORREÇÃO DE POSICIONAMENTO FIXO
function adjustFixedElements() {
    const header = document.querySelector('header');
    const tabsContainer = document.querySelector('.tabs-container');
    const body = document.querySelector('body');
    
    // 1. Altura do Header
    const headerHeight = header.offsetHeight;
    
    // 2. Reposiciona o Tabs Container, logo abaixo do header
    // O tabsContainer agora SÓ tem os botões, a parte fixa das abas
    tabsContainer.style.top = headerHeight + 'px';
    
    // 3. Altura TOTAL DOS ELEMENTOS FIXOS
    const fixedHeight = headerHeight + tabsContainer.offsetHeight;
    
    // 4. Ajusta o padding-top do Body
    // Isso garante que o conteúdo do body comece ABAIXO dos elementos fixos.
    body.style.paddingTop = fixedHeight + 18 + 'px'; // Adicionado 18px para o padding original do .wrap
}

// DOWNLOAD COMO IMAGEM
function downloadTabAsImage() {
    const activePane = document.querySelector('.tab-pane.active');
    const activeTabBtn = document.querySelector('.tab-button.active');
    
    if (!activePane || !activeTabBtn) {
        alert('Nenhuma aba ativa encontrada!');
        return;
    }
    
    const tabName = activeTabBtn.textContent.trim();
    const fileName = tabName + ' - ' + new Date().toLocaleDateString('pt-BR').replace(/\//g, '-') + '.png';
    
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
    let html = '<strong>DADOS RECEBIDOS</strong><br><br>';
    
    html += '<strong>CONTAGEM APP</strong><br>' + JSON.stringify(lastDataContagemApp, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    html += '<br><br><strong>VENDAS</strong><br>' + JSON.stringify(lastDataVendas, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    html += '<br><br><strong>REFUTURIZA</strong><br>' + JSON.stringify(lastDataRefuturiza, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    // Adicionando outros dados de debug
    html += '<br><br><strong>RETENÇÃO</strong><br>' + JSON.stringify(lastDataRetencao, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    html += '<br><br><strong>ADIMPLÊNCIA</strong><br>' + JSON.stringify(lastDataAdimplencia, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    html += '<br><br><strong>CASHBACK</strong><br>' + JSON.stringify(lastDataCashback, null, 2).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;');
    
    panel.innerHTML = html;
}

// Funções helper atualizadas
function safeNum(v) {
    if (v == null || v == undefined || v == '') return 0;
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
    return t == 0 ? 0 : Math.round((o / t) * 100);
}

function colorClass(p) {
    if (p >= 89) return 'green';
    if (p >= 85) return 'yellow';
    return 'red';
}

function isInactive(p) {
    const s = String(p.status).toLowerCase();
    return ['inativa', 'ferias', 'frias', 'ausente'].includes(s);
}

// Inicialização
if (document.readyState === 'loading') {
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

// Resto do JavaScript (funções render, fetch APIs, etc.) VEM DO ARQUIVO ORIGINAL
// Cole aqui TODO o JavaScript que estava no <script> do indexv10.html
// (As funções renderBigCard, fetchAPI, init, etc.)
