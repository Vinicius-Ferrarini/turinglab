// ── MT Transdutora L6 (lista nova) ──────────────────────────────────
// Gabarito importado de implementar/MT/gabaritos_oficiais/transdutora/L6.xml
// (verificado por fuzz contra a transformação esperada antes da conversão).

const MT_L6 = {
  id:          'MT_L6',
  label:       'L6',
  type:        'transducer',
  level:       'medium',
  alphabet:    ["a","b","c"],
  tapeAlphabet: ["<","A","B","C","a","b","c","□"],
  startMarker: "<",
  description: "Tem como entrada uma palavra qualquer com a, b e c, e gera como saída a palavra duplicada – Duplicar palavra ww.",
  hint:        "Marque cada símbolo, copie-o para o final da fita, e repita até marcar todos.",
  validate:    (w) => w+w,
  testWords:   ["a","ab","abc","cab","aa","ba","bb","cc"],
  skipEmptyWord: true,
  formalDescription: {
    sigma:   '{a,b,c}',
    gamma:   '{<,A,B,C,a,b,c,□}',
    states:  '{q0,q1,q2,q3,q4,q5,q6,q7}',
    initial: 'q0',
    final:   '{q7}',
    blank:   '□',
  },

  guidedLesson: {
    steps: [
    {
      "prof": {
        "message": "Bem-vindo! Vamos construir a MT Transdutora que tem como entrada uma palavra qualquer com a, b e c, e gera como saída a palavra duplicada – duplicar palavra ww.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [],
        "transitions": []
      }
    },
    {
      "prof": {
        "message": "Vamos testar a palavra \"ab\". Começamos no estado inicial q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [
          {
            "uid": "q0",
            "id": "q0",
            "label": "q0",
            "x": 3380,
            "y": 3966,
            "isInitial": true,
            "isFinal": false
          }
        ],
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": [
        "□",
        "□",
        "<",
        "a",
        "b",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '<', vamos para q1, escrevemos '<' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,{"uid":"q1","id":"q1","label":"q1","x":3679,"y":3968,"isInitial":false,"isFinal":false}]},
        "transitions": [
          {
            "from": "q0",
            "to": "q1",
            "read": "<",
            "write": "<",
            "move": "R"
          }
        ]
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'a', vamos para q2, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,{"uid":"q2","id":"q2","label":"q2","x":4147,"y":3710,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[{"from":"q1","to":"q2","read":"a","write":"A","move":"R"},0]}
      },
      "simulateWord": "ab",
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
      "simulateWord": "ab",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'b', vamos para q2, escrevemos 'b' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,{"from":"q2","to":"q2","read":"b","write":"b","move":"R"}]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler '□', vamos para q3, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,{"uid":"q3","id":"q3","label":"q3","x":4620,"y":4007,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[{"from":"q2","to":"q3","read":"","write":"A","move":"L"},0,1,2]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[5,"A"]},
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'b', vamos para q3, escrevemos 'b' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q3","to":"q3","read":"b","write":"b","move":"L"},3]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'A', vamos para q3, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q3","to":"q3","read":"A","write":"A","move":"L"},4]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler '<', vamos para q1, escrevemos '<' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q3","to":"q1","read":"<","write":"<","move":"R"},3,4,5]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'A', vamos para q1, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q1","to":"q1","read":"A","write":"A","move":"R"}]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'b', vamos para q4, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,{"uid":"q4","id":"q4","label":"q4","x":4323,"y":3748,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q1","to":"q4","read":"b","write":"B","move":"R"}]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[4,"B"]},
      "head": 5,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'A', vamos para q4, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q4","to":"q4","read":"A","write":"A","move":"R"},8]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 5,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 6,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler '□', vamos para q3, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,{"from":"q4","to":"q3","read":"","write":"B","move":"L"}]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 6,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[6,"B"]},
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'B', vamos para q3, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,{"from":"q3","to":"q3","read":"B","write":"B","move":"L"},6,7,8,9,10]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'B', vamos para q1, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q1","to":"q1","read":"B","write":"B","move":"R"},8,9,10,11]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
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
      "simulateWord": "ab",
      "tape": "=",
      "head": 6,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "A",
        "B",
        "□"
      ],
      "head": 7,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler '□', vamos para q6, escrevemos '□' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,{"uid":"q6","id":"q6","label":"q6","x":3421,"y":4218,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q1","to":"q6","read":"","write":"","move":"L"},3,4,5,6,7,8,9,10,11,12]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 7,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 6,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler 'B', vamos para q6, escrevemos 'b' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,{"from":"q6","to":"q6","read":"B","write":"b","move":"L"},2,3,4,5,6,7,8,9,10,11,12,13]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 6,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[6,"b"]},
      "head": 5,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler 'A', vamos para q6, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,{"from":"q6","to":"q6","read":"A","write":"a","move":"L"},2,3,4,5,6,7,8,9,10,11,12,13,14]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 5,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[5,"a"]},
      "head": 4,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[4,"b"]},
      "head": 3,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": {"d":[3,"a"]},
      "head": 2,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler '<', vamos para q7, escrevemos '<' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,5,{"uid":"q7","id":"q7","label":"q7","x":4059,"y":4290,"isInitial":false,"isFinal":true}]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,{"from":"q6","to":"q7","read":"<","write":"<","move":"R"},10,11,12,13,14,15]}
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 2,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Chegamos em q7 (estado final). A fita ficou \"abab\". ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ab",
      "tape": "=",
      "head": 3,
      "activeNode": "q7",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"abcabc\". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "a",
        "b",
        "c",
        "a",
        "b",
        "c",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
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
      "simulateWord": "abcabc",
      "tape": {"d":[3,"A"]},
      "head": 4,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'c', vamos para q2, escrevemos 'c' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"from":"q2","to":"q2","read":"c","write":"c","move":"R"},11,12,13,14,15,16]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'a', vamos para q2, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,{"from":"q2","to":"q2","read":"a","write":"a","move":"R"},12,13,14,15,16,17]}
      },
      "simulateWord": "abcabc",
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[9,"A"]},
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'c', vamos para q3, escrevemos 'c' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q3","to":"q3","read":"c","write":"c","move":"L"},8,9,10,11,12,13,14,15,16,17,18]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'a', vamos para q3, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q3","to":"q3","read":"a","write":"a","move":"L"},7,8,9,10,11,12,13,14,15,16,17,18,19]}
      },
      "simulateWord": "abcabc",
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[4,"B"]},
      "head": 5,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'c', vamos para q4, escrevemos 'c' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,{"from":"q4","to":"q4","read":"c","write":"c","move":"R"},18,19,20]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'a', vamos para q4, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,{"from":"q4","to":"q4","read":"a","write":"a","move":"R"},17,18,19,20,21]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'b', vamos para q4, escrevemos 'b' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,{"from":"q4","to":"q4","read":"b","write":"b","move":"R"},19,20,21,22]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[10,"B"]},
      "head": 9,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'c', vamos para q5, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,2,3,4,{"uid":"q5","id":"q5","label":"q5","x":4330,"y":4281,"isInitial":false,"isFinal":false},5,6]},
        "transitions": {"base":"prev","items":[{"from":"q1","to":"q5","read":"c","write":"C","move":"R"},0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[5,"C"]},
      "head": 6,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'a', vamos para q5, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,{"from":"q5","to":"q5","read":"a","write":"a","move":"R"},21,22,23,24]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'b', vamos para q5, escrevemos 'b' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,{"from":"q5","to":"q5","read":"b","write":"b","move":"R"},19,20,21,22,23,24,25]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'c', vamos para q5, escrevemos 'c' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,{"from":"q5","to":"q5","read":"c","write":"c","move":"R"},18,19,20,21,22,23,24,25,26]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'A', vamos para q5, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,{"from":"q5","to":"q5","read":"A","write":"A","move":"R"},17,18,19,20,21,22,23,24,25,26,27]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'B', vamos para q5, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,{"from":"q5","to":"q5","read":"B","write":"B","move":"R"},24,25,26,27,28]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "C",
        "a",
        "b",
        "c",
        "A",
        "B",
        "□"
      ],
      "head": 11,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler '□', vamos para q3, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,{"from":"q5","to":"q3","read":"","write":"C","move":"L"},5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[11,"C"]},
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Nova regra: em q3, ao ler 'C', vamos para q3, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,{"from":"q3","to":"q3","read":"C","write":"C","move":"L"},14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Nova regra: em q1, ao ler 'C', vamos para q1, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,{"from":"q1","to":"q1","read":"C","write":"C","move":"R"},27,28,29,30,31]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
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
      "simulateWord": "abcabc",
      "tape": {"d":[6,"A"]},
      "head": 7,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'A', vamos para q2, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,{"from":"q2","to":"q2","read":"A","write":"A","move":"R"},20,21,22,23,24,25,26,27,28,29,30,31,32]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'B', vamos para q2, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,{"from":"q2","to":"q2","read":"B","write":"B","move":"R"},21,22,23,24,25,26,27,28,29,30,31,32,33]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Nova regra: em q2, ao ler 'C', vamos para q2, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,{"from":"q2","to":"q2","read":"C","write":"C","move":"R"},22,23,24,25,26,27,28,29,30,31,32,33,34]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q2.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "C",
        "A",
        "b",
        "c",
        "A",
        "B",
        "C",
        "□"
      ],
      "head": 12,
      "activeNode": "q2"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[12,"A"]},
      "head": 11,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'B' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[7,"B"]},
      "head": 8,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'B', vamos para q4, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,{"from":"q4","to":"q4","read":"B","write":"B","move":"R"},29,30,31,32,33,34,35]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Nova regra: em q4, ao ler 'C', vamos para q4, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,{"from":"q4","to":"q4","read":"C","write":"C","move":"R"},30,31,32,33,34,35,36]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 12,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q4.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "C",
        "A",
        "B",
        "c",
        "A",
        "B",
        "C",
        "A",
        "□"
      ],
      "head": 13,
      "activeNode": "q4"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'B' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[13,"B"]},
      "head": 12,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'C' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[8,"C"]},
      "head": 9,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Nova regra: em q5, ao ler 'C', vamos para q5, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,{"from":"q5","to":"q5","read":"C","write":"C","move":"R"},36,37]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 12,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q5.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 13,
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
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "C",
        "A",
        "B",
        "C",
        "A",
        "B",
        "C",
        "A",
        "B",
        "□"
      ],
      "head": 14,
      "activeNode": "q5"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[14,"C"]},
      "head": 13,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 12,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q3.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 2,
      "activeNode": "q3"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 4,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 5,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 6,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 7,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 8,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 9,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 10,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 11,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 12,
      "activeNode": "q1"
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
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 13,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 14,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q1.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": [
        "□",
        "□",
        "<",
        "A",
        "B",
        "C",
        "A",
        "B",
        "C",
        "A",
        "B",
        "C",
        "A",
        "B",
        "C",
        "□"
      ],
      "head": 15,
      "activeNode": "q1"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 14,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Nova regra: em q6, ao ler 'C', vamos para q6, escrevemos 'c' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,{"from":"q6","to":"q6","read":"C","write":"c","move":"L"},5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38]}
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 14,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'c' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[14,"c"]},
      "head": 13,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[13,"b"]},
      "head": 12,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[12,"a"]},
      "head": 11,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'c' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[11,"c"]},
      "head": 10,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[10,"b"]},
      "head": 9,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[9,"a"]},
      "head": 8,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'c' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[8,"c"]},
      "head": 7,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[7,"b"]},
      "head": 6,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[6,"a"]},
      "head": 5,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'c' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[5,"c"]},
      "head": 4,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'b' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[4,"b"]},
      "head": 3,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'a' e moveu. Agora em q6.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": {"d":[3,"a"]},
      "head": 2,
      "activeNode": "q6"
    },
    {
      "prof": {
        "message": "Executou: leu '<', escreveu '<' e moveu. Agora em q7.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q7"
    },
    {
      "prof": {
        "message": "Chegamos em q7 (estado final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "abcabc",
      "tape": "=",
      "head": 3,
      "activeNode": "q7",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Grafo finalizado! 🎉 Agora vamos formalizar matematicamente a nossa Máquina de Turing.",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "formalIntro": true
    },
    {
      "prof": {
        "message": "Q é o conjunto de ESTADOS: {q0,q1,q2,q3,q4,q5,q6,q7}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "states": "{q0,q1,q2,q3,q4,q5,q6,q7}"
      }
    },
    {
      "prof": {
        "message": "Σ é o alfabeto de ENTRADA: {a,b,c}",
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
        "message": "Γ é o alfabeto da FITA: {<,A,B,C,a,b,c,□}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "gamma": "{<,A,B,C,a,b,c,□}"
      }
    },
    {
      "prof": {
        "message": "q0 é o estado INICIAL: q0",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "initial": "q0"
      }
    },
    {
      "prof": {
        "message": "O símbolo BRANCO: □",
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
        "message": "F é o conjunto de estados de ACEITAÇÃO: {q7}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "final": "{q7}"
      }
    },
    {
      "prof": {
        "message": "Por fim, a função δ completa — Máquina formalizada! ✓",
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
            "to": "q5",
            "read": "c",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q3",
            "read": "",
            "write": "A",
            "move": "L"
          },
          {
            "from": "q1",
            "to": "q2",
            "read": "a",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "A",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "B",
            "write": "b",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q6",
            "read": "C",
            "write": "c",
            "move": "L"
          },
          {
            "from": "q5",
            "to": "q3",
            "read": "",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q0",
            "to": "q1",
            "read": "<",
            "write": "<",
            "move": "R"
          },
          {
            "from": "q1",
            "to": "q6",
            "read": "",
            "write": "",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q1",
            "read": "<",
            "write": "<",
            "move": "R"
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
            "read": "b",
            "write": "b",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "c",
            "write": "c",
            "move": "L"
          },
          {
            "from": "q3",
            "to": "q3",
            "read": "A",
            "write": "A",
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
            "to": "q3",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q6",
            "to": "q7",
            "read": "<",
            "write": "<",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "c",
            "write": "c",
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
            "read": "b",
            "write": "b",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q2",
            "to": "q2",
            "read": "A",
            "write": "A",
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
            "to": "q2",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q1",
            "to": "q1",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "c",
            "write": "c",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "b",
            "write": "b",
            "move": "R"
          },
          {
            "from": "q1",
            "to": "q1",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "b",
            "write": "b",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "B",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q1",
            "to": "q1",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "a",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "c",
            "write": "c",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q4",
            "read": "A",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q5",
            "to": "q5",
            "read": "C",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q1",
            "to": "q4",
            "read": "b",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q4",
            "to": "q3",
            "read": "",
            "write": "B",
            "move": "L"
          }
        ]
      }
    }
  ],
  },
};

export default MT_L6;
