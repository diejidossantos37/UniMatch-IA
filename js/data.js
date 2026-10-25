export const UNIVERSIDADES = [
  { id: 1, nome: "Universidade Agostinho Neto", sigla:"UAN", pais: "AO", cidade: "Luanda", custo: "baixo", propina: 500, cursos: [
    { nome: "Eng. Informática", area: "engenharia", notaMin: 14, notaMat: 15, duracao: 5, 
      notaCorte: [13.2, 13.8, 14.1],
      grade: {
        "1º Ano": ["Algoritmos", "Cálculo I", "Física I", "Inglês Técnico"],
        "2º Ano": ["Estrutura de Dados", "Cálculo II", "Arquitetura de PCs"],
        "3º Ano": ["Base de Dados", "Redes", "POO", "Sistemas Operativos"],
        "4º Ano": ["IA", "Compiladores", "Segurança", "Projeto I"],
        "5º Ano": ["Estágio", "TFC", "Empreendedorismo"]
      }
    },
    { nome: "Medicina", area: "saude", notaMin: 17, notaMat: 14, duracao: 6,
      notaCorte: [16.5, 17.2, 17.0],
      grade: {
        "1º Ano": ["Anatomia I", "Biologia Celular", "Bioquímica"],
        "2º Ano": ["Fisiologia", "Histologia", "Anatomia II"],
        "3º Ano": ["Patologia", "Farmacologia", "Semiologia"],
        "4º Ano": ["Clínica Médica", "Cirurgia", "Pediatria"],
        "5º Ano": ["Ginecologia", "Saúde Pública", "Internato I"],
        "6º Ano": ["Internato II", "TFC"]
      }
    }
  ]},
  { id: 2, nome: "Universidade do Porto", sigla:"UPorto", pais: "PT", cidade: "Porto", custo: "medio", propina: 1500, cursos: [
    { nome: "Eng. Informática", area: "engenharia", notaMin: 16, notaMat: 16, duracao: 3,
      notaCorte: [15.8, 16.1, 16.3],
      grade: {
        "1º Ano": ["Programação I", "Matemática Discreta", "Sistemas Digitais"],
        "2º Ano": ["Algoritmos", "Base de Dados", "Redes de Computadores"],
        "3º Ano": ["IA", "Segurança", "Projeto Final"]
      }
    },
    { nome: "Economia", area: "gestao", notaMin: 14, notaMat: 15, duracao: 3,
      notaCorte: [13.9, 14.2, 14.8],
      grade: {
        "1º Ano": ["Intro à Gestão", "Microeconomia", "Análise Matemática"],
        "2º Ano": ["Macroeconomia", "Contabilidade", "Estatística"],
        "3º Ano": ["Finanças", "Estratégia", "Seminário"]
      }
    }
  ]},
  { id: 3, nome: "Universidade de São Paulo", sigla:"USP", pais: "BR", cidade: "São Paulo", custo: "baixo", propina: 0, cursos: [
    { nome: "Eng. Computação", area: "engenharia", notaMin: 18, notaMat: 17, duracao: 5,
      notaCorte: [17.5, 18.2, 18.0],
      grade: {
        "1º Ano": ["Cálculo I", "Física I", "Intro à Computação"],
        "2º Ano": ["Cálculo II", "Álgebra Linear", "Estrutura de Dados"],
        "3º Ano": ["Circuitos", "SO", "Eng. Software"],
        "4º Ano": ["Compiladores", "Redes", "IA"],
        "5º Ano": ["TCC", "Empreendedorismo", "Optativas"]
      }
    },
    { nome: "Direito", area: "humanas", notaMin: 15, notaMat: 10, duracao: 5,
      notaCorte: [14.2, 14.9, 15.1],
      grade: {
        "1º Ano": ["Teoria Geral do Estado", "Sociologia", "Introdução ao Direito"],
        "2º Ano": ["Direito Civil I", "Direito Penal I", "Constitucional"],
        "3º Ano": ["Direito Civil II", "Processual Civil", "Trabalhista"],
        "4º Ano": ["Direito Comercial", "Tributário", "Internacional"],
        "5º Ano": ["Estágio Supervisionado", "Prática Jurídica", "TCC"]
      }
    }
  ]}
];

export const PERGUNTAS_DINAMICAS = {
  engenharia: ["Você curte resolver problemas lógicos?", "Prefere hardware ou software?"],
  saude: ["Você lida bem com pressão?", "Tem interesse em biologia?"],
  humanas: ["Gosta de ler e escrever?", "Se interessa por debates?"],
  gestao: ["Você é organizado com números?", "Curte liderar equipes?"]
};

// Mock para simulação das escolhas populares no Step 0
export const ESCOLHAS_POPULARES = {
  "1-Eng. Informática": 142,
  "1-Medicina": 235,
  "2-Eng. Informática": 98,
  "2-Economia": 64,
  "3-Eng. Computação": 187,
  "3-Direito": 110
};