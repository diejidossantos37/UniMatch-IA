export class AIEngine {
  // Filtra os cursos e calcula os resultados
  static analisarCursos(aluno, listaCursos, listaUniversidades) {
    let cursosParaAnalisar = [];

    // Se o utilizador escolheu um curso específico na tabela (Step 0)
    if (aluno.cursoForcado) {
      cursosParaAnalisar = [aluno.cursoForcado];
    } else {
      // Fluxo normal do Quiz: Filtra pela área de interesse selecionada no Step 1
      cursosParaAnalisar = listaCursos.filter(c => c.curso.area === aluno.areaInteresse);
    }

    // Mapeia e calcula o Score de cada curso elegível
    const resultados = cursosParaAnalisar.map(item => {
      const score = this.calcularCompatibilidade(aluno, item.curso, item.uni);
      const expl = AIEngine.gerarExplicacao(item.curso, score, aluno); 
    return { ...item, score, expl };
    });

    // Ordena do maior Match para o menor
    return resultados.sort((a, b) => b.score - a.score);
  }

  // Função auxiliar para calcular a nota (Evita que falte o método no ecossistema)
  static calcularCompatibilidade(aluno, curso, uni) {
    let score = 100;
    
    // Penalização por nota de matemática insuficiente
    if (aluno.notaMat < curso.notaMat) {
      score -= (curso.notaMat - aluno.notaMat) * 10;
    }
    // Penalização por nota geral insuficiente
    if (aluno.notaGeral < curso.notaMin) {
      score -= (curso.notaMin - aluno.notaGeral) * 8;
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static gerarExplicacao(curso, score, aluno) {
    if (score > 85) {
      return `Recomendamos altamente o curso de ${curso.nome} porque a tua nota de Matemática (${aluno.notaMat}/20) atende às expectativas e o curso enquadra-se na tua área de interesse em ${aluno.areaInteresse}.`;
    }
    if (score > 60) {
      const difMat = curso.notaMat - aluno.notaMat;
      return `${curso.nome} é uma opção viável, mas aumentar a tua nota de Matemática de ${aluno.notaMat} para ${curso.notaMat} elevará a tua compatibilidade significativamente em ${difMat * 10}%.`;
    }
    return `${curso.nome} exige uma nota mínima de entrada de ${curso.notaMin}/20. Foca primeiro em subir a tua média global académica.`;
  }

  static simularMelhoriaMat(aluno, incremento = 2) {
    return {
      ...aluno,
      notaMat: Math.min(20, aluno.notaMat + incremento)
    };
  }
}