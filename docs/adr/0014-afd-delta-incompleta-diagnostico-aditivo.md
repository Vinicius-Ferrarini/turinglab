# 0014 — AFD_1: δ incompleta é diagnóstico aditivo, não nova categoria bloqueante

**Status:** aceita

## Contexto

AFD_1 não tinha nenhuma categoria de erro própria para "δ incompleta"
(estado sem transição pra algum símbolo do alfabeto) — uma palavra que
travava nesse ponto só aparecia como `word_mismatch`/`language_mismatch`
genérico ("rejeitada — deveria ser aceita"), sem apontar o estado/símbolo
culpado nem destacar nada no canvas. O módulo de Minimização já tem essa
checagem (`analyzeDrawnDFA`, código `'incomplete'`), mas lá ela é
**bloqueante**: o gabarito exige um DFA completo, então δ incompleta
reprova o desenho.

AFD_1 não segue essa mesma premissa: o jogo já aceita grafos parciais
(transição ausente = rejeição implícita) e valida por bateria de palavras
testadas + `fuzzDFA` (equivalência de linguagem completa por força bruta),
não por completude estrutural. Muitos dos 61 níveis existentes têm
soluções válidas e correntemente aprovadas que omitem transições
desnecessárias (a linguagem rejeita esses casos de qualquer forma, via
"buraco" = rejeição implícita). Copiar o gate bloqueante da Minimização
para AFD_1 mudaria o critério de aprovação de nível — reprovando alunos
que hoje passam legitimamente.

## Decisão

δ incompleta vira um **campo de diagnóstico aditivo**, nunca uma nova
causa de reprovação: `traceDeadEnd(nodes, transitions, word)` (função
pura nova em `useAFDGraph.js`) refaz o percurso de uma palavra e, se
travar por falta de transição, devolve `{ nodeId, symbol }` do ponto
exato. `validateAFDPure` anexa esse resultado como `deadEnd` nos motivos
`word_mismatch`/`language_mismatch` **já existentes** — `reason` e `ok`
não mudam. Em `AFDPart1.jsx`, quando `deadEnd` está presente, a nota do
`SimPanel` cita o estado/símbolo exatos ("δ incompleta: ... não tem
transição para '...'") e o nó ganha destaque via `errorNodeIds`
(`Set<nodeId>`) — a mesma prop que `CanvasArea.jsx` já suporta desde a
Minimização, só não estava sendo alimentada pelo AFD_1.

`simulateDFA` (usado internamente por `fuzzDFA`) não foi alterado —
continua devolvendo um booleano puro, preservando o contrato do
fuzzer. `traceDeadEnd` é uma segunda função, chamada só depois que a
falha já foi confirmada, isolando o novo diagnóstico do caminho quente
de validação.

## Alternativas consideradas

- **Gate bloqueante igual à Minimização** — descartada: mudaria o
  critério de aprovação de nível, potencialmente reprovando desenhos
  hoje válidos em níveis com "buracos" intencionais/inofensivos.
- **Modificar `simulateDFA` para retornar `{accepted, deadEnd}`** —
  descartada: `simulateDFA` é passado diretamente como predicado pro
  `fuzzDFA`, que espera um booleano; mudar sua assinatura quebraria esse
  contrato. `traceDeadEnd` isolado evita esse acoplamento.

## Consequências / Trade-offs

- Diagnóstico mais específico só aparece quando a rejeição foi causada
  por um buraco real de transição — quando o grafo aceita indevidamente
  (accepted=true, shouldAccept=false) não há "buraco" a apontar, e a
  mensagem genérica antiga continua igual.
- `e2e/afd1_trace_on_failure.spec.js`: as 2 asserções originais precisaram
  ser atualizadas porque o fixture usado (`unlockAndBuildWrongAFD`) já
  tinha um buraco de δ real — a mensagem mais específica passou a valer
  ali, corretamente.

## Referências

- Plano: `docs/PLAN_FEEDBACK_VALIDACAO_AFD_AP_MT.md` (Item 2)
- Código: `src/modules/afd/hooks/useAFDGraph.js` (`traceDeadEnd`,
  `validateAFDPure`), `src/modules/afd/AFDPart1.jsx` (`validateAFD`,
  `errorNodeIds`), `src/modules/afd/AFDPart1.css` (`.node.node-error`)
- Testes: `src/__tests__/validateAFD.test.js`, `e2e/afd1_trace_on_failure.spec.js`
- Padrão bloqueante (não replicado aqui, por design): `src/modules/afd/utils/dfaAlgorithms.js`
  (`analyzeDrawnDFA`, código `'incomplete'`)
