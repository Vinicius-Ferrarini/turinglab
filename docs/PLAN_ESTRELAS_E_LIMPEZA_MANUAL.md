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

- [ ] **1. `sessionSnapshot.js`: campo `stars` opcional no envelope + testes**
      TDD — escrever antes:
      - `buildSnapshot(moduleKey, levelId, payload, levelLabel, stars)`: com
        `stars` informado, aparece no envelope; sem informar (undefined),
        continua ausente do objeto (mesmo padrão já usado por `levelLabel`).
      - `isValidSnapshot`: `stars` ausente → válido, sem afetar o resto da
        validação (CA4). `stars` presente e é inteiro 0-3 → válido. `stars`
        presente mas inválido (string, negativo, > 3, float não-inteiro,
        `NaN`) → `{ ok:false, reason:'bad_stars' }`, nunca lança.
      - Roundtrip: `buildSnapshot` com `stars` → `JSON.stringify`/`parse` →
        `isValidSnapshot` continua `ok:true` com o mesmo valor.
      - `SCHEMA_VERSION` **não muda** — teste explícito garantindo que um
        envelope `schemaVersion: 1` sem `stars` nenhum ainda passa
        (documenta a decisão da ADR 0012 de não bumpar versão).

- [ ] **2. `App.jsx`: `updateProgress(moduleId, stars, extras, logTelemetry)`**
      TDD não aplicável da forma usual — `App.jsx` não tem suíte Vitest
      (só Playwright, já documentado em CLAUDE.md/ADR 0011). Escrever o teste
      MANUAL/E2E primeiro mesmo assim (roteiro no item 7) antes de
      implementar, no espírito do TDD ainda que sem arquivo `.test.js`.
      - 4º parâmetro opcional, default `true` (nenhum call-site existente
        muda de comportamento).
      - Quando `false`: pula o `logEvent({tipo_evento:'fim_fase', ...})`,
        mas continua atualizando `progress`/`localStorage` normalmente
        (inclusive a regra de nunca regredir).

- [ ] **3. Export/Import nos 4 orquestradores: ligar `stars`**
      - `handleExportSession`: ler `progress?.[<chave-de-estrelas-do-módulo>]?.stars ?? 0`
        (a chave de estrelas é DIFERENTE do `moduleKey` da sessão — ex.: AFD
        usa `currentLevel.id` cru, AP usa `` `ap-${level.id}` `` etc.; não
        confundir os dois namespaces) e passar pro `buildSnapshot`.
      - `handleImportSessionFile`: se `res.snapshot.stars != null`, chamar
        `updateProgress(<chave>, res.snapshot.stars, {}, false)` (CA2/CA3).
      - Testes: cobertos via Playwright no item 7 (mesma razão do item 2 —
        é fiação de UI/estado React, não lógica pura isolável).

- [ ] **4. `resetPhaseToBlank()` por orquestrador**
      Extrai a lógica de "estado em branco" que hoje só existe dentro do
      início de `loadLevel` pra uma função reaproveitável por `loadLevel` E
      pelo novo fluxo de "Limpar Fase" — sem duplicar a lista de `setState`.
      Chama `clearLevelSession(moduleKey, levelId)` também. Sem teste
      unitário (mesma natureza de `applyRestoredPayload`, já sem teste
      próprio na Fase A) — cobertura via Playwright no item 7.

- [ ] **5. Componente de confirmação + botão "🗑 Limpar Fase" no `GameHeader`**
      Balão de confirmação reaproveitando o estilo visual já usado no jogo
      (balão do Maurílio) — decisão de implementação, não de comportamento
      visível, então não bloqueia a revisão: exato componente/CSS a decidir
      durante a execução, documentando a escolha no doc de progresso.
      `GameHeader` ganha `onClearSession` (abre o balão de confirmação — só
      existe ali, **não** na `EndScreen`, ver item 6). Sim verde/Não
      vermelho, texto exato "Isso vai apagar os dados da fase".

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
