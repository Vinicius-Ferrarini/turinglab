# Plano — Estrelas no export/import + limpeza manual de fase

Baseado em `docs/prompts/PROMPT_estrelas_e_limpeza_manual.md` e ADR 0012.
Continuação da Fase A/B (`docs/PLAN_SESSAO_E_EXPORTACAO.md`, já fechada).

**Status: planejamento — aguardando revisão final antes de implementar.**
Nenhum item abaixo foi codificado ainda; os checkboxes serão marcados durante
a execução, no mesmo formato de `docs/PLAN_SESSAO_E_EXPORTACAO.md`. Design da
`EndScreen` fechado na 2ª rodada de esclarecimento (ver ADR 0012): 4 botões
— Voltar ao Menu, ⬇ Exportar, 🎮 Acessar Tabuleiro, Próxima — sem "Limpar"
ali.

## Casos de aceite

### CA1 — Exportar inclui as estrelas atuais
**Dado** um aluno com 2 estrelas na fase X e um grafo parcial desenhado,
**quando** ele clica "⬇ Exportar" (no `GameHeader` ou na `EndScreen`),
**então** o arquivo `.json` baixado contém `stars: 2` no nível raiz do
envelope (irmão de `payload`), sem afetar o payload em si.

### CA2 — Importar restaura as estrelas sem regredir
**Dado** um arquivo exportado com `stars: 3` e a fase atual só com 1 estrela,
**quando** o aluno importa esse arquivo,
**então** a fase passa a mostrar 3 estrelas (e o resto do estado é restaurado
como já acontecia antes desta mudança).

**Dado** um arquivo exportado com `stars: 1` e a fase atual já com 3 estrelas,
**quando** o aluno importa esse arquivo,
**então** a fase continua com 3 estrelas (nunca regride) — só o
grafo/testes/formal do arquivo são aplicados.

### CA3 — Importar estrelas não gera telemetria de fim de fase falsa
**Dado** consentimento de telemetria concedido,
**quando** o aluno importa um arquivo com `stars`,
**então** nenhum evento `fim_fase` é disparado por causa disso (só
`importar_fase`, já existente).

### CA4 — Arquivo exportado ANTES desta mudança continua importável
**Dado** um `.json` exportado pela Feature B original (sem o campo `stars`),
**quando** o aluno importa esse arquivo agora,
**então** a importação funciona normalmente (grafo/testes/formal restaurados),
sem erro por causa do campo ausente, e sem alterar as estrelas atuais.

### CA5 — Terminar a fase NÃO limpa mais nada automaticamente
**Dado** um aluno que acabou de vencer a fase X,
**quando** ele clica "Voltar ao Menu" ou "Próxima" na `EndScreen` **sem**
clicar em "🎮 Acessar Tabuleiro" antes,
**então** a sessão da fase X **continua salva** — reabrindo a fase X depois
(mesmo dias depois), o estado completo (grafo, testes, formal) volta
exatamente como estava, **e a `EndScreen` reabre também** (mesmo
comportamento de F5 já existente na Fase A — o flag de vitória persiste até
ser explicitamente dispensado, ver CA7).

### CA6 — "🗑 Limpar Fase" exige confirmação e nunca mexe nas estrelas
**Dado** uma fase com estado salvo (qualquer combinação de grafo/testes/
formal/vitória) e 2 estrelas conquistadas,
**quando** o aluno clica "🗑 Limpar Fase",
**então** aparece um balão "Isso vai apagar os dados da fase" com botão
**Sim** (verde) e **Não** (vermelho), e nada é apagado ainda.

**Quando** o aluno clica **Não**, **então** o balão fecha e nada muda.

**Quando** o aluno clica **Sim**, **então** o grafo volta a vazio, os testes
somem, a Descrição Formal volta em branco, a tela de vitória fecha (se
estava aberta) — a fase se comporta como se nunca tivesse sido jogada — **e
as 2 estrelas continuam intactas**.

### CA7 — "🎮 Acessar Tabuleiro" dispensa a tela de fim sem navegar nem limpar
**Dado** um aluno na tela de vitória (ou "Impossível") da fase X,
**então** ele vê 4 botões, nesta ordem: "Voltar ao Menu", "⬇ Exportar",
"🎮 Acessar Tabuleiro", "Próxima" (quando houver próxima fase).

**Quando** ele clica "🎮 Acessar Tabuleiro",
**então** o overlay fecha, ele continua na fase X (não navega pro menu),
o grafo/testes/formal continuam intactos na tela, e o `GameHeader`
(Exportar/Importar/🗑 Limpar Fase) fica clicável de novo.

**Dado** que ele já clicou "🎮 Acessar Tabuleiro" nessa visita,
**quando** ele sai (Voltar ao Menu) e reabre a fase X depois,
**então** ela abre direto no tabuleiro (sem reabrir a `EndScreen`) — a
escolha de dispensar a tela de fim persiste (é parte do estado salvo).

## Itens

- [ ] **0. ADR 0012** (`docs/adr/0012-estrelas-no-export-e-limpeza-manual-de-fase.md`)
      — já redigida nesta rodada de planejamento, ver arquivo. Nota de
      atualização adicionada na ADR 0011.

- [x] **1. `sessionSnapshot.js`: campo `stars` opcional no envelope + testes** ✅
      TDD: 21 testes novos em `sessionSnapshot.test.js` (Suites 6-7),
      confirmados falhando (7 falhas, `stars` ainda undefined) antes de
      implementar. `buildSnapshot(moduleKey, levelId, payload, levelLabel,
      stars)` — 5º parâmetro opcional; `stars: 0` é tratado como "informado"
      (só `undefined`/`null` deixam o campo de fora, mesmo padrão de
      `levelLabel`). `isValidSnapshot` aceita `stars` ausente (CA4, arquivo
      exportado antes desta mudança) e valida inteiro 0-3 quando presente —
      string/NaN/negativo/>3/float rejeitados com `reason:'bad_stars'`, nunca
      lança. `SCHEMA_VERSION` continua 1 (teste explícito).
      Testes: `npx vitest run sessionSnapshot.test.js` 28/28. `npm test`
      completo: **2087/2087 passando** (26 arquivos) — sem regressão.

- [x] **2. `App.jsx`: `updateProgress(moduleId, stars, extras, logTelemetry)`** ✅
      Sem teste unitário (App.jsx não tem suíte Vitest, só Playwright — já
      documentado em CLAUDE.md/ADR 0011); cobertura via E2E no item 7 (CA3).
      4º parâmetro opcional, default `true` — nenhum call-site existente
      muda de comportamento (todos os ~12 call-sites atuais continuam
      chamando com 2-3 argumentos, herdando o default). Quando `false`: pula
      o `logEvent({tipo_evento:'fim_fase', ...})`, mas continua atualizando
      `progress`/`localStorage` normalmente, inclusive a regra de nunca
      regredir (`if (stars <= cur) return prev;` já existia e não mudou).
      Testes: `npx eslint src/App.jsx` limpo. `npm test`: 2087/2087 (sem
      mudança nesta etapa — item sem lógica pura nova).

- [x] **3. Export/Import nos 4 orquestradores: ligar `stars`** ✅
      `handleExportSession` de cada módulo agora lê a chave de progresso
      certa (`currentLevel.id` no AFD; `` `ap-${level.id}` ``,
      `` `mt-recon-${level.id}` ``, `` `mt-trans-${level.id}` `` nos outros
      3 — confirmadas DIFERENTES do `moduleKey` da sessão) e passa pro
      `buildSnapshot`. `handleImportSessionFile` chama
      `updateProgress(<chave>, res.snapshot.stars, {}, false)` quando
      `stars` vem no arquivo (CA2/CA3) — `false` = sem telemetria de
      `fim_fase` falsa (item 2).
      Testes: cobertos via Playwright no item 7 (fiação de UI/estado React,
      mesma razão do item 2). `npx eslint` nos 4 orquestradores: **0 erros,
      17 warnings** — idêntico à soma dos 4 baselines individuais (13+0+2+2)
      já registrados na Fase B, nenhum novo. `npm test`: 2087/2087.

- [x] **4+5. `resetToBlankState()` por orquestrador + botão "🗑 Limpar Fase"
      com confirmação no `GameHeader`** ✅ (implementados juntos — um sem o
      outro deixaria `handleClearSession` sem uso, quebrando `no-unused-vars`
      no lint; não fazia sentido commitar em 2 passos)
      **Decisão de implementação registrada** (refina o item 4 do plano
      original): em vez de UMA função `resetPhaseToBlank()` que faz reset +
      `clearLevelSession` junto, separei em duas — `resetToBlankState()`
      (só estado local, sem ler `currentLevel`/`level` no corpo) e
      `handleClearSession()` (chama `clearSession()` do
      `useLevelSessionPersistence` — que já cancela o autosave debounced
      pendente, não só apaga o localStorage — e então `resetToBlankState()`).
      Motivo: se `loadLevel` chamasse uma função que lê `currentLevel` pra
      limpar o localStorage, limparia a sessão do nível ANTERIOR (React
      ainda não comitou `setCurrentLevel(level)` nesse ponto do callback) —
      um bug real que só apareceu ao tentar reaproveitar ingenuamente.
      No AFD, `loadLevel` foi refatorado pra chamar `resetToBlankState()`
      (já reaproveitava `applyRestoredPayload`, então manter a mesma
      filosofia). No AP/MT-Recon/MT-Trans, `loadLevel` manteve seu reset
      inline como estava (decisão já registrada na Fase A/B — código
      testado, não valia reabrir); `resetToBlankState()` ali é usado só
      pelo "Limpar Fase".
      `GameHeader` ganha `onClearSession` — balão de confirmação **num
      portal pro `document.body`** (achado ao testar manualmente: renderizado
      inline, o balão ficava atrás de qualquer overlay de tela cheia com
      z-index igual/maior que apareça depois no DOM, ex. `.locked-overlay`
      da grade "descubra a menor palavra" — stacking context não deixa um
      z-index local "vencer" um overlay fora da árvore do header; corrigido
      com `createPortal` + posição calculada via `getBoundingClientRect` do
      botão). Sim verde/Não vermelho, texto exato "Isso vai apagar os dados
      da fase". Confirmado visualmente com Playwright antes de fechar o
      item (screenshot manual, descartado depois).
      Testes: `npx eslint` nos 5 arquivos tocados — **0 erros**, contagem de
      warnings idêntica à baseline em cada arquivo (nenhum novo introduzido;
      1 warning novo de `exhaustive-deps` no AFD foi corrigido adicionando
      as deps faltantes, voltando aos 13 de sempre). `npm test`: 2087/2087.

- [ ] **6. `EndScreen.jsx`: botões "⬇ Exportar" + "🎮 Acessar Tabuleiro"**
      Novas props `onExport` (reaproveita o MESMO handler já passado pro
      `GameHeader` — não duplicar lógica) e `onAccessBoard` (chama
      `setShowVictoryScreen(false)`/`setShowImpossibleScreen(false)` conforme
      a tela; não navega, não limpa nada). Ordem dos botões: Voltar ao Menu,
      ⬇ Exportar, 🎮 Acessar Tabuleiro, Próxima. Remove a chamada automática
      de `clearSession()` dos `onMenu`/`onNext` nos 4 orquestradores (CA5) —
      a limpeza só acontece pelo "🗑 Limpar Fase" (item 5) agora.

- [ ] **7. E2E Playwright** — específico pra este conjunto de mudanças,
      arquivo novo (ex. `e2e/stars_export_and_clear_session.spec.js`),
      cobrindo os 7 casos de aceite acima nos 4 módulos (ou pelo menos AFD
      completo + 1 caso representativo nos outros 3, a decidir pelo volume —
      registrar a escolha no doc de progresso).

- [ ] **8. Fechamento** — atualizar a seção "Session persistence &
      export/import" do `CLAUDE.md` (campo `stars` no envelope, limpeza
      manual em vez de automática, `updateProgress(..., logTelemetry)`).
      Rodar `npm run lint`, `npm test`, `npm run build`, `npx playwright test`
      completos e registrar os números finais aqui.
