# Cobertura E2E de navegação e atividades

Os testes novos percorrem a interface com armazenamento de navegador isolado por teste. Não enviam consentimento de pesquisa e não dependem da telemetria em nuvem.

## Cobertura adicionada

| Arquivo | Verificações |
|---|---|
| `e2e/all_screens.spec.js` | As nove atividades: abertura da grade, quantidade de botões na primeira página, entrada em um exercício utilizável e retorno pelos menus |
| `e2e/afd2_flow.spec.js` | Paginação completa, L14 bloqueada, resposta errada e certa, duas estrelas na segunda tentativa, persistência e simulação que avança e fecha |
| `e2e/minimization_flow.spec.js` | Edição e validação de tabela incompleta; aula que avança e fecha preservando a edição sem conceder estrelas |
| `e2e/boss_flow.spec.js` | Entrada e retorno nos cinco exercícios do Trabalho e nos oito da Prova; conclusão de P2 grava estrelas somente na chave do Boss |
| `e2e/word_guess_flow.spec.js` | Todas as páginas, 84 entradas únicas, abertura de exercícios de AFD/AP/MT, vitória, estrela persistida e próxima fase |

São **30 casos novos**. O helper compartilhado também reprova os testes em caso de exceção de página, erro de carregamento de script/CSS local ou mensagens de erro de atualização infinita do React.

As contagens explícitas são um contrato do catálogo atual: alterações intencionais no número de exercícios exigem atualizar as expectativas. Verificar uma tela ou um exercício representativo não equivale a resolver todas as fases nem a certificar todos os fluxos possíveis.

## Desenvolvimento

Instalação inicial do navegador de testes, quando necessário:

```sh
npx playwright install chromium
```

Executar somente os novos casos:

```sh
npx playwright test all_screens.spec.js afd2_flow.spec.js minimization_flow.spec.js boss_flow.spec.js word_guess_flow.spec.js
```

A suíte completa continua disponível com `npm run test:e2e`. A configuração padrão inicia o servidor de desenvolvimento.

## Build de produção local

```sh
npm run build
npx playwright test --config playwright.production.config.js
```

A configuração de produção executa os mesmos 30 casos contra `dist`, servido na porta 4173 pelo preview do Vite. O servidor é iniciado pelo Playwright; uma porta já ocupada faz a execução falhar para evitar testar outra versão por engano. A build deve ser feita antes para não testar arquivos antigos.

Esse modo detecta problemas no carregamento dos arquivos gerados, mas não reproduz filtros do Jekyll, cache/CDN ou configurações do GitHub Pages. Uma verificação após a publicação ainda será necessária para cobrir esses riscos.

O teste `mt_trans_loading_failure.spec.js`, criado anteriormente, intercepta um caminho de fonte do servidor de desenvolvimento e por isso não faz parte da seleção de produção.

## Correção revelada pelos novos testes

O fluxo de simulação de AFD P2 expôs atualizações repetidas: `ExerciseScreen` recriava os callbacks enviados a `SimPanel`, cujo efeito atualizava novamente o pai. Os callbacks de fechar e destacar agora têm identidade estável. O teste acompanha o avanço da simulação e seu fechamento e também observa erros de atualização infinita.

Na Minimização, a imagem fixa do professor interceptava o clique em um botão de verificação na resolução 1280×720. O painel direito agora reserva espaço inferior para os controles não ficarem atrás da imagem. O teste usa clique real, sem forçar passagem pelo elemento sobreposto.

## Deploy

Nenhum teste foi conectado ao `predeploy` ou ao comando `deploy` nesta mudança. A integração será feita separadamente.
