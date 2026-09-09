# Plano — Persistência de Sessão + Exportar/Importar (.json)

Baseado em `docs/prompts/PROMPT_persistencia_sessao_e_exportacao.md` (arquitetura já
validada com o usuário — não reabrir). Cada item: teste primeiro → implementação →
`npm test` (suíte inteira) → marcar feito. Mesmo formato de `docs/OPTIMIZATION_PROGRESS.md`.

3 fases de revisão do usuário: **Fase A** = persistência de sessão (itens 0-6),
**Fase B** = exportar/importar (itens 7-9), **Fase C** = fechamento (item 10).

## Itens

- [x] **0. ADR 0011** (`docs/adr/0011-persistencia-de-sessao-e-exportacao-json.md`) ✅
      Registrada a decisão do §2/§3 do prompt: schema único (envelope + payload)
      reaproveitado por autosave e export/import, `uid` nunca persistido, grafo
      salvo sem validar, `.json` em vez de XML/JFLAP (decisão do usuário, sem
      necessidade de interoperar com JFLAP). Linha adicionada ao índice de
      `docs/adr/README.md`.
      Testes: N/A (documentação).
- [x] **1. `sessionSnapshot.js` + testes primeiro** ✅
      `src/__tests__/sessionSnapshot.test.js` escrito ANTES da implementação (17
      testes: roundtrip stringify/parse para os 4 moduleKey, grafo AFD
      não-determinístico/sem flags/transição em branco sobrevive intacto,
      schemaVersion incompatível e envelope malformado (`null`/string/objeto
      solto) rejeitados sem lançar, payload vazando campo de outro módulo
      (`linguagemTests` fora de mt-trans, `testMode` em mt-trans,
      `isDrawingUnlocked`/`hintStage` em mt-trans) rejeitado, fixture MT grande
      (40 estados, 120 transições, 150+130 entradas nos 2 históricos) sem
      truncar nenhum item. Confirmado falhando (módulo inexistente) antes de
      implementar `src/modules/shared/persistence/sessionSnapshot.js`
      (`buildSnapshot`/`isValidSnapshot`/`SCHEMA_VERSION`, allowlist de campos
      por `moduleKey` — fail closed em campo desconhecido).
      Testes: `npx vitest run sessionSnapshot.test.js` 17/17. `npm test`
      completo: **2016/2016 passando** (22 arquivos) — sem regressão.
- [x] **2. `storageAdapter.js` + testes** (storage falso injetado) ✅
      `src/__tests__/storageAdapter.test.js` (12 testes, TDD — confirmado
      falhando antes) com um Map em memória fazendo o papel do `Storage`
      (sem jsdom). `safeGetItem`/`safeSetItem`/`safeRemoveItem` fazem
      JSON.parse/stringify internamente (único uso real é ler/escrever
      envelopes de `sessionSnapshot.js`) e nunca lançam: chave ausente,
      JSON corrompido, `storage.getItem`/`setItem`/`removeItem` lançando
      (quota excedida simulada via exception), valor não serializável
      (referência circular) e `storage` ausente/undefined — todos caem para
      `null`/`false` com `console.warn`, sem derrubar o chamador.
      Testes: `npx vitest run storageAdapter.test.js` 12/12. `npm test`
      completo: **2028/2028 passando** (23 arquivos) — sem regressão.
- [x] **3. `useTMGraph.js`/`usePDAGraph.js`: `reset(initial)`** ✅
      `src/__tests__/graphReset.test.js` (7 testes, TDD — falhou antes por
      `pdaGraphReducer`/`tmGraphReducer` não exportados). Reducers internos
      (antes `reducer` local) renomeados e exportados (`pdaGraphReducer`,
      `tmGraphReducer`), junto com `EMPTY_PDA_GRAPH`/`EMPTY_TM_GRAPH` — mesmo
      padrão de `createHistoryStack` em `useHistory.js` (reducer puro
      testável sem montar React). `reset()` virou `reset(initialGraph =
      EMPTY)`: sem args continua idêntico (volta ao grafo vazio); com um
      objeto `{nodes, transitions}`, o `RESET` hidrata `present` DIRETO, sem
      empurrar o present anterior pro `past` — confirmado que um `UNDO` logo
      após `reset(initial)` é no-op (não existe "desfazer" pra antes da
      hidratação). Todo call-site existente (`loadLevel`/`goLevel` chamando
      `g.reset()` sem args) continua funcionando sem mudança.
      Testes: `npx vitest run graphReset.test.js` 7/7. `npm test` completo:
      **2035/2035 passando** (24 arquivos) — sem regressão.
- [x] **4. Içar Descrição Formal (AFD e AP)** — componentes controlados ✅
      TDD: testes primeiro. AFD já tinha lógica pura isolada
      (`formalDescriptionLogic.js`) — adicionei `buildFormalStateSnapshot`/
      `normalizeFormalInitialValues`/`EMPTY_FORMAL_STATE` com 6 novos testes em
      `formalDescription.test.js` (confirmados falhando antes). AP não tinha
      nada extraído — criei `src/modules/ap/utils/apFormalDescriptionLogic.js`
      (`validateApFormalElements`/`validateApFormalTransitions`/
      `canvasGammaFromTransitions`/snapshot helpers, reaproveitando
      `parseFormalInput`/`checkFormalBraceFormat` do AFD — mesmo padrão de
      reuso cross-módulo já usado pelo AP com `sizeHint.js`/
      `bracketAutoClose.js`) com 15 testes novos em
      `apFormalDescriptionLogic.test.js`, confirmados falhando (módulo
      inexistente) antes de implementar.
      Depois: `FormalDescriptionModal.jsx` e `APFormalDescription.jsx`
      viraram componentes controlados (`initialValues`/`onStateChange`).
      AFD: `useState` inicializa de `initialValues`; o `useEffect` de reset
      ao abrir (`[isOpen]`) só zera quando NÃO há `initialValues` (senão
      hidrata e imediatamente apagaria — ADR 0011 §3.1); um 2º `useEffect`
      sempre emite o snapshot atual via `onStateChange` (sem debounce aqui —
      fica pro hook do item 5). AP: sem `useEffect` de reset — o reset já
      era por remontagem via `key` no pai (comentário original do arquivo),
      então o `useState(initialValues)` já resolve; `validateElements`/
      `validateTransitions` do componente passaram a chamar as funções puras
      novas em vez de duplicar a lógica inline.
      **Efeito colateral observado (não é scope creep — é o próprio
      requisito de persistência parcial)**: como o pai vai manter o último
      snapshot emitido e repassá-lo como `initialValues` a cada render (item
      5), fechar/reabrir o painel do AP (que remonta via `key`) deixará de
      apagar o que o aluno já tinha digitado — hoje isso já acontece
      (comportamento existente antes desta tarefa), então não é regressão;
      é a persistência funcionando como pedido.
      Testes: `npx eslint` nos 4 arquivos tocados — só o warning esperado
      `react-hooks/set-state-in-effect` (já documentado no CLAUDE.md,
      downgradado a warn — mesmo padrão do reset-on-open original). `npm
      test` completo: **2055/2055 passando** (25 arquivos, incluindo os 21
      testes novos e o guard-rail `formalDescription.test.js` inteiro
      verde) — sem regressão.
- [ ] **5. `useLevelSessionPersistence.js`** + integração nos 4 `loadLevel`
- [ ] **6. E2E Playwright (Feature A)** — 4 specs, um por módulo
- [ ] **7. `exportImportFile.js`** + testes unitários (serialização/validação)
- [ ] **8. UI de exportar/importar** — botão no `GameHeader.jsx`
- [ ] **9. E2E Playwright (Feature B)** — `e2e/export_import_json.spec.js`
- [ ] **10. Fechamento** — CLAUDE.md, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`
