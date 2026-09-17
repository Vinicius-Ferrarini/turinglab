# 0015 — MT Transdutora: destaque visual de não-determinismo no canvas

**Status:** aceita

## Contexto

Em MT Transdutora, quando duas regras conflitam no mesmo (estado, símbolo)
lido, a mensagem de erro já citava o estado e o símbolo exatos
(`MTPart1.jsx`'s `validate()`), mas nenhum destaque visual acendia no
canvas — diferente de AFD_1/Minimização, que já apontam o nó certo. O
prop `errAction` (existente) só pisca um BOTÃO de ferramenta (usado pelos
motivos `no_initial`/`no_final`, que não têm um nó específico a apontar);
não existia nenhum mecanismo pra destacar um NÓ específico no `MTCanvas`.

## Decisão

`MTCanvas.jsx` (componente compartilhado entre MT Transdutora e MT
Reconhecedora) ganha uma nova prop opcional `errorNodeIds` (`Set<nodeId>
| null`, default `null`), inserida na composição de classes do nó
(`errorNodeIds?.has(node.id) ? 'error-pulse-severe' : ''`) — reaproveita a
classe/animação `.error-pulse-severe` já trazida por `AFDPart1.css`
(`MTPart1.jsx` já importa esse arquivo, então nenhum CSS novo foi
necessário). `MTPart1.jsx` ganha o estado `errorNodeIds`, populado com
`new Set([t.from])` no branch de não-determinismo e limpo depois de 3s
(mesma convenção de auto-clear do `errAction` existente).

Por ser uma prop nova com default `null`, `MTReconPart1.jsx` (que também
usa `MTCanvas`) não é afetado — continua sem passá-la.

## Alternativas consideradas

- **Reaproveitar `errAction`** — descartada: `errAction` nunca foi
  destructurado/usado dentro de `MTCanvas.jsx` (é consumido pelo
  `APFooterDeck`, o rodapé de ferramentas, não pelo canvas) — não serve
  pra destacar um nó.
- **String única (`highlightedError`, como no AFD_1) em vez de `Set`** —
  descartada em favor do formato `Set<nodeId>` já estabelecido por
  `CanvasArea.jsx`/`errorNodeIds` na Minimização, mantendo o mesmo
  contrato entre os módulos que passaram por este plano de feedback
  (ver ADR 0014).

## Consequências / Trade-offs

- Nenhuma lógica pura nova — a detecção do conflito já existia e estava
  correta; a mudança é só de wiring/apresentação. Evidência de
  RED→GREEN ficou 100% no nível de e2e (`Vitest` roda em
  `environment:'node'`, sem DOM).
- **Nota de processo**: a 1ª tentativa de wiring passou a prop pro
  componente errado (`<APFooterDeck>`, ~300 linhas de distância de
  `<MTCanvas>` no mesmo arquivo, e que coincidentemente já recebia
  `errAction`) — só foi descoberta instrumentando as duas árvores de
  props diretamente. Ver commit `218bb30` para o relato completo.

## Referências

- Plano: `docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md` (Item 3)
- Código: `src/modules/mt/MTPart1.jsx` (`validate()`, `errorNodeIds`),
  `src/modules/mt/components/MTCanvas.jsx` (prop `errorNodeIds`)
- Testes: `e2e/mt_trans_nondeterminism_highlight.spec.js`
- Padrão de referência: `src/modules/afd/components/MinDrawStep.jsx` +
  `CanvasArea.jsx` (`errorNodeIds`, mesmo formato `Set`)
