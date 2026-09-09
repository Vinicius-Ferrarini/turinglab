// ── MT Transdutora L11 (lista nova) ──────────────────────────────────
// Gabarito importado de implementar/MT/gabaritos_oficiais/transdutora/L11.xml
// (verificado por fuzz contra a transformação esperada antes da conversão).

const MT_L11 = {
  id:          'MT_L11',
  label:       'L11',
  type:        'transducer',
  level:       'hard',
  alphabet:    ["A","B","C","a","b","c","0","1","2"," ",",","."],
  tapeAlphabet: [" ","!","","",".","0","1","2","3","4","5","6","7","8","9",":",";","?","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","^","`","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","~","´","□"],
  description: "Tem como entrada um texto qualquer (letras, números, pontuação, acentos) e criptografa usando uma cifra mono alfabética simples – Criptografia mono alfabética. [GABARITO NÃO-OFICIAL: cifra assumida como deslocamento fixo +3 por classe de caractere — validar com o professor]",
  hint:        "Cada letra maiúscula desloca 3 posições dentro de A-Z, cada minúscula desloca 3 dentro de a-z, cada dígito desloca 3 dentro de 0-9 (com volta ao início). Pontuação e espaços não mudam.",
  validate:    (w) => (()=>{
      const UPPER='ABCDEFGHIJKLMNOPQRSTUVWXYZ', LOWER='abcdefghijklmnopqrstuvwxyz', DIGITS='0123456789';
      const shift=(alpha,c)=>{const i=alpha.indexOf(c); return i<0?null:alpha[(i+3)%alpha.length];};
      return [...w].map(c => shift(UPPER,c) ?? shift(LOWER,c) ?? shift(DIGITS,c) ?? c).join('');
    })(),
  testWords:   ["ABC","abc123","Ola, Mundo!","XYZxyz789","0","."],
  skipEmptyWord: true,
  formalDescription: {
    sigma:   '{A,B,C,a,b,c,0,1,2, ,,,.}',
    gamma:   '{ ,!,,,.,0,1,2,3,4,5,6,7,8,9,:,;,?,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,^,`,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,~,´,□}',
    states:  '{q0,q_rw,qf}',
    initial: 'q0',
    final:   '{qf}',
    blank:   '□',
  },

  guidedLesson: {
    steps: [
    {
      "prof": {
        "message": "Bem-vindo! Vamos construir a MT Transdutora: entrada é um texto qualquer (letras, números, pontuação, acentos), saída é ele criptografado por cifra mono alfabética. [gabarito não-oficial: validar com o professor]",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [],
        "transitions": []
      }
    },
    {
      "prof": {
        "message": "Vamos testar a palavra \"ABC\". Começamos no estado inicial q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": [
          {
            "uid": "q0",
            "id": "q0",
            "label": "q0",
            "x": 3460,
            "y": 4000,
            "isInitial": true,
            "isFinal": false
          }
        ],
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": [
        "□",
        "□",
        "A",
        "B",
        "C",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'A', vamos para q0, escrevemos 'D' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": [
          {
            "from": "q0",
            "to": "q0",
            "read": "A",
            "write": "D",
            "move": "R"
          }
        ]
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'D' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": {"d":[2,"D"]},
      "head": 3,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'B', vamos para q0, escrevemos 'E' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,{"from":"q0","to":"q0","read":"B","write":"E","move":"R"}]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 3,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'E' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": {"d":[3,"E"]},
      "head": 4,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'C', vamos para q0, escrevemos 'F' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,{"from":"q0","to":"q0","read":"C","write":"F","move":"R"}]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 4,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'F' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": {"d":[4,"F"]},
      "head": 5,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '□', vamos para q_rw, escrevemos '□' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,{"uid":"q_rw","id":"q_rw","label":"q_rw","x":4000,"y":4000,"isInitial":false,"isFinal":false}]},
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q0","to":"q_rw","read":"","write":"","move":"L"}]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 5,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 4,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'F', vamos para q_rw, escrevemos 'F' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q_rw","to":"q_rw","read":"F","write":"F","move":"L"}]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 4,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'F', escreveu 'F' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 3,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'E', vamos para q_rw, escrevemos 'E' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q_rw","to":"q_rw","read":"E","write":"E","move":"L"},4]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 3,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'E', escreveu 'E' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 2,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'D', vamos para q_rw, escrevemos 'D' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q_rw","to":"q_rw","read":"D","write":"D","move":"L"},4,5]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 2,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'D', escreveu 'D' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 1,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '□', vamos para qf, escrevemos '□' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": {"base":"prev","items":[0,1,{"uid":"qf","id":"qf","label":"qf","x":4540,"y":4000,"isInitial":false,"isFinal":true}]},
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q_rw","to":"qf","read":"","write":"","move":"R"}]}
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 1,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Chegamos em qf (estado final). A fita ficou \"DEF\". ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABC",
      "tape": "=",
      "head": 2,
      "activeNode": "qf",
      "status": "ACCEPTED"
    },
    {
      "prof": {
        "message": "Próxima palavra: \"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ \". Mesma máquina, novo teste.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": [
        "□",
        "□",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        ",",
        ".",
        "?",
        "!",
        ";",
        ":",
        "´",
        "`",
        "^",
        "~",
        " ",
        "□",
        "□"
      ],
      "head": 2,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'D' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[2,"D"]},
      "head": 3,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'E' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[3,"E"]},
      "head": 4,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'F' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[4,"F"]},
      "head": 5,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'D', vamos para q0, escrevemos 'G' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,{"from":"q0","to":"q0","read":"D","write":"G","move":"R"},3,4,5,6,7]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 5,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'D', escreveu 'G' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[5,"G"]},
      "head": 6,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'E', vamos para q0, escrevemos 'H' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,{"from":"q0","to":"q0","read":"E","write":"H","move":"R"},4,5,6,7,8]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 6,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'E', escreveu 'H' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[6,"H"]},
      "head": 7,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'F', vamos para q0, escrevemos 'I' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,{"from":"q0","to":"q0","read":"F","write":"I","move":"R"},5,6,7,8,9]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 7,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'F', escreveu 'I' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[7,"I"]},
      "head": 8,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'G', vamos para q0, escrevemos 'J' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,{"from":"q0","to":"q0","read":"G","write":"J","move":"R"},6,7,8,9,10]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 8,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'G', escreveu 'J' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[8,"J"]},
      "head": 9,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'H', vamos para q0, escrevemos 'K' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,{"from":"q0","to":"q0","read":"H","write":"K","move":"R"},7,8,9,10,11]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 9,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'H', escreveu 'K' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[9,"K"]},
      "head": 10,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'I', vamos para q0, escrevemos 'L' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,{"from":"q0","to":"q0","read":"I","write":"L","move":"R"},8,9,10,11,12]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 10,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'I', escreveu 'L' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[10,"L"]},
      "head": 11,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'J', vamos para q0, escrevemos 'M' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,{"from":"q0","to":"q0","read":"J","write":"M","move":"R"},9,10,11,12,13]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 11,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'J', escreveu 'M' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[11,"M"]},
      "head": 12,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'K', vamos para q0, escrevemos 'N' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,{"from":"q0","to":"q0","read":"K","write":"N","move":"R"},10,11,12,13,14]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 12,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'K', escreveu 'N' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[12,"N"]},
      "head": 13,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'L', vamos para q0, escrevemos 'O' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,{"from":"q0","to":"q0","read":"L","write":"O","move":"R"},11,12,13,14,15]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 13,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'L', escreveu 'O' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[13,"O"]},
      "head": 14,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'M', vamos para q0, escrevemos 'P' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,{"from":"q0","to":"q0","read":"M","write":"P","move":"R"},12,13,14,15,16]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 14,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'M', escreveu 'P' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[14,"P"]},
      "head": 15,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'N', vamos para q0, escrevemos 'Q' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,{"from":"q0","to":"q0","read":"N","write":"Q","move":"R"},13,14,15,16,17]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 15,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'N', escreveu 'Q' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[15,"Q"]},
      "head": 16,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'O', vamos para q0, escrevemos 'R' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,{"from":"q0","to":"q0","read":"O","write":"R","move":"R"},14,15,16,17,18]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 16,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'O', escreveu 'R' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[16,"R"]},
      "head": 17,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'P', vamos para q0, escrevemos 'S' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,{"from":"q0","to":"q0","read":"P","write":"S","move":"R"},15,16,17,18,19]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 17,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'P', escreveu 'S' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[17,"S"]},
      "head": 18,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'Q', vamos para q0, escrevemos 'T' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,{"from":"q0","to":"q0","read":"Q","write":"T","move":"R"},16,17,18,19,20]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 18,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'Q', escreveu 'T' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[18,"T"]},
      "head": 19,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'R', vamos para q0, escrevemos 'U' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,{"from":"q0","to":"q0","read":"R","write":"U","move":"R"},17,18,19,20,21]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 19,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'R', escreveu 'U' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[19,"U"]},
      "head": 20,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'S', vamos para q0, escrevemos 'V' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,{"from":"q0","to":"q0","read":"S","write":"V","move":"R"},18,19,20,21,22]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 20,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'S', escreveu 'V' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[20,"V"]},
      "head": 21,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'T', vamos para q0, escrevemos 'W' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,{"from":"q0","to":"q0","read":"T","write":"W","move":"R"},19,20,21,22,23]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 21,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'T', escreveu 'W' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[21,"W"]},
      "head": 22,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'U', vamos para q0, escrevemos 'X' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,{"from":"q0","to":"q0","read":"U","write":"X","move":"R"},20,21,22,23,24]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 22,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'U', escreveu 'X' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[22,"X"]},
      "head": 23,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'V', vamos para q0, escrevemos 'Y' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,{"from":"q0","to":"q0","read":"V","write":"Y","move":"R"},21,22,23,24,25]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 23,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'V', escreveu 'Y' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[23,"Y"]},
      "head": 24,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'W', vamos para q0, escrevemos 'Z' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,{"from":"q0","to":"q0","read":"W","write":"Z","move":"R"},22,23,24,25,26]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 24,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'W', escreveu 'Z' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[24,"Z"]},
      "head": 25,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'X', vamos para q0, escrevemos 'A' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,{"from":"q0","to":"q0","read":"X","write":"A","move":"R"},23,24,25,26,27]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 25,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'X', escreveu 'A' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[25,"A"]},
      "head": 26,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'Y', vamos para q0, escrevemos 'B' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,{"from":"q0","to":"q0","read":"Y","write":"B","move":"R"},24,25,26,27,28]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 26,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'Y', escreveu 'B' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[26,"B"]},
      "head": 27,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'Z', vamos para q0, escrevemos 'C' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,{"from":"q0","to":"q0","read":"Z","write":"C","move":"R"},25,26,27,28,29]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 27,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'Z', escreveu 'C' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[27,"C"]},
      "head": 28,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'a', vamos para q0, escrevemos 'd' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,{"from":"q0","to":"q0","read":"a","write":"d","move":"R"},26,27,28,29,30]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 28,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'd' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[28,"d"]},
      "head": 29,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'b', vamos para q0, escrevemos 'e' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,{"from":"q0","to":"q0","read":"b","write":"e","move":"R"},27,28,29,30,31]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 29,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'e' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[29,"e"]},
      "head": 30,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'c', vamos para q0, escrevemos 'f' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,{"from":"q0","to":"q0","read":"c","write":"f","move":"R"},28,29,30,31,32]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 30,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'f' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[30,"f"]},
      "head": 31,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'd', vamos para q0, escrevemos 'g' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,{"from":"q0","to":"q0","read":"d","write":"g","move":"R"},29,30,31,32,33]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 31,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'd', escreveu 'g' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[31,"g"]},
      "head": 32,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'e', vamos para q0, escrevemos 'h' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,{"from":"q0","to":"q0","read":"e","write":"h","move":"R"},30,31,32,33,34]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 32,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'e', escreveu 'h' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[32,"h"]},
      "head": 33,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'f', vamos para q0, escrevemos 'i' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,{"from":"q0","to":"q0","read":"f","write":"i","move":"R"},31,32,33,34,35]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 33,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'f', escreveu 'i' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[33,"i"]},
      "head": 34,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'g', vamos para q0, escrevemos 'j' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,{"from":"q0","to":"q0","read":"g","write":"j","move":"R"},32,33,34,35,36]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 34,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'g', escreveu 'j' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[34,"j"]},
      "head": 35,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'h', vamos para q0, escrevemos 'k' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,{"from":"q0","to":"q0","read":"h","write":"k","move":"R"},33,34,35,36,37]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 35,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'h', escreveu 'k' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[35,"k"]},
      "head": 36,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'i', vamos para q0, escrevemos 'l' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,{"from":"q0","to":"q0","read":"i","write":"l","move":"R"},34,35,36,37,38]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 36,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'i', escreveu 'l' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[36,"l"]},
      "head": 37,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'j', vamos para q0, escrevemos 'm' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,{"from":"q0","to":"q0","read":"j","write":"m","move":"R"},35,36,37,38,39]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 37,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'j', escreveu 'm' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[37,"m"]},
      "head": 38,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'k', vamos para q0, escrevemos 'n' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,{"from":"q0","to":"q0","read":"k","write":"n","move":"R"},36,37,38,39,40]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 38,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'k', escreveu 'n' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[38,"n"]},
      "head": 39,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'l', vamos para q0, escrevemos 'o' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,{"from":"q0","to":"q0","read":"l","write":"o","move":"R"},37,38,39,40,41]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 39,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'l', escreveu 'o' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[39,"o"]},
      "head": 40,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'm', vamos para q0, escrevemos 'p' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,{"from":"q0","to":"q0","read":"m","write":"p","move":"R"},38,39,40,41,42]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 40,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'm', escreveu 'p' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[40,"p"]},
      "head": 41,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'n', vamos para q0, escrevemos 'q' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,{"from":"q0","to":"q0","read":"n","write":"q","move":"R"},39,40,41,42,43]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 41,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'n', escreveu 'q' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[41,"q"]},
      "head": 42,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'o', vamos para q0, escrevemos 'r' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,{"from":"q0","to":"q0","read":"o","write":"r","move":"R"},40,41,42,43,44]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 42,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'o', escreveu 'r' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[42,"r"]},
      "head": 43,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'p', vamos para q0, escrevemos 's' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,{"from":"q0","to":"q0","read":"p","write":"s","move":"R"},41,42,43,44,45]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 43,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'p', escreveu 's' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[43,"s"]},
      "head": 44,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'q', vamos para q0, escrevemos 't' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,{"from":"q0","to":"q0","read":"q","write":"t","move":"R"},42,43,44,45,46]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 44,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'q', escreveu 't' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[44,"t"]},
      "head": 45,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'r', vamos para q0, escrevemos 'u' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,{"from":"q0","to":"q0","read":"r","write":"u","move":"R"},43,44,45,46,47]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 45,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'r', escreveu 'u' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[45,"u"]},
      "head": 46,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 's', vamos para q0, escrevemos 'v' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,{"from":"q0","to":"q0","read":"s","write":"v","move":"R"},44,45,46,47,48]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 46,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 's', escreveu 'v' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[46,"v"]},
      "head": 47,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 't', vamos para q0, escrevemos 'w' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,{"from":"q0","to":"q0","read":"t","write":"w","move":"R"},45,46,47,48,49]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 47,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 't', escreveu 'w' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[47,"w"]},
      "head": 48,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'u', vamos para q0, escrevemos 'x' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,{"from":"q0","to":"q0","read":"u","write":"x","move":"R"},46,47,48,49,50]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 48,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'u', escreveu 'x' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[48,"x"]},
      "head": 49,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'v', vamos para q0, escrevemos 'y' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,{"from":"q0","to":"q0","read":"v","write":"y","move":"R"},47,48,49,50,51]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 49,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'v', escreveu 'y' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[49,"y"]},
      "head": 50,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'w', vamos para q0, escrevemos 'z' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,{"from":"q0","to":"q0","read":"w","write":"z","move":"R"},48,49,50,51,52]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 50,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'w', escreveu 'z' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[50,"z"]},
      "head": 51,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'x', vamos para q0, escrevemos 'a' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,{"from":"q0","to":"q0","read":"x","write":"a","move":"R"},49,50,51,52,53]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 51,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'x', escreveu 'a' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[51,"a"]},
      "head": 52,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'y', vamos para q0, escrevemos 'b' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,{"from":"q0","to":"q0","read":"y","write":"b","move":"R"},50,51,52,53,54]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 52,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'y', escreveu 'b' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[52,"b"]},
      "head": 53,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler 'z', vamos para q0, escrevemos 'c' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,{"from":"q0","to":"q0","read":"z","write":"c","move":"R"},51,52,53,54,55]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 53,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu 'z', escreveu 'c' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[53,"c"]},
      "head": 54,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '0', vamos para q0, escrevemos '3' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,{"from":"q0","to":"q0","read":"0","write":"3","move":"R"},52,53,54,55,56]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 54,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '0', escreveu '3' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[54,"3"]},
      "head": 55,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '1', vamos para q0, escrevemos '4' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,{"from":"q0","to":"q0","read":"1","write":"4","move":"R"},53,54,55,56,57]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 55,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '1', escreveu '4' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[55,"4"]},
      "head": 56,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '2', vamos para q0, escrevemos '5' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,{"from":"q0","to":"q0","read":"2","write":"5","move":"R"},54,55,56,57,58]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 56,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '2', escreveu '5' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[56,"5"]},
      "head": 57,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '3', vamos para q0, escrevemos '6' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,{"from":"q0","to":"q0","read":"3","write":"6","move":"R"},55,56,57,58,59]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 57,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '3', escreveu '6' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[57,"6"]},
      "head": 58,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '4', vamos para q0, escrevemos '7' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,{"from":"q0","to":"q0","read":"4","write":"7","move":"R"},56,57,58,59,60]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 58,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '4', escreveu '7' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[58,"7"]},
      "head": 59,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '5', vamos para q0, escrevemos '8' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,{"from":"q0","to":"q0","read":"5","write":"8","move":"R"},57,58,59,60,61]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 59,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '5', escreveu '8' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[59,"8"]},
      "head": 60,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '6', vamos para q0, escrevemos '9' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,{"from":"q0","to":"q0","read":"6","write":"9","move":"R"},58,59,60,61,62]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 60,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '6', escreveu '9' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[60,"9"]},
      "head": 61,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '7', vamos para q0, escrevemos '0' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,{"from":"q0","to":"q0","read":"7","write":"0","move":"R"},59,60,61,62,63]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 61,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '7', escreveu '0' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[61,"0"]},
      "head": 62,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '8', vamos para q0, escrevemos '1' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,{"from":"q0","to":"q0","read":"8","write":"1","move":"R"},60,61,62,63,64]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 62,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '8', escreveu '1' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[62,"1"]},
      "head": 63,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '9', vamos para q0, escrevemos '2' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,{"from":"q0","to":"q0","read":"9","write":"2","move":"R"},61,62,63,64,65]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 63,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '9', escreveu '2' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": {"d":[63,"2"]},
      "head": 64,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler ',', vamos para q0, escrevemos ',' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,{"from":"q0","to":"q0","read":",","write":",","move":"R"},62,63,64,65,66]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 64,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu ',', escreveu ',' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 65,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '.', vamos para q0, escrevemos '.' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,{"from":"q0","to":"q0","read":".","write":".","move":"R"},63,64,65,66,67]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 65,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '.', escreveu '.' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 66,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '?', vamos para q0, escrevemos '?' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,{"from":"q0","to":"q0","read":"?","write":"?","move":"R"},64,65,66,67,68]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 66,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '?', escreveu '?' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 67,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '!', vamos para q0, escrevemos '!' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,{"from":"q0","to":"q0","read":"!","write":"!","move":"R"},65,66,67,68,69]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 67,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '!', escreveu '!' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 68,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler ';', vamos para q0, escrevemos ';' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,{"from":"q0","to":"q0","read":";","write":";","move":"R"},66,67,68,69,70]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 68,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu ';', escreveu ';' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 69,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler ':', vamos para q0, escrevemos ':' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,{"from":"q0","to":"q0","read":":","write":":","move":"R"},67,68,69,70,71]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 69,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu ':', escreveu ':' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 70,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '´', vamos para q0, escrevemos '´' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,{"from":"q0","to":"q0","read":"´","write":"´","move":"R"},68,69,70,71,72]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 70,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '´', escreveu '´' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 71,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '`', vamos para q0, escrevemos '`' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,{"from":"q0","to":"q0","read":"`","write":"`","move":"R"},69,70,71,72,73]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 71,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '`', escreveu '`' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 72,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '^', vamos para q0, escrevemos '^' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,{"from":"q0","to":"q0","read":"^","write":"^","move":"R"},70,71,72,73,74]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 72,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '^', escreveu '^' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 73,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler '~', vamos para q0, escrevemos '~' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,{"from":"q0","to":"q0","read":"~","write":"~","move":"R"},71,72,73,74,75]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 73,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '~', escreveu '~' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 74,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Nova regra: em q0, ao ler ' ', vamos para q0, escrevemos ' ' e movemos à DIREITA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,{"from":"q0","to":"q0","read":" ","write":" ","move":"R"},72,73,74,75,76]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 74,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu ' ', escreveu ' ' e moveu. Agora em q0.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 75,
      "activeNode": "q0"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 74,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler ' ', vamos para q_rw, escrevemos ' ' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":" ","write":" ","move":"L"},77]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 74,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu ' ', escreveu ' ' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 73,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '~', vamos para q_rw, escrevemos '~' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"~","write":"~","move":"L"},77,78]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 73,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '~', escreveu '~' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 72,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '^', vamos para q_rw, escrevemos '^' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"^","write":"^","move":"L"},77,78,79]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 72,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '^', escreveu '^' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 71,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '`', vamos para q_rw, escrevemos '`' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"`","write":"`","move":"L"},77,78,79,80]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 71,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '`', escreveu '`' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 70,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '´', vamos para q_rw, escrevemos '´' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"´","write":"´","move":"L"},77,78,79,80,81]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 70,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '´', escreveu '´' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 69,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler ':', vamos para q_rw, escrevemos ':' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":":","write":":","move":"L"},77,78,79,80,81,82]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 69,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu ':', escreveu ':' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 68,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler ';', vamos para q_rw, escrevemos ';' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":";","write":";","move":"L"},77,78,79,80,81,82,83]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 68,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu ';', escreveu ';' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 67,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '!', vamos para q_rw, escrevemos '!' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"!","write":"!","move":"L"},77,78,79,80,81,82,83,84]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 67,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '!', escreveu '!' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 66,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '?', vamos para q_rw, escrevemos '?' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"?","write":"?","move":"L"},77,78,79,80,81,82,83,84,85]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 66,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '?', escreveu '?' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 65,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '.', vamos para q_rw, escrevemos '.' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":".","write":".","move":"L"},77,78,79,80,81,82,83,84,85,86]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 65,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '.', escreveu '.' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 64,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler ',', vamos para q_rw, escrevemos ',' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":",","write":",","move":"L"},77,78,79,80,81,82,83,84,85,86,87]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 64,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu ',', escreveu ',' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 63,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '2', vamos para q_rw, escrevemos '2' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"2","write":"2","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 63,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '2', escreveu '2' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 62,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '1', vamos para q_rw, escrevemos '1' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"1","write":"1","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88,89]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 62,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '1', escreveu '1' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 61,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '0', vamos para q_rw, escrevemos '0' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"0","write":"0","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88,89,90]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 61,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '0', escreveu '0' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 60,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '9', vamos para q_rw, escrevemos '9' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"9","write":"9","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 60,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '9', escreveu '9' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 59,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '8', vamos para q_rw, escrevemos '8' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"8","write":"8","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 59,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '8', escreveu '8' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 58,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '7', vamos para q_rw, escrevemos '7' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"7","write":"7","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 58,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '7', escreveu '7' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 57,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '6', vamos para q_rw, escrevemos '6' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"6","write":"6","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 57,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '6', escreveu '6' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 56,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '5', vamos para q_rw, escrevemos '5' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"5","write":"5","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 56,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '5', escreveu '5' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 55,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '4', vamos para q_rw, escrevemos '4' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"4","write":"4","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 55,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '4', escreveu '4' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 54,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler '3', vamos para q_rw, escrevemos '3' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"3","write":"3","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 54,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '3', escreveu '3' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 53,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'c', vamos para q_rw, escrevemos 'c' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"c","write":"c","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 53,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'c', escreveu 'c' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 52,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'b', vamos para q_rw, escrevemos 'b' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"b","write":"b","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 52,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'b', escreveu 'b' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 51,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'a', vamos para q_rw, escrevemos 'a' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,{"from":"q_rw","to":"q_rw","read":"a","write":"a","move":"L"},77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 51,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'a', escreveu 'a' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 50,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'z', vamos para q_rw, escrevemos 'z' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"z","write":"z","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 50,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'z', escreveu 'z' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 49,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'y', vamos para q_rw, escrevemos 'y' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"y","write":"y","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 49,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'y', escreveu 'y' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 48,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'x', vamos para q_rw, escrevemos 'x' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"x","write":"x","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 48,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'x', escreveu 'x' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 47,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'w', vamos para q_rw, escrevemos 'w' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"w","write":"w","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 47,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'w', escreveu 'w' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 46,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'v', vamos para q_rw, escrevemos 'v' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"v","write":"v","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 46,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'v', escreveu 'v' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 45,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'u', vamos para q_rw, escrevemos 'u' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"u","write":"u","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 45,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'u', escreveu 'u' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 44,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 't', vamos para q_rw, escrevemos 't' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"t","write":"t","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 44,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 't', escreveu 't' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 43,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 's', vamos para q_rw, escrevemos 's' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"s","write":"s","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 43,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 's', escreveu 's' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 42,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'r', vamos para q_rw, escrevemos 'r' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"r","write":"r","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 42,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'r', escreveu 'r' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 41,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'q', vamos para q_rw, escrevemos 'q' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"q","write":"q","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 41,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'q', escreveu 'q' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 40,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'p', vamos para q_rw, escrevemos 'p' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"p","write":"p","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 40,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'p', escreveu 'p' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 39,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'o', vamos para q_rw, escrevemos 'o' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"o","write":"o","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 39,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'o', escreveu 'o' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 38,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'n', vamos para q_rw, escrevemos 'n' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"n","write":"n","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 38,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'n', escreveu 'n' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 37,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'm', vamos para q_rw, escrevemos 'm' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"m","write":"m","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 37,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'm', escreveu 'm' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 36,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'l', vamos para q_rw, escrevemos 'l' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"l","write":"l","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 36,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'l', escreveu 'l' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 35,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'k', vamos para q_rw, escrevemos 'k' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"k","write":"k","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 35,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'k', escreveu 'k' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 34,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'j', vamos para q_rw, escrevemos 'j' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"j","write":"j","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 34,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'j', escreveu 'j' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 33,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'i', vamos para q_rw, escrevemos 'i' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"i","write":"i","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 33,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'i', escreveu 'i' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 32,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'h', vamos para q_rw, escrevemos 'h' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"h","write":"h","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 32,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'h', escreveu 'h' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 31,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'g', vamos para q_rw, escrevemos 'g' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"g","write":"g","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 31,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'g', escreveu 'g' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 30,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'f', vamos para q_rw, escrevemos 'f' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"f","write":"f","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 30,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'f', escreveu 'f' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 29,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'e', vamos para q_rw, escrevemos 'e' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"e","write":"e","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 29,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'e', escreveu 'e' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 28,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'd', vamos para q_rw, escrevemos 'd' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"d","write":"d","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 28,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'd', escreveu 'd' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 27,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'C', vamos para q_rw, escrevemos 'C' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,{"from":"q_rw","to":"q_rw","read":"C","write":"C","move":"L"},74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 27,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'C', escreveu 'C' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 26,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'B', vamos para q_rw, escrevemos 'B' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,{"from":"q_rw","to":"q_rw","read":"B","write":"B","move":"L"},74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 26,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'B', escreveu 'B' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 25,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'A', vamos para q_rw, escrevemos 'A' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,{"from":"q_rw","to":"q_rw","read":"A","write":"A","move":"L"},74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 25,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'A', escreveu 'A' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 24,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'Z', vamos para q_rw, escrevemos 'Z' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"Z","write":"Z","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 24,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'Z', escreveu 'Z' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 23,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'Y', vamos para q_rw, escrevemos 'Y' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"Y","write":"Y","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 23,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'Y', escreveu 'Y' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 22,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'X', vamos para q_rw, escrevemos 'X' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"X","write":"X","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 22,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'X', escreveu 'X' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 21,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'W', vamos para q_rw, escrevemos 'W' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"W","write":"W","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 21,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'W', escreveu 'W' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 20,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'V', vamos para q_rw, escrevemos 'V' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"V","write":"V","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 20,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'V', escreveu 'V' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 19,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'U', vamos para q_rw, escrevemos 'U' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"U","write":"U","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 19,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'U', escreveu 'U' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 18,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'T', vamos para q_rw, escrevemos 'T' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"T","write":"T","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 18,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'T', escreveu 'T' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 17,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'S', vamos para q_rw, escrevemos 'S' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"S","write":"S","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 17,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'S', escreveu 'S' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 16,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'R', vamos para q_rw, escrevemos 'R' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"R","write":"R","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 16,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'R', escreveu 'R' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 15,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'Q', vamos para q_rw, escrevemos 'Q' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"Q","write":"Q","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 15,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'Q', escreveu 'Q' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 14,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'P', vamos para q_rw, escrevemos 'P' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"P","write":"P","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 14,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'P', escreveu 'P' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 13,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'O', vamos para q_rw, escrevemos 'O' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"O","write":"O","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 13,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'O', escreveu 'O' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 12,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'N', vamos para q_rw, escrevemos 'N' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"N","write":"N","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 12,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'N', escreveu 'N' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 11,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'M', vamos para q_rw, escrevemos 'M' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"M","write":"M","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 11,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'M', escreveu 'M' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 10,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'L', vamos para q_rw, escrevemos 'L' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"L","write":"L","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 10,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'L', escreveu 'L' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 9,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'K', vamos para q_rw, escrevemos 'K' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"K","write":"K","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 9,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'K', escreveu 'K' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 8,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'J', vamos para q_rw, escrevemos 'J' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"J","write":"J","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 8,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'J', escreveu 'J' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 7,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'I', vamos para q_rw, escrevemos 'I' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"I","write":"I","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 7,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'I', escreveu 'I' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 6,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'H', vamos para q_rw, escrevemos 'H' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"H","write":"H","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 6,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'H', escreveu 'H' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 5,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Nova regra: em q_rw, ao ler 'G', vamos para q_rw, escrevemos 'G' e movemos à ESQUERDA.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": {"base":"prev","items":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,{"from":"q_rw","to":"q_rw","read":"G","write":"G","move":"L"},80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146]}
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 5,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'G', escreveu 'G' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 4,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'F', escreveu 'F' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 3,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'E', escreveu 'E' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 2,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu 'D', escreveu 'D' e moveu. Agora em q_rw.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 1,
      "activeNode": "q_rw"
    },
    {
      "prof": {
        "message": "Executou: leu '□', escreveu '□' e moveu. Agora em qf.",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 2,
      "activeNode": "qf"
    },
    {
      "prof": {
        "message": "Chegamos em qf (estado final) e não há mais nada a ler. Palavra ACEITA! ✓",
        "mood": "feliz"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "simulateWord": "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,.?!;:´`^~ ",
      "tape": "=",
      "head": 2,
      "activeNode": "qf",
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
        "message": "Q é o conjunto de ESTADOS: {q0,q_rw,qf}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "states": "{q0,q_rw,qf}"
      }
    },
    {
      "prof": {
        "message": "Σ é o alfabeto de ENTRADA: {A,B,C,a,b,c,0,1,2, ,,,.}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "sigma": "{A,B,C,a,b,c,0,1,2, ,,,.}"
      }
    },
    {
      "prof": {
        "message": "Γ é o alfabeto da FITA: { ,!,,,.,0,1,2,3,4,5,6,7,8,9,:,;,?,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,^,`,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,~,´,□}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "gamma": "{ ,!,,,.,0,1,2,3,4,5,6,7,8,9,:,;,?,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,^,`,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,~,´,□}"
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
        "message": "F é o conjunto de estados de ACEITAÇÃO: {qf}",
        "mood": "explicando"
      },
      "stateUpdate": {
        "nodes": "=",
        "transitions": "="
      },
      "phase": "FORMAL",
      "formalFill": {
        "final": "{qf}"
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
            "from": "q0",
            "to": "q0",
            "read": "A",
            "write": "D",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "B",
            "write": "E",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "C",
            "write": "F",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "D",
            "write": "G",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "E",
            "write": "H",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "F",
            "write": "I",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "G",
            "write": "J",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "H",
            "write": "K",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "I",
            "write": "L",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "J",
            "write": "M",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "K",
            "write": "N",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "L",
            "write": "O",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "M",
            "write": "P",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "N",
            "write": "Q",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "O",
            "write": "R",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "P",
            "write": "S",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "Q",
            "write": "T",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "R",
            "write": "U",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "S",
            "write": "V",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "T",
            "write": "W",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "U",
            "write": "X",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "V",
            "write": "Y",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "W",
            "write": "Z",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "X",
            "write": "A",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "Y",
            "write": "B",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "Z",
            "write": "C",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "a",
            "write": "d",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "b",
            "write": "e",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "c",
            "write": "f",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "d",
            "write": "g",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "e",
            "write": "h",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "f",
            "write": "i",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "g",
            "write": "j",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "h",
            "write": "k",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "i",
            "write": "l",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "j",
            "write": "m",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "k",
            "write": "n",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "l",
            "write": "o",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "m",
            "write": "p",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "n",
            "write": "q",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "o",
            "write": "r",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "p",
            "write": "s",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "q",
            "write": "t",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "r",
            "write": "u",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "s",
            "write": "v",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "t",
            "write": "w",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "u",
            "write": "x",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "v",
            "write": "y",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "w",
            "write": "z",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "x",
            "write": "a",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "y",
            "write": "b",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "z",
            "write": "c",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "0",
            "write": "3",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "1",
            "write": "4",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "2",
            "write": "5",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "3",
            "write": "6",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "4",
            "write": "7",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "5",
            "write": "8",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "6",
            "write": "9",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "7",
            "write": "0",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "8",
            "write": "1",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "9",
            "write": "2",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": ",",
            "write": ",",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": ".",
            "write": ".",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "?",
            "write": "?",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "!",
            "write": "!",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": ";",
            "write": ";",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": ":",
            "write": ":",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "´",
            "write": "´",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "`",
            "write": "`",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "^",
            "write": "^",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": "~",
            "write": "~",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q0",
            "read": " ",
            "write": " ",
            "move": "R"
          },
          {
            "from": "q0",
            "to": "q_rw",
            "read": "",
            "write": "",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "A",
            "write": "A",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "B",
            "write": "B",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "C",
            "write": "C",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "D",
            "write": "D",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "E",
            "write": "E",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "F",
            "write": "F",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "G",
            "write": "G",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "H",
            "write": "H",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "I",
            "write": "I",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "J",
            "write": "J",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "K",
            "write": "K",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "L",
            "write": "L",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "M",
            "write": "M",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "N",
            "write": "N",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "O",
            "write": "O",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "P",
            "write": "P",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "Q",
            "write": "Q",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "R",
            "write": "R",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "S",
            "write": "S",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "T",
            "write": "T",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "U",
            "write": "U",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "V",
            "write": "V",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "W",
            "write": "W",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "X",
            "write": "X",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "Y",
            "write": "Y",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "Z",
            "write": "Z",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "a",
            "write": "a",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "b",
            "write": "b",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "c",
            "write": "c",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "d",
            "write": "d",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "e",
            "write": "e",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "f",
            "write": "f",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "g",
            "write": "g",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "h",
            "write": "h",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "i",
            "write": "i",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "j",
            "write": "j",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "k",
            "write": "k",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "l",
            "write": "l",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "m",
            "write": "m",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "n",
            "write": "n",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "o",
            "write": "o",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "p",
            "write": "p",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "q",
            "write": "q",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "r",
            "write": "r",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "s",
            "write": "s",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "t",
            "write": "t",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "u",
            "write": "u",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "v",
            "write": "v",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "w",
            "write": "w",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "x",
            "write": "x",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "y",
            "write": "y",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "z",
            "write": "z",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "0",
            "write": "0",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "1",
            "write": "1",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "2",
            "write": "2",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "3",
            "write": "3",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "4",
            "write": "4",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "5",
            "write": "5",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "6",
            "write": "6",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "7",
            "write": "7",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "8",
            "write": "8",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "9",
            "write": "9",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": ",",
            "write": ",",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": ".",
            "write": ".",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "?",
            "write": "?",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "!",
            "write": "!",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": ";",
            "write": ";",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": ":",
            "write": ":",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "´",
            "write": "´",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "`",
            "write": "`",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "^",
            "write": "^",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": "~",
            "write": "~",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "q_rw",
            "read": " ",
            "write": " ",
            "move": "L"
          },
          {
            "from": "q_rw",
            "to": "qf",
            "read": "",
            "write": "",
            "move": "R"
          }
        ]
      }
    }
  ],
  },
};

export default MT_L11;
