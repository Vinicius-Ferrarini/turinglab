// ─── Funções puras da Descrição Formal do AP (testáveis sem React) ───────────
// Extraídas de APFormalDescription.jsx (mesmo espírito de
// src/modules/afd/utils/formalDescriptionLogic.js) — o componente passa a
// reusá-las via import, em vez de validar inline. `parseFormalInput`/
// `checkFormalBraceFormat` são idênticas às do AFD: reaproveitadas de lá em
// vez de duplicadas (o AP já reusa outros utils do AFD, ex. sizeHint.js).
import { parseFormalInput, checkFormalBraceFormat } from '../../afd/utils/formalDescriptionLogic.js';

export { parseFormalInput, checkFormalBraceFormat };

const LAMBDA = 'λ';
const normLambda = (v) => { const t = (v || '').trim(); return (t === '' || t === LAMBDA) ? '' : t; };

export function setsEqual(a, b) {
  return a.length === b.length && a.every(x => b.includes(x)) && b.every(x => a.includes(x));
}

/** Γ do desenho: símbolos de pop/push das transições ∪ {Z} (o fundo), ordenado. */
export function canvasGammaFromTransitions(transitions) {
  const s = new Set(['Z']);
  for (const t of transitions) {
    if (t.pop) s.add(t.pop);
    for (const c of (t.push || '')) s.add(c);
  }
  return [...s].sort();
}

/**
 * Valida a tupla (E, Σ, Γ, i, B) contra o grafo desenhado pelo aluno (nunca
 * contra o gabarito — ver ADR 0010). Retorna { ok: true, rows } ou
 * { ok: false, reason, fieldErrors }.
 */
export function validateApFormalElements({ inE, inSigma, inGamma, inInitial, inBottom, nodes, transitions, alphabet }) {
  const fmts = {
    E: checkFormalBraceFormat(inE), Sigma: checkFormalBraceFormat(inSigma), Gamma: checkFormalBraceFormat(inGamma),
    initial: checkFormalBraceFormat(inInitial, true), bottom: checkFormalBraceFormat(inBottom, true),
  };
  const braceMsg = (f) => !f ? null
    : (f === 'multi_needs_braces' ? 'Mais de 1 elemento — use { }' : 'Só 1 elemento — retire { }');
  if (Object.values(fmts).some(Boolean)) {
    return {
      ok: false, reason: 'brace_format',
      fieldErrors: {
        E: braceMsg(fmts.E), Sigma: braceMsg(fmts.Sigma), Gamma: braceMsg(fmts.Gamma),
        initial: braceMsg(fmts.initial), bottom: braceMsg(fmts.bottom),
      },
    };
  }

  const pE = parseFormalInput(inE), pSigma = parseFormalInput(inSigma), pGamma = parseFormalInput(inGamma);
  const pInitial = parseFormalInput(inInitial), pBottom = parseFormalInput(inBottom);

  const canvasE = nodes.map(n => n.label ?? n.id);
  const canvasInitial = (() => { const i = nodes.find(n => n.isInitial); return i ? (i.label ?? i.id) : null; })();
  const canvasGamma = canvasGammaFromTransitions(transitions);

  const errors = {};
  if (!setsEqual(pE, canvasE))            errors.E = 'Não bate com os estados do desenho';
  if (!setsEqual(pSigma, alphabet || [])) errors.Sigma = 'Não bate com o alfabeto de entrada';
  if (!setsEqual(pGamma, canvasGamma))    errors.Gamma = 'Não bate com os símbolos da pilha do desenho';
  if (pInitial.length !== 1 || pInitial[0] !== canvasInitial) errors.initial = 'Estado inicial incorreto';
  if (pBottom.length !== 1 || pBottom[0] !== 'Z')             errors.bottom = 'O fundo da pilha é Z';

  if (Object.keys(errors).length > 0)
    return { ok: false, reason: 'field_mismatch', fieldErrors: errors };

  const fromLabel = (id) => nodes.find(n => n.id === id)?.label ?? id;
  const rows = transitions.map((t, i) => ({ key: String(i), from: fromLabel(t.from), read: t.read, pop: t.pop }));
  return { ok: true, rows };
}

/**
 * Valida a tabela δ (destino + push por transição) preenchida pelo aluno
 * contra as transições do grafo. Retorna { ok: true } ou
 * { ok: false, cellErrors: { '0': true, ... } }.
 */
export function validateApFormalTransitions({ transitions, nodes, cells }) {
  const toLabel = (id) => nodes.find(n => n.id === id)?.label ?? id;
  const errors = {};
  transitions.forEach((t, i) => {
    const key = String(i);
    const c = cells[key] || { dest: '', push: '' };
    const okDest = (c.dest ?? '').trim() === toLabel(t.to);
    const okPush = normLambda(c.push) === normLambda(t.push);
    if (!okDest || !okPush) errors[key] = true;
  });
  if (Object.keys(errors).length > 0)
    return { ok: false, cellErrors: errors };
  return { ok: true };
}

// ─── Snapshot do formulário (içar estado pro orquestrador — persistência) ────
// Mesmo padrão de formalDescriptionLogic.js (AFD) — ver ADR 0011 §3.1.
export const EMPTY_AP_FORMAL_STATE = {
  inE: '', inSigma: '', inGamma: '', inInitial: '', inBottom: '',
  elementsValid: false, rows: [], cells: {},
};

export function buildApFormalStateSnapshot({ inE, inSigma, inGamma, inInitial, inBottom, elementsValid, rows, cells }) {
  return { inE, inSigma, inGamma, inInitial, inBottom, elementsValid, rows, cells };
}

export function normalizeApFormalInitialValues(initialValues) {
  return { ...EMPTY_AP_FORMAL_STATE, ...(initialValues ?? {}) };
}
