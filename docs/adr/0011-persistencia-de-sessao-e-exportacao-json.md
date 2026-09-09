# 0011 — Persistência de sessão por fase + exportar/importar em `.json`

**Status:** aceita

## Contexto

Antes desta mudança, todo o estado de uma fase em andamento (grafo desenhado,
palavras testadas, progresso da mecânica "descubra a menor palavra", Descrição
Formal parcialmente preenchida) vivia só em `useState` do orquestrador — um F5,
queda de internet ou troca de fase e volta perdia tudo, exceto as estrelas já
conquistadas (`turinglab_progress`). Isso penalizava sessões longas, especialmente
nos níveis grandes de MT (L23/L24, dezenas de transições).

## Decisão

Um **documento JSON por (módulo, fase)** — não a instância inteira do React (não
serializável, mistura estado efêmero de UI com estado do exercício) nem uma chave
de `localStorage` por parâmetro (muitas escritas pequenas, difícil manter atômico).
Guardado sob `turinglab_session_v1:<moduleKey>:<levelId>`, separado de
`turinglab_progress`/`turinglab_progress_p2` (que continuam guardando só estrelas).

O mesmo objeto (envelope `{schemaVersion, app, moduleKey, levelId, savedAt,
payload}`) serve tanto ao autosave em `localStorage` (Feature A) quanto ao arquivo
`.json` exportado/importado (Feature B) — um único serializer/parser
(`src/modules/shared/persistence/sessionSnapshot.js`) reaproveitado nas duas
features, em vez de dois formatos paralelos.

Decisões específicas:
- `uid` dos nós **nunca** entra no payload — é regenerado a cada hidratação
  (autosave ou import), igual a quando o aluno adiciona um nó novo.
- O grafo é salvo **exatamente como está no canvas**, mesmo estruturalmente
  inválido (não-determinístico, sem estado inicial/final, transição em branco) —
  nunca validado antes de salvar/exportar.
- `.json` em vez de XML/JFLAP: mais simples de gerar/ler no navegador, sem
  necessidade de compatibilidade com JFLAP para este caso de uso (autosave +
  backup manual entre máquinas).
- Efêmero, fora de escopo (decisão consciente, não omissão): zoom/pan,
  seleção múltipla, pilha de undo/redo, passo da Aula Guiada, rabiscos de lápis
  livre, toasts.
- Gatilho de limpeza: só ao sair da fase depois de vencer (clicar "Voltar ao
  Menu"/"Próxima" no `EndScreen`) — nunca por timeout ou tamanho.

## Alternativas consideradas

- **Serializar a instância inteira do jogo** (todo `useState`/refs do
  orquestrador) — descartada: refs/closures não são serializáveis, e misturaria
  estado de UI efêmero (zoom, undo/redo, toasts) com o que realmente compõe o
  exercício do aluno.
- **Uma chave de `localStorage` por campo** (`..._nodes`, `..._testWords`, etc.)
  — descartada: múltiplas escritas pequenas por autosave, sem atomicidade (um
  autosave parcial no meio de uma escrita deixaria o estado inconsistente entre
  chaves).
- **XML compatível com JFLAP** — descartada por decisão do usuário: não há
  necessidade de interoperar com JFLAP aqui; `.json` é mais simples de
  implementar e depurar, e cobre o caso de uso real (autosave local + backup
  manual portável entre máquinas).

## Consequências / Trade-offs

- `useTMGraph.js`/`usePDAGraph.js` precisaram de `reset(initial)` (antes só
  aceitava reset para o grafo vazio) para poder hidratar o reducer a partir de
  um snapshot salvo sem passar por `past`/histórico de undo.
- AFD e AP precisaram içar o estado da Descrição Formal do componente filho
  (`FormalDescriptionModal.jsx`/`APFormalDescription.jsx`) para o orquestrador —
  MT já guardava esse estado no orquestrador, então só precisou copiar para o
  payload.
- Arquivo `.json` importado é input do usuário — tratado como hostil por padrão
  (limite de tamanho antes de parsear, `JSON.parse` nunca `eval`, falha fechada
  em schema/shape inválido) — ver `exportImportFile.js`.
- Autosave debounced (~400-600ms) por `useEffect` — custo de escrita em
  `localStorage` a cada mudança de domínio relevante, mitigado pelo debounce.

## Referências

- Plano original: `docs/prompts/PROMPT_persistencia_sessao_e_exportacao.md`
- Progresso de execução: `docs/PLAN_SESSAO_E_EXPORTACAO.md`
- Código: `src/modules/shared/persistence/`
