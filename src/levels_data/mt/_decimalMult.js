// ─── Gerador dos níveis "decimal × N" (L17–L23) ──────────────────────────────
// L16 (× 2) é o gabarito oficial. L17..L23 (× 3 .. × 9) seguem exatamente a
// mesma construção, parametrizada por N — um único gerador garante que os 7
// fiquem idênticos em estrutura.
//
// Máquina (varredura da DIREITA para a ESQUERDA, propagando o "vai-um"):
//   q1                 — lê o número da esquerda p/ direita sem alterar
//   q1  --□;□,L-->  qc0 — achou o fim: começa a multiplicar de trás p/ frente
//   qc{c} --d;u,L--> qc{c'} — lê o dígito d com carry de entrada c:
//                            p = d·N + c ; escreve u = p mod 10 ; c' = ⌊p/10⌋
//   qc0   --□;□,R--> qf — sem carry pendente: já está no branco → 1 à direita
//                        (cai no 1º dígito) e ACEITA
//   qc{c} --□;c,L--> qR — carry pendente (c ≥ 1): escreve o dígito do carry
//                        como novo dígito mais à esquerda e recua p/ o branco
//   qR    --□;□,R--> qf — no branco inicial → 1 à direita (1º dígito) e ACEITA
//
// O par qc{c}→qR→qf é o "Padrão Rewind" (mesmo do L16 VAI 1→q0→q4): ao aceitar,
// o cabeçote SEMPRE para no 1º caractere da palavra de saída, indo até o branco
// e depois 1 à direita.
import { buildTransducerSim } from './buildTransducerSim.js';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

function buildMachine(N) {
  const maxCarry = Math.floor((9 * N) / 10); // = N - 1 para N em 2..9

  const baseX = 3100;
  const stepX = 300;
  const y = 4350;
  const nodes = [{ uid: 'q1', id: 'q1', label: 'q1', x: baseX, y, isInitial: true, isFinal: false }];
  for (let c = 0; c <= maxCarry; c++) {
    nodes.push({ uid: `qc${c}`, id: `qc${c}`, label: `qc${c}`, x: baseX + (c + 1) * stepX, y, isInitial: false, isFinal: false });
  }
  nodes.push({ uid: 'qR', id: 'qR', label: 'qR', x: baseX + (maxCarry + 2) * stepX, y: y + 200, isInitial: false, isFinal: false });
  nodes.push({ uid: 'qf', id: 'qf', label: 'qf', x: baseX + (maxCarry + 3) * stepX, y, isInitial: false, isFinal: true });

  // Transições agrupadas por estado (a ordem não afeta o determinismo — cada
  // (from, read) é único — mas deixa a revelação da δ mais legível).
  const scan = DIGITS.map((d) => ({ from: 'q1', to: 'q1', read: d, write: d, move: 'R' }));
  scan.push({ from: 'q1', to: 'qc0', read: '', write: '', move: 'L' });

  const carryRows = [];
  for (let c = 0; c <= maxCarry; c++) {
    const row = DIGITS.map((d) => {
      const p = Number(d) * N + c;
      return { from: `qc${c}`, to: `qc${Math.floor(p / 10)}`, read: d, write: String(p % 10), move: 'L' };
    });
    if (c === 0) row.push({ from: 'qc0', to: 'qf', read: '', write: '', move: 'R' });
    else row.push({ from: `qc${c}`, to: 'qR', read: '', write: String(c), move: 'L' });
    carryRows.push(row);
  }
  const rewind = [{ from: 'qR', to: 'qf', read: '', write: '', move: 'R' }];

  const transitions = [...scan, ...carryRows.flat(), ...rewind];
  return { N, maxCarry, nodes, transitions, scan, carryRows, rewind };
}

// Bateria de palavras que cobre 100% das transições:
//  - "0".."9": q1 lê cada dígito; qc0 lê cada dígito; qc{c}→qR / qc0→qf conforme o carry final
//  - "d"+e_c para c=1..maxCarry: força qc{c} a ler cada dígito d (e_c é o menor
//    dígito cujo N·e_c gera carry c)
//  - testWords do nível (0,1,5,10,99,123) p/ casar com o fuzz/validate
function coverageBattery(N, maxCarry, testWords) {
  const words = new Set(DIGITS);
  for (let c = 1; c <= maxCarry; c++) {
    const ec = Math.ceil((c * 10) / N); // menor e com ⌊e·N/10⌋ = c
    if (ec <= 9) for (const d of DIGITS) words.add(d + String(ec));
  }
  for (const w of testWords) if (w !== '') words.add(w);
  // ordena: 1 dígito primeiro, depois por comprimento e valor
  return [...words].sort((a, b) => a.length - b.length || Number(a) - Number(b) || a.localeCompare(b));
}

export function makeDecimalMultLevel(N, id, label) {
  const m = buildMachine(N);
  const { nodes, transitions, maxCarry } = m;
  const curatedWords = ['0', '1', '5', '10', '99', '123'];
  // A bateria de VALIDAÇÃO (level.testWords, o que fuzzTMTransducer usa em
  // "✓ Validar MT") precisa da MESMA cobertura de 100% das transições que
  // coverageBattery() já calculava só pra aula guiada — senão um aluno pode
  // "esquecer" uma célula qc{c}→qc{c'} da tabela de carry sem a validação
  // notar (mesma classe de bug do L06, ver docs/PLAN_BATERIA_VALIDACAO_MT.md).
  const testWords = coverageBattery(N, maxCarry, curatedWords);
  const stateList = `{q1, ${Array.from({ length: maxCarry + 1 }, (_, c) => `qc${c}`).join(', ')}, qR, qf}`;

  const steps = [];
  steps.push({
    prof: { message: `Bem-vindo! Esta MT recebe um número decimal e devolve o número multiplicado por ${N}. A ideia: multiplicar dígito a dígito, da DIREITA para a ESQUERDA, escrevendo as unidades e levando as dezenas como "vai-um" (carry).`, mood: 'explicando' },
    stateUpdate: { nodes: [], transitions: [] },
  });
  steps.push({
    prof: { message: `Grafo completo: q1 varre o número; qc0…qc${maxCarry} multiplicam cada dígito por ${N} carregando o carry de entrada (0 a ${maxCarry}); qc0 sem carry final vai direto a qf; qc1…qc${maxCarry} escrevem o dígito do carry, recuam ao branco (qR) e só então aceitam — o cabeçote sempre termina no 1º dígito do resultado.`, mood: 'explicando' },
    stateUpdate: { nodes, transitions },
  });

  for (const w of testWords) {
    const res = String(parseInt(w, 10) * N);
    steps.push(...buildTransducerSim(w, {
      nodes, transitions,
      leadingBlanks: 2, trailingBlanks: 2,
      introMessage: `Próxima palavra: "${w}"  (${w} × ${N} = ${res}). Vamos simular transição por transição.`,
      introMood: 'serio',
    }));
  }

  // ── Descrição formal, campo por campo ──────────────────────────────────────
  const frozen = { nodes, transitions };
  steps.push({ prof: { message: 'Número finalizado! 🎉 Agora a 7-tupla M = (Q, Σ, Γ, δ, q1, □, F), campo por campo.', mood: 'feliz' }, stateUpdate: frozen, formalIntro: true });
  const ff = (msg, fill) => steps.push({ prof: { message: msg, mood: 'explicando' }, stateUpdate: frozen, phase: 'FORMAL', formalFill: fill });
  ff(`Q é o conjunto de ESTADOS: ${stateList}. q1 varre; qc0…qc${maxCarry} multiplicam com carry; qR rebobina; qf aceita.`, { states: stateList });
  ff('Σ é o alfabeto de ENTRADA: os dez dígitos {0,1,2,3,4,5,6,7,8,9}.', { sigma: '{0,1,2,3,4,5,6,7,8,9}' });
  ff('Γ é o alfabeto da FITA: os dígitos e o branco {0,1,2,3,4,5,6,7,8,9,□}.', { gamma: '{0,1,2,3,4,5,6,7,8,9,□}' });
  ff('q1 é o estado INICIAL — varre o número da esquerda para a direita sem alterar.', { initial: 'q1' });
  ff('O símbolo BRANCO (□) delimita o número na fita.', { blank: '□' });
  ff('F é o conjunto de estados de ACEITAÇÃO: {qf}.', { final: '{qf}' });
  ff(`δ — q1: para cada dígito, laço d;d,R (só varre); ao ler □, vai a qc0 movendo à ESQUERDA para começar a multiplicar de trás para frente.`, { delta: m.scan });
  let acc = [...m.scan];
  for (let c = 0; c <= maxCarry; c++) {
    acc = [...acc, ...m.carryRows[c]];
    const tailMsg = c === 0
      ? 'qc0 sem carry pendente: ao ler □ já está no branco → move 1 à DIREITA (cai no 1º dígito) e ACEITA em qf.'
      : `qc${c} ao ler □: escreve o dígito ${c} (o carry vira o novo 1º dígito) e recua à ESQUERDA para qR.`;
    ff(`δ — qc${c}: lê o dígito d com carry ${c}; escreve (d×${N}+${c}) mod 10 e leva ⌊(d×${N}+${c})/10⌋. ${tailMsg}`, { delta: [...acc] });
  }
  acc = [...acc, ...m.rewind];
  ff('δ — qR: no branco inicial, move 1 à DIREITA e ACEITA em qf, com o cabeçote no 1º dígito do resultado. δ completa! ✓', { delta: acc });

  return {
    id,
    label,
    type: 'transducer',
    level: 'hard',
    alphabet: [...DIGITS],
    tapeAlphabet: [...DIGITS, '□'],
    description: `Tem como entrada um número qualquer em decimal e gera como saída o número multiplicado por ${N} – Decimal vezes ${N}.`,
    hint: `Multiplique cada dígito por ${N}, escreva o dígito das unidades e propague o carry (dezenas) para o dígito à esquerda, da direita para a esquerda.`,
    validate: (w) => String(parseInt(w, 10) * N),
    testWords,
    skipEmptyWord: true,
    formalDescription: {
      sigma: '{0,1,2,3,4,5,6,7,8,9}',
      gamma: '{0,1,2,3,4,5,6,7,8,9,□}',
      states: stateList,
      initial: 'q1',
      final: '{qf}',
      blank: '□',
    },
    guidedLesson: { steps },
  };
}
