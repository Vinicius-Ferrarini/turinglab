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
- [ ] **2. `storageAdapter.js` + testes** (storage falso injetado)
- [ ] **3. `useTMGraph.js`/`usePDAGraph.js`: `reset(initial)`** — teste primeiro
- [ ] **4. Içar Descrição Formal (AFD e AP)** — componentes controlados
- [ ] **5. `useLevelSessionPersistence.js`** + integração nos 4 `loadLevel`
- [ ] **6. E2E Playwright (Feature A)** — 4 specs, um por módulo
- [ ] **7. `exportImportFile.js`** + testes unitários (serialização/validação)
- [ ] **8. UI de exportar/importar** — botão no `GameHeader.jsx`
- [ ] **9. E2E Playwright (Feature B)** — `e2e/export_import_json.spec.js`
- [ ] **10. Fechamento** — CLAUDE.md, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`
