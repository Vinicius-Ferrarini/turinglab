# TuringLab

> Transformando a Teoria da Computação em uma experiência gamificada, visual e interativa — e gerando dados reais de pesquisa sobre como as pessoas aprendem autômatos.

<div align="center">

### 🎮 [▶ Jogar Agora — teoriadacomputacao.com.br](https://teoriadacomputacao.com.br/)

</div>

---

<div align="center">

https://github.com/user-attachments/assets/27b2bd60-45b8-4abb-b22f-09aefeb0a692

*Se o vídeo não carregar diretamente aqui, [assista no link da release](https://github.com/Vinicius-Ferrarini/turinglab/releases/tag/v1.0-demo).*

</div>

---

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat&logo=vite&logoColor=FFD62E)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)
![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow.svg)
![License](https://img.shields.io/badge/Licença-Acadêmica-blue.svg)

</div>

---

## O que é o TuringLab?

O **TuringLab** é uma plataforma educacional construída como projeto de **Iniciação Científica**. O objetivo é duplo:

1. **Ensinar** Teoria da Computação — Autômatos Finitos Determinísticos (AFD), Autômatos com Pilha (AP) e Máquinas de Turing (MT) — de forma concreta e acessível, por meio de mecânicas de jogo: cartas, canvas interativo e validação em tempo real.
2. **Pesquisar** como estudantes de fato aprendem esses modelos formais — o jogo é também um instrumento de coleta de dados para a pesquisa, medindo tentativas, erros, tempo por fase e uso de ajuda em cada exercício.

O visual segue o estilo neo-brutalismo / gibi (inspirado na Turma da Mônica), com o professor **Maurílio** guiando o jogador em cada fase.

---

## 🔬 Pesquisa e coleta de dados

Este projeto **não é só um jogo** — é um instrumento de pesquisa acadêmica em andamento. Cada partida gera dados que ajudam a entender, com evidência real (não só intuição de professor), onde os alunos mais travam ao aprender autômatos.

- **O que é coletado:** eventos de jogo anônimos — início/fim de fase, número de tentativas, tipo de erro cometido, tempo gasto, se o aluno abriu a ajuda/aula guiada, e uma pesquisa de satisfação opcional ao final de módulos.
- **O que NÃO é coletado:** nenhum dado pessoal identificável. Não há cadastro, nome ou e-mail — a identificação é um client ID anônimo gerado pelo próprio Google Analytics.
- **Consentimento explícito:** ao abrir o jogo, um banner não bloqueante pede autorização antes de qualquer envio de dado. Sem aceitar, o jogo funciona normalmente — só que 100% local, sem telemetria.
- **Como funciona:** [Google Analytics 4](https://analytics.google.com/) para eventos de uso, com [Firebase](https://firebase.google.com/) (Firestore) como backend opcional de autenticação anônima. Sem as variáveis de ambiente `VITE_FIREBASE_*` configuradas, o app roda offline e sem nenhuma coleta.

---

## Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| 🔒 | **Desbloqueio por Descoberta** | O canvas de desenho só é liberado quando o aluno descobre o exemplo mínimo da fase (a menor palavra aceita ou o menor caso de entrada/saída) |
| 🃏 | **Mecânica de Cartas** | Estados, setas e símbolos são distribuídos como cartas interativas na mão do jogador |
| 🖱️ | **Canvas Drag & Drop** | Construção do autômato (AFD, AP ou MT) via arrastar, conectar e rotular estados diretamente no grafo |
| 🧠 | **Validação Automática** | O sistema simula o autômato desenhado contra a especificação da fase (linguagem, bateria de testes ou entrada/saída) e rejeita erros estruturais e de não-determinismo |
| 🔬 | **Simulação Passo a Passo** | Percorre cada transição com destaque visual em tempo real |
| 📊 | **Grafo → Linguagem (P2)** | Modo inverso: dado um autômato, o aluno deve identificar a linguagem formal aceita |
| 🔽 | **Minimização de AFD** | Reduz um autômato ao equivalente mínimo em passos guiados |
| 📚 | **Autômatos com Pilha** | Construção de AP com aceitação por pilha vazia |
| 🔍 | **Máquina de Turing Reconhecedora** | Construção passo a passo de MT que aceita ou rejeita a palavra na fita |
| 🔄 | **Máquina de Turing Transdutora** | Construção passo a passo de MT que transforma a fita de entrada numa saída, com simulação em tempo real |
| 📝 | **Boss Mode — Trabalho** | Desafio final que reúne, numa grade própria, 5 exercícios já vistos de AFD Parte 1, AFD Parte 2 e Autômatos com Pilha |
| 🏆 | **Boss Mode — Prova** | Desafio final maior, com 8 questões cobrindo os 6 tipos de exercício do jogo (AFD P1, AFD P2, Minimização, AP, MT Reconhecedora e MT Transdutora) |
| 🎓 | **Modo Aula Guiada** | Storyboard passo a passo, narrado pelo Professor Maurílio, cobrindo 100% dos níveis de AFD Parte 1, Minimização, AP e MT (reconhecedora e transdutora) — não disponível em AFD Parte 2 |
| ⭐ | **Sistema de Estrelas** | Até 3 estrelas por fase — a regra varia por módulo (ver [Sistema de Estrelas](#-sistema-de-estrelas)) |

---

## Módulos

```
TuringLab
├── Autômatos Finitos (AFD)
│   ├── Parte 1 — Desenhar o autômato a partir da linguagem
│   ├── Parte 2 — Identificar a linguagem a partir do grafo
│   └── Minimização — reduzir um autômato ao seu equivalente mínimo
├── Autômatos com Pilha — construção e aceitação por pilha vazia
├── Máquinas de Turing
│   ├── Reconhecedora — aceita ou rejeita a palavra na fita
│   └── Transdutora — transforma a fita de entrada numa saída
└── Mini-Games
    ├── Trabalho (Boss Mode) — 5 exercícios-marco de AFD P1/P2 e AP, numa grade própria
    ├── Prova (Boss Mode) — 8 questões cobrindo os 6 tipos de exercício do jogo
    └── Menor Palavra — descubra a menor palavra da linguagem, reunindo num só
        lugar os exercícios de AFD, Autômatos com Pilha e MT Reconhecedora
```

---

## 📈 Progressão de dificuldade

Cada fase do jogo (definidas em `src/levels.js`, mapa `LEVEL_DIFFICULTY`) tem um
nível de dificuldade associado, usado para colorir os cards no menu de seleção:

| Dificuldade | Cor | Uso |
|---|---|---|
| 🟢 `easy` | verde | Introdução ao conceito, exemplos diretos |
| 🟡 `medium` | amarelo | Combina duas ou mais regras/condições |
| 🔴 `hard` | vermelho | Casos com múltiplas exceções, "pegadinhas" clássicas do modelo |
| 🟣 `impossible` | lilás | Linguagem comprovadamente fora do poder do modelo atual — exercício pedagógico sobre os *limites* do formalismo |
| 🟪 `trabalho` / 🔵 `prova` | roxo / azul | Fases-marco reunidas no Boss Mode (Desafio de Prova) |

O caso `impossible` é usado uma única vez, na fase **L14** (`|w|ₐ = |w|_b`, mesmo
número de "a"s e "b"s numa palavra): é uma linguagem comprovadamente **não
regular**, então não existe nenhum AFD correto para ela. O jogo mantém L14
jogável em AFD Parte 1 — o aluno tenta construir o autômato e recebe uma
explicação de por que é impossível — mas a mantém bloqueada em AFD Parte 2
(`UNAVAILABLE_LEVELS_P2_ONLY`), já que essa parte depende de um grafo válido
que, neste caso, não existe. Nesse nível, o "exercício" é a própria
demonstração de um limite formal do modelo, não uma tarefa a resolver.

---

## 🎓 Professor Maurílio — Modo Aula passo a passo

Em todo módulo jogável (AFD Parte 1, Minimização, Autômatos com Pilha, MT
Reconhecedora e MT Transdutora), o aluno pode abrir o **Modo Aula**: o
professor Maurílio narra, passo a passo, a construção e a simulação completa
do autômato daquela fase — sem pular etapas. AFD Parte 2 não tem Modo Aula,
já que seu exercício é o inverso (identificar a linguagem a partir de um
grafo pronto), sem construção guiada.

A parte notável é *como* essa narração é gerada: em vez de um roteiro escrito
manualmente para cada exercício (o que não escalaria — seriam dezenas de
roteiros para manter), a aula é **auto-derivada do próprio gabarito** de cada
nível (ver [ADR 0005](docs/adr/0005-modo-aula-auto-derivado-do-gabarito.md)):

- **AFD (Minimização):** `useMinimizationGame.js` gera os frames de cada etapa
  (PREP/SETUP/TRIVIAL/PROP/GROUPS/DRAW) a partir dos mesmos gabaritos
  memoizados usados para validar o jogo.
- **Autômatos com Pilha:** `buildApLesson.js` deriva a aula (fase Grafo + fase
  Formal) diretamente da tripla `(read, pop, push)` de cada transição do
  `.jff`/`.xml` de cada nível.
- **Máquinas de Turing:** cada transição de cada nível carrega sua própria
  narração (`"prof": "..."`), lida passo a passo pelo hook
  `useMTGuidedLesson` — reaproveitado tanto pela MT Reconhecedora quanto pela
  Transdutora.

Essa abordagem cobre **100% dos níveis "de graça"**, sem depender de um
roteiro manual por exercício. Nos níveis mais longos de MT Transdutora, isso
se traduz em narrações extensas: **L23 e L24 têm 904 passos narrados pelo
professor cada um** (contagem de chaves `"prof"` em
`src/levels_data/mt/L23.js` e `L24.js`), cobrindo cada transição da simulação
completa, sem atalhos.

---

## ⭐ Sistema de Estrelas

Toda fase concede **até 3 estrelas**, mas a regra de cálculo não é uniforme
entre módulos — ela reflete o formato de cada exercício (fonte única dos
totais: `src/services/starTotals.js`):

- **AFD Parte 1, Autômatos com Pilha, MT Reconhecedora e Minimização** — as
  estrelas são **marcos de progresso dentro da própria fase**, não uma
  penalidade por erro:
  1. ⭐ descobrir o exemplo mínimo da linguagem (desbloqueia o canvas de
     desenho);
  2. ⭐⭐ validar o autômato desenhado contra a especificação;
  3. ⭐⭐⭐ completar a descrição formal (a tupla do modelo — quíntupla,
     sêxtupla etc.) ou, na Minimização, terminar o desenho do autômato
     mínimo.

  (Na Minimização o fluxo entra direto a partir de 2 marcos — propagação e
  desenho mínimo — sem uma etapa de "descoberta" prévia como nos demais.)

  **MT Transdutora** ainda não tem a etapa de descoberta (o canvas já começa
  destravado), então hoje concede no máximo **2 de 3 estrelas** por fase —
  ajuste em andamento para trazer esse módulo para o mesmo padrão dos demais.

- **AFD Parte 2** (Grafo → Linguagem) é a exceção: aqui a estrela **de fato
  depende do número de tentativas** para acertar a fórmula da linguagem —
  acertar de primeira vale 3⭐, na segunda tentativa 2⭐, da terceira em
  diante 1⭐ (`useP2Answer.js`).

- **Boss Mode (Trabalho e Prova)** reaproveita o mesmo componente e a mesma
  regra de estrelas do módulo original de cada exercício, só que gravando o
  progresso numa chave própria (`boss-trabalho-{id}` / `boss-prova-{id}`),
  independente do progresso do exercício na tela normal daquele módulo — e
  fora do total geral de estrelas da Home (`totalEarnedStars` ignora
  qualquer chave `boss-*`, para não contar a mesma estrela duas vezes).

- **Menor Palavra** (minigame) reúne, num módulo próprio, os exercícios de
  "descobrir a menor palavra" de AFD, Autômatos com Pilha e MT Reconhecedora
  — a mesma mecânica de tentativas usada na fase AFD Parte 1, mas sem canvas
  nem aula guiada. A estrela aqui é **binária** (0 ou 1 por exercício, ganha
  ao acertar a menor palavra, com ou sem dica), gravada numa chave própria
  (`word-guess-{id}`) e fora do total geral de estrelas da Home. Exercícios
  com a mesma linguagem formal em módulos diferentes contam uma única vez
  (deduplicados por um script offline, `scripts/generate-deduped-word-exercises.mjs`).

---

## Stack

- **Framework:** React 19 + Vite
- **Estilização:** CSS3 puro — Neo-brutalismo, Comic Sans, `#fff9c4`
- **Lógica de autômatos:** JavaScript puro, sem bibliotecas externas de grafo
- **Pesquisa/Telemetria:** Google Analytics 4 + Firebase (Firestore, autenticação anônima) — opcional, com consentimento explícito
- **Persistência local:** `localStorage` para progresso por fase
- **Testes:** Vitest (testes unitários/fuzzing dos níveis) + Playwright (E2E)
- **Deploy:** GitHub Pages, domínio próprio ([teoriadacomputacao.com.br](https://teoriadacomputacao.com.br/))

---

## Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/Vinicius-Ferrarini/turinglab.git
cd turinglab

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra **http://localhost:5173** no navegador.

> **Nota:** o jogo roda 100% localmente sem nenhuma configuração extra. As
> variáveis `VITE_FIREBASE_*` (veja [`.env.example`](.env.example)) são
> **opcionais** — habilitam apenas login anônimo e telemetria de pesquisa na
> nuvem. Sem elas, o app funciona normalmente e o progresso é salvo só no
> `localStorage` do navegador.

### Outros comandos úteis

```bash
npm run build     # build de produção (dist/)
npm run test      # suíte de testes (Vitest)
npm run lint      # ESLint
npm run test:e2e  # testes end-to-end (Playwright)
npm run check:deploy  # testes unitários + build + verificação dos arquivos + E2E de produção, sem publicar
npm run deploy   # executa check:deploy e só publica se todas as etapas passarem
```

O deploy usa `--nojekyll --dotfiles` e inclui `public/.nojekyll` para que o GitHub Pages sirva também arquivos iniciados por `_`. Na primeira execução dos testes em uma máquina nova, instale o navegador com `npx playwright install chromium --only-shell`. Detalhes da cobertura e das verificações: [docs/E2E_COVERAGE.md](docs/E2E_COVERAGE.md).

---

## Contexto Acadêmico

Este software é um artefato de **Iniciação Científica** focado no ensino de Teoria da Computação em cursos de Engenharia de Software e Ciência da Computação. O design foi concebido para reduzir a carga cognitiva associada às definições formais de cada modelo — a quíntupla do AFD **M = (Q, Σ, δ, q₀, F)**, a sêxtupla do AP (com pilha) e a séxtupla/séptupla da MT (com fita) —, apresentando cada componente de forma progressiva e tangível dentro do jogo. Os dados de uso coletados (ver seção [Pesquisa e coleta de dados](#-pesquisa-e-coleta-de-dados)) alimentam a análise empírica da pesquisa.

---

## Autor

**Vinicius Ferrarini**
Estudante de Engenharia de Software

---

<div align="center">

*Feito com dedicação para provar que a Ciência da Computação também se joga.*

**[▶ Testar agora](https://teoriadacomputacao.com.br/)**

</div>
