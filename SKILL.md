---
name: reel-corte-seco
description: Estilo de edição de Reels 9:16 do Saraiva, aprovado em 24/11/2026 ("gostei bastante da edição, pode fechar essa skill assim"). A partir de um vídeo bruto de fala (até horizontal), corta por palavra, isola e nivela a voz, e monta no Remotion com legenda que entra seca e se acumula no bloco (palavra-chave grande e destaque condensado em lima), planos alternando aberto/fechado com zoom rápido na palavra, a página real da pesquisa em 3D com scroll passando atrás dele, motions finos do HyperFrames e b-rolls literais em tela cheia, sonoplastia do ElevenLabs e CTA "Comenta PALAVRA" narrado com a voz clonada. Use quando ele pedir "edita no corte seco", "faz no estilo corte seco", "aquele estilo das legendas que se acumulam e dos zooms", "faz mais reels desse vídeo nesse estilo", ou mandar um bruto de fala pedindo esse formato. Não serve para o padrão antigo da edicao-saraiva, para reel narrado sem gravação (reel-voz-saraiva) nem para publicar sem o "sim" dele.
---

# Reel corte seco

Nasceu em 24/11/2026 da engenharia reversa do reel de 9 milhões de views da @tay.ldantas (skill
`reel-ensaio-cinematico`), adaptado ao Saraiva em sete rodadas de retorno no mesmo dia. A versão aprovada é o
reel 2 ("a voz diz mais que o texto"). **Leia [aprendizados.md](references/aprendizados.md) antes de editar**: ele
guarda o que foi aprovado e, principalmente, o que foi reprovado e por quê. Atualize-o a cada retorno dele.

## O que define o estilo

| Elemento | Regra |
|---|---|
| Legenda | **Tudo entra seco, em 1 quadro.** As palavras se acumulam no lugar final do bloco e o bloco sai de uma vez. Poppins SemiBold, tracking −7%, branco `#FAF9F7`. "Solta" = 1 linha de 1–3 palavras (68 px). "Pilha" = 2–3 linhas em escada (92 px), com palavra-chave grande (140 px). |
| Destaque | **Nunca script rosa.** Condensada pesada (Anton), caixa alta, inclinada, em lima `#B8FF3D`, como uma linha da pilha. 5–7 por reel, só nos conceitos da tese e na última frase. |
| Corte | Seco. Um plano por trecho de fala (pausa > 0,42 s vira corte); a pausa some. |
| Câmera | Alterna aberto (1,0) e fechado (1,22) a cada corte. Um plano dramático por reel em 1,42 com aberração cromática. |
| Zoom | Plano parado; **zoom rápido** de +13% em 0,45 s, suavizado, terminando na palavra de destaque. |
| Prova | **A página real, nunca um cartão desenhado.** Captura do site em largura de celular numa janela de navegador em 3D que chega pela direita e passa atrás dele; a matéria rola da manchete até a frase-chave, o cursor chega nela e o marca-texto lima passa por cima. O plano é reenquadrado (ele vai para a esquerda) e a pessoa recortada fica por cima da janela. 2 por reel, ~2,4–4,4 s. Prefira o artigo ou a instituição de pesquisa. |
| Motion | **Feito no HyperFrames pela skill `motion-graphics`, um agente por peça**, com direção de arte própria. Motion feito à mão no Remotion e imagem gerada parada foram reprovados. |
| B-roll | Pelo `get-brolls`: fonte **literal** (ex.: canal oficial do WhatsApp), tela cheia, mudo, 1,4–3 s, com crédito no canto de cima. Stock genérico é vetado. Só entra com a aprovação dele. |
| Som | Voz isolada no ElevenLabs e nivelada em −16 LUFS. Clique em toda troca de cena, pop em destaque e em elemento que aparece, whoosh na entrada de motion, riser até a primeira palavra de destaque, teclado na palavra do CTA. Trilha orquestral acústica com impacto, 14 dB abaixo da voz. Master −14 LUFS. |
| CTA | 6,5 s sobre o último quadro dele escurecido: "Comenta" + a PALAVRA digitada em lima quando ele a fala + a promessa + "siga @saraiva.ai", **narrado com a voz clonada**. |

## Fluxo

1. **Uma vez por máquina:** `bash scripts/preparar.sh` (Python da skill em `.venv`).
2. **Projeto:** uma pasta com `transcripts/`, `som/`, `noticias3d/`, `motions_prontos/`, `work/` e `reels.json`.
3. **Transcrever** com o Scribe (skill `video-use`): `helpers/transcribe.py <bruto> --edit-dir <projeto> --language pt --num-speakers 1`.
4. **Escolher os trechos**: leia a transcrição por blocos de pausa e monte um reel de 35–65 s por tese (gancho →
   tese → espelho do cotidiano → virada → frase-memória). De um bruto de 4–5 min saem 3 reels. Corte tropeços
   ("a va--") desenhando as faixas de tempo ao redor deles.
5. **Som:** `python3 scripts/som_elevenlabs.py <projeto>/som <bruto>` (isola a voz; gera clique, pop, whoosh, riser,
   teclado e trilha) e `bash scripts/nivelar.sh <projeto>/som`.
6. **Provas:** pesquise estudos e **abra cada fonte** (número exato, país, ano, amostra). Depois
   `node scripts/noticia3d.mjs <url> <projeto>/noticias3d/<id> "<frase exata da página a destacar>"` e converta o PNG
   para JPG (`ffmpeg -i <id>.png -q:v 3 <id>.jpg`). Olhe a captura. Site com captcha (PubMed) não captura: use o
   release oficial da instituição. Se a pesquisa não sustenta a fala do jeito que ela é dita, diga isso a ele.
7. **Motions:** um agente por peça seguindo `~/.claude/skills/motion-graphics/SKILL.md`, com briefing de 1080×1920,
   fundo `#0D0D0D`, tinta `#FAF9F7`, acento `#B8FF3D`, Poppins 600 + Anton, composição entre y=220 e y=1250 (a
   legenda entra embaixo), primeiro quadro não vazio, e os tempos das palavras. Leva ~20–40 min por peça; lance em
   paralelo logo no começo. **Olhe a folha de snapshots** antes de usar. Para casar com a fala sem perder fluidez,
   renderize a `--fps 45` e desacelere 1,5× (`setpts=1.5*PTS,fps=30`). O MP4 final vai para `motions_prontos/`.
8. **B-rolls:** skill `get-brolls` (brief → busca literal → prévia → **parada para a aprovação dele** → permit →
   fetch → deliver). Recorte 9:16 para `motions_prontos/br_*.mp4`. Descarte trecho com legenda queimada.
9. **CTA narrado:** `bash scripts/cta_voz.sh <projeto> 'Comenta "palavra", que eu te mando …' 'E segue o Saraiva ponto ei ai.'`
   A palavra e a promessa são decisão dele; se ele não disser, escolha, avise e deixe fácil de trocar.
10. **Configurar `reels.json`** (exemplo completo em [reels.exemplo.json](references/reels.exemplo.json)):
    - `ranges`: faixas `[início, fim]` do bruto, em segundos, na ordem do reel.
    - `enfase`: `"palavra#ocorrência:g"` (grande) ou `":d"` (destaque lima). A legenda é montada sozinha; `spec`
      (`"2|3|1/1/1d"` por trecho) sobrescreve à mão: `|` separa blocos, `/` separa linhas, o número é a contagem de palavras.
    - `aberracao`: `[palavra, ocorrência]` do plano dramático. Em selfie (já é close): `punch` 1.1, `punch_drama` 1.22, `origem` [50, 42].
    - `flutuantes`: `{na:[palavra,oc], pagina:<id>, dominio, dur}` — começa no corte do trecho da palavra.
    - `videos`: `{na:[palavra,oc], atraso, dur, src, credito}` — motion (sem `credito`, ganha whoosh) ou b-roll
      (com `credito`, ganha clique e o crédito na tela).
    - `cta`: `{palavra, promessa, perfil, voz:"cta_voz.wav", dur, palavra_em, siga_em}`.
11. **Montar:** `.venv/bin/python scripts/montar.py <bruto> <projeto> <id>`. Confira os trechos e as legendas que ele imprime
    e que página, motion e b-roll não se sobrepõem.
12. **Render + master:** `bash scripts/render.sh <projeto> <id>...` → `reels/<id>/out/reel_final.mp4`, cópia leve
    em `entrega/` e `out/contato.jpg`. Não rode o montador de um reel enquanto ele renderiza.

## QA antes de entregar

- [ ] Retranscrever o reel final e comparar com o texto do corte: nenhuma palavra comida.
- [ ] Olhar `out/contato.jpg`: legenda no peito, nada cobrindo o rosto, página legível ao lado da cabeça.
- [ ] −14 LUFS; voz estável do início ao fim.
- [ ] Cada prova confere com a fonte aberta. Dizer a ele onde a pesquisa não sustenta a fala.
- [ ] Dizer o que não foi conferido (não dá para ouvir o áudio: a emenda entre voz real e clonada é com ele).
- [ ] Lembrá-lo do rótulo de conteúdo feito com IA do Instagram (voz sintética no CTA).
- [ ] Nada publicado sem o "sim" dele. Entregue um reel como amostra antes de fazer o lote.

## Arquivos

- `template/` — Remotion (1080×1920, 30 fps): `Legenda.tsx`, `Planos.tsx`, `Flutuante.tsx` (página 3D), `Cta.tsx`, `Som.tsx`.
- `scripts/` — `montar.py`, `som_elevenlabs.py`, `nivelar.sh`, `noticia3d.mjs`, `cta_voz.sh`, `render.sh`, `preparar.sh`, `matte.swift`.
- `references/` — `aprendizados.md`, `reels.exemplo.json`.
