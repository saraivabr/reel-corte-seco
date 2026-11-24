# reel-corte-seco

Skill do Claude Code para editar Reels 9:16 no estilo "corte seco" do Saraiva: a partir de um vídeo bruto de fala,
ela corta por palavra, isola e nivela a voz e monta o reel no Remotion.

O que define o estilo:

- legenda que entra seca, em 1 quadro, e se acumula no bloco, com palavra-chave grande e destaque condensado em lima;
- corte seco entre planos, alternando aberto e fechado, com zoom rápido na palavra de destaque;
- a página real da pesquisa em 3D, com scroll e marca-texto, passando atrás da pessoa;
- motions feitos no HyperFrames e b-rolls literais em tela cheia;
- sonoplastia e trilha do ElevenLabs;
- CTA "Comenta PALAVRA" narrado com a voz clonada.

## Instalação

```bash
git clone https://github.com/saraivabr/reel-corte-seco ~/.claude/skills/reel-corte-seco
```

```bash
bash ~/.claude/skills/reel-corte-seco/scripts/preparar.sh
```

Depois é só pedir ao Claude Code: "edita esse vídeo no corte seco".

## Do que ela depende

- macOS (o recorte da pessoa usa o Apple Vision), `ffmpeg`, `node`, `uv`, `swiftc` e Google Chrome.
- Chave da ElevenLabs em `~/.config/saraiva-secrets/elevenlabs_api_key` (isolar voz, efeitos e trilha).
- Skills `video-use` (transcrição), `motion-graphics`/HyperFrames (motions), `get-brolls` (b-rolls) e
  `reel-voz-saraiva` (voz clonada do CTA). O Remotion vem das dependências da skill `edicao-saraiva`, ou de
  `npm install` no template.

## Onde está cada coisa

- `SKILL.md` — as regras do estilo e o fluxo completo.
- `references/aprendizados.md` — o que foi aprovado e reprovado, e por quê.
- `references/reels.exemplo.json` — configuração dos reels já feitos.
- `scripts/` — montador, som, captura de página, CTA e render.
- `template/` — projeto Remotion (1080×1920, 30 fps).
