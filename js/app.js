import { state } from './state.js';
import { UNIVERSIDADES, PERGUNTAS_DINAMICAS } from './data.js';
import { AIEngine } from './ai-engine.js';
import { atualizarTabela } from './components/table-handler.js';

let toastInstance = null;
let chartCompatInstance = null; // Variável global para controlar a instância do Chart.js

document.addEventListener('DOMContentLoaded', () => {
  if (typeof bootstrap !== 'undefined') {
    toastInstance = new bootstrap.Toast(document.getElementById('toastFeedback'));
  }
  
  // Inicialização do Step 0 (Tabela)
  atualizarTabela();
  setupEventListeners();
  syncInputSelectors();
  updateWizardUI();
});

function setupEventListeners() {
  // Escutas de Input da Tabela (Step 0)
  document.getElementById('buscaCurso').addEventListener('input', atualizarTabela);
  document.getElementById('filtroPaisTabela').addEventListener('change', atualizarTabela);
  document.getElementById('filtroCustoTabela').addEventListener('change', atualizarTabela);
  document.getElementById('filtroAreaTabela').addEventListener('change', atualizarTabela);
  document.getElementById('ordenarPor').addEventListener('change', atualizarTabela);

  // Escutas de Navegação do Wizard
  document.getElementById('btnPularExplorar').onclick = () => mudarStep(1);
  document.getElementById('btnNext').onclick = () => {
    if (state.stepAtual === state.totalSteps - 1) {
      location.reload();
    } else {
      mudarStep(1);
    }
  };
  document.getElementById('btnPrev').onclick = () => mudarStep(-1);

  // Escutas dos Sliders de Notas (Step 1)
  document.getElementById('notaGeral').oninput = e => {
    state.aluno.notaGeral = +e.target.value;
    document.getElementById('notaGeralVal').textContent = e.target.value;
  };
  document.getElementById('notaMat').oninput = e => {
    state.aluno.notaMat = +e.target.value;
    document.getElementById('notaMatVal').textContent = e.target.value;
  };

  // Botões do Painel de Resultados (Step 4)
  document.getElementById('btnSimularMat').onclick = () => {
    state.aluno = AIEngine.simularMelhoriaMat(state.aluno, 2);
    document.getElementById('notaMat').value = state.aluno.notaMat;
    document.getElementById('notaMatVal').textContent = state.aluno.notaMat;
    gerarResultados();
    showToast(`Simulação Aplicada: Matemática elevada para ${state.aluno.notaMat}/20.`);
  };

  document.getElementById('btnSalvarPerfil').onclick = () => {
    state.saveToLocalStorage();
    showToast('Teu perfil foi armazenado com sucesso localmente!');
  };

  document.getElementById('btnLoadProfile').onclick = () => {
    if (state.loadFromLocalStorage()) {
      showToast('Perfil de estudante restaurado!');
      syncInputSelectors();
      mudarStep(4 - state.stepAtual); // Salta direto para os resultados
    } else {
      showToast('Nenhum perfil salvo foi encontrado.');
    }
  };

  // Escuta de Eventos Customizados Globais
  window.addEventListener('showToast', (e) => showToast(e.detail));
  window.addEventListener('changeStep', (e) => {
    const passosDiferenca = e.detail - state.stepAtual;
    mudarStep(passosDiferenca);
  });


// --- ESNCUTAS DE AUTENTICAÇÃO ---
const formAuth = document.getElementById('formAuth');
if (formAuth) {
  formAuth.onsubmit = (e) => {
    e.preventDefault();
    const acao = e.submitter.dataset.acao; // 'login' ou 'registrar'
    const user = document.getElementById('authUsuario').value.trim().toLowerCase();
    const pass = document.getElementById('authSenha').value;

    if (!user || !pass) {
      showToast('Por favor, preenche todos os campos.');
      return;
    }

    const banco = JSON.parse(localStorage.getItem('uniMatch_usuarios') || '{}');

    if (acao === 'registrar') {
      if (banco[user]) {
        showToast('Este utilizador já existe!');
        return;
      }
      // Cria utilizador com dados padrão iniciais
      banco[user] = { senha: pass, perfil: null, darkMode: false };
      localStorage.setItem('uniMatch_usuarios', JSON.stringify(banco));
      showToast('Conta criada com sucesso! Podes fazer Login.');
    } else {
      // Ação de Login
      if (!banco[user] || banco[user].senha !== pass) {
        showToast('Utilizador ou palavra-passe incorretos.');
        return;
      }
      
      // Inicia sessão com sucesso
      state.usuarioLogado = user;
      state.loadFromLocalStorage();
      
      // Aplica o tema salvo do utilizador
      if (banco[user].darkMode) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      
      // Fecha o Modal de Autenticação do Bootstrap de forma limpa
      const modalAuthEl = document.getElementById('modalAuth');
      const modalAuthBS = bootstrap.Modal.getInstance(modalAuthEl);
      if (modalAuthBS) modalAuthBS.hide();

      atualizarInterfaceSessao();
      syncInputSelectors();
      atualizarTabela();
      showToast(`Sessão iniciada como: ${user}`);
    }
  };
}

// Botão de Terminar Sessão (Logout)
document.getElementById('btnLogOut').onclick = () => {
  state.usuarioLogado = null;
  state.resetAluno();
  localStorage.removeItem('uniMatch_sessaoAtiva');
  document.body.classList.remove('dark-mode'); // Volta ao tema padrão claro
  atualizarInterfaceSessao();
  syncInputSelectors();
  atualizarTabela();
  mudarStep(0 - state.stepAtual); // Força voltar para o ecrã inicial de segurança
  showToast('Sessão terminada com sucesso.');
};

// --- ESCUTA DO DARK MODE ELEGANTE ---
document.getElementById('btnToggleDarkMode').onclick = () => {
  document.body.classList.toggle('dark-mode');
  // Guarda a preferência imediatamente se houver sessão ativa
  if (state.usuarioLogado) {
    state.saveToLocalStorage();
  }
};
}

function syncInputSelectors() {
  document.getElementById('notaGeral').value = state.aluno.notaGeral;
  document.getElementById('notaGeralVal').textContent = state.aluno.notaGeral;
  document.getElementById('notaMat').value = state.aluno.notaMat;
  document.getElementById('notaMatVal').textContent = state.aluno.notaMat;
  document.getElementById('areaInteresse').value = state.aluno.areaInteresse;
  document.getElementById('filtroPais').value = state.aluno.filtroPais;
  document.getElementById('filtroCusto').value = state.aluno.filtroCusto;
  document.getElementById('filtroCidade').value = state.aluno.filtroCidade;
}

function mudarStep(direcao) {
  // Retorno da simulação forçada para a tabela
  if (state.stepAtual === 4 && direcao === -1 && state.aluno.cursoForcado) {
    document.querySelector(`.wizard-step[data-step="${state.stepAtual}"]`).classList.remove('active');
    state.stepAtual = 0;
    document.querySelector(`.wizard-step[data-step="${state.stepAtual}"]`).classList.add('active');
    updateWizardUI();
    return;
  }

  // Coleta dados se estiver avançando a partir do Step 1
  if (state.stepAtual === 1 && direcao > 0) {
    state.aluno.areaInteresse = document.getElementById('areaInteresse').value;
    state.aluno.filtroPais = document.getElementById('filtroPais').value;
    state.aluno.filtroCusto = document.getElementById('filtroCusto').value;
    state.aluno.filtroCidade = document.getElementById('filtroCidade').value;
    
    state.aluno.cursoForcado = null; // Limpa estado forçado para o fluxo normal do quiz
    carregarPerguntasDinamicas();
  }
  
  const proximoStep = state.stepAtual + direcao;

  if (proximoStep === 4) {
    gerarResultados();
  }

  document.querySelector(`.wizard-step[data-step="${state.stepAtual}"]`).classList.remove('active');
  state.stepAtual = proximoStep;
  document.querySelector(`.wizard-step[data-step="${state.stepAtual}"]`).classList.add('active');

  updateWizardUI();
}

function updateWizardUI() {
  document.getElementById('wizardProgress').style.width = `${(state.stepAtual / (state.totalSteps - 1)) * 100}%`;
  document.getElementById('btnPrev').disabled = state.stepAtual === 0;
  document.getElementById('btnNext').textContent = state.stepAtual === state.totalSteps - 1 ? 'Recomeçar' : 'Próximo';
}

function carregarPerguntasDinamicas() {
  const container = document.getElementById('dynamicQuestions');
  if(!container) return;
  container.innerHTML = '';
  
  const perguntas = PERGUNTAS_DINAMICAS[state.aluno.areaInteresse] || [];
  perguntas.forEach((p, i) => {
    container.innerHTML += `
      <div class="form-check form-switch mb-3 section-fade">
        <input class="form-check-input" type="checkbox" id="q${i}">
        <label class="form-check-label" for="q${i}">${p}</label>
      </div>`;
  });
}

function gerarResultados() {
  let resultados = [];
  
  UNIVERSIDADES.forEach(uni => {
    if (state.aluno.filtroPais !== 'todos' && uni.pais !== state.aluno.filtroPais) return;
    if (state.aluno.filtroCidade && !uni.cidade.toLowerCase().includes(state.aluno.filtroCidade.toLowerCase())) return;
    
    uni.cursos.forEach(curso => {
      // Ignora se não condizer com a área no fluxo normal do Quiz
      if (!state.aluno.cursoForcado && curso.area !== state.aluno.areaInteresse) return;

      const score = AIEngine.calcularCompatibilidade(state.aluno, curso, uni);
      resultados.push({
        curso, uni, score,
        expl: AIEngine.gerarExplicacao(curso, score, state.aluno)
      });
    });
  });

  resultados.sort((a, b) => b.score - a.score);

  // Garante prioridade ao curso vindo do Modal da Tabela
  if (state.aluno.cursoForcado) {
    const cf = state.aluno.cursoForcado;
    const index = resultados.findIndex(r => r.curso.nome === cf.curso.nome && r.uni.nome === cf.uni.nome);
    if (index > -1) {
      const [elemento] = resultados.splice(index, 1);
      resultados.unshift(elemento);
    }

   // Mantém isto para que simulações seguintes (ex: botão de Matemática) sejam dinâmicas!
    state.aluno.cursoForcado = null; 
  }

  renderResultadosUI(resultados);

  // Salva de forma personalizada no histórico do utilizador se ele estiver logado
  if (state.usuarioLogado && resultados.length > 0) {
    const novaSimulacao = {
      data: new Date().toLocaleDateString('pt-PT'),
      cursoPrincipal: resultados[0].curso.nome,
      uniPrincipal: resultados[0].uni.nome,
      matchScore: resultados[0].score
    };
    
    // Evita duplicados idênticos seguidos no histórico
    const ultimo = state.aluno.historicoSimulacoes[0];
    if (!ultimo || ultimo.cursoPrincipal !== novaSimulacao.cursoPrincipal || ultimo.matchScore !== novaSimulacao.matchScore) {
      state.aluno.historicoSimulacoes.unshift(novaSimulacao); // Adiciona no início
      if (state.aluno.historicoSimulacoes.length > 5) state.aluno.historicoSimulacoes.pop(); // Limita a 5 registos
      state.saveToLocalStorage();
    }
  }
  
  renderizarHistoricoUI();
}

function renderResultadosUI(resultados) {
  const top3 = resultados.slice(0, 3);
  const top3El = document.getElementById('top3Container');
  if (top3El) {
    top3El.innerHTML = '';
    top3.forEach((r, i) => {
      top3El.innerHTML += `
        <div class="col-md-4 section-fade" style="animation-delay: ${i * 0.1}s">
          <div class="card course-card h-100">
            <div class="card-body">
              <span class="badge bg-primary mb-2">#${i + 1} Match</span>
              <h6>${r.curso.nome}</h6>
              <p class="text-muted small mb-2">${r.uni.nome} - ${r.uni.cidade}</p>
              <div class="compat-bar mb-2">
                <div class="compat-fill" id="bar-top3-${i}" style="width: 0%"></div>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <strong>${r.score}% compatível</strong>
              </div>
            </div>
          </div>
        </div>`;
    });

    setTimeout(() => {
      top3.forEach((r, i) => {
        const bar = document.getElementById(`bar-top3-${i}`);
        if (bar) bar.style.width = `${r.score}%`;
      });
    }, 50);
  }

  const expIaEl = document.getElementById('explicacaoIA');
  if (expIaEl) {
    expIaEl.innerHTML = top3.length > 0 
      ? `<strong>Análise da IA:</strong> ${top3[0].expl}`
      : `<strong>Análise da IA:</strong> Nenhum curso atende aos critérios estritos selecionados.`;
  }

  desenharGraficoAreas(resultados);

  const lista = document.getElementById('rankingCompleto');
  if (lista) {
    lista.innerHTML = resultados.map(r => `
      <div class="list-group-item list-group-item-action">
        <div class="d-flex justify-content-between align-items-center">
          <div><strong>${r.curso.nome}</strong> - ${r.uni.nome} <small class="text-muted">(${r.uni.cidade})</small></div>
          <span class="badge bg-success">${r.score}%</span>
        </div>
      </div>`).join('');
  }
}

function desenharGraficoAreas(resultados) {
  const canvas = document.getElementById('chartCompat');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const areas = ['engenharia', 'saude', 'humanas', 'gestao'];
  const medias = areas.map(a => {
    const filtrados = resultados.filter(r => r.curso.area === a);
    return filtrados.length ? filtrados.reduce((s, r) => s + r.score, 0) / filtrados.length : 0;
  });

  if (chartCompatInstance) chartCompatInstance.destroy();

  if (typeof Chart !== 'undefined') {
    chartCompatInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['ENGENHARIA', 'SAÚDE', 'HUMANAS', 'GESTÃO'],
        datasets: [{
          label: '% Média de Match',
          data: medias,
          backgroundColor: 'rgba(13, 110, 253, 0.7)',
          borderColor: '#0d6efd',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 0, max: 100 } }
      }
    });
  }
}

function showToast(msg) {
  const el = document.getElementById('toastMsg');
  if (el && toastInstance) {
    el.textContent = msg;
    toastInstance.show();
  }
}

function atualizarInterfaceSessao() {
  const containerSessao = document.getElementById('sessaoStatusContainer');
  const btnSalvar = document.getElementById('btnSalvarPerfil');
  
  if (state.usuarioLogado) {
    containerSessao.innerHTML = `
      <span class="me-2 text-muted small"><i class="bi bi-person-circle text-primary"></i> Olá, <strong>${state.usuarioLogado}</strong></span>
      <button class="btn btn-outline-danger btn-sm" id="btnLogOutClick"><i class="bi bi-box-arrow-right"></i> Sair</button>
    `;
    document.getElementById('btnLogOutClick').onclick = () => document.getElementById('btnLogOut').click();
    if (btnSalvar) btnSalvar.disabled = false;
  } else {
    containerSessao.innerHTML = `
      <button class="btn btn-primary btn-sm me-2" data-bs-toggle="modal" data-bs-target="#modalAuth">
        <i class="bi bi-box-arrow-in-right"></i> Entrar / Registar
      </button>
    `;
    if (btnSalvar) btnSalvar.disabled = true;
  }
}

function renderizarHistoricoUI() {
  const container = document.getElementById('historicoSimulacoesContainer');
  if (!container) return;

  if (!state.usuarioLogado) {
    container.innerHTML = `<p class="text-muted small text-center my-3">Inicia sessão para ver o teu histórico personalizado.</p>`;
    return;
  }

  const historico = state.aluno.historicoSimulacoes || [];
  if (historico.length === 0) {
    container.innerHTML = `<p class="text-muted small text-center my-3">Nenhuma simulação guardada ainda.</p>`;
    return;
  }

  container.innerHTML = historico.map(h => `
    <div class="p-2 border-bottom text-start small">
      <div class="d-flex justify-content-between">
        <span class="fw-bold text-primary">${h.matchScore}% - ${h.cursoPrincipal}</span>
        <span class="text-muted text-end" style="font-size:10px">${h.data}</span>
      </div>
      <div class="text-muted" style="font-size:11px">${h.uniPrincipal}</div>
    </div>
  `).join('');
}

// Restaura a sessão automaticamente ao carregar a página se o utilizador não encerrou a sessão antes
document.addEventListener('DOMContentLoaded', () => {
  const sessaoAtiva = localStorage.getItem('uniMatch_sessaoAtiva');
  if (sessaoAtiva) {
    state.usuarioLogado = sessaoAtiva;
    state.loadFromLocalStorage();
    
    const banco = JSON.parse(localStorage.getItem('uniMatch_usuarios') || '{}');
    if (banco[sessaoAtiva] && banco[sessaoAtiva].darkMode) {
      document.body.classList.add('dark-mode');
    }
    
    syncInputSelectors();
    atualizarTabela();
  }
  atualizarInterfaceSessao();
  renderizarHistoricoUI();
});