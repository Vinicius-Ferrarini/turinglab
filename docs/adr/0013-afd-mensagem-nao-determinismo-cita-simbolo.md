# 0013 — AFD_1: mensagem de não-determinismo cita o símbolo duplicado

**Status:** aceita

## Contexto

Em AFD_1, quando o aluno desenha duas setas saindo do mesmo estado com o
mesmo símbolo (não-determinismo), `validateAFDSilent` já destacava o nó
certo (`setHighlightedError(node.id)`), mas a mensagem do toast era
genérica: `Não determinístico! "<nó>" tem símbolo duplicado nas setas.` —
não dizia QUAL símbolo estava duplicado. O módulo de Minimização
(`dfaAlgorithms.js`'s `analyzeDrawnDFA`) já resolvia o mesmo problema
citando o símbolo exato na mensagem, então essa era uma inconsistência
entre os dois módulos, não uma limitação técnica.

## Decisão

Extraída `findDuplicateSymbol(nodeId, transitions)` — função pura em
`src/modules/afd/hooks/useAFDGraph.js`, mesmo padrão de `mergeSymbols`
já existente no arquivo (pura, exportada, testável isoladamente sem
mocks de React). `validateAFDPure` passa a devolver `nodeId`/`symbol`
aditivos no `reason: 'nondeterministic'`; `validateAFDSilent` usa a
mesma função pra citar o símbolo exato na mensagem do toast:
`Não determinístico! "<nó>" tem duas setas para o símbolo '<símbolo>'.`

O highlight do nó (`setHighlightedError(node.id)`) já estava correto e
não foi alterado — só a mensagem mudou.

## Alternativas consideradas

- **Calcular o símbolo inline, sem extrair função** — descartada porque
  o mesmo cálculo é necessário em dois lugares (`validateAFDPure` para
  telemetria/testes, `validateAFDSilent` para a UI) e o arquivo já
  estabelece o padrão de extrair lógica pura reaproveitável.

## Consequências / Trade-offs

- `reason: 'nondeterministic'` ganha campos aditivos (`nodeId`, `symbol`)
  — não quebra nenhum código existente que só verifica `reason` (testes
  usam `toMatchObject`, que ignora campos extras).
- Nenhuma mudança de comportamento além do texto da mensagem.

## Referências

- Plano: `docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md` (Item 1)
- Código: `src/modules/afd/hooks/useAFDGraph.js` (`findDuplicateSymbol`,
  `validateAFDPure`, `validateAFDSilent`)
- Testes: `src/__tests__/validateAFD.test.js`
- Padrão de referência (já existente): `src/modules/afd/utils/dfaAlgorithms.js`
  (`analyzeDrawnDFA`, código `'nondeterministic'`)
