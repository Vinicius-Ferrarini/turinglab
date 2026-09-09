# Architecture Decision Records — TuringLab

Registro das decisões arquiteturais do projeto: o quê foi decidido, por quê, e
quais alternativas foram descartadas. Formato MADR simplificado — ver
[TEMPLATE.md](TEMPLATE.md).

Cada ADR é um resumo executivo. Quando existe um plano original mais detalhado
(recuperado do histórico do git ou já presente no repo), a ADR linka para ele
em `docs/archive/` em vez de duplicar o conteúdo.

## Índice

| # | Título | Status |
|---|---|---|
| [0001](0001-mt-descricao-formal-matriz-por-celula.md) | MT: Descrição Formal mantém matriz por célula | aceita |
| [0002](0002-ap-aceitacao-por-pilha-vazia.md) | AP: aceitação por pilha vazia, não estado final | aceita |
| [0003](0003-ap-validacao-por-bateria-nao-analitica.md) | AP: validação por bateria de palavras, não analítica | aceita |
| [0004](0004-minimizacao-table-filling-juiz-invisivel.md) | Minimização como minigame de Table Filling ("juiz invisível") | aceita |
| [0005](0005-modo-aula-auto-derivado-do-gabarito.md) | Modo Aula (AP/Minimização) auto-derivado do gabarito | aceita |
| [0006](0006-carregamento-niveis-mt-import-dinamico.md) | MT: carregamento de níveis via import() dinâmico | aceita |
| [0007](0007-canvas-duplicado-nao-extraido.md) | Duplicação de canvas AFD/AP/MT não extraída | aceita, pendente de execução |
| [0008](0008-ap-canvas-unificado-com-afd.md) | AP migrou para o motor de canvas fixo + zoom do AFD | aceita |
| [0009](0009-telemetria-consentimento-explicito.md) | Telemetria de pesquisa é opt-in com consentimento explícito | aceita |
| [0010](0010-formal-validacao-contra-grafo-real.md) | Descrição Formal valida contra o grafo do aluno, não o gabarito | aceita |
| [0011](0011-persistencia-de-sessao-e-exportacao-json.md) | Persistência de sessão por fase + exportar/importar em `.json` | aceita |
| [0012](0012-estrelas-no-export-e-limpeza-manual-de-fase.md) | Estrelas no exportar/importar + limpeza de sessão vira ação manual | proposta |

## Planos originais arquivados

Documentos de planejamento que já cumpriram seu papel (implementados) ficam em
[`docs/archive/`](../archive/), com um banner `[ARQUIVADO]` no topo indicando
que são referência histórica, não roadmap ativo:

- `MT_TRANSDUTORA_PLAN.md`
- `PLANO_AP_REFORMA.md`
- `PLANO_MT_DESCRICAO_FORMAL.md`
- `PLAN_AP_FORMAL_E_VISUAL.md`
- `PLAN_AULA_V2.md`
- `PLAN_AUTOMATO_PILHA.md`
- `PLAN_MINIMIZACAO_GAME.md`
- `PLAN_MODO_AULA_AP.md`
- `PLAN_MODO_AULA_MINIMIZACAO.md`
