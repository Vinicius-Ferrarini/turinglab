// ── MT Reconhecedora L8: {aⁱbʲcᵏ / i = j + k, j ≥ 0, k > 0} ──────────────────────────────
// Gabarito importado de implementar/MT/gabaritos_oficiais/reconhecedora/L8.xml
// (verificado por fuzz contra a linguagem formal antes da conversão — ver
// notas abaixo sobre as correções aplicadas).
//
// CORREÇÕES NO GABARITO: o XML oficial (uma "block machine" do JFLAP, achatada
// aqui numa MT única) tinha 6 transições faltando, todas no caminho "sem 'b'
// no meio" (j=0) — cada uma delas é a versão simétrica de uma regra que já
// existia para o caso "com 'b'":
//   q15-(A;A,L)->q17   (simétrica a q16-(A;A,L)->q17)
//   q4-(a;a,L)->q4     (simétrica às regras a;a,L já existentes em q3/q5/q6/q11/q12)
//   q8-(C;C,R)->q8     (simétrica a q9-(C;C,R)->q9)
//   q8-(c;C,L)->q10    (simétrica a q9-(c;C,L)->q10)
//   q10-(A;A,R)->q7    (simétrica a q11-(A;A,R)->q7)
//   q10-(a;a,L)->q10   (simétrica a q4-(a;a,L)->q4)
// Sem elas, qualquer palavra com j=0 e i≥1 (ex.: "ac", "aacc") travava e era
// rejeitada incorretamente. Verificado por fuzz: 0 divergências em 88.573
// palavras (alfabeto {a,b,c}, comprimento até 10) comparado contra a
// definição formal da linguagem.

const MT_RECON_L8 = {
  "id": "MT_RECON_L8",
  "label": "L8",
  "type": "recognizer",
  "level": "hard",
  "alphabet": [
    "a",
    "b",
    "c"
  ],
  "tapeAlphabet": [
    "A",
    "B",
    "C",
    "a",
    "b",
    "c",
    "□"
  ],
  "language": "{aⁱbʲcᵏ / i = j + k, j ≥ 0, k > 0}",
  "description": "Reconheça aⁱbʲcᵏ onde a quantidade de \"a\" é igual à soma das quantidades de \"b\" e \"c\" (com pelo menos 1 \"c\").",
  "hint": "Pareie cada \"a\" com um \"b\" (se houver) ou com um \"c\" — cada \"a\" precisa de exatamente 1 símbolo correspondente depois dele.",
  "acceptedWords": [
    "ac",
    "aacc",
    "aabc",
    "aaabbc",
    "aaabcc",
    "aaaabbcc",
    "aaaabccc",
    "aaaccc",
    "aaaaabcccc"
  ],
  "rejectedWords": [
    "",
    "a",
    "b",
    "c",
    "ab",
    "bc",
    "aabb",
    "abcc",
    "aaabb",
    "cba"
  ],
  "formalDescription": {
    "sigma": "{a,b,c}",
    "gamma": "{a,b,c,A,B,C,□}",
    "states": "{q1,q2,...,q18}",
    "initial": "q1",
    "final": "{q18}",
    "blank": "□"
  },
  "guidedLesson": {
    "steps": [
    {
      "prof": {
        "message": "Bem-vindo! Vamos construir a MT Reconhecedora da linguagem {aⁱbʲcᵏ / i = j + k, j ≥ 0, k > 0}.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [],
        "transitions": []
      }
    },
    {
      "prof": {
        "message": "Vamos testar a palavra \"ac\". Começamos no estado inicial q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [
          {
            "uid": "q1",
            "id": "q1",
            "label": "q1",
            "x": 3400,
            "y": 3839,
            "isInitial": true,
            "isFinal": false
          }
        ],
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": [
        "□",
        "□",
        "a",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Criamos q2 e a aresta a;A,R: em q1, ao ler 'a', vamos para q2, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,{"uid":"q2","id":"q2","label":"q2","x":3533,"y":3721,"isInitial":false,"isFinal":false}]},
        "transitions": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          }
        ]
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": {"d":[2,"A"]},
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Criamos q4 e a aresta c;C,L: em q2, ao ler 'c', vamos para q4, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,{"uid":"q4","id":"q4","label":"q4","x":3760,"y":3700,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,{"from":"q2","to":"q4","read":"c","write":"C","move":"L"}]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": {"d":[3,"C"]},
      "head": 2,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Criamos q7 e a aresta A;A,R: em q4, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,{"uid":"q7","id":"q7","label":"q7","x":3887,"y":4060,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[{"from":"q4","to":"q7","read":"A","write":"A","move":"R"},0,1]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 2,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 3,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Criamos q14 e a aresta C;C,R: em q7, ao ler 'C', vamos para q14, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,{"uid":"q14","id":"q14","label":"q14","x":4141,"y":4343,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[{"from":"q7","to":"q14","read":"C","write":"C","move":"R"},0,1,2]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 3,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 4,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Criamos q15 e a aresta □;□,L: em q14, ao ler '□', vamos para q15, escrevemos '□' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,{"uid":"q15","id":"q15","label":"q15","x":4397,"y":4343,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q14","to":"q15","read":"","write":"","move":"L"}]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 4,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 3,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Nova regra: em q15, ao ler 'C', vamos para q15, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q15","to":"q15","read":"C","write":"C","move":"L"},3,4]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 3,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 2,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Criamos q17 e a aresta A;A,L: em q15, ao ler 'A', vamos para q17, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,{"uid":"q17","id":"q17","label":"q17","x":4786,"y":4343,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,{"from":"q15","to":"q17","read":"A","write":"A","move":"L"}]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 2,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Criamos q18 e a aresta □;□,R: em q17, ao ler '□', vamos para q18, escrevemos '□' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,{"uid":"q18","id":"q18","label":"q18","x":4944,"y":4338,"isInitial":false,"isFinal":true}]},
        "transitions": {"base":"prev","items":[0,1,{"from":"q17","to":"q18","read":"","write":"","move":"R"},2,3,4,5,6]}
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Chegamos em q18 (final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ac",
      "tape": "=",
      "head": 2,
      "activeNode": "q18",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"aaaabbcc\". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": [
        "□",
        "□",
        "a",
        "a",
        "a",
        "a",
        "b",
        "b",
        "c",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[2,"A"]},
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'a', vamos para q2, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,{"from":"q2","to":"q2","read":"a","write":"a","move":"R"},5,6,7]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Criamos q3 e a aresta b;B,L: em q2, ao ler 'b', vamos para q3, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,{"uid":"q3","id":"q3","label":"q3","x":3680,"y":3834,"isInitial":false,"isFinal":false},2,3,4,5,6,7]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q2","to":"q3","read":"b","write":"B","move":"L"},7,8]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[6,"B"]},
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'a', vamos para q3, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q3","to":"q3","read":"a","write":"a","move":"L"},4,5,6,7,8,9]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'A', vamos para q1, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,{"from":"q3","to":"q1","read":"A","write":"A","move":"R"},6,7,8,9,10]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'B', vamos para q2, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q2","to":"q2","read":"B","write":"B","move":"R"},8,9,10,11]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[7,"B"]},
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'B', vamos para q3, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,{"from":"q3","to":"q3","read":"B","write":"B","move":"L"},5,6,7,8,9,10,11,12]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[4,"A"]},
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[8,"C"]},
      "head": 7,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Criamos q5 e a aresta B;B,L: em q4, ao ler 'B', vamos para q5, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,{"uid":"q5","id":"q5","label":"q5","x":4034,"y":3715,"isInitial":false,"isFinal":false},4,5,6,7,8]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"from":"q4","to":"q5","read":"B","write":"B","move":"L"},11,12,13]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'B', vamos para q5, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q5","to":"q5","read":"B","write":"B","move":"L"},7,8,9,10,11,12,13,14]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Criamos q6 e a aresta a;a,L: em q5, ao ler 'a', vamos para q6, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,{"uid":"q6","id":"q6","label":"q6","x":3886,"y":3851,"isInitial":false,"isFinal":false},5,6,7,8,9]},
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q5","to":"q6","read":"a","write":"a","move":"L"},3,4,5,6,7,8,9,10,11,12,13,14,15]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,{"from":"q6","to":"q7","read":"A","write":"A","move":"R"},2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Criamos q8 e a aresta a;A,R: em q7, ao ler 'a', vamos para q8, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,{"uid":"q8","id":"q8","label":"q8","x":4082,"y":3952,"isInitial":false,"isFinal":false},7,8,9,10]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,{"from":"q7","to":"q8","read":"a","write":"A","move":"R"},13,14,15,16,17]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[5,"A"]},
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Criamos q9 e a aresta B;B,R: em q8, ao ler 'B', vamos para q9, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"uid":"q9","id":"q9","label":"q9","x":4404,"y":3952,"isInitial":false,"isFinal":false},8,9,10,11]},
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q8","to":"q9","read":"B","write":"B","move":"R"},4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Nova regra: em q9, ao ler 'B', vamos para q9, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,{"from":"q9","to":"q9","read":"B","write":"B","move":"R"},14,15,16,17,18,19]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Nova regra: em q9, ao ler 'C', vamos para q9, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,{"from":"q9","to":"q9","read":"C","write":"C","move":"R"},15,16,17,18,19,20]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 9,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Criamos q10 e a aresta c;C,L: em q9, ao ler 'c', vamos para q10, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,{"uid":"q10","id":"q10","label":"q10","x":4551,"y":4060,"isInitial":false,"isFinal":false},9,10,11,12]},
        "transitions": {"base":"prev","items":[0,1,{"from":"q9","to":"q10","read":"c","write":"C","move":"L"},2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 9,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": {"d":[9,"C"]},
      "head": 8,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Nova regra: em q10, ao ler 'C', vamos para q10, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,{"from":"q10","to":"q10","read":"C","write":"C","move":"L"},12,13,14,15,16,17,18,19,20,21,22]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Criamos q11 e a aresta B;B,L: em q10, ao ler 'B', vamos para q11, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,{"uid":"q11","id":"q11","label":"q11","x":4402,"y":4163,"isInitial":false,"isFinal":false},10,11,12,13]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,{"from":"q10","to":"q11","read":"B","write":"B","move":"L"},18,19,20,21,22,23]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Nova regra: em q11, ao ler 'B', vamos para q11, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,{"from":"q11","to":"q11","read":"B","write":"B","move":"L"},13,14,15,16,17,18,19,20,21,22,23,24]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Nova regra: em q11, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q11","to":"q7","read":"A","write":"A","move":"R"},8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Criamos q13 e a aresta B;B,R: em q7, ao ler 'B', vamos para q13, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"uid":"q13","id":"q13","label":"q13","x":3679,"y":4299,"isInitial":false,"isFinal":false},11,12,13,14]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q7","to":"q13","read":"B","write":"B","move":"R"},7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Nova regra: em q13, ao ler 'B', vamos para q13, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,{"from":"q13","to":"q13","read":"B","write":"B","move":"R"},21,22,23,24,25,26,27]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Nova regra: em q13, ao ler 'C', vamos para q14, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q13","to":"q14","read":"C","write":"C","move":"R"},4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 9,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Nova regra: em q14, ao ler 'C', vamos para q14, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,{"from":"q14","to":"q14","read":"C","write":"C","move":"R"},22,23,24,25,26,27,28,29]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 9,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 10,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 9,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 8,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Criamos q16 e a aresta B;B,L: em q15, ao ler 'B', vamos para q16, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,{"uid":"q16","id":"q16","label":"q16","x":4629,"y":4180,"isInitial":false,"isFinal":false},14,15]},
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q15","to":"q16","read":"B","write":"B","move":"L"},3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 7,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Nova regra: em q16, ao ler 'B', vamos para q16, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,{"from":"q16","to":"q16","read":"B","write":"B","move":"L"},13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 6,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Nova regra: em q16, ao ler 'A', vamos para q17, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,{"from":"q16","to":"q17","read":"A","write":"A","move":"L"},12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 5,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Nova regra: em q17, ao ler 'A', vamos para q17, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,{"from":"q17","to":"q17","read":"A","write":"A","move":"L"},20,21,22,23,24,25,26,27,28,29,30,31,32,33]}
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 4,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 3,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 2,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Chegamos em q18 (final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaabbcc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"aaabbc\". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": [
        "□",
        "□",
        "a",
        "a",
        "a",
        "b",
        "b",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[2,"A"]},
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[5,"B"]},
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[6,"B"]},
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[4,"A"]},
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": {"d":[7,"C"]},
      "head": 6,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 5,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q5","to":"q7","read":"A","write":"A","move":"R"},8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34]}
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 5,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 6,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 7,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 8,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 7,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 6,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 5,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 4,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 3,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 2,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q18.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18"
    },
    {
      "prof": {
        "message": "Chegamos em q18 (estado final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaabbc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"aaaccc\". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": [
        "□",
        "□",
        "a",
        "a",
        "a",
        "c",
        "c",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[2,"A"]},
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[5,"C"]},
      "head": 4,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'a', vamos para q4, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,{"from":"q4","to":"q4","read":"a","write":"a","move":"L"}]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Nova regra: em q8, ao ler 'a', vamos para q8, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,{"from":"q8","to":"q8","read":"a","write":"a","move":"R"},25,26,27,28,29,30,31,32,33,34,35,36]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Nova regra: em q8, ao ler 'C', vamos para q8, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,{"from":"q8","to":"q8","read":"C","write":"C","move":"R"}]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Nova regra: em q8, ao ler 'c', vamos para q10, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,{"from":"q8","to":"q10","read":"c","write":"C","move":"L"}]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[6,"C"]},
      "head": 5,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Nova regra: em q10, ao ler 'a', vamos para q10, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,{"from":"q10","to":"q10","read":"a","write":"a","move":"L"}]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Nova regra: em q10, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,{"from":"q10","to":"q7","read":"A","write":"A","move":"R"},40]}
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[4,"A"]},
      "head": 5,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": {"d":[7,"C"]},
      "head": 6,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q18.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18"
    },
    {
      "prof": {
        "message": "Chegamos em q18 (estado final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"aaaaaabbcccc\". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": [
        "□",
        "□",
        "a",
        "a",
        "a",
        "a",
        "a",
        "a",
        "b",
        "b",
        "c",
        "c",
        "c",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[2,"A"]},
      "head": 3,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[8,"B"]},
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[9,"B"]},
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[4,"A"]},
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[10,"C"]},
      "head": 9,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler 'a', vamos para q6, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,{"from":"q6","to":"q6","read":"a","write":"a","move":"L"},19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41]}
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[5,"A"]},
      "head": 6,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[11,"C"]},
      "head": 10,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Nova regra: em q11, ao ler 'a', vamos para q12, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"uid":"q12","id":"q12","label":"q12","x":4082,"y":4166,"isInitial":false,"isFinal":false},11,12,13,14,15,16]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"from":"q11","to":"q12","read":"a","write":"a","move":"L"},11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42]}
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q12.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q12"
    },
    {
      "prof": {
        "message": "Nova regra: em q12, ao ler 'a', vamos para q12, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,{"from":"q12","to":"q12","read":"a","write":"a","move":"L"},24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43]}
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q12"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q12.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q12"
    },
    {
      "prof": {
        "message": "Nova regra: em q12, ao ler 'A', vamos para q7, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,{"from":"q12","to":"q7","read":"A","write":"A","move":"R"},15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44]}
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q12"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[6,"A"]},
      "head": 7,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 12,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[12,"C"]},
      "head": 11,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q12.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q12"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'A' e moveu. Agora em q8.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[7,"A"]},
      "head": 8,
      "activeNode": "q8"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 12,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q9.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 13,
      "activeNode": "q9"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": {"d":[13,"C"]},
      "head": 12,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q10.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q10"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q11.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q11"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q13.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q13"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 12,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 13,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q14.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 14,
      "activeNode": "q14"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 13,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 12,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 11,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 10,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q15.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 9,
      "activeNode": "q15"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 8,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q16.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 7,
      "activeNode": "q16"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 6,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 5,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 4,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 3,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q17.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 1,
      "activeNode": "q17"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q18.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18"
    },
    {
      "prof": {
        "message": "Chegamos em q18 (estado final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "aaaaaabbcccc",
      "tape": "=",
      "head": 2,
      "activeNode": "q18",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Grafo finalizado! 🎉 Agora precisamos formalizar matematicamente a nossa Máquina de Turing. Vamos lá?",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,{"from":"q4","to":"q4","read":"C","write":"C","move":"L"},17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45]}
      },
      "formalIntro": true
    },
    {
      "prof": {
        "message": "A 7-tupla é M = (Q, Σ, Γ, δ, q0, □, F). Vou preencher campo por campo! Q é o conjunto de ESTADOS: {q1,q2,...,q18}.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "states": "{q1,q2,...,q18}"
      }
    },
    {
      "prof": {
        "message": "Σ é o alfabeto de ENTRADA: {a,b,c}.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "sigma": "{a,b,c}"
      }
    },
    {
      "prof": {
        "message": "Γ é o alfabeto da FITA (entrada + marcações + branco): {a,b,c,A,B,C,□}.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "gamma": "{a,b,c,A,B,C,□}"
      }
    },
    {
      "prof": {
        "message": "q1 é o estado INICIAL.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "initial": "q1"
      }
    },
    {
      "prof": {
        "message": "O símbolo BRANCO (□) marca as células vazias da fita.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "blank": "□"
      }
    },
    {
      "prof": {
        "message": "F é o conjunto de estados de ACEITAÇÃO: {q18}.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "final": "{q18}"
      }
    },
    {
      "prof": {
        "message": "q1 marca o primeiro \"a\" como A e vai para q2 procurar seu par (um \"b\" ou um \"c\").",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q2 avança pulando \"a\"/\"B\" não relevantes; ao achar \"b\" marca B e desce pra q3 (caso com b); ao achar \"c\" direto marca C e desce pra q4 (caso sem b).",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q3 volta até o \"A\" do par, retornando a q1 pra processar o próximo \"a\" contando para um \"b\".",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q4/q5/q6 tratam o caso sem \"b\": voltam até achar o \"A\" livre mais próximo para parear com o \"c\" marcado, retornando a q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q7 decide o segundo pareamento: acha \"C\" (já sem b, confirma), \"B\" (via b, vai por q13) ou \"a\" livre (marca A, vai por q8 achar seu c).",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q7",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q8",
            "read": "a",
            "write": "A",
            "move": "R"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q8/q9/q10/q11/q12 avançam sobre B/C/a até achar o \"c\" livre correspondente, marcam C e voltam até o \"A\" que abriu esse par, retornando a q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q7",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q8",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q11",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q12",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q12",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q13/q14 avançam confirmando os B/C restantes até o fim da palavra (branco), indo para q15 varrer tudo de volta.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q7",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q8",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q11",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q12",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q12",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q13",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q13",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q14",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q14",
            "to": "q15",
            "read": "",
            "write": "",
            "move": "L"
          }
        ]
      }
    },
    {
      "prof": {
        "message": "q15/q16/q17 varrem B, C e A de volta até o branco inicial, aceitando em q18. δ completa — Máquina formalizada! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "delta": [
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "b",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q2",
            "to": "q4",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q7",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q7",
            "to": "q8",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q8",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q8",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q10",
            "read": "c",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q9",
            "to": "q9",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q10",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q10",
            "to": "q10",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q11",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q11",
            "to": "q11",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q12",
            "to": "q7",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q12",
            "to": "q12",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q13",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q13",
            "to": "q13",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q14",
            "to": "q14",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q14",
            "to": "q15",
            "read": "",
            "write": "",
            "move": "L"
          },
          {
            "from": "q15",
            "to": "q16",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q15",
            "to": "q15",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q15",
            "to": "q17",
            "read": "A",
            "write": "A",
            "move": "L"
          },
          {
            "from": "q16",
            "to": "q17",
            "read": "A",
            "write": "A",
            "move": "L"
          },
          {
            "from": "q16",
            "to": "q16",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q17",
            "to": "q18",
            "read": "",
            "write": "",
            "move": "R"
          },
          {
            "from": "q17",
            "to": "q17",
            "read": "A",
            "write": "A",
            "move": "L"
          }
        ]
      }
    }
  ]
  }
};

export default MT_RECON_L8;
