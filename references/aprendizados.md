# Aprendizados do corte seco

Registro do que o Saraiva aprovou, reprovou e pediu. O mais novo vence. As frases entre aspas são dele.

## 24/11/2026 — criação do estilo (bruto: DJI_20260609, fala sobre IA que liga dentro do WhatsApp)

### Aprovado
- "Gostei" da primeira versão (v1): legenda seca que se acumula, destaque condensado em lima, planos alternando.
- "Gostei das legendas, como aparece, gostei dos zooms." Foi o que motivou criar a skill.
- Fazer vários reels do mesmo bruto (saíram 3: 62 s, 41 s e 36 s).

### Reprovado
- **Script caligráfico rosa** da referência: "sou homem, essa fonte rosa e desse jeito não tá muito legal".
- **Sonoplastia baixa/sutil** (drone, batida grave, queda, impacto): "não teve nada de criação de som de efeitos". Além
  disso, thud, queda e impacto já eram vetados nas regras de reels dele.
- **Final sem CTA**: "terminou sem nada, conectando a mim".
- **Só texto e ele na tela**: quer elementos interagindo com ele (atrás, flutuando), b-rolls, a notícia na imagem.
- **Imagens geradas paradas** (mesmo com Ken Burns): "não ficou legal. Você podia criar motions."
- **Cartão de pesquisa desenhado e motions feitos à mão no Remotion**: "quero um motion graphics bonito, coisa fina, não isso
  que você tá fazendo… tá zuado". Observação minha: o cartão ficava escondido atrás da cabeça com o texto cortado.

### Versão aprovada (reel 2, v7)
- "Eu gostei bastante da edição, pode fechar essa skill assim." Sequência: página do Stanford em 3D (2,9–5,3 s) → motion
  da onda da fala (5,3–9,0 s) → b-roll digitando (9,1–10,5 s) → b-roll gravando áudio (18,2–21,1 s) → página do estudo de
  Yale em 3D (26,8–31,2 s) → CTA narrado (40,7–47,2 s).
- B-rolls: "cara, já tá aprovado" para três vídeos do canal oficial do WhatsApp (How to Make a Voice Call, How to Send a
  Voice Message, Message Privately). A página não declara licença de reúso (licença padrão do YouTube); entram com crédito
  "WhatsApp · YouTube". Trecho com legenda queimada foi descartado.
- CTA narrado com a voz clonada (PVC "Saraiva", config da reel-voz-saraiva), similaridade 0,84.

### O que levou até ela (pedidos dele, na ordem)
- "busque os /get-brolls pra trazer melhor experiência".
- "como você tem minha voz no ElevenLabs, você pode facilmente fazer uma narração ali no final".
- "quero um motion graphics bonito, coisa fina, não isso que você tá fazendo… tá zuado" → HyperFrames, um agente por peça.
- "a notícia… em 3D passando por trás de mim, de forma real, bem integrativo, com scroll animation e interactive 3D" e
  depois "quero que seja o print do site real, alguma coisa que traga mais relevância… como um artigo científico".

### Em aberto
- Reels 1 e 3 do mesmo bruto ainda não foram levados para esta versão.
- Um segundo motion fino ("escrever é filtrar", 3,0 s) ficou pronto depois da aprovação e não entrou no reel 2.
- A palavra do CTA ("LIGAÇÃO") e a promessa foram escolha minha; ele não comentou.
- Legenda branca some em b-roll claro (teclado branco): falta sombra mais forte ou faixa escura nesses planos.
- O b-roll mais forte só ele tem: gravação de tela da IA dele ligando no WhatsApp.
- PubMed bloqueia captura com captcha; o estudo de Yale entrou pelo release da APA no EurekAlert.

### Fatos do material
- Estudos conferidos na fonte para esse tema (IA, ligação, voz × texto): Pew 2020 (19% dos americanos atendem número
  desconhecido), Mobile Time/Opinion Box 2025 (77% ligam mais pelo WhatsApp), Stanford 2017 (falar 2,9x mais rápido que
  digitar), Kraus/Yale 2017 (voz e precisão empática, N = 1.772), Opinion Box 2026 (80% usam áudio), Xiao et al. 2020
  (+39% de informação em conversa com IA por texto contra formulário).
- "Quase ninguém atende" só se sustenta com dado dos EUA; no Brasil é cerca de metade. "Falar é mais natural" não tem
  estudo, só "mais rápido".
- A palavra do CTA ("LIGAÇÃO") e a promessa foram escolha minha; ele não confirmou.

### Técnica que funcionou
- Bruto horizontal 1920×1080: recorte 608×1080 centrado no rosto (mediana do x do rosto), ampliado para 1080×1920.
  Fica macio no plano fechado.
- Pessoa recortada por trecho com `matte.swift` (Apple Vision, accurate) → webm VP9 com alfa → por cima do elemento.
- Página em 3D: captura em largura de celular (430 px, escala 3) para o texto ficar legível numa janela de 590 px; os
  retângulos da frase vêm de `Range.getClientRects()`; o marca-texto é um retângulo lima em `mix-blend-mode: multiply`.
- Motion do HyperFrames a 45 fps desacelerado 1,5× cai certo em 30 fps e casa as cinco palavras com a fala.
- Um motion fino leva 23–41 min de agente; lançar no começo da edição, não no fim.
- Drone gerado no ElevenLabs oscila até 20 dB; se usar, fazer laço do trecho mais estável e em mono.
- O rea-video (github.com/JuneYaooo/rea-video) dá cortes e planos, mas erra a leitura de legenda em português; os tempos
  de animação foram medidos por diferença de máscara branca quadro a quadro.

## 24/11/2026 — segundo reel pela skill (bruto: Teleprompter-2026-19-10, "a IA tá deixando muita gente burra")

Pedido: "refazer algum outro que você veja aí nos downloads que valha a pena". Escolhi o do teleprompter (tese clara,
gancho forte, melhor enquadramento); descartei IMG_9904 (POV da mesa, sem rosto), IMG_9517 (lista de 5 serviços, imagem
escura) e IMG_8506 (49 s ao ar livre). Projeto em `~/edicaodevideo/reel-2026-11-24-ia-deixando-burra`.

- Cortei a oferta com preço (R$697, "link aqui embaixo") e fechei com CTA narrado 'Comenta "formação", que eu te mando.'
- Provas lidas na página: MIT Media Lab, "Your Brain on ChatGPT" (arXiv 2506.08872, 54 participantes, preprint) e
  Microsoft/CHI 2025 (319 profissionais; mais confiança na IA associada a menos pensamento crítico).
- **Bruto vertical (selfie):** o montador agora detecta. Sem sobra lateral, no trecho com página ele encolhe o quadro para
  85% no canto de baixo à esquerda e estica a borda da parede (`fillborders smear`); funciona em parede lisa.
- **Selfie já é close:** `punch` 1,1 e `punch_drama` 1,22 no reels.json (o padrão 1,22/1,42 corta a testa); `origem` [50, 42].
- A página fica o trecho inteiro (`dur` alto), senão ele aparece encolhido sem ela.
- Aviso de cookies que não é fixo fica na captura: recortar o topo e descontar o `y` dos retângulos no JSON.
- Sem retorno dele ainda sobre este reel.
