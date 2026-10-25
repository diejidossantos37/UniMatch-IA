import { UNIVERSIDADES, ESCOLHAS_POPULARES } from '../data.js';
import { state } from '../state.js';
import { abrirModalCurso } from './modal-handler.js';

export function atualizarTabela(manterPagina = false) {
  let todosCursos = [];
  UNIVERSIDADES.forEach(uni => {
    uni.cursos.forEach(curso => {
      const id = `${uni.id}-${curso.nome}`;
      todosCursos.push({
        id, curso, uni,
        popular: ESCOLHAS_POPULARES[id] || 0
      });
    });
  });

  const busca = document.getElementById('buscaCurso').value.toLowerCase();
  const pais = document.getElementById('filtroPaisTabela').value;
  const custo = document.getElementById('filtroCustoTabela').value;
  const area = document.getElementById('filtroAreaTabela').value;

  state.cursosFiltradosTabela = todosCursos.filter(item => {
    const matchBusca = item.curso.nome.toLowerCase().includes(busca) || item.uni.nome.toLowerCase().includes(busca);
    const matchPais = pais === 'todos' || item.uni.pais === pais;
    const matchCusto = custo === 'todos' || item.uni.custo === custo;
    const matchArea = area === 'todos' || item.curso.area === area;
    return matchBusca && matchPais && matchCusto && matchArea;
  });

  const ordenar = document.getElementById('ordenarPor').value;
  if (ordenar === 'popular') state.cursosFiltradosTabela.sort((a,b) => b.popular - a.popular);
  if (ordenar === 'notaMin') state.cursosFiltradosTabela.sort((a,b) => a.curso.notaMin - b.curso.notaMin);
  if (ordenar === 'custo') {
    const ordem = { baixo: 1, medio: 2, alto: 3 };
    state.cursosFiltradosTabela.sort((a,b) => ordem[a.uni.custo] - ordem[b.uni.custo]);
  }

  // Se não for pedido explicitamente para manter, reseta para a página 1 (ex: nova busca)
  if (!manterPagina) {
    state.paginaAtualTabela = 1;
  }
  
  renderizarTabela();
}

export function renderizarTabela() {
  const inicio = (state.paginaAtualTabela - 1) * state.itensPorPagina;
  const fim = inicio + state.itensPorPagina;
  const pagina = state.cursosFiltradosTabela.slice(inicio, fim);

  const tbody = document.getElementById('tabelaCursos');
  if(!tbody) return;
  
  tbody.innerHTML = pagina.map(item => `
    <tr class="section-fade" style="cursor:pointer" data-id="${item.id}">
      <td><strong>${item.curso.nome}</strong><br><small class="text-muted">${item.curso.duracao} anos</small></td>
      <td>${item.uni.nome}<br><small class="text-muted">${item.uni.sigla}</small></td>
      <td>${item.uni.cidade}, ${item.uni.pais}</td>
      <td>
        <span class="badge bg-${item.uni.custo === 'baixo'? 'success' : item.uni.custo === 'medio'? 'warning' : 'danger'}">
          ${item.uni.custo}
        </span><br>
        <small>$${item.uni.propina}/ano</small>
      </td>
      <td>${item.curso.notaMin}/20</td>
      <td>
        <div class="d-flex align-items-center"><i class="bi bi-people-fill text-primary me-1"></i> ${item.popular}</div>
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-auto btn-escolher" data-id="${item.id}">
          Escolher <i class="bi bi-check2"></i>
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('tr').forEach(tr => {
    tr.addEventListener('click', () => abrirModalCurso(tr.dataset.id));
  });
  
  tbody.querySelectorAll('.btn-escolher').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      registrarEscolha(btn.dataset.id);
    });
  });

  renderizarPaginacao();
}

function renderizarPaginacao() {
  const totalPaginas = Math.ceil(state.cursosFiltradosTabela.length / state.itensPorPagina);
  const pagEl = document.getElementById('paginacao');
  if(!pagEl) return;
  
  pagEl.innerHTML = '';
  for(let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement('li');
    li.className = `page-item ${i === state.paginaAtualTabela ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      state.paginaAtualTabela = i;
      renderizarTabela();
    });
    pagEl.appendChild(li);
  }

  const fimReal = Math.min(state.paginaAtualTabela * state.itensPorPagina, state.cursosFiltradosTabela.length);
  document.getElementById('infoTabela').textContent = 
    `Mostrando ${state.cursosFiltradosTabela.length ? (state.paginaAtualTabela - 1) * state.itensPorPagina + 1 : 0}-${fimReal} de ${state.cursosFiltradosTabela.length}`;
}

function registrarEscolha(id) {
  if (ESCOLHAS_POPULARES[id] !== undefined) {
    ESCOLHAS_POPULARES[id]++;
  }
  const toastEvent = new CustomEvent('showToast', { detail: 'Curso marcado! A popularidade foi atualizada.' });
  window.dispatchEvent(toastEvent);
  
  // Passamos 'true' para re-renderizar mantendo o utilizador na mesma página em que votou
  atualizarTabela(true); 
}