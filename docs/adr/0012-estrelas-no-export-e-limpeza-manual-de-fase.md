# 0012 — Estrelas no exportar/importar + limpeza de sessão vira ação manual

**Status:** proposta

## Contexto

Depois de usar a Feature B (ADR 0011) na prática, o usuário relatou dois
problemas de uso real:

1. Exportar e reimportar uma fase não trazia de volta as estrelas conquistadas
   — só o estado do exercício (grafo/testes/formal), como decidido na ADR
   0011. Ao mover entre máquinas/navegadores, o progresso em estrelas ficava
   pra trás.
2. O gatilho de limpeza da ADR 0011 ("ao sair da fase depois de vencer, clicar
   Voltar ao Menu/Próxima limpa a sessão salva") se mostrou contraproducente
   na prática: o aluno termina a fase, e a sessão já some antes dele ter a
   chance de exportar aquele estado final — o oposto do que a Feature B
   deveria permitir.

## Decisão

### Estrelas no envelope do arquivo exportado (não no autosave)

O envelope de `sessionSnapshot.js` ganha um campo **opcional** no nível raiz
(irmão de `payload`, não dentro dele): `stars` (inteiro 0-3). Só é preenchido
no momento de **exportar** — o autosave em `localStorage` continua sem tocar
nele (estrelas já sobrevivem a F5 pelo mecanismo próprio de
`turinglab_progress`, não precisam duplicar aqui). Ao **importar**, se
`stars` estiver presente, restaura via o mesmo `updateProgress` de sempre —
que já nunca regride (só sobrescreve se o valor novo for maior). `schemaVersion`
**não muda** (continua 1): um arquivo exportado antes desta ADR, sem o campo
`stars`, continua válido — o campo é tratado como ausente, sem erro.

`updateProgress` (App.jsx) ganha um 4º parâmetro (`logTelemetry = true`).
Restaurar estrelas de um arquivo importado passa `logTelemetry: false` — não
é o aluno terminando a fase agora, é dado histórico voltando; sem isso, cada
import geraria um evento `fim_fase` falso, distorcendo os dados da pesquisa
(IC).

### Limpeza de sessão vira ação manual, com confirmação

A chamada automática de `clearSession()` nos 4 `onMenu`/`onNext` da
`EndScreen` é **removida**. Terminar a fase não apaga mais nada — o estado
completo continua salvo indefinidamente até uma ação explícita do aluno.

Novo botão **"🗑 Limpar Fase"** (só no `GameHeader`, ao lado de
Exportar/Importar — **não** na `EndScreen`, decisão explícita do usuário)
abre um balão de confirmação estilo Maurílio ("Isso vai apagar os dados da
fase — Sim/Não", Sim verde/Não vermelho). Confirmando, limpa
grafo/testes/formal/estado de vitória da fase — **nunca** as estrelas.

A `EndScreen` ganha **2 botões novos** — "⬇ Exportar" e **"🎮 Acessar
Tabuleiro"** — nesta ordem: Voltar ao Menu, ⬇ Exportar, 🎮 Acessar Tabuleiro,
Próxima. "🎮 Acessar Tabuleiro" resolve o problema de acesso ao `GameHeader`
(e portanto ao "🗑 Limpar Fase") sem duplicar a lógica de confirmação na
`EndScreen`: fecha o overlay (`setShowVictoryScreen(false)`/
`setShowImpossibleScreen(false)`) permanecendo na mesma fase — nem navega pro
menu, nem limpa nada. Como esse flag é parte do payload salvo (autosave),
clicar nesse botão também **persiste** a escolha — reabrir a fase depois vai
direto pro tabuleiro. Só "Voltar ao Menu" (sem passar por "🎮 Acessar
Tabuleiro") mantém o flag ligado, e reabrir a fase volta a mostrar a
`EndScreen` com "Próxima" disponível — mesmo comportamento já existente da
ADR 0011 (F5 restaura a tela de vitória).

## Alternativas consideradas

- **Meter `stars` dentro de `payload`** — descartada: `payload` é
  module-specific (allowlist de campos por `moduleKey`) e estrelas não são
  estado do exercício, são metadado de progresso; um campo raiz opcional
  mantém a separação de conceitos clara.
- **Bumpar `schemaVersion` para 2** — descartada: o campo é opcional e
  estritamente aditivo (arquivos antigos continuam válidos), não há motivo
  pra invalidar exports já feitos pelos usuários.
- **Reusar `updateProgress` sem flag** (deixar logar `fim_fase` no import) —
  descartada: contaminaria a telemetria de pesquisa com eventos que não
  representam o aluno terminando a fase de verdade.
- **Manter o gatilho automático, só adicionar Exportar na EndScreen** —
  descartada: não resolve o problema relatado (o aluno pode querer exportar
  bem depois de terminar, não só naquele instante) nem o pedido explícito
  de "não limpar automático".
- **Duplicar "🗑 Limpar Fase" na `EndScreen`** (proposta inicial minha) —
  descartada pelo usuário: prefere resolver o acesso ao `GameHeader` com um
  botão de "voltar pro tabuleiro" em vez de duplicar a ação de limpar (com
  sua confirmação) em dois lugares.
- **"🎮 Acessar Tabuleiro" também limpar/resetar algo** — descartada: o botão
  só fecha o overlay, não mexe em nenhum dado — limpar continua sendo só o
  "🗑 Limpar Fase" do `GameHeader`, com sua própria confirmação.

## Consequências / Trade-offs

- `EndScreen.jsx` (componente compartilhado pelos 4 módulos) ganha 2 props
  novas (`onExport`, `onAccessBoard`) — muda a assinatura de um componente
  central; os 4 orquestradores precisam passar as duas.
- Cada orquestrador precisa de uma função "resetar a fase pro estado em
  branco" reaproveitável tanto por `loadLevel` (fluxo já existente) quanto
  pelo "Limpar Fase" (fluxo novo) — mais uma extração de função compartilhada,
  no mesmo espírito de `applyRestoredPayload` (ADR 0011/item 8 do plano
  anterior).
- Sessões nunca mais se auto-limpam — o `localStorage` acumula estado de
  fases já terminadas indefinidamente até o aluno limpar manualmente (aceito:
  é exatamente o comportamento pedido; o volume por fase já era limitado
  pelo autosave existente, não muda).

## Referências

- ADR anterior: `docs/adr/0011-persistencia-de-sessao-e-exportacao-json.md`
  (decisão original do gatilho de limpeza automática, agora substituída pela
  seção "Limpeza de sessão vira ação manual" acima)
- Plano original desta ADR: `docs/prompts/PROMPT_estrelas_e_limpeza_manual.md`
- Plano de execução: `docs/PLAN_ESTRELAS_E_LIMPEZA_MANUAL.md`
- Código: `src/modules/shared/persistence/`, `src/App.jsx`
  (`updateProgress`), `src/modules/afd/components/EndScreen.jsx`,
  `src/modules/afd/components/GameHeader.jsx`
