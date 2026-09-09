# Plano — Bateria de validação insuficiente em MT (Reconhecedora + Transdutora)

Origem: bug relatado pelo usuário em MT Reconhecedora L06 — desenhou o
autômato do gabarito faltando as transições `q5,b→q5` e `q5,B→q5`
(auto-loop de "pular mais um símbolo igual enquanto procura o par"). A
palavra `"bbaa"` (2 a's, 2 b's — deveria ser ACEITA) travaria no estado sem
essa transição, mas **"✓ Validar MT" mesmo assim aprovou o autômato**.

**Status: investigação concluída, plano em revisão — nada foi codificado
ainda.**

## 1. Causa raiz

Ambos os módulos de MT validam o autômato do aluno contra o autômato do
aluno rodando uma **bateria de palavras fixa**, nunca contra a definição
formal da linguagem (`src/modules/mt/utils/tmAlgorithms.js`):

- **MT Reconhecedora** (`fuzzTMRecognizer`): roda `level.acceptedWords` e
  `level.rejectedWords` (listas **escritas à mão** por nível) contra o grafo
  do aluno. Se o grafo aceita tudo que devia aceitar e rejeita tudo que devia
  rejeitar **dentro dessa lista**, passa — mesmo que esteja incompleto para
  palavras fora da lista.
- **MT Transdutora** (`fuzzTMTransducer`): roda `level.testWords` e só
  confere se a MT **termina em estado final** — nunca compara o conteúdo
  final da fita com `level.validate(word)`. Essa comparação existe
  (`extractTapeOutput` + `level.validate`), mas só na aba "✏ Desenho"
  (`testWord()` em `MTPart1.jsx:404-435`), que é uma ferramenta manual/
  opcional do aluno — **não é chamada por `validate()` (linha 438-508), o
  handler real do botão "✓ Validar MT"**.

No caso do L06: `q5` (estado "achei um 'b', procurando um 'a'") precisa de
auto-loop em `b`/`B` só quando há **2+ símbolos iguais consecutivos** antes
do par — nenhuma palavra em `acceptedWords` (`["","ab","ba","abba","baba",
"aabb","abab"]`) tem essa forma partindo por 'b' primeiro, então a bateria
nunca força essa transição a existir.

## 2. Auditoria — verificação em TODOS os exercícios

Metodologia (mutation testing): para cada nível, pega o grafo do gabarito
oficial (o mesmo já usado pelos testes existentes, via o passo final da aula
guiada) e testa, transição por transição:

- **MT Reconhecedora**: remove a transição e roda `fuzzTMRecognizer` de
  novo. Se ainda passar (`ok:true`), a bateria não notaria um aluno que
  "esqueceu" aquela transição.
- **MT Transdutora**: troca só o `write` da transição (mantém
  `read`/`move`/`from`/`to` — controle da máquina intacto) e roda
  `fuzzTMTransducer` de novo. Se ainda passar, a bateria não notaria um
  aluno cuja MT aceita certo mas **escreve errado**.

### Resultado — MT Reconhecedora (18 níveis)

| Nível | Transições não cobertas pela bateria | Palavra que fecha o gap (verificado) |
|-------|---|---|
| L06 | `q3→q3 (b;b,L)`, `q2→q2 (b;b,R)`, `q2→q2 (A;A,R)` | **`"bbaa"`** — fecha as 3 de uma vez |
| L08 | 6 transições (`q11→q12`, `q12→q7`, `q6→q6`, `q12→q12`, `q8→q8`, `q10→q10`) | `"aaaabccc"` + `"aaaccc"` fecham 5/6 — `q12→q12 (a;a,L)` não achei palavra ≤8 caracteres, precisa checar à mão |
| L09 | `p1→p3 (□;□,L)` | Não achei palavra ≤8 que a exercite — checar à mão se é morta (padrão `KNOWN_DEAD_TRANSITIONS` já usado no teste) ou se falta caso de teste maior |
| L10 | 6 transições (`q5→q5` ×2, `q6→q4`, `q4→q4` ×2, `q7→q7`) | **`"bbcc"`** — fecha as 6 de uma vez |
| L01-L05, L07, L11-L18 | nenhuma | — já ok |

**4 de 18 níveis afetados.**

### Resultado — MT Transdutora (21 níveis)

**21 de 21 níveis afetados** — todo nível tem pelo meno uma célula da tabela
δ cujo `write` poderia estar errado sem `fuzzTMTransducer` notar (de poucas
células isoladas a praticamente a tabela toda em níveis com muitos estados
de "carry", ex. L11/L19-L23). Isso não é uma lista de níveis pra corrigir
individualmente — é **a função de validação em si que não confere o
resultado da transdução**, em nenhum nível.

### AP (Autômatos com Pilha) e AFD — não auditados a fundo, risco menor

Não rodei a mesma mutação neles nesta rodada (escopo: o usuário relatou em
MT). Pelo código, o risco estrutural é bem menor:
- **AP** (`pdaAlgorithms.js` `buildBattery`): gera a bateria por **BFS
  exaustivo de todas as palavras até 7 caracteres** contra o gabarito real —
  não é uma lista escrita à mão, então uma transição só necessária pra
  padrões repetidos tende a aparecer nessa enumeração. Ainda vale confirmar
  com o mesmo script de mutação num momento futuro (risco residual: bugs que
  só aparecem em palavras >7 caracteres).
- **AFD** (`afd_levels.test.js`): já tem fuzz BFS até 8 caracteres contra
  cada grafo de nível, documentado em CLAUDE.md. Mesmo raciocínio.

## 3. Plano de correção

**Disciplina TDD em todo item abaixo**: primeiro o teste (RED — comprovando
que ele falha com o código/dado atual), só depois o conserto (GREEN). Isso
vale inclusive pros dados de nível (a "implementação" de um item de bateria
é o array `acceptedWords`/`testWords`, então o teste de mutação generalizado
É o teste que precisa nascer falhando antes de qualquer palavra nova entrar).
Cada checkbox, ao ser marcado, ganha uma linha "**Feito:**" abaixo com o
commit e o resultado da suíte (mesmo formato de `docs/PLAN_SESSAO_E_EXPORTACAO.md`)
— nenhum checkbox descreve trabalho já feito hoje; tudo abaixo está por fazer.

### 3.1 — MT Reconhecedora (bug relatado + mesma classe em L08/L09/L10) — ✅ CONCLUÍDO

- [x] **Passo 1 (RED)**: `describe` de mutação adicionada em
  `mt_recon_levels.test.js`. Confirmado RED antes do fix: L06 (3 gaps), L08
  (6), L09 (1), L10 (6) — exatamente os 16 da tabela de §2.
  **Feito:** commit `3d35e7b`.
- [x] **Passo 2 (GREEN) — L06**: `"bbaa"` adicionado a `acceptedWords`.
  **Feito:** commit `3d35e7b` (mesmo commit do teste — RED→GREEN de uma vez
  pro caso do bug relatado). `mt_recon_levels.test.js`: 216/216.
- [x] **Passo 3 (GREEN) — L10**: `"bbcc"` adicionado. **Feito:** commit
  `d16aa67`.
- [x] **Passo 4 (GREEN) — L08**: `"aaaabccc"` + `"aaaccc"` fecharam 5/6; a
  transição restante (`q12→q12 (a;a,L)`) **não é morta** — só precisava de
  palavra maior (busca automática ia só até comprimento 8). Achada
  `"aaaaabcccc"` (comprimento 10) por busca estendida até 12. **Feito:**
  commit `e1fbd62`.
- [x] **Passo 5 (GREEN) — L09**: `p1→p3 (□;□,L)` investigada e provada
  **estruturalmente invisível à bateria por construção da linguagem** (não
  é sobre alcançabilidade — é alcançável — é que remover essa transição
  NUNCA muda o veredito de nenhuma palavra possível, verificado
  computacionalmente com 5 palavras). Documentada em
  `KNOWN_BATTERY_COVERAGE_GAPS` (nova allowlist, distinta de
  `KNOWN_DEAD_TRANSITIONS`). **Feito:** commit `4404154`.
- [x] **Passo 6**: `mt_recon_levels.test.js` completo (216/216) e suíte
  inteira (`npm test`, 2106/2106) — 0 regressão. **Feito:** verificado antes
  do E2E abaixo.

**Extra (não estava no plano original, adicionado nesta rodada):** E2E de
ponta a ponta reproduzindo o bug pela UI real (§6) — `mt_recon_battery_precision.spec.js`,
confirmado sensível ao fix (falha sem "bbaa" em `acceptedWords`, passa com).
**Feito:** commit `43519c9`. Suíte e2e completa: 80/80.

### 3.2 — MT Transdutora (achado mais sério — decisão de comportamento visível) — ✅ CONCLUÍDO (núcleo) — ⚠️ 1 item aberto (ver abaixo)

- [x] **Decisão**: confirmada pelo usuário — `validate()`/`fuzzTMTransducer`
  passa a comparar a fita final de cada `testWord` com `level.validate(word)`
  **além** de checar estado final.
- [x] **Passo 1 (RED)**: fixture "aceita mas escreve errado" em
  `mt_trans_levels.test.js` — confirmado `ok:true` (bug reproduzido) antes
  do fix.
- [x] **Passo 2 (GREEN)**: `fuzzTMTransducer` (`tmAlgorithms.js`) agora
  extrai a fita e compara com `level.validate(word)`; motivo novo
  `'wrong-output'` com `{expected, got}`. Achado curioso: o comentário da
  função já dizia fazer essa comparação — nunca tinha sido implementado
  (comentário aspiracional). **Feito:** commit `75abf2e`.
- [x] Mensagem de erro: o fallback do ternário em `MTPart1.jsx` **já
  esperava** `res.expected`/`res.got` (código morto até agora, nunca
  alcançável) — só reescrevi o texto, nenhuma lógica nova de UI. **Feito:**
  commit `75abf2e`.
- [x] **Passo 3**: `describe` de mutação de `write` em `mt_trans_levels.test.js`.
  **Achado importante, não previsto no plano original**: mesmo depois do
  fix, 14 dos 21 níveis (as MTs de tabela — multiplicação L16-L23, cifra
  L11, duplicação L06/L10, soma L24) ainda têm células cujo `write` errado
  não muda a saída das `testWords` de hoje (combinação de dígito/carry não
  exercitada). Implementado como **RATCHET** (`KNOWN_WRITE_GAP_CEILING`,
  não allowlist silenciosa) — bloqueia regressão nova, documenta o estado
  atual sem fingir estar tudo coberto. Fechar de vez é trabalho de
  CONTEÚDO (expandir `testWords` nível a nível), não de código — **fica
  registrado como item em aberto** (ver "Pendência" abaixo), não escondido.
  **Feito:** commit `75abf2e`.
- [x] **Passo 4**: suíte completa — nenhum dos 21 gabaritos oficiais
  precisou de correção (já produziam saída certa; só o validador do ALUNO
  não conferia isso). **Feito:** `npm test` 2129/2129.

**Extra (mesmo padrão do 3.1):** E2E de ponta a ponta —
`mt_trans_battery_precision.spec.js`, grafo real do L01 com 1 write
mutado isolado, confirmado sensível ao fix. **Feito:** commit `782d7b8`.
Suíte e2e completa: 81/81.

**Pendência registrada (não fechada nesta rodada):** reduzir o teto do
ratchet (`KNOWN_WRITE_GAP_CEILING`) nos 14 níveis afetados exige expandir
`testWords` pra exercitar toda combinação de dígito/carry das tabelas —
trabalho de conteúdo por nível (potencialmente grande em L11/L17-L23),
não decidido/priorizado ainda. Ver §4 de "Decisão" — mesma técnica
BFS+oráculo recomendada ali serviria aqui.

### 3.3 — Fora de escopo desta rodada (registrado, não abandonado)

- [ ] Auditoria de mutação equivalente em AP (`pdaAlgorithms.js`) e
  confirmação formal de que a bateria BFS-até-7 do AFD/AP não tem gaps
  residuais — menor prioridade (risco estrutural bem mais baixo, ver §2).

## 4. Decisão: como gerar as palavras de correção — regex vs. lista fixa vs. BFS+oráculo

Pergunta levantada: gerar as palavras de teste via **regex** (e simular contra
o autômato) é melhor que **lista fixa** escrita à mão, dado que existem vários
tipos de MT?

### Regex-gerado
- **Vantagem**: rápido de escrever, fácil de garantir que toda palavra gerada
  "deveria" ser aceita (se o regex está certo).
- **Problema fatal pra MT especificamente**: regex só descreve **linguagens
  regulares**. MT existe justamente pra ir ALÉM disso — e vários níveis reais
  já são contraexemplo direto:
  - **L06** (`|w|_a = |w|_b`) é **livre de contexto, não regular** — não
    existe regex (nem com backreference) que descreva essa linguagem pra
    qualquer tamanho de palavra. Um gerador regex simplesmente não consegue
    produzir/rotular corretamente as palavras desse nível.
  - **MT Transdutora não é sobre linguagem, é sobre função** (L11: cifra de
    substituição `"ABC"→"DEF"`; L16: multiplicação; L24: soma com carry).
    Regex gera/casa strings — não computa uma transformação. Mesmo pros
    níveis onde as palavras de ENTRADA são regulares (ex. `[01]+`), regex não
    ajuda a saber qual é a **saída esperada**; isso sempre exige uma função-
    oráculo de verdade, regex ou não.
  - Pra linguagens que SÃO regulares (poucos níveis), regex ajudaria a gerar
    entradas — mas exigiria um regex por nível escrito à mão, com o mesmo
    risco de erro humano que a lista fixa já tem hoje, só que numa forma mais
    difícil de revisar visualmente que uma lista de palavras.

### Lista fixa (o que existe hoje)
- **Vantagem**: funciona pra qualquer classe de linguagem/função (é só o
  autor do nível escolhendo palavras "de propósito").
- **Problema**: é exatamente a causa raiz do bug — cobertura depende da
  imaginação de quem escreveu a lista. A auditoria (§2) provou isso: 4/18
  níveis de Reconhecedora e 21/21 de Transdutora têm buracos reais.

### BFS + oráculo (recomendado — já é o padrão usado em AP, `pdaAlgorithms.js` `buildBattery`)
Gera TODAS as palavras até um tamanho N por busca em largura sobre o
alfabeto (sem qualquer suposição sobre a classe da linguagem) e usa uma
função-oráculo pra rotular cada uma:
- **Recognizer**: oráculo = `simulateTM` no **gabarito** (ou, melhor ainda
  onde for prático, um predicado formal independente do grafo, tipo
  `contaA(w) === contaB(w)` pro L06 — reduz o risco de "testar o grafo contra
  ele mesmo").
- **Transducer**: oráculo = `level.validate(word)`, que **já existe por
  nível** — só precisa enumerar entradas e comparar a fita extraída contra
  ele, em vez de só checar "chegou em estado final".
- **Vantagem decisiva**: não depende da linguagem ser regular — funciona
  igual para L06 (livre de contexto), pra níveis recursivos/arbitrários, e
  pra transdução (função, não linguagem). É estritamente mais geral que
  regex E não tem o problema de cobertura da lista fixa, porque testa
  exaustivamente até o tamanho N, não só os casos que alguém lembrou de
  escrever.
- **Custo**: só cresce exponencialmente com N e o tamanho do alfabeto — na
  prática N=6 a 8 já é suficiente (mesmo valor usado em AFD/AP hoje) e o
  próprio script de auditoria desta rodada achou contraexemplos ≤8 pra quase
  todos os gaps.
- Mantém espaço para **`extraWords`** (palavras longas/curadas à mão,
  mesmo parâmetro que `buildBattery` do AP já tem) pra casos didáticos
  específicos que valha a pena fixar allém do BFS.

### Veredito
**BFS + oráculo vence os dois outros de forma clara para MT**, porque a
limitação do regex (só linguagens regulares) colide de frente com o motivo
de MT existir no jogo. Recomendo:
1. Migrar a geração de `acceptedWords`/`rejectedWords` (Reconhecedora) e do
   par entrada/saída esperada (Transdutora) pro padrão BFS+oráculo, igual ao
   AP.
2. **Além disso** (não em vez disso), manter o teste de mutação (§3) como
   guarda permanente — ele mede a PRECISÃO da bateria resultante
   independente de como ela foi gerada, então continua valioso mesmo depois
   da troca pra BFS (ex.: BFS com N pequeno demais ainda pode deixar um gap,
   e o teste de mutação pega isso).

## 5. Casos de teste (unitários — Vitest)

Nomes concretos, pra cada item de §3 ter um teste rastreável (não só uma
descrição em prosa):

### `src/__tests__/mt_recon_levels.test.js`
Nova `describe('MT Reconhecedora — nenhuma transição do gabarito é removível sem que a bateria note')`:
- `it('${level.label}: remover qualquer transição do gabarito faz a bateria falhar')`
  — um `it()` por nível (18 total), igual ao padrão já usado nas outras
  `describe` do arquivo. Dentro, itera as transições do grafo (via
  `lastGraphStep`, já existe no arquivo) e reusa a allowlist
  `KNOWN_DEAD_TRANSITIONS` (já existe) pra transições confirmadas
  inalcançáveis.
- Resultado esperado ANTES do conserto (RED): falha em L06 (3 gaps), L08 (6),
  L09 (1), L10 (6) — exatamente a tabela de §2.
- Resultado esperado DEPOIS (GREEN): só L08 e L09 podem seguir "falhando" se
  a transição remanescente for adicionada a `KNOWN_DEAD_TRANSITIONS` (nesse
  caso o `it()` passa porque a exceção está documentada, não porque o gap
  desapareceu escondido).

### `src/__tests__/mt_trans_levels.test.js`
- `describe('MT Transdutora — nenhuma célula de write é trocável sem que a validação note')`
  com `it('${level.label}: trocar o write de qualquer transição faz a bateria falhar')`
  — um `it()` por nível (21 total). RED hoje: todos os 21 falham (ver tabela
  de §2, ex. L11 falha em 146/148 mutações).
- `describe('MT Transdutora — aceitar em estado final não basta, a fita tem que bater')`:
  - `it('MT que aceita mas escreve símbolo errado numa célula não afetada pelo controle deve falhar na validação')`
    — fixture sintética: grafo mínimo de 2 estados que aceita qualquer palavra
    do alfabeto de teste E escreve um símbolo fixo errado (não lido de volta
    em nenhuma transição, pra isolar exatamente o buraco encontrado). RED
    (`ok:true`) antes do Passo 2 de 3.2, GREEN (`ok:false`) depois.
  - `it('MT com fita correta continua passando (sem falso-positivo do endurecimento)')`
    — mesma fixture, mas com o write certo; nunca pode quebrar.

## 6. Testes E2E (Playwright)

**Gap identificado nesta revisão: o plano original não tinha nenhum E2E —
os specs de MT existentes (`mt_recon_trace_on_failure.spec.js`,
`mt_recon_menor_palavra_grid.spec.js`, `session_persistence_mt_recon/trans.spec.js`)**
cobrem o painel de trace e a persistência de sessão, mas nenhum verifica o
comportamento de "✓ Validar MT" acertar/errar de ponta a ponta pela UI —
só por chamada direta de `fuzzTMRecognizer`/`fuzzTMTransducer` (unitário).
Sem isso, um bug de FIAÇÃO (ex. o botão parar de chamar a função certa)
passaria os testes unitários e não seria pego.

- [x] **Novo spec `e2e/mt_recon_battery_precision.spec.js`**: reproduz o bug
  relatado de ponta a ponta. **Decisão de implementação**: em vez de clicar
  as ~19 transições do L06 no canvas (muito frágil), monta o grafo oficial
  MENOS as 3 transições faltantes e injeta via "⬆ Importar" (reaproveitando
  a infra de export/import de sessão, ADR 0011) — testa exatamente o mesmo
  caminho de código que "✓ Validar MT" usa (`g.nodes`/`g.transitions` do
  estado do canvas), só monta o estado de forma mais robusta que clique-a-
  clique. Confirmado sensível ao fix (RED sem "bbaa" em `acceptedWords`,
  GREEN com). **Feito:** commit `43519c9`.
- [ ] **Novo spec `e2e/mt_trans_battery_precision.spec.js`** (só depois da
  decisão de 3.2 confirmada e implementada): desenha uma MT Transdutora que
  aceita mas escreve errado numa célula, clica "✓ Validar MT" — espera
  toast de erro específico (fita errada), não ★★.
- [ ] Rodar `npx playwright test` completo (79 specs hoje) depois de cada
  novo spec — 0 regressão.

## Casos de aceite

### CA1 — L06 aceita corretamente um autômato correto mas sem a bateria antiga passar um incompleto
**Dado** o autômato oficial do L06 com a transição `q2→q2 (b;b,R)` removida,
**quando** "✓ Validar MT" é clicado,
**então** o jogo mostra erro (rejeita "bbaa"), não sucesso.

### CA2 — Mesmo padrão fechado em L08/L09/L10
**Dado** cada um dos 3 outros níveis afetados com sua respectiva transição
identificada removida,
**quando** validado,
**então** falha (mesma lógica do CA1).

### CA3 — Teste de regressão de MT Reconhecedora pega qualquer transição não coberta, em qualquer nível (atual ou futuro)
**Dado** qualquer nível de MT Reconhecedora (existente ou adicionado depois),
**quando** a suíte roda,
**então** falha se existir uma transição do gabarito removível sem que
`acceptedWords`/`rejectedWords` note — a menos que esteja explicitamente
documentada como morta.

### CA4 — MT Transdutora: aceitar com fita errada passa a falhar (após decisão confirmada)
**Dado** uma MT que aceita "a" em estado final mas escreve algo diferente do
esperado por `level.validate('a')`,
**quando** "✓ Validar MT" é clicado,
**então** o jogo mostra erro específico (fita errada), não ★★.

### CA5 — Nenhuma regressão nos gabaritos reais existentes
**Dado** os 18 gabaritos de MT Reconhecedora e os 21 de MT Transdutora
(depois de qualquer correção de bateria/gabarito necessária),
**quando** a suíte completa roda,
**então** todos os gabaritos continuam passando sua própria validação (0
falso-negativo introduzido pelo endurecimento da checagem).
