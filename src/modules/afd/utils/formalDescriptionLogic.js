// ─── Funções puras da Descrição Formal (testáveis sem React) ──────────────────
// Extraídas de FormalDescriptionModal.jsx — o componente as reusa via import.

// Remove chaves e divide por vírgula
export function parseFormalInput(str) {
  const clean = str ? str.trim().replace(/^\{|\}$/g, '').trim() : '';
  return clean ? clean.split(',').map(s => s.trim()).filter(Boolean) : [];
}

// Retorna 'multi_needs_braces' | 'single_no_braces' | null
// isSingle=true: campo nunca deve ter chaves (q0)
export function checkFormalBraceFormat(str, isSingle = false) {
  const t = (str || '').trim();
  if (!t || t === '{}') return null;
  const hasBraces = t.startsWith('{') && t.endsWith('}');
  const hasComma  = t.includes(',');
  if (isSingle) {
    return (t.startsWith('{') || t.endsWith('}')) ? 'single_no_braces' : null;
  }
  if (hasComma && !hasBraces) return 'multi_needs_braces';
  if (!hasComma && hasBraces) return 'single_no_braces';
  return null;
}

// Valida os 4 campos de elementos contra o canvas.
// Retorna { ok: true } ou { ok: false, fieldErrors: {Q, Sigma, initial, final} }
export function validateFormalElements({ inputQ, inputSigma, inputInitial, inputFinal, nodes, alphabet }) {
  const braceErrQ       = checkFormalBraceFormat(inputQ);
  const braceErrSigma   = checkFormalBraceFormat(inputSigma);
  const braceErrInitial = checkFormalBraceFormat(inputInitial, true);
  const braceErrFinal   = checkFormalBraceFormat(inputFinal);

  const braceMsg = (fmt) => {
    if (!fmt) return null;
    return fmt === 'multi_needs_braces'
      ? 'Tem mais de 1 elemento, use { }'
      : 'Tem somente 1 elemento, Retire{ }';
  };

  if (braceErrQ || braceErrSigma || braceErrInitial || braceErrFinal) {
    return {
      ok: false,
      reason: 'brace_format',
      fieldErrors: {
        Q:       braceMsg(braceErrQ),
        Sigma:   braceMsg(braceErrSigma),
        initial: braceMsg(braceErrInitial),
        final:   braceMsg(braceErrFinal),
      },
    };
  }

  const pQ       = parseFormalInput(inputQ);
  const pSigma   = parseFormalInput(inputSigma);
  const pInitial = parseFormalInput(inputInitial);
  const pFinal   = parseFormalInput(inputFinal);

  const canvasQ       = nodes.map(n => n.label ?? n.id);
  const canvasSigma   = alphabet || [];
  const canvasInitial = nodes.find(n => n.isInitial)?.label ?? nodes.find(n => n.isInitial)?.id;
  const canvasFinal   = nodes.filter(n => n.isFinal).map(n => n.label ?? n.id);

  const errors = { Q: null, Sigma: null, initial: null, final: null };

  const extraQ   = pQ.filter(x => !canvasQ.includes(x));
  const missingQ = canvasQ.filter(x => !pQ.includes(x));
  if (extraQ.length > 0 && missingQ.length > 0)
    errors.Q = `${extraQ.join(', ')} não pertence${extraQ.length > 1 ? 'm' : ''} — e ainda faltam estados`;
  else if (extraQ.length > 0)
    errors.Q = `${extraQ.join(', ')} não pertence${extraQ.length > 1 ? 'm' : ''} ao conjunto de estados`;
  else if (missingQ.length > 0)
    errors.Q = `Faltam estados no conjunto — verifique se há outros erros`;

  const extraSigma   = pSigma.filter(x => !canvasSigma.includes(x));
  const missingSigma = canvasSigma.filter(x => !pSigma.includes(x));
  if (extraSigma.length > 0 && missingSigma.length > 0)
    errors.Sigma = `${extraSigma.join(', ')} não pertence${extraSigma.length > 1 ? 'm' : ''} ao alfabeto — e ainda faltam símbolos`;
  else if (extraSigma.length > 0)
    errors.Sigma = `${extraSigma.join(', ')} não pertence${extraSigma.length > 1 ? 'm' : ''} ao alfabeto`;
  else if (missingSigma.length > 0)
    errors.Sigma = `Faltam símbolos no alfabeto`;

  const wrongInitial = canvasInitial
    ? (pInitial.length !== 1 || pInitial[0] !== canvasInitial)
    : pInitial.length !== 0;
  if (wrongInitial)
    errors.initial = pInitial.length === 0
      ? 'Informe o estado inicial'
      : `${pInitial[0]} não é o estado inicial`;

  const extraF   = pFinal.filter(x => !canvasFinal.includes(x));
  const missingF = canvasFinal.filter(x => !pFinal.includes(x));
  if (extraF.length > 0 && missingF.length > 0)
    errors.final = `${extraF.join(', ')} não é${extraF.length > 1 ? 'o' : ''} estado${extraF.length > 1 ? 's' : ''} final${extraF.length > 1 ? 'is' : ''} — e ainda faltam outros`;
  else if (extraF.length > 0)
    errors.final = `${extraF.join(', ')} não é${extraF.length > 1 ? 'o' : ''} estado${extraF.length > 1 ? 's' : ''} final${extraF.length > 1 ? 'is' : ''}`;
  else if (missingF.length > 0)
    errors.final = `Faltam estados finais`;

  if (Object.values(errors).some(Boolean))
    return { ok: false, reason: 'field_mismatch', fieldErrors: errors };

  return { ok: true, parsed: { Q: pQ, Sigma: pSigma, initial: pInitial[0], final: pFinal } };
}

// Valida a tabela δ preenchida pelo aluno contra as transições do canvas.
// Retorna { ok: true } ou { ok: false, cellErrors: { 'q0_a': true, ... } }
export function validateFormalTransitions({ parsedQ, parsedSigma, transitionTableData, nodes, transitions }) {
  const errors = {};
  for (const q of parsedQ) {
    for (const s of parsedSigma) {
      const userDest   = transitionTableData[q]?.[s] ?? '';
      const actualTrans = transitions.find(t => {
        const fromLabel = nodes.find(n => n.id === t.from)?.label ?? t.from;
        return fromLabel === q && t.symbol.split(',').map(x => x.trim()).includes(s);
      });
      const actualDest = actualTrans
        ? (nodes.find(n => n.id === actualTrans.to)?.label ?? actualTrans.to)
        : '';
      if (userDest !== actualDest) errors[`${q}_${s}`] = true;
    }
  }
  if (Object.keys(errors).length > 0)
    return { ok: false, cellErrors: errors };
  return { ok: true };
}

// ─── Snapshot do formulário (içar estado pro orquestrador — persistência) ────
// FormalDescriptionModal.jsx vira um componente controlado (initialValues/
// onStateChange, ver ADR 0011 §3.1): estas funções puras definem "qual
// snapshot representa o estado atual do formulário", testável sem montar
// React, antes de tocar no componente.
export const EMPTY_FORMAL_STATE = {
  inputQ: '', inputSigma: '', inputInitial: '', inputFinal: '',
  areElementsValid: false, parsedQ: [], parsedSigma: [], transitionTableData: {},
};

/** Extrai só as 8 peças de estado que compõem o payload persistido (ignora fieldErrors/tableErrors — deriváveis, não persistidos). */
export function buildFormalStateSnapshot({
  inputQ, inputSigma, inputInitial, inputFinal,
  areElementsValid, parsedQ, parsedSigma, transitionTableData,
}) {
  return { inputQ, inputSigma, inputInitial, inputFinal, areElementsValid, parsedQ, parsedSigma, transitionTableData };
}

/** Completa um snapshot salvo (possivelmente parcial) com os defaults de fase nova. */
export function normalizeFormalInitialValues(initialValues) {
  return { ...EMPTY_FORMAL_STATE, ...(initialValues ?? {}) };
}
