# Prompt de execução — Estrelas no export/import + limpeza manual de fase

> Como usar: continuação de `PROMPT_persistencia_sessao_e_exportacao.md`
> (Fases A e B já implementadas e testadas — ver `docs/PLAN_SESSAO_E_EXPORTACAO.md`,
> ADR 0011). Este prompt registra 2 ajustes pedidos pelo usuário depois de usar
> a Feature B na prática. **Planejamento apenas** — não implementar até o plano
> (`docs/PLAN_ESTRELAS_E_LIMPEZA_MANUAL.md`) ser revisado e aprovado.

## 0. Contexto

Depois de exportar e reimportar uma fase, o usuário reportou 2 problemas:

1. **As estrelas não vêm no export/import.** O schema atual (ADR 0011) exclui
   `turinglab_progress` de propósito — decisão correta pra sessão/autosave, mas
   o usuário quer que exportar/importar carregue TAMBÉM o número de estrelas
   daquela fase específica, pra não perder o progresso ao mover entre
   navegadores/máquinas.

2. **Terminar a fase limpa a sessão automaticamente.** Hoje (ADR 0011, gatilho
   de limpeza), clicar "Voltar ao Menu"/"Próxima" na tela de vitória (ou na
   tela "Impossível") chama `clearSession()` — a fase reabre em branco da
   próxima vez. O usuário quer o oposto: **terminar a fase não deve limpar
   nada automaticamente** — o estado completo (grafo, testes, formal) deve
   continuar lá, exatamente pra permitir exportar depois de terminar. A
   limpeza vira uma ação manual e explícita.

## 1. Pedido 1 — Estrelas no export/import

- **Exportar**: o arquivo `.json` passa a incluir o número de estrelas atual
  daquela fase (0 a 3, lido de `turinglab_progress`/`turinglab_progress_p2`
  conforme o módulo).
- **Importar**: se o arquivo trouxer estrelas, restaura via o mesmo mecanismo
  de sempre (`updateProgress`) — **nunca regride** (já é o comportamento
  padrão de `updateProgress`: só sobrescreve se o novo valor for maior).
- **Não é telemetria de fim de fase de verdade**: `updateProgress` hoje sempre
  dispara `logEvent({tipo_evento:'fim_fase', ...})`. Restaurar estrelas de um
  arquivo importado **não é** o aluno terminando a fase agora — é dado
  histórico voltando. Precisa de um jeito de restaurar o número sem gerar um
  evento de telemetria falso (distorceria os dados de pesquisa da IC).
- `turinglab_session_v1:*` (autosave/localStorage) **continua** sem tocar em
  estrelas — só o ENVELOPE do arquivo exportado ganha o campo novo. Autosave
  não precisa disso (estrelas já sobrevivem a F5 pelo mecanismo próprio).

## 2. Pedido 2 — Parar de limpar automático + botão manual "Limpar Fase"

- Remover a chamada automática de `clearSession()` dos 4 `onMenu`/`onNext` da
  `EndScreen` (AFD, AP, MT-Recon, MT-Trans) — vitória E tela "Impossível".
- Novo botão **"🗑 Limpar Fase"** na tela de jogo (`GameHeader`, ao lado de
  Exportar/Importar). Ao clicar, abre um **balão de fala** (mesmo estilo
  visual do balão do Maurílio já usado no jogo) com a pergunta **"Isso vai
  apagar os dados da fase (Sim/Não)"** — botão **Sim verde**, botão **Não
  vermelho**. Confirmando, limpa TUDO da fase salva (grafo, testes, formal,
  vitória) — **exceto as estrelas**, que nunca são tocadas por essa ação.
- **Resolvido nesta rodada (2ª iteração)**: a `EndScreen` (tela de
  vitória/impossível) ganha **4 botões**, nesta ordem: "Voltar ao Menu",
  **"⬇ Exportar"** (novo, pedido explícito), **"🎮 Acessar Tabuleiro"** (novo),
  "Próxima" (quando houver próxima fase). **Sem** botão "Limpar" na
  `EndScreen` — decisão explícita do usuário ("sem o limpar, somente
  adicione o exportar").
  - **Por que precisava de um 4º botão**: a `EndScreen` é um overlay de tela
    cheia (`position:fixed; inset:0`) que cobre o `GameHeader` por baixo.
    Sem limpar automaticamente (pedido 2), reabrir uma fase já vencida
    **sempre** restaura `showVictoryScreen: true` e reabre a `EndScreen` na
    hora (mesmo comportamento de F5 já existente da Fase A) — sem um jeito
    de dispensar esse overlay ficando na mesma fase, o `GameHeader` (e o
    "🗑 Limpar Fase" nele) ficaria permanentemente inacessível pra qualquer
    fase já vencida.
  - **"🎮 Acessar Tabuleiro"**: fecha o overlay (`setShowVictoryScreen(false)`/
    `setShowImpossibleScreen(false)`) SEM navegar pro menu e SEM limpar a
    sessão — volta pro canvas normal da mesma fase, com o `GameHeader`
    (Exportar/Importar/Limpar) acessível de novo.
  - **Efeito colateral intencional, não um bug**: como esse flag faz parte
    do payload salvo (autosave), clicar em "🎮 Acessar Tabuleiro" também
    **persiste** essa escolha — reabrir a fase depois vai direto pro
    tabuleiro, sem reabrir o balão de vitória de novo. Só clicar em "Voltar
    ao Menu" (sem passar por "🎮 Acessar Tabuleiro" antes) mantém o flag
    ligado — reabrir a fase volta a mostrar a `EndScreen` com "Próxima"
    disponível, exatamente como no comportamento já existente da Fase A.

## 3. Escopo

Mesmos 4 módulos-alvo da Fase A/B: AFD Parte 1, Autômatos com Pilha, MT
Reconhecedora, MT Transdutora. Nenhum módulo novo.

## 4. Regras não-negociáveis (herdadas + novas)

- Continua nunca tocando o *shape*/chave de `turinglab_progress`/
  `turinglab_progress_p2` além do valor de estrelas em si — não vira um
  objeto novo, não muda formato.
- `updateProgress` continua "nunca regride" — importar um arquivo com estrelas
  menores que o progresso atual não deve fazer nada.
- "Limpar Fase" nunca apaga estrelas, mesmo que o usuário confirme "Sim".
- Toda decisão de UI (posição exata dos botões, componente do balão) segue o
  padrão visual já existente no jogo (neo-brutalism, Comic Sans, bordas
  pretas, balão do Maurílio) — não inventar um novo sistema de modal.
- TDD nas partes de lógica pura (schema/validação); UI cobre com Playwright,
  mesmo padrão da Fase A/B.
