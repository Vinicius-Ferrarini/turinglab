# 0016 — MT Transdutora: trace automático de contraexemplo na validação

**Status:** aceita

## Contexto

MT Transdutora era o único dos 4 módulos de canvas-drawing (AFD_1,
Autômato com Pilha, MT Reconhecedora, MT Transdutora) sem NENHUM wiring
de simulador passo a passo — nem manual (botão "🔬 Simular", que os
outros 3 têm), nem automático. Quando `"✓ Validar MT"` reprovava por
qualquer um dos 4 motivos de `fuzzTMTransducer` (`loop`, `rejected`,
`wrong-output`, `head-not-rewound`), o aluno só via um toast — sem
destaque, sem trace. MT Reconhecedora já resolvia exatamente esse
problema (`MTReconPart1.jsx`, mesmo espírito do trace-on-failure de
AFD_1/AP) abrindo o `MTSimPanel` automaticamente na palavra que falhou.

## Decisão

`MTPart1.jsx` replica o padrão já usado por `MTReconPart1.jsx`, sem
nenhuma alteração em `tmAlgorithms.js`: `simulateTMSteps` já era
genérica (usada pelo Reconhecedor, funciona sem mudanças pro formato de
grafo da Transdutora) e `MTSimPanel.jsx` já suportava os 4 motivos da
Transdutora sem alteração — `loop`→status `LOOP`, `rejected`→status
`REJECTED`, `head-not-rewound`→o badge dedicado que já existia
(`headRewound` prop), `wrong-output`→cabe no `message` livre do banner
(texto "esperado X, obtido Y" já montado em `validate()`).

Adicionado em `MTPart1.jsx`: estado `sim`/`simKey`/`simHighlight` +
`openSim`/`closeSim`/`handleSimHighlight` (mesmo padrão de
`MTReconPart1.jsx`); chamada de `openSim(...)` no branch de falha de
`validate()`, sempre que há contraexemplo (todos os 4 motivos de
`fuzzTMTransducer` têm); `simPanel`/`simPanelClassName` no
`<APFooterDeck>` já existente (o mesmo componente de rodapé que
`MTReconPart1.jsx` usa, já suporta essas props); `simActiveNodeId`/
`simActiveTIdx`/`simActiveSeq` no `<MTCanvas>` real, pra destacar
estado/transição percorridos durante o trace.

## Alternativas consideradas

- **Construir um painel de simulação novo, específico da Transdutora** —
  descartada: `MTSimPanel.jsx` já é suficientemente genérico (prova:
  nenhuma linha dele precisou mudar); construir um novo duplicaria
  código sem necessidade.
- **Adicionar um botão "🔬 Simular" manual, igual aos outros 3 módulos**
  — fora do escopo deste item (o plano pediu só o trace AUTOMÁTICO na
  validação); a ausência do botão manual continua sendo uma divergência
  de UX documentada (ver `CLAUDE.md`), não resolvida aqui.

## Consequências / Trade-offs

- Nenhuma mudança em `tmAlgorithms.js` — risco bem menor do que o
  originalmente estimado no plano (que previa possível necessidade de
  mexer nos motivos de contraexemplo).
- `MTSimPanel`'s badge "CABEÇOTE NÃO VOLTOU" só aparece no ÚLTIMO passo
  da simulação (não no passo inicial) — os testes e2e precisaram
  avançar o painel até o fim antes de checar esse selo, mesmo padrão já
  usado em `mt_recon_head_rewind.spec.js`.
- MT Transdutora segue sem simulador MANUAL (só o automático,
  disparado por uma validação reprovada) — consistente com o gap já
  documentado em `CLAUDE.md` sobre paridade de UX entre os módulos.

## Referências

- Plano: `docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md` (Item 4, maior risco —
  confirmado explicitamente com o usuário antes de iniciar)
- Código: `src/modules/mt/MTPart1.jsx` (`validate()`, `sim`/`openSim`/
  `closeSim`/`handleSimHighlight`)
- Testes: `e2e/mt_trans_trace_on_failure.spec.js`
- Padrão de referência (não alterado): `src/modules/mt-recon/MTReconPart1.jsx`,
  `src/modules/mt/components/MTSimPanel.jsx`, `src/modules/mt/utils/tmAlgorithms.js`
  (`simulateTMSteps`)
