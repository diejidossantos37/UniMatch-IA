import { state } from '../state.js';
import { AIEngine } from '../ai-engine.js';

let modalCursoBS = null;
let chartNotaCorteInstance = null;

export function abrirModalCurso(id) {
  const item = state.cursosFiltradosTabela.find(c => c.id === id);
  if (!item) return;
  
  document.getElementById('modalCursoTitulo').textContent = item.curso.nome;
  document.getElementById('modalUni').textContent = item.uni.nome;
  document.getElementById('modalLocal').textContent = `${item.uni.cidade}, ${item.uni.pais}`;
  document.getElementById('modalDuracao').textContent = item.curso.duracao;
  document.getElementById('modalPropina').textContent = item.uni.propina;
  document.getElementById('modalNotaMin').textContent = item.curso.notaMin;

  // Garante a instância correta do Modal do Bootstrap sem quebrar
  if (!modalCursoBS) {
    const modalEl = document.getElementById('modalCurso');
    if (modalEl) modalCursoBS = new bootstrap.Modal(modalEl);
  }

  // Renderização estável do gráfico com Chart.js
  const canvas = document.getElementById('chartNotaCorte');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (chartNotaCorteInstance) chartNotaCorteInstance.destroy();
    
    chartNotaCorteInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['2023', '2024', '2025'],
        datasets: [{
          label: 'Nota de Corte Histórica',
          data: item.curso.notaCorte || [item.curso.notaMin - 1, item.curso.notaMin, item.curso.notaMin],
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { min: 8, max: 20 } }
      }
    });
  }

  // Montagem da grade curricular
  const accordion = document.getElementById('accordionGrade');
  if (accordion) {
    accordion.innerHTML = '';
    Object.entries(item.curso.grade || {}).forEach(([ano, disciplinas], i) => {
      accordion.innerHTML += `
        <div class="accordion-item">
          <h2 class="accordion-header">
            <button class="accordion-button ${i > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#grade${i}">
              ${ano}
            </button>
          </h2>
          <div id="grade${i}" class="accordion-collapse collapse ${i === 0 ? 'show' : ''}" data-bs-parent="#accordionGrade">
            <div class="accordion-body">
              <ul class="mb-0">${disciplinas.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
          </div>
        </div>`;
    });
  }

  const btnSimular = document.getElementById('btnSimularEsteCurso');
  if (btnSimular) {
    btnSimular.onclick = () => {
      // 1. Calcula a compatibilidade em tempo real para exibir no Toast
      const score = AIEngine.calcularCompatibilidade(state.aluno, item.curso, item.uni);
      
      // 2. Dispara o feedback visual para o utilizador
      window.dispatchEvent(new CustomEvent('showToast', { 
        detail: `Simulando compatibilidade com ${item.curso.nome}: ${score}%` 
      }));
      
      // 3. Fecha o modal de forma limpa antes da transição de ecrã
      if (modalCursoBS) modalCursoBS.hide();
      
      // 4. CORREÇÃO CRÍTICA: Injeta o curso formatado exatamente no padrão estrutural que o app.js exige
      state.aluno.cursoForcado = {
        curso: { ...item.curso },
        uni: { ...item.uni }
      };
      
      // 5. Força o Wizard a saltar diretamente para o ecrã de Resultados (Step 4)
      window.dispatchEvent(new CustomEvent('changeStep', { detail: 4 }));
    };
  }
}