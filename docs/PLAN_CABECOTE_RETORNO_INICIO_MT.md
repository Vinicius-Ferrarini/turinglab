# Plano — MT tem que validar que o cabeçote volta ao 1º caractere

Origem: usuário relatou em MT Reconhecedora L06, com dois arquivos `.json`
exportados reais como prova:
- `turinglab_mt-recon_MT_RECON_L6_2026-09-09T20-07-22-997Z.json` — autômato
  que aceita `"ab"` mas termina em `q4` (final) com o cabeçote **não** no
  1º caractere da palavra — **não deveria** ser aceito.
- `turinglab_mt-recon_MT_RECON_L6_2026-09-09T20-13-49-096Z.json` — mesmo
  autômato + um estado `q5` (final) que varre de volta (`q4→q4` em `A`/`B`,
  `move:'L'`) até o início e só então aceita — **este sim** deveria ser
  aceito.

**Regra pedida**: ao ACEITAR uma palavra **não-vazia**, o cabeçote da MT tem
que estar sobre o 1º caractere resultante na fita. Palavra vazia (`λ`) é
isenta — não importa onde o cabeçote parou.

**Status: ✅ CONCLUÍDO.** Implementado, testado (unitário + E2E, usando os
2 `.json` reais do usuário como fixture) e commitado — `3001525` (motor +
UI + testes unitários) e `0376c58` (E2E). Suíte final: `npm test` 2131/2131,
`npx playwright test` 85/85, `eslint` 0 erros.

## 1. Definindo a regra com precisão (1ª tentativa estava errada, corrigida)

"1º caractere" não pode ser uma posição fixa (`2`, ou `3` com marcador) —
teria dado FALSO POSITIVO real. Testei 3 versões da regra, nesta ordem,
contra os 39 gabaritos oficiais (18 Reconhecedora + 21 Transdutora):

1. **Posição fixa `2`** (sem contar marcador): reprovou incorretamente os 8
   níveis que usam `startMarker` (L03/L04/L06/L07/L09/L10/L12/L14 da
   Transdutora) — eles corretamente recuam até **depois** do marcador
   (posição `3`), não até a posição `2` (que é o próprio marcador, controle
   interno, não faz parte do resultado).
2. **1º caractere não-branco da fita, sem tratar marcador**: ainda reprovava
   errado os mesmos 8 níveis com marcador (achava a posição do `<`, não a
   posição depois dele).
3. **1º caractere não-branco, pulando o marcador se houver** — **exatamente
   a mesma lógica que `extractTapeOutput` (`tmAlgorithms.js`) já usa** pra
   decidir onde a saída "de verdade" começa: `lo = 1º índice não-branco; se
   tape[lo] === marker, lo++`. Com essa versão, **os 39/39 gabaritos oficiais
   passam** (ver §2).

Ou seja: a regra certa não é "cabeçote == posição X fixa" — é "cabeçote ==
onde `extractTapeOutput` diria que a saída começa". Isso também explica de
graça por que multiplicação (L16-L23 da Transdutora) as vezes pousa numa
posição "antes" do esperado ingênuo: quando o resultado tem 1 dígito a MAIS
que a entrada (carry final, ex. `"4"×3="12"`), a saída cresce pra ESQUERDA —
o novo 1º caractere realmente fica numa posição mais à esquerda, e pousar
ali está CERTO, não errado.

## 2. Causa raiz

`simulateTM` (`src/modules/mt/utils/tmAlgorithms.js`) **nunca retorna nem
verifica a posição final do cabeçote** — só `status`/`tape`/`finalState`/
`steps`. `fuzzTMRecognizer` e `fuzzTMTransducer` só checam se a MT terminou
em estado final (mais, no caso da Transdutora, se o conteúdo da fita bate —
ver `docs/PLAN_BATERIA_VALIDACAO_MT.md` da rodada anterior). **Nenhum dos
dois jamais olha ONDE o cabeçote parou.** Por isso o autômato do 1º arquivo
do usuário (aceita "ab", pousa fora do 1º caractere) passava em "✓ Validar
MT" — exatamente a mesma classe de lacuna da rodada anterior (checagem
incompleta), só que numa dimensão nova (posição do cabeçote, não conteúdo).

## 3. Auditoria — os 39 gabaritos oficiais JÁ estão corretos

Rodei a regra final (§1, versão 3) contra `acceptedWords` (Reconhecedora) e
`testWords` (Transdutora) de TODOS os níveis, usando o motor de simulação
real (`simulateTMSteps`) nos gabaritos oficiais (não nos autômatos do
usuário):

| Módulo | Resultado |
|---|---|
| MT Reconhecedora (18 níveis) | **18/18 conformes** — toda palavra aceita não-vazia termina com o cabeçote no 1º caractere |
| MT Transdutora (21 níveis) | **21/21 conformes** — idem, incluindo os 8 níveis com `startMarker` (recuam corretamente pra depois do marcador) e os 8 de multiplicação/tabela (recuam corretamente pro novo 1º dígito quando o resultado cresce) |

**Nenhum gabarito precisa ser reescrito.** Isso é uma diferença importante
em relação à rodada anterior (onde vários gabaritos da Transdutora
precisaram de bateria de testes maior) — aqui o problema é **só** a função
de validação nunca ter checado essa propriedade; os autômatos oficiais já a
satisfazem (fazem sentido pedagogicamente: o "Padrão Rewind" já documentado
em `_decimalMult.js` já existe pra isso, só nunca foi *verificado*).

## 4. Plano de implementação (TDD)

### 4.1 — Motor (`tmAlgorithms.js`) — ✅

- [x] **Passo 1 (RED)**: fixture com os nodes/transitions exatos do `.json`
  "incorreto" contra `fuzzTMRecognizer` — confirmado `ok:true` pra "ab"
  antes do fix. **Feito:** commit `3001525`.
- [x] **Passo 2 (GREEN)**:
  - `simulateTM` agora retorna `head`.
  - `firstOutputIndex(tape, marker)` extraída de `extractTapeOutput`
    (reaproveitada, sem duplicar lógica).
  - `fuzzTMRecognizer` checa `headRewound()` pra palavra não-vazia após
    `ACCEPTED`; motivo novo `'head-not-rewound'`.
  - Teste do Passo 1 confirmado GREEN.
  **Feito:** commit `3001525`.
- [x] **Passo 3 — Transdutora**: mesma checagem em `fuzzTMTransducer`
  (depois da checagem de saída), mesmo motivo. **Feito:** commit `3001525`.
- [x] **Passo 4 — regressão nos 39 gabaritos reais**: já coberta pelos
  describes existentes ("gabarito bate com acceptedWords/rejectedWords" e
  "gabarito aceita todas as testWords") — chamam `fuzzTMRecognizer`/
  `fuzzTMTransducer` contra os gabaritos reais e exigem `ok:true`; como a
  checagem nova está DENTRO dessas funções, elas já viram a regressão
  automaticamente, sem precisar de teste novo. Confirmado 409/409 passando
  em `mt_recon_levels.test.js` + `mt_trans_levels.test.js`.
  **Achado durante a implementação (não estava no plano)**: 1 fixture
  PRÉ-EXISTENTE (`wrongOutputGraph` da rodada anterior, em
  `mt_trans_levels.test.js`) quebrou — não por regressão do motor, mas
  porque ela nunca tinha sido desenhada pra recuar o cabeçote (`move:'R'`
  simples). Corrigida pra `move:'S'` (fica parado, já no 1º caractere) —
  ela testa conteúdo da fita, não posição, então isso não muda o que ela
  garante. **Feito:** commit `3001525`.

### 4.2 — Mensagem de erro (UI) — ✅

- [x] `MTReconPart1.jsx`: branch novo pro motivo `'head-not-rewound'`.
  **Feito:** commit `3001525`.
- [x] `MTPart1.jsx`: idem. **Feito:** commit `3001525`.

### 4.3 — Testes E2E — ✅

- [x] `e2e/mt_recon_head_rewind.spec.js`: os 2 grafos reais do usuário via
  "⬆ Importar" — "incorreto" reprova, "corrigido pelo usuário" aprova.
  **Feito:** commit `0376c58`.
- [x] `e2e/mt_trans_head_rewind.spec.js`: fixture sintética em L16 (aceita
  "0", escreve certo, mas não recua) — isola a checagem de posição da de
  conteúdo. **Feito:** commit `0376c58`.

Suíte e2e completa: 85/85.

## 5. Casos de teste (unitários)

### `src/__tests__/mt_recon_levels.test.js` (ou novo arquivo dedicado)
- `it('L06: autômato que aceita mas não recua o cabeçote é rejeitado por "✓ Validar MT"')`
  — fixture = nodes/transitions do `.json` "incorreto" do usuário.
- `it('L06: autômato que aceita e recua o cabeçote corretamente é aprovado')`
  — fixture = nodes/transitions do `.json` "correto" do usuário (regressão
  positiva — não pode virar falso-positivo do endurecimento).
- `it('${level.label}: gabarito oficial continua ok:true em todo acceptedWord')`
  — um `it()` por nível (18), roda o gabarito real contra `fuzzTMRecognizer`
  com a checagem nova ligada. Já sabemos (§3) que passa — vira regressão.

### `src/__tests__/mt_trans_levels.test.js`
- Fixture sintética "aceita mas não recua" análoga à de `wrongOutputGraph`
  já existente no arquivo (mesmo padrão de MT de poucos estados).
- `it('${level.label}: gabarito oficial continua ok:true em toda testWord')`
  — 21 níveis, mesma lógica, já comprovado que passa (§3).

## Casos de aceite

### CA1 — Reproduz o bug relatado
**Dado** o autômato exato do 1º `.json` do usuário (L06, aceita "ab" sem
recuar o cabeçote),
**quando** "✓ Validar MT" é clicado,
**então** o jogo mostra erro — não sucesso (hoje mostra sucesso; é o RED).

### CA2 — O autômato corrigido pelo usuário passa
**Dado** o autômato exato do 2º `.json` (com `q5` e o recuo `q4→q4`),
**quando** validado,
**então** passa normalmente (★★), sem falso-positivo do endurecimento.

### CA3 — Palavra vazia é isenta
**Dado** um nível cuja `acceptedWords`/`testWords` inclui `""`,
**quando** a MT aceita `""` parando em QUALQUER posição do cabeçote,
**então** isso nunca conta como falha por `'head-not-rewound'`.

### CA4 — Nenhum dos 39 gabaritos oficiais regride
**Dado** todos os 18 gabaritos de MT Reconhecedora e 21 de MT Transdutora,
**quando** a suíte completa roda com a checagem nova,
**então** todos continuam `ok:true` (confirmado por auditoria antes de
implementar — §3) — 0 gabarito precisa de correção nesta rodada.

### CA5 — Multiplicação/tabela (saída maior que a entrada) não quebra
**Dado** um nível de multiplicação (L16-L23) onde o resultado tem mais
dígitos que a entrada (ex. "4"×3="12"),
**quando** a MT aceita corretamente,
**então** a checagem usa a posição do NOVO 1º caractere da saída (que pode
ser 1 posição à esquerda de onde a entrada começava), não uma posição fixa
— não pode reprovar um gabarito correto por isso (é exatamente o erro que
cometi na 1ª tentativa de medição, corrigido antes de chegar no código).
