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
- [ ] **1. `sessionSnapshot.js` + testes primeiro**
- [ ] **2. `storageAdapter.js` + testes** (storage falso injetado)
- [ ] **3. `useTMGraph.js`/`usePDAGraph.js`: `reset(initial)`** — teste primeiro
- [ ] **4. Içar Descrição Formal (AFD e AP)** — componentes controlados
- [ ] **5. `useLevelSessionPersistence.js`** + integração nos 4 `loadLevel`
- [ ] **6. E2E Playwright (Feature A)** — 4 specs, um por módulo
- [ ] **7. `exportImportFile.js`** + testes unitários (serialização/validação)
- [ ] **8. UI de exportar/importar** — botão no `GameHeader.jsx`
- [ ] **9. E2E Playwright (Feature B)** — `e2e/export_import_json.spec.js`
- [ ] **10. Fechamento** — CLAUDE.md, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`
