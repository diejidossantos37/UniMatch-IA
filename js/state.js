export const state = {
  stepAtual: 0,
  totalSteps: 5,
  paginaAtualTabela: 1,
  itensPorPagina: 6,
  cursosFiltradosTabela: [],
  
  // Controlo de Autenticação
  usuarioLogado: null, // Guardará o nome do utilizador ativo (ex: "dieji")
  
  aluno: {
    notaGeral: 14,
    notaMat: 13,
    areaInteresse: 'engenharia',
    filtroPais: 'todos',
    filtroCusto: 'todos',
    filtroCidade: '',
    cursoForcado: null,
    historicoSimulacoes: [] // Array para guardar os resultados passados deste utilizador
  },

  // Reset do perfil do aluno para o padrão
  resetAluno() {
    this.aluno = {
      notaGeral: 14,
      notaMat: 13,
      areaInteresse: 'engenharia',
      filtroPais: 'todos',
      filtroCusto: 'todos',
      filtroCidade: '',
      cursoForcado: null,
      historicoSimulacoes: []
    };
  },
  
  // Salva os dados do utilizador atual na lista global de utilizadores
  saveToLocalStorage() {
    if (!this.usuarioLogado) return false;

    // Recupera a base global de utilizadores cadastrados
    const usuariosNoBanco = JSON.parse(localStorage.getItem('uniMatch_usuarios') || '{}');
    
    // Cria um clone para limpar o objeto circular cursoForcado antes de salvar
    const dadosParaSalvar = { ...this.aluno };
    delete dadosParaSalvar.cursoForcado;

    // Guarda os dados específicos dentro da chave deste utilizador
    usuariosNoBanco[this.usuarioLogado] = {
      perfil: dadosParaSalvar,
      // Guarda se o utilizador prefere dark mode ou não
      darkMode: document.body.classList.contains('dark-mode')
    };

    localStorage.setItem('uniMatch_usuarios', JSON.stringify(usuariosNoBanco));
    localStorage.setItem('uniMatch_sessaoAtiva', this.usuarioLogado); // Mantém sessão ao dar F5
    return true;
  },
  
  // Carrega os dados salvos do utilizador que iniciou sessão
  loadFromLocalStorage() {
    if (!this.usuarioLogado) return false;
    
    const usuariosNoBanco = JSON.parse(localStorage.getItem('uniMatch_usuarios') || '{}');
    const dadosUsuario = usuariosNoBanco[this.usuarioLogado];
    
    if (dadosUsuario && dadosUsuario.perfil) {
      this.aluno = { ...this.aluno, ...dadosUsuario.perfil, cursoForcado: null };
      return true;
    }
    return false;
  }
};