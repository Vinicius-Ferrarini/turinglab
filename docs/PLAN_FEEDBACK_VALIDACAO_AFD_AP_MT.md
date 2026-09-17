# Plano — Feedback de Validação (AFD_1, AP, MT)

**Status: aprovado, execução em andamento (TDD item a item).**

Origem: pedido para melhorar o feedback de erro (localização exata,
highlight visual, trace automático) na validação de AFD_1, Autômato com
Pilha e Máquina de Turing. Investigação feita lendo o código real (não a
premissa do pedido original) — duas correções relevantes ao enunciado
original estão documentadas abaixo, na tabela-resumo.

## Tabela-resumo

| Módulo | Erro | Localização exata? | Highlight? | Trace automático? | Ação |
|---|---|---|---|---|---|
| AFD_1 | `nondeterministic` | Sim (nó certo) | Sim (nó) | N/A (erro estrutural) | **Item 1** — mensagem não cita o símbolo duplicado |
| AFD_1 | δ incompleta | **Não existe categoria própria** | Não | Não | **Item 2** — vira diagnóstico adicional em `word_mismatch`/`language_mismatch` |
| AFD_1 | `word_mismatch` / `language_mismatch` | Sim (palavra exata) | Sim (progressivo, `SimPanel`) | **Sim — já implementado** (commit `3b865b71`, coberto por `e2e/afd1_trace_on_failure.spec.js`) | **Nenhuma ação** — gap do enunciado já foi fechado |
| AP | `counterexample` | Sim | Sim (progressivo, `APSimPanel`) | Sim (`pdaRejectingTrace`/`pdaAcceptingRun`) | Referência — não mexer |
| AP | não-determinismo | Bloqueado no desenho (UI) | N/A | N/A | Fora de escopo — não mexer |
| MT (Transdutora) | `nondeterministic` | Sim (estado+símbolo na mensagem) | **Não** | N/A (erro estrutural) | **Item 3** — adicionar highlight |
| MT (Transdutora) | `loop`/`rejected`/`wrong-output`/`head-not-rewound` | Sim (palavra no toast) | Não | **Não** | **Item 4** — trace automático (MAIOR RISCO) |

**Correções ao enunciado, confirmadas lendo o código:**
- **AFD `word_mismatch`/`language_mismatch`**: o enunciado dizia "só toast, sem highlight, painel abre vazio". Isso **não é mais verdade** — `AFDPart1.jsx:666-710` já abre `SimPanel` automaticamente com a palavra certa, nota de erro e trace progressivo com highlight (mesmo espírito do AP), e já existe `e2e/afd1_trace_on_failure.spec.js` cobrindo isso. Nenhuma ação necessária.
- **MT — `tmAlgorithms.js`**: ao contrário do que o enunciado sugere, o Item 4 **não precisa alterar `tmAlgorithms.js`**. `simulateTMSteps` já é genérica (usada por MT Reconhecedora) e funciona sem mudanças para a Transdutora; `MTSimPanel.jsx` já suporta os 4 motivos de contraexemplo da Transdutora. O trabalho real é só em `MTPart1.jsx` (wiring, no padrão que `MTReconPart1.jsx` já usa).

---

## Item 1 — AFD_1: mensagem de não-determinismo cita o símbolo duplicado

**Risco: baixo.**

### Spec (SDD)

Arquivo: `src/modules/afd/hooks/useAFDGraph.js`.

Nova função pura exportada (mesmo padrão de `mergeSymbols`/`lvlAccepts`, já testáveis isoladamente):
```js
export function findDuplicateSymbol(nodeId, transitions) // → string | null
```
Retorna o primeiro símbolo repetido nas transições de saída de `nodeId` (percorrendo na ordem do array, símbolos "a,b" já splitados).

`validateAFDPure` — branch de não-determinismo (linha 31) muda de:
```js
return { ok: false, reason: 'nondeterministic' };
```
para:
```js
return { ok: false, reason: 'nondeterministic', nodeId: node.id, symbol: findDuplicateSymbol(node.id, transitions) };
```
(`reason` continua `'nondeterministic'` — sem categoria nova.)

`validateAFDSilent` — mensagem (linha 146) muda de:
```
Não determinístico! "${label}" tem símbolo duplicado nas setas.
```
para:
```
Não determinístico! "${label}" tem duas setas para o símbolo '${symbol}'.
```
(texto exato, símbolo vindo de `findDuplicateSymbol`).

Highlight: **inalterado** — `setHighlightedError(node.id)` já destaca o nó certo (confirmado no código); nenhum `errorNodeIds`/Set entra neste item.

### TDD
- [x] **Passo 1 (RED)**: em `src/__tests__/validateAFD.test.js`, novo `describe('findDuplicateSymbol')` com casos (sem duplicata → null; duplicata simples; duplicata em chip multi-símbolo "a,b"; duplicata só em outro nó → null); e atualização do teste existente "não-determinismo" para `toMatchObject({ reason:'nondeterministic', nodeId:'q0', symbol:'a' })`. RED confirmado: 5 falhas (`findDuplicateSymbol is not a function` ×4 + `toMatchObject` faltando `nodeId`/`symbol` ×1), 16 passando.
- [x] **Passo 2 (GREEN)**: implementado `findDuplicateSymbol` em `useAFDGraph.js` + campos `nodeId`/`symbol` em `validateAFDPure` + mensagem atualizada em `validateAFDSilent`. **Feito:** commit `9108302`, suíte do arquivo 21/21.
- [x] **Passo 3 (REFACTOR)**: `npm test` completo — **2135/2135** (26 arquivos), 0 regressão. `npm run lint` — 36 warnings antes e depois (baseline via `git stash`), nenhum novo. **Feito:** commit `9108302`.

---

## Item 2 — AFD_1: δ incompleta como diagnóstico (não como bloqueio novo)

**Risco: baixo-médio.** Decisão de design importante (ver abaixo).

### Decisão de escopo (por que não é uma categoria de erro bloqueante)
AFD_1 não é validado por completude estrutural — ele já aceita grafos parciais (transição ausente = rejeição implícita) e valida por bateria + `fuzzDFA` (equivalência de linguagem completa). Isso é **diferente** de Minimização (`dfaAlgorithms.js`/`analyzeDrawnDFA`), que já tem uma checagem de completude **bloqueante** própria (`code:'incomplete'`, linha 231-236) porque lá o gabarito exige um DFA completo. Copiar esse gate bloqueante para AFD_1 mudaria o critério de aprovação de nível — **proibido pelo "Fora de escopo"**. Então: δ incompleta vira um **campo adicional de diagnóstico** anexado a uma falha que **já** aconteceria hoje (`word_mismatch`/`language_mismatch`), nunca uma nova causa de reprovação.

### Spec (SDD)

Arquivo: `src/modules/afd/hooks/useAFDGraph.js`.

Nova função pura exportada:
```js
export function traceDeadEnd(nodes, transitions, word) // → { nodeId, symbol } | null
```
Refaz o percurso de `word` a partir do estado inicial; se travar por falta de transição, devolve `{ nodeId, symbol }` do ponto exato da travada; senão `null`. (Implementação isolada — **não** mexe em `simulateDFA`, que continua devolvendo booleano puro para não quebrar o contrato com `fuzzDFA`.)

`validateAFDPure` — branches `word_mismatch`/`language_mismatch` ganham campo aditivo:
```js
return { ok: false, reason: 'word_mismatch', word, shouldAccept, deadEnd: !accepted ? traceDeadEnd(nodes, transitions, word) : null };
```
(mesma ideia para `language_mismatch` com `counterexample.word`). `reason` e `ok` **não mudam** — testes existentes com `toMatchObject` continuam passando.

`AFDPart1.jsx` — novo estado `const [errorNodeIds, setErrorNodeIds] = useState(null)`, propagado para `<CanvasArea errorNodeIds={errorNodeIds} .../>` (prop já suportada por `CanvasArea.jsx:825` via `errorNodeIds?.has(node.id) ? 'node-error'`, hoje não alimentada por `AFDPart1.jsx` — só por `MinDrawStep.jsx`).

Em `validateAFD` (linha 691-704), quando `badWord.deadEnd` existir:
```js
setErrorNodeIds(new Set([badWord.deadEnd.nodeId]));
setTimeout(() => setErrorNodeIds(null), 3000);
setSimMismatchNote(`"${w}" foi rejeitada — δ incompleta: "${labelOf(deadEnd.nodeId)}" não tem transição para '${deadEnd.symbol}'.`);
```
(texto exato acima; quando `deadEnd` for `null`, mensagem atual permanece **idêntica**, sem mudança).

**Payload de highlight**: `errorNodeIds` — `Set<string>` com um único id (`new Set([nodeId])`).

### TDD
- [x] **Passo 1 (RED)**: `traceDeadEnd` — 4 testes puros (percurso completo sem buraco → null mesmo terminando não-final; buraco real → `{nodeId,symbol}`; λ sem buraco → null; sem estado inicial → null); + 3 testes de `word_mismatch`/`language_mismatch` com `deadEnd` esperado (`null` nos 2 casos sem buraco real, objeto nos 2 casos com buraco real). RED confirmado: 8 falhas (`traceDeadEnd is not a function` ×4 + `deadEnd` ausente do `toMatchObject` ×4), 21 passando.
- [x] **Passo 2 (GREEN)**: implementado `traceDeadEnd` + campo `deadEnd` em `word_mismatch`/`language_mismatch`. **Feito:** commit `409912b`, suíte do arquivo 29/29; suíte completa 2143/2143 (0 regressão nos testes puros existentes).
- [x] **Passo 3 (GREEN, UI)**: wiring `errorNodeIds`/mensagem em `AFDPart1.jsx` + regra `.node.node-error` em `AFDPart1.css`. Evidência via 2 casos consolidados em `e2e/afd1_trace_on_failure.spec.js` — RED genuíno obtido revertendo temporariamente (`git stash`) só o wiring de UI e rodando o e2e (2 falhas reais: nota ainda genérica, sem `.node-error`); GREEN após `git stash pop`. Efeito colateral descoberto no processo: o fixture `unlockAndBuildWrongAFD` já tinha um buraco de δ real (q1 sem saída) — os 2 testes ORIGINAIS desse arquivo passaram a receber a mensagem mais específica em vez da genérica (comportamento correto, não regressão), então suas asserções foram atualizadas em vez de duplicadas em testes novos. **Feito:** commit `409912b`, e2e 3/3 (arquivo) + 23/23 (afd1_flow/afd1_erase_symbol/session_persistence_afd1, sem regressão).
- [x] **Passo 4 (REFACTOR)**: `npm test` completo — 2143/2143. `npm run lint` — 36 warnings antes e depois, nenhum novo. **Feito:** commit `409912b`.

---

## Item 3 — MT: highlight de não-determinismo no canvas

**Risco: médio** (mexe em `MTCanvas.jsx`, componente compartilhado com MT Reconhecedora).

### Spec (SDD)

Arquivo: `src/modules/mt/MTPart1.jsx` — bloco de não-determinismo (linha ~478-490). Mensagem **inalterada** (já correta, confirmado). Adiciona:
```js
const [errorNodeIds, setErrorNodeIds] = useState(null);
// ...dentro do if de nondeterminismo:
setErrorNodeIds(new Set([t.from]));
setTimeout(() => setErrorNodeIds(null), 3000);
```

Arquivo: `src/modules/mt/components/MTCanvas.jsx` — nova prop `errorNodeIds` (Set|null, default `null`), inserida na composição de classes do nó (linha 789):
```js
${errorNodeIds?.has(node.id) ? 'error-pulse-severe' : ''}
```
Reaproveita `.node.error-pulse-severe` (já definida em `AFDPart1.css`, já importada por `MTPart1.jsx:7` — **nenhum CSS novo necessário**). Prop opcional e default `null` → `MTReconPart1.jsx` (que também usa `MTCanvas`) não é afetado.

**Payload de highlight**: `errorNodeIds` — `Set<string>` com um único id (`new Set([t.from])`), mesmo formato do Item 2.

### TDD
Não há lógica pura nova aqui (a detecção do estado/símbolo já existe e está correta) — RED/GREEN só no nível de UI (Vitest roda em `environment:'node'`, sem DOM; a evidência real é e2e, seguindo o precedente de `mt_recon_trace_on_failure.spec.js`/`afd1_trace_on_failure.spec.js`).
- [x] **Passo 1 (RED)**: novo `e2e/mt_trans_nondeterminism_highlight.spec.js` (fixture via import de `.json`, mesmo padrão de `mt_trans_head_rewind.spec.js` — 2 transições conflitantes em (q0, lendo '0')). RED confirmado: toast com a mensagem certa já aparecia, mas `.error-pulse-severe` nunca aparecia no nó.
- [x] **Passo 2 (GREEN)**: `errorNodeIds` (Set, default null) implementado em `MTCanvas.jsx` (prop nova, aditiva — não quebra MT Reconhecedora, que não a passa) + `MTPart1.jsx` (estado + `setErrorNodeIds(new Set([t.from]))` no branch de não-determinismo, auto-clear em 3s). **Nota de depuração real**: a 1ª tentativa de wiring teve RED que nunca virava GREEN mesmo após a implementação — rastreei e descobri que eu estava editando o `<APFooterDeck>` (componente do rodapé, que também recebe uma prop `errAction` pré-existente) em vez do `<MTCanvas>` de verdade — os dois `<...>` ficam ~300 linhas distantes no arquivo. Só depois de instrumentar `window.__DEBUG_PROPS__` dentro de `MTCanvas.jsx` e comparar com o valor lido pelo teste é que a causa apareceu. **Feito:** commit `218bb30`, e2e 1/1.
- [x] **Passo 3 (REFACTOR)**: `npm test` completo — 2143/2143. `npx playwright test` nos specs de MT (Transdutora + Reconhecedora + persistência de sessão de ambos) — 25/25, sem regressão no Reconhecedor (prop nova é opcional). `npm run lint` — 36 warnings antes e depois, nenhum novo. **Feito:** commit `218bb30`.

---

## Item 4 — MT Transdutora: trace automático de contraexemplo

**Risco: alto — PARAR antes de começar e pedir confirmação explícita** (`tmAlgorithms.js` não precisa mudar — ver correção acima; o risco está em `MTPart1.jsx`).

### Spec (SDD)

Arquivo: `src/modules/mt/MTPart1.jsx`. Modelo a copiar: `MTReconPart1.jsx` linhas ~88-101 (estado `sim`/`simKey`/`openSim`/`closeSim`) e ~629-653 (abertura pós-falha) — só que a Transdutora não tem nenhum desse estado hoje.

Novos imports: `MTSimPanel` (`./components/MTSimPanel`) + `simulateTMSteps` (já exportada por `./utils/tmAlgorithms`, **sem alterações nela**).

Novo estado:
```js
const [sim, setSim] = useState(null);
const [simKey, setSimKey] = useState(0);
const openSim  = useCallback((s) => { setSim(s); setSimKey(k => k + 1); }, []);
const closeSim = useCallback(() => setSim(null), []);
```

No branch `else` de falha de `validate()` (linha 501-513), após o `showToast`, quando `res.counterexample != null`:
```js
const configs = simulateTMSteps(mtGraph, res.counterexample, SIM_MAX_STEPS, level.startMarker ?? null);
openSim({
  configs, word: res.counterexample, maxSteps: SIM_MAX_STEPS,
  title: `Contraexemplo: "${show}"`,
  message: msg,
  headRewound: res.reason === 'head-not-rewound' ? false : undefined,
});
```
`reason`s (`loop`/`rejected`/`wrong-output`/`head-not-rewound`) **inalterados** — nenhuma categoria nova.

Render: `{sim && <MTSimPanel key={simKey} configs={sim.configs} word={sim.word} maxSteps={sim.maxSteps} title={sim.title} message={sim.message} headRewound={sim.headRewound} onHighlight={...} onClose={closeSim} />}` — `onHighlight` espelha exatamente o wiring de `simActiveNodeId`/tIdx/seq que `MTReconPart1.jsx` já usa com `MTCanvas`. Posição exata na JSX (relativa às abas "⚙ Linguagem"/"✏ Desenho") fica para ser confirmada no passo RED, lendo a árvore JSX atual de perto nesse momento.

### TDD
Sem lógica pura nova (tudo reaproveitado, `tmAlgorithms.js` intocado como previsto) → evidência 100% e2e.
- [x] **Passo 1 (RED)**: novo `e2e/mt_trans_trace_on_failure.spec.js`, espelhando `mt_recon_trace_on_failure.spec.js`, com 5 casos (`loop`, `rejected`, `wrong-output`, `head-not-rewound` + 1 caso de falha estrutural provando que o painel NÃO deve abrir nesse caso). RED confirmado: os 4 casos de contraexemplo falharam (`.sim-panel-container` nunca aparecia — timeout), o 5º (estrutural) já passava (comportamento correto preexistente).
- [x] **Passo 2 (GREEN)**: wiring completo em `MTPart1.jsx` — import de `MTSimPanel`/`simulateTMSteps`, `SIM_MAX_STEPS`, estado `sim`/`simKey`/`simHighlight`/`openSim`/`closeSim`/`handleSimHighlight` (mesmo padrão de `MTReconPart1.jsx`), chamada de `openSim` no branch de falha de `validate()`, `simPanel`/`simPanelClassName` no `<APFooterDeck>` já existente, `simActiveNodeId`/`simActiveTIdx`/`simActiveSeq` no `<MTCanvas>` real. Ajuste durante o GREEN: o caso `head-not-rewound` só mostra o selo dedicado no ÚLTIMO passo do painel (não no passo inicial) — teste corrigido pra avançar o `MTSimPanel` até o fim antes de checar o selo (mesmo padrão de `mt_recon_head_rewind.spec.js`'s `advanceSimToEnd`). **Feito:** commit `19792ff`, e2e 5/5.
- [x] **Passo 3 (REFACTOR)**: `npm test` completo — 2143/2143. `npx playwright test` em todos os specs de MT (Transdutora + Reconhecedora + persistência de sessão de ambos, 31 specs) — 31/31, sem regressão. `npm run lint` — 36 warnings antes e depois, nenhum novo. **Feito:** commit `19792ff`.

---

## Ordem de execução por risco

1. Item 1 (AFD — mensagem)
2. Item 2 (AFD — δ incompleta como diagnóstico)
3. Item 3 (MT — highlight de não-determinismo)
4. **PARAR** → confirmação explícita do usuário
5. Item 4 (MT Transdutora — trace automático de contraexemplo)

## Fora de escopo
- Mudar critério de aprovação/reprovação de nível em qualquer módulo (Item 2 é só diagnóstico aditivo, `ok`/`reason` continuam iguais).
- Mexer em `dfaAlgorithms.js`/`MinDrawStep.jsx` (Minimização) — já é o padrão-ouro, só leitura/referência.
- Mexer em `usePDAGraph.js`/`pdaAlgorithms.js`/`APPart1.jsx` (AP) — já correto, só referência.
- Equivalência exata via regex→autômato — decisão já tomada (ADR 0003/bateria+fuzzer), não revisitar.
- Alterar o comportamento de `MTReconPart1.jsx` (MT Reconhecedora) — qualquer prop nova em `MTCanvas.jsx` deve ser opcional/aditiva para não afetá-lo.
