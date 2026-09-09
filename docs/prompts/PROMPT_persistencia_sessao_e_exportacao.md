# Prompt de execução — Persistência de sessão + Exportar/Importar (.json)

> Como usar: cole este arquivo inteiro como instrução para o Claude Code, rodando
> dentro do checkout local do repositório `turinglab` (`git clone
> https://github.com/Vinicius-Ferrarini/turinglab`). Ele foi escrito depois de ler
> `CLAUDE.md`, os 10 ADRs em `docs/adr/`, os 4 orquestradores-alvo e os hooks de
> grafo — as decisões de arquitetura abaixo **já foram validadas com o usuário**
> (formato, escopo, o que persistir); não reabra esse debate, só execute. Onde
> houver um detalhe de implementação genuinamente aberto, decida com bom senso e
> registre a decisão no doc de progresso (Fase 3).

## 0. Contexto (não repetir, só ler)

Leia antes de escrever qualquer código:
- `CLAUDE.md` (arquitetura geral, convenções, o que já é "esperado" vs bug)
- `docs/adr/README.md` + os 10 ADRs (especialmente 0005, 0007, 0008, 0010 — são os
  mais próximos deste trabalho)
- `docs/OPTIMIZATION_PROGRESS.md` — é o **modelo de formato** que o doc de
  progresso desta tarefa deve seguir (checkboxes `[x]`/`[~]`, cada item com o que
  foi feito + resultado de testes)

Todos os comentários e nomes de variável novos devem seguir a convenção do
projeto: **comentários em português**, nomes de variável já usados no arquivo
(ex.: `testWords` no AFD, `testedWords` no AP/MT-recon, `linguagemTests`/
`desenhoTests` no MT-transdutora — não uniformize esses nomes, são propositalmente
diferentes por módulo).

## 1. As duas features (escopo confirmado com o usuário)

**Feature A — Persistência exata de sessão por fase.** Enquanto o aluno está numa
fase (AFD Parte 1, Autômatos com Pilha, MT Reconhecedora, MT Transdutora), todo
progresso *daquele exercício* deve sobreviver a: F5, queda de internet, trocar de
fase e voltar, fechar e reabrir o navegador. Isso inclui, **completo**:
- os nós adicionados (com posição, rótulo, `isInitial`/`isFinal`) e as transições
  — **mesmo se o grafo estiver estruturalmente errado** (não-determinístico,
  símbolo duplicado, transição em branco, estado sem inicial/final) — nunca
  validar antes de salvar, salvar exatamente o que está no canvas;
- as palavras já testadas (histórico completo, sem truncar — ver nota MT abaixo);
- se a "menor palavra" já foi descoberta (`isDrawingUnlocked`) e o estágio de dica
  já usado (`hintStage` do `useWordGuessGame`);
- a **Descrição Formal** (Q, Σ, δ, q₀, F no AFD; sêxtupla com pilha no AP; a
  tupla com fita no MT) — inclusive parcialmente preenchida, campo a campo;
- estado de vitória/impossível da fase, e no MT-transdutora especificamente as
  **duas** baterias de teste independentes (`linguagemTests`/`desenhoTests`) e a
  aba ativa (`activeTab`).

Fora de escopo (efêmero, não persistir — decisão já tomada, não é omissão):
zoom/pan do canvas, seleção múltipla/`selectionBox`/arraste em andamento, pilha
de undo/redo, passo da Aula Guiada (Modo Aula sempre reabre fechado), riscos de
lápis livre (`drawings`/`drawColor` etc. — é rabisco de anotação, não faz parte
do autômato), mensagens de toast/erro destacado.

**Feature B — Exportar/Importar em `.json`.** Um botão na tela de jogo (mesmo
grupo visual do botão "👨‍🏫 Aula") abre duas ações: baixar um `.json` com o
estado completo da fase atual, e subir um `.json` (de outra máquina, ou
salvo antes) para restaurar exatamente aquele estado — **mesmo schema da Feature
A**, só que como arquivo em vez de `localStorage` (ver §3). Decisão já tomada com
o usuário: **não precisa ser XML nem compatível com JFLAP** — `.json` está bom,
desde que completo (grafo + testes + descrição formal, não só o grafo).

Módulos-alvo (só estes 4 — não mexer em AFD Parte 2, Minimização, Boss
Trabalho/Prova, "Menor Palavra" standalone):

| Módulo | Arquivo orquestrador | `modulo` (telemetria, reusar como `moduleKey`) |
|---|---|---|
| AFD Parte 1 | `src/modules/afd/AFDPart1.jsx` | `afd-p1` |
| Autômatos com Pilha | `src/modules/ap/APPart1.jsx` | `ap` |
| MT Reconhecedora | `src/modules/mt-recon/MTReconPart1.jsx` | `mt-recon` |
| MT Transdutora | `src/modules/mt/MTPart1.jsx` | `mt-trans` |

## 2. Decisão de arquitetura (não reabrir)

**Não** é "salvar a instância inteira do jogo" (React/refs/closures não são
serializáveis, e misturaria estado efêmero de UI com estado do exercício) **nem**
"uma chave por parâmetro" (muitas escritas pequenas, difícil manter atômico).

É **um documento JSON por (módulo, fase)**, guardado sob uma chave própria de
`localStorage`, separada de `turinglab_progress`/`turinglab_progress_p2`
(que continuam guardando só estrelas — não toque nelas):

```
turinglab_session_v1:<moduleKey>:<levelId>
```

Esse é o mesmo objeto (envelope + `payload`) usado tanto para o autosave em
`localStorage` quanto para o arquivo `.json` exportado — **um único
serializer/parser reaproveitado nas duas features**, não dois formatos
paralelos:

```jsonc
{
  "schemaVersion": 1,
  "app": "turinglab",
  "moduleKey": "afd-p1",       // um de: afd-p1 | ap | mt-recon | mt-trans
  "levelId": 12,
  "levelLabel": "L12",          // só informativo/debug — não usar para casar import
  "savedAt": "2026-09-09T12:00:00.000Z",
  "payload": { /* específico do módulo — ver §4 */ }
}
```

`uid` dos nós **nunca** entra no `payload` — é chave React efêmera gerada por
`genUid()`/contador local a cada módulo; ao hidratar (autosave ou import),
regenere um `uid` novo para cada nó restaurado, exatamente como já acontece
quando o aluno adiciona um nó novo. Isso evita qualquer risco de colisão de
contador e simplifica o parser (não precisa se preocupar em preservar uids).

`from`/`to` das transições continuam por **label** (`id`, ex. `"q0"`), não por
`uid` — restaurar do jeito que já está no código, sem tradução.

## 3. Schema por módulo (`payload`) — nomes de campo = nomes de estado já existentes no código

**AFD Parte 1** (`src/modules/afd/AFDPart1.jsx`):
```jsonc
{
  "nodes": [...], "transitions": [...],           // useState em AFDPart1.jsx:66-67
  "testWords": [...],                              // AFDPart1.jsx:83
  "isDrawingUnlocked": false,                      // AFDPart1.jsx:80
  "hintStage": 0,                                  // wordleGame (useWordGuessGame) — AFDPart1.jsx:105
  "showVictoryScreen": false, "showImpossibleScreen": false,  // AFDPart1.jsx:134-135
  "formal": {                                      // ver §3.1 — precisa içar estado do FormalDescriptionModal
    "inputQ": "", "inputSigma": "", "inputInitial": "", "inputFinal": "",
    "areElementsValid": false, "parsedQ": [], "parsedSigma": [],
    "transitionTableData": {}
  }
}
```

**Autômatos com Pilha** (`src/modules/ap/APPart1.jsx`):
```jsonc
{
  "nodes": [...], "transitions": [...],            // dentro do reducer de usePDAGraph.js (hist.present)
  "testedWords": [...],                             // APPart1.jsx:48
  "isDrawingUnlocked": false,                       // APPart1.jsx:54
  "hintStage": 0,
  "testMode": "LANGUAGE",                           // APPart1.jsx:53
  "victory": false,                                 // APPart1.jsx:57
  "formal": {                                       // ver §3.1 — içar de APFormalDescription.jsx
    "inE": "", "inSigma": "", "inGamma": "", "inInitial": "", "inBottom": "",
    "elementsValid": false, "rows": [], "cells": {}
  }
}
```

**MT Reconhecedora** (`src/modules/mt-recon/MTReconPart1.jsx`):
```jsonc
{
  "nodes": [...], "transitions": [...],             // dentro do reducer de useTMGraph.js (hist.present)
  "testedWords": [...],                              // MTReconPart1.jsx:64
  "isDrawingUnlocked": false,                        // MTReconPart1.jsx:70
  "hintStage": 0,
  "testMode": "LANGUAGE",                            // MTReconPart1.jsx:69
  "victory": false,                                  // MTReconPart1.jsx:73
  "formal": {                                        // já é estado de topo — só copiar
    "formalAnswers": { "states": "", "sigma": "", "gamma": "", "initial": "", "blank": "", "final": "", "deltaCells": {} },
    "formalElementsValid": false
  }
}
```

**MT Transdutora** (`src/modules/mt/MTPart1.jsx`) — atenção especial ("exercícios
extensos de MT" — L23/L24 têm dezenas de transições e o aluno pode acumular
muitas tentativas; **não trunque `linguagemTests`/`desenhoTests`**, e cubra isso
num teste unitário dedicado usando um nível grande de verdade, ver §6):
```jsonc
{
  "nodes": [...], "transitions": [...],              // dentro do reducer de useTMGraph.js (hist.present)
  "linguagemTests": [...], "desenhoTests": [...],     // MTPart1.jsx:61-62 — DUAS baterias independentes
  "activeTab": "linguagem",                           // MTPart1.jsx:63 — 'linguagem' | 'desenho'
  "victory": false,                                   // MTPart1.jsx:65
  "formal": {
    "formalAnswers": { "states": "", "sigma": "", "gamma": "", "initial": "", "blank": "", "final": "", "deltaCells": {} },
    "formalElementsValid": false
  }
  // MT Transdutora não tem mecânica de "descubra a menor palavra"
  // (isDrawingUnlocked é sempre true — ver CLAUDE.md, seção "Star count for
  // MT Transducer") — não incluir isDrawingUnlocked/hintStage aqui.
}
```

### 3.1 Refatoração necessária: içar estado da Descrição Formal (AFD e AP)

No MT, `formalAnswers`/`formalElementsValid` **já vivem no orquestrador**
(`MTPart1.jsx`/`MTReconPart1.jsx`) — só copiar para o payload. No AFD e no AP,
hoje esse estado vive **dentro do componente filho**
(`src/modules/afd/FormalDescriptionModal.jsx` linhas 29-40,
`src/modules/ap/components/APFormalDescription.jsx` linhas 20-30) e reseta
sozinho sempre que o modal abre (`useEffect` em `FormalDescriptionModal.jsx:42-50`).

Transforme os dois em componentes controlados: aceitar `initialValues` (objeto
com o mesmo shape do payload `formal` acima) e emitir um `onStateChange(snapshot)`
a cada mudança relevante (um único `useEffect` com todas as peças de estado nas
deps, debounced pelo hook de persistência — não pelo componente). Ao montar,
usar `initialValues` como inicializador do `useState` em vez do array/string
vazio hardcoded; o `useEffect` de reset ao abrir (`isOpen`) só deve zerar se
**não** houver `initialValues` (senão hidrata e imediatamente apaga o que acabou
de restaurar). Escreva isso com TDD: antes de tocar no componente, extraia a
lógica de "qual snapshot representa o estado atual do formulário" para uma
função pura testável (mesmo padrão de `validateAFDPure`/`mergeSymbols` já
exportados de `useAFDGraph.js`).

## 4. Pontos de integração exatos (onde plugar carregar/salvar)

Todos os 4 orquestradores têm uma função `loadLevel` — é o ponto certo para
hidratar, **depois** do reset em branco que já existe (sobrescrever com os
valores salvos quando houver sessão válida para aquele `moduleKey`+`levelId`):
- `AFDPart1.jsx:266` (`const loadLevel = useCallback((level) => {...`, síncrona)
- `APPart1.jsx:224` (síncrona)
- `MTReconPart1.jsx:282` (`async`, por causa do `import()` dinâmico — hidrate
  só depois do `await loadMTReconLevel(...)` resolver)
- `MTPart1.jsx:239` (`async`, mesma observação)

`useTMGraph.js` (`reset` — linha ~38: `dispatch({ type: 'RESET', next: EMPTY })`)
e `usePDAGraph.js` (`reset` — mesmo padrão) hoje **não aceitam payload** — o
`EMPTY` está hardcoded. Estenda a assinatura para `reset(initial = EMPTY)` nos
dois, preservando o comportamento atual quando chamado sem argumento (todo
outro call-site continua funcionando sem mudança). Escreva o teste disso em
`src/__tests__/useHistory.test.js` como referência de estilo (já existe um
teste de reducer puro lá — sem precisar montar React).

Salvamento: debounced (~400–600ms) via `useEffect` observando o estado de
domínio relevante, dentro de um hook novo compartilhado (ver §5). Gatilho de
limpeza da sessão salva: quando o aluno chega na tela de vitória **e** clica em
"Voltar ao Menu" ou "Próxima" (`EndScreen.jsx` — `onMenu`/`onNext`) — ou seja,
enquanto ele não sair da fase depois de vencer, o F5 continua restaurando a
vitória; só ao sair de fato é que a sessão daquela fase é apagada (a fase
volta a abrir em branco na próxima vez, igual ao comportamento atual para
fases já concluídas). Nunca apagar por timeout nem por tamanho.

## 5. Onde colocar o código novo

Nova pasta `src/modules/shared/persistence/`, seguindo o mesmo padrão de
`src/modules/shared/useWordGuessGame.js`/`wordExercises/` (lógica pura separada
de React sempre que possível — lembrando que `vitest.config.js` roda em
`environment: 'node'`, **sem jsdom/DOMParser**; qualquer função que precise ser
testada por Vitest tem que ser JS puro, sem depender de `window`/`document`):

- `sessionSnapshot.js` — `buildSnapshot(moduleKey, levelId, payload)`,
  `isValidSnapshot(raw, moduleKey, levelId)` (schemaVersion + shape check,
  nunca lança — retorna `{ ok, reason }` como `validateAFDPure`),
  `SCHEMA_VERSION`. 100% puro, testável direto no Vitest.
- `storageAdapter.js` — `safeGetItem`/`safeSetItem`/`safeRemoveItem`, cada um
  com `try/catch` (quota excedida, modo privado, `localStorage` desabilitado —
  nenhum destes pode quebrar a tela). Aceite o `storage` como parâmetro
  (default `globalThis.localStorage`) para poder testar com um Map em memória
  no Vitest sem precisar de jsdom — repare que **nenhum código hoje no
  projeto testa nada que toque `localStorage`** (`App.jsx`,
  `AFDPart2.jsx`, `services/telemetry.js` só são cobertos por Playwright);
  não quebre esse padrão adicionando um teste que dependa de jsdom — a
  injeção de storage resolve isso sem sair do `environment: 'node'`.
- `useLevelSessionPersistence.js` — hook fino: recebe `moduleKey`, `levelId`,
  o payload atual (objeto memoizado) e um setter/`onHydrate`; internamente usa
  `sessionSnapshot.js` + `storageAdapter.js`. Não precisa (nem dá, sem jsdom)
  de teste unitário próprio — cobertura vem do Playwright (§6).
- `exportImportFile.js` — só a parte que toca `Blob`/`URL.createObjectURL`/
  `<a download>`/`FileReader` (glue de navegador, sem lógica de negócio —
  mantenha isso separado de `sessionSnapshot.js` justamente para não
  contaminar o que é puro/testável em Node com o que só roda em browser).

## 6. Plano de execução — TDD, com checkboxes (siga esta ordem)

Vá atualizando um arquivo `docs/PLAN_SESSAO_E_EXPORTACAO.md` conforme avança,
**no mesmo formato de `docs/OPTIMIZATION_PROGRESS.md`**: cada item marcado
`[x]` traz o que foi feito, resultado de `npm test`, e testes manuais/Playwright
relevantes; itens adiados ou com trade-off usam `[~]` com a justificativa —
mesma cultura de registrar decisões que já existe no repo (ver ADR 0007).

- [ ] **0. ADR 0011** (`docs/adr/0011-persistencia-de-sessao-e-exportacao-json.md`,
      seguindo `docs/adr/TEMPLATE.md`) — registre a decisão do §2/§3 (schema
      único por módulo+fase, `uid` nunca persistido, o que fica de fora e por
      quê, formato `.json` em vez de XML/JFLAP). Adicione a linha no índice de
      `docs/adr/README.md`.

- [ ] **1. `sessionSnapshot.js` + testes primeiro**
      Escreva os testes em `src/__tests__/sessionSnapshot.test.js` ANTES da
      implementação: schema válido/roundtrip para os 4 `moduleKey`; grafo
      não-determinístico (AFD) e com estado sem inicial/final salvos e
      restaurados sem alteração; transições em branco; `schemaVersion`
      incompatível é rejeitado sem lançar exceção; payload de um módulo não
      "vaza" campo de outro (ex.: `linguagemTests` não deve aparecer fora do
      `mt-trans`); fixture baseada em um nível grande de MT (L23 ou L24 — leia
      `src/levels_data/mt/L23.js`/`L24.js` só para saber a forma dos dados,
      não precisa usar o `guidedLesson` inteiro) com muitas transições e uma
      lista longa de `linguagemTests`/`desenhoTests` (idealmente >100 entradas)
      para garantir que nada trunca. Só depois implemente até os testes
      passarem.

- [ ] **2. `storageAdapter.js` + testes** com storage falso (Map) injetado:
      leitura corrompida (`JSON.parse` falha) retorna `null` sem lançar;
      `setItem` que lança (simule quota excedida) é engolido com log, não
      derruba o chamador.

- [ ] **3. `useTMGraph.js`/`usePDAGraph.js`: `reset(initial)`** — teste primeiro
      (reducer puro, sem React) confirmando que `reset()` sem args continua
      idêntico a hoje e que `reset({nodes, transitions})` hidrata `present`
      direto, sem entrar em `past`.

- [ ] **4. Içar Descrição Formal (AFD e AP)** — extraia a lógica de
      validação/parsing que hoje mistura estado e regra dentro de
      `FormalDescriptionModal.jsx`/`APFormalDescription.jsx` para funções puras
      testáveis primeiro (se ainda não existirem isoladas — várias já estão em
      `utils/formalDescriptionLogic.js`, reaproveite), depois torne os
      componentes controlados (`initialValues`/`onStateChange`) como descrito
      no §3.1. Rode a suíte de testes existente (`formalDescription.test.js`)
      depois da refatoração — tem que continuar 100% verde, é o guard-rail de
      não regressão aqui.

- [ ] **5. `useLevelSessionPersistence.js`** + integração nos 4 `loadLevel`
      (hidratação) e nos respectivos `useEffect` de autosave. Sem teste
      unitário (hook React com `localStorage`/timers) — cobertura via
      Playwright no próximo item. Tome cuidado especial com o `async
      loadLevel` dos 2 módulos de MT (hidrate só após o `await`).

- [ ] **6. E2E Playwright (Feature A)** — um spec por módulo (seguindo o
      padrão de nomes já usado, ex. `e2e/afd1_flow.spec.js`):
      `e2e/session_persistence_afd1.spec.js`,
      `e2e/session_persistence_ap.spec.js`,
      `e2e/session_persistence_mt_recon.spec.js`,
      `e2e/session_persistence_mt_trans.spec.js`. Cada um cobrindo no mínimo:
      desenhar um grafo parcial (incluindo um caso propositalmente
      não-determinístico/estado incompleto) → `page.reload()` → grafo idêntico
      continua lá; testar 2-3 palavras → reload → histórico intacto;
      descobrir a menor palavra → reload → canvas continua destravado;
      preencher parte da Descrição Formal → reload → campos continuam
      preenchidos; sair para o Menu e voltar pra MESMA fase (sem reload) →
      idêntico; vencer a fase, clicar "Voltar ao Menu", reabrir a mesma fase →
      abre em branco (sessão limpa). Para MT Transdutora, cobrir as duas abas
      (`linguagem`/`desenho`) e confirmar que a aba ativa é restaurada.

- [ ] **7. `exportImportFile.js`** + testes unitários puros da parte
      serialização/validação de arquivo importado (schema errado, JSON
      corrompido, `moduleKey` de outro módulo, `levelId` diferente do nível
      atualmente aberto — defina e teste o comportamento: bloquear com toast
      de erro claro, nunca aplicar parcialmente). **Higiene de segurança
      obrigatória, por ser input de arquivo não confiável do usuário**: usar
      só `JSON.parse` (nunca `eval`/`new Function`); rejeitar antes de
      parsear qualquer arquivo acima de um limite de tamanho razoável (ex.:
      2–5 MB — folgado o bastante para os níveis grandes de MT do item 1,
      mas descarta arquivo malicioso/corrompido gigante sem travar a aba);
      cobrir os dois casos (arquivo grande demais, JSON tecnicamente válido
      mas com profundidade/tamanho de array absurdo) com teste unitário.

- [ ] **8. UI de exportar/importar** — botão novo no `GameHeader.jsx`
      (`src/modules/afd/components/GameHeader.jsx` — repare que o slot
      `secondaryAction` já existe mas está livre nos 4 módulos hoje, veja se
      cabe nele ou se precisa de um slot novo para 2 ações lado a lado) com
      "⬇ Exportar" (baixa `.json`, nome de arquivo tipo
      `turinglab_<moduleKey>_<levelId>_<timestamp>.json`) e "⬆ Importar"
      (input de arquivo oculto + `FileReader`). Toast de sucesso/erro
      reaproveitando `useToast`. Opcional, mas recomendado (consistente com o
      resto do projeto): logar `tipo_evento: 'exportar_fase'`/`'importar_fase'`
      via `logEvent` do `services/telemetry.js`, **só se `hasConsent()`** —
      siga o padrão exato já usado (nunca logar incondicionalmente).

- [ ] **9. E2E Playwright (Feature B)** — `e2e/export_import_json.spec.js`:
      montar um grafo, exportar (capturar o evento `download` do Playwright,
      inspecionar o conteúdo), recarregar a página / abrir noutro nível,
      importar o arquivo salvo, confirmar estado restaurado idêntico; importar
      um arquivo de `moduleKey`/`levelId` incompatível mostra erro sem alterar
      o estado atual.

- [ ] **10. Fechamento** — atualize a seção "Progress persistence" de
      `CLAUDE.md` para descrever o novo mecanismo (hoje ela só menciona
      `turinglab_progress` de estrelas — deixe claro que isso não muda, é um
      mecanismo paralelo). Rode a suíte inteira: `npm run lint`, `npm test`
      (confirme que os ~1080+ testes pré-existentes continuam passando, não só
      os novos), `npm run build`, `npm run test:e2e`. Registre os números finais
      no doc de progresso, igual ao "Resultado final vs. baseline" de
      `docs/OPTIMIZATION_PROGRESS.md`.

## 7. Regras não-negociáveis

- Nunca validar o grafo antes de salvar/exportar — salvar o estado exatamente
  como está, válido ou não.
- Nunca tocar no shape ou na chave de `turinglab_progress`/`turinglab_progress_p2`
  (estrelas) — é um mecanismo separado, já existente, não mexer.
- Nunca importar arquivo estático pesado (`AFD_LEVELS`/`levels_data/mt/*`) num
  arquivo carregado eagerly — se precisar validar `levelId` contra a lista de
  níveis de um módulo, confira como cada `loadLevel`/`goLevel` já faz isso
  hoje e replique o mesmo caminho (lazy, ou `import()` dinâmico no caso do MT)
  em vez de adicionar um import novo no topo do arquivo.
- Não extrair/unificar os 3 motores de canvas (AFD/AP/MT) por causa desta
  tarefa — decisão já tomada e registrada na ADR 0007, fora de escopo aqui.
- `logEvent` só depois de `hasConsent()` — sem exceção.
- Todo teste novo de lógica pura vai em `.js` (nunca `.jsx`) dentro de
  `src/__tests__/`, seguindo `vitest.config.js` (`include:
  ['src/**/*.test.js']`).
- Comentários em português, no estilo já usado nos arquivos vizinhos.
- Ao final, `npm test` tem que estar 100% verde **incluindo os testes que já
  existiam antes** — não é aceitável quebrar `afd_levels.test.js`,
  `formalDescription.test.js`, `useHistory.test.js` etc.
