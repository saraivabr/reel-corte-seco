// Contrato do roteiro.json (todos os tempos em segundos, relativos ao reel final).
// Caminhos de mídia são relativos à pasta public/ do projeto.

export type Midia = {
  src: string; // vídeo (.mp4/.mov/.webm) ou imagem (.jpg/.png/.webp)
  srcInicio?: number; // de onde começa a tocar dentro do arquivo (s)
};

export type PlanoRosto = Midia & {
  tipo: "rosto";
  inicio: number;
  fim: number;
  punch?: number; // 1 = aberto; 1.4 = punch-in (mesmo take, plano fechado)
  zoom?: [number, number]; // push-in lento dentro do plano, ex. [1, 1.12]
  origem?: [number, number]; // ponto do zoom em % (x, y). Padrão [50, 38] = rosto
  aberracao?: boolean; // franja RGB nas bordas (câmera lateral / momento dramático)
  // zoom rápido animado na palavra de ênfase (tempo do reel). A referência fica PARADA no resto do plano.
  zoomRapido?: { t: number; escala?: number; dur?: number }[];
};

export type PlanoCard = Midia & {
  tipo: "card";
  inicio: number;
  fim: number;
  formato?: "quadrado" | "vertical"; // 944x944 ou 944x1352 sobre preto
  zoom?: [number, number];
};

export type PlanoTela = Midia & {
  tipo: "tela";
  inicio: number;
  fim: number;
  zoom?: [number, number];
  credito?: string; // crédito do b-roll de terceiros, no canto de cima
  desfoque?: boolean; // desfoque de movimento leve (cena de ansiedade/memória)
};

export type Plano = PlanoRosto | PlanoCard | PlanoTela;

export type Palavra = { w: string; t: number }; // t = tempo do reel em que a palavra entra (seca)
export type Linha = { palavras: Palavra[]; estilo?: "n" | "g" | "d" }; // n normal, g grande, d destaque (cor)

export type Legenda = {
  inicio: number;
  fim: number;
  tipo: "solta" | "pilha"; // solta = 1 linha pequena; pilha = linhas em escada
  linhas: Linha[];
};

export type Faixa = {
  src: string;
  inicio: number; // quando entra no reel
  fim: number; // quando sai
  volume?: number; // 0..1
  fadeIn?: number; // s
  fadeOut?: number; // s
  srcInicio?: number;
  pausas?: [number, number][]; // trechos (tempo do reel) em que a faixa some
};

export type Som = {
  voz?: { src: string; volume?: number; srcInicio?: number };
  drone?: Faixa; // grave de tensão por baixo da tese
  trilha?: Faixa; // trilha emocional da virada
  extras?: Faixa[]; // qualquer outra camada pontual
};

// elemento flutuando atrás da pessoa (cartão de pesquisa, com ou sem o recorte da página); pessoa = webm com alfa do mesmo trecho
export type Pagina = { src: string; largura: number; altura: number; rects: { x: number; y: number; w: number; h: number }[] };
// página real da pesquisa em 3D atrás da pessoa; pessoa = webm com alfa do mesmo trecho
export type Flutuante = { inicio: number; fim: number; pessoa: string; pagina: Pagina; dominio: string };
export type Cta = { inicio: number; fim: number; fundo: string; palavra: string; promessa: string; perfil: string; palavraEm?: number; sigaEm?: number };

export type Roteiro = {
  flutuantes?: Flutuante[];
  cta?: Cta;
  fps?: number;
  duracao: number; // s
  corScript?: string; // padrão #E879B9
  legendaY?: number; // base do bloco de legenda em px (padrão 1330)
  planos: Plano[];
  legendas: Legenda[];
  som: Som;
};
