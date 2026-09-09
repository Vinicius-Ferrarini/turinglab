// FormalDescriptionModal.jsx — v5.0 (+ Modo Aula demo com auto-scroll)
import { useState, useEffect, useRef } from 'react';
import './FormalDescriptionModal.css';
import { onBracketKeyDown } from './utils/bracketAutoClose';
import {
  parseFormalInput, checkFormalBraceFormat,
  buildFormalStateSnapshot, normalizeFormalInitialValues,
} from './utils/formalDescriptionLogic';

export default function FormalDescriptionModal({
  isOpen,
  onClose,
  nodes,
  transitions,
  alphabet,
  onSuccess,
  showToast,
  onValidateGraph,
  onTableFocusChange,
  demo, // { fields, rows, deltaRows, allStates, current } — modo Aula Guiada (read-only)
  // Componente controlado (persistência de sessão — ver ADR 0011 §3.1):
  // initialValues hidrata o formulário ao montar/reabrir (snapshot salvo ou
  // null pra fase nova); onStateChange emite o snapshot atual a cada mudança
  // (sem debounce aqui — quem debounça é o hook de persistência, não este componente).
  initialValues,
  onStateChange,
}) {
  // ── Auto-scroll para o elemento ativo no modo demo ─────────────────────────
  const currentElRef = useRef(null);
  const demoKey = demo?.current
    ? (demo.current.kind === 'delta'
        ? `d:${demo.current.rowKey}`
        : `t:${Object.keys(demo.current.fields || {}).join(',')}`)
    : null;
  useEffect(() => {
    if (demoKey) currentElRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [demoKey]);
  const initNorm = normalizeFormalInitialValues(initialValues);
  const [inputQ,       setInputQ]       = useState(initNorm.inputQ);
  const [inputSigma,   setInputSigma]   = useState(initNorm.inputSigma);
  const [inputInitial, setInputInitial] = useState(initNorm.inputInitial);
  const [inputFinal,   setInputFinal]   = useState(initNorm.inputFinal);

  const [areElementsValid,    setAreElementsValid]    = useState(initNorm.areElementsValid);
  const [parsedQ,             setParsedQ]             = useState(initNorm.parsedQ);
  const [parsedSigma,         setParsedSigma]         = useState(initNorm.parsedSigma);
  const [transitionTableData, setTransitionTableData] = useState(initNorm.transitionTableData);

  const [fieldErrors, setFieldErrors] = useState({ Q: null, Sigma: null, initial: null, final: null });
  const [tableErrors, setTableErrors] = useState({});

  // Ao (re)abrir: hidrata de initialValues quando existir (sessão salva pra
  // esta fase); senão reseta em branco — comportamento de sempre. Sem essa
  // distinção, reabrir o painel apagaria imediatamente o que acabou de ser
  // restaurado (ver ADR 0011 §3.1).
  useEffect(() => {
    if (!isOpen) return;
    const norm = normalizeFormalInitialValues(initialValues);
    setInputQ(norm.inputQ); setInputSigma(norm.inputSigma);
    setInputInitial(norm.inputInitial); setInputFinal(norm.inputFinal);
    setAreElementsValid(norm.areElementsValid);
    setParsedQ(norm.parsedQ); setParsedSigma(norm.parsedSigma);
    setTransitionTableData(norm.transitionTableData);
    setFieldErrors({ Q: null, Sigma: null, initial: null, final: null });
    setTableErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Emite o snapshot atual a cada mudança relevante — o componente sempre
  // roda esse efeito (hooks executam antes do `if (!isOpen) return null`
  // abaixo), então o orquestrador recebe o estado do formulário mesmo com o
  // painel fechado (necessário pro autosave capturar preenchimento parcial).
  useEffect(() => {
    onStateChange?.(buildFormalStateSnapshot({
      inputQ, inputSigma, inputInitial, inputFinal,
      areElementsValid, parsedQ, parsedSigma, transitionTableData,
    }));
  }, [inputQ, inputSigma, inputInitial, inputFinal, areElementsValid, parsedQ, parsedSigma, transitionTableData, onStateChange]);

  if (!isOpen) return null;

  // ── Modo demo (Aula Guiada): read-only, revela a tupla + δ passo a passo ───
  if (demo) {
    const fields        = demo.fields || {};
    const allStates     = demo.allStates ?? [];
    const deltaRows     = demo.deltaRows ?? {};
    const revealedRows  = demo.rows ?? new Set();
    const curKind       = demo.current?.kind;
    const curField      = curKind === 'tuple' ? Object.keys(demo.current.fields || {})[0] : null;
    const curRow        = curKind === 'delta'  ? demo.current.rowKey : null;

    const revealed  = (k) => Object.prototype.hasOwnProperty.call(fields, k);
    const demoField = (key, label, placeholder) => (
      <div
        ref={key === curField ? currentElRef : null}
        className={`form-group ap-demo-group${revealed(key) ? '' : ' ap-demo-dim'}`}
      >
        <label>{label}</label>
        <input type="text" readOnly
          value={revealed(key) ? fields[key] : ''}
          placeholder={revealed(key) ? '' : placeholder}
          translate="no"
        />
      </div>
    );

    return (
      <div className="formal-sidebar-content">
        <h2>Descrição Formal (AFD)</h2>
        <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px' }}>
          👨‍🏫 <b>Modo Aula</b> — M = (Q, Σ, δ, q₀, F) lido direto do grafo.
        </p>

        {demoField('Q',       'Q (Conjunto de Estados):',  '…')}
        {demoField('Sigma',   'Σ (Alfabeto):',             '…')}
        {demoField('initial', 'q₀ (Estado Inicial):',      '…')}
        {demoField('final',   'F (Estados Finais):',       '…')}

        {allStates.length > 0 && (
          <div className="table-section">
            <h3>Tabela de transição (δ)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="transition-table">
                <thead>
                  <tr>
                    <th>δ</th>
                    {(alphabet || []).map(s => <th key={s}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {allStates.map(lbl => {
                    const shown   = revealedRows.has(lbl);
                    const isCur   = lbl === curRow;
                    return (
                      <tr
                        key={lbl}
                        ref={isCur ? currentElRef : null}
                        className={`${shown ? '' : 'ap-demo-dim'}${isCur ? ' ap-delta-row-current' : ''}`}
                      >
                        <td className="row-header">{lbl}</td>
                        {(alphabet || []).map(sym => (
                          <td key={sym}>{shown ? (deltaRows[lbl]?.[sym] ?? '') : '…'}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }


  // Strips braces and splits — used only after format validation passes
  const parseInput = (str) => parseFormalInput(str);

  // Returns 'multi_needs_braces' | 'single_no_braces' | null
  // isSingle=true: field must never have braces (q0)
  const checkBraceFormat = (str, isSingle = false) => checkFormalBraceFormat(str, isSingle);

  const validateElements = () => {
    if (onValidateGraph && !onValidateGraph()) return;

    // ── Passo 1: formato das chaves ────────────────────────────────────────────
    const fmtQ       = checkBraceFormat(inputQ);
    const fmtSigma   = checkBraceFormat(inputSigma);
    const fmtInitial = checkBraceFormat(inputInitial, true);
    const fmtFinal   = checkBraceFormat(inputFinal);

    const hasMissing = [fmtQ, fmtSigma, fmtInitial, fmtFinal].includes('multi_needs_braces');
    const hasExtra   = [fmtQ, fmtSigma, fmtInitial, fmtFinal].includes('single_no_braces');

    const braceMsg = (fmt) => {
      if (!fmt) return null;
      return fmt === 'multi_needs_braces'
        ? 'Tem mais de 1 elemento, use { }'
        : 'Tem somente 1 elemento, Retire{ }';
    };

    if (hasMissing || hasExtra) {
      setFieldErrors({
        Q:       braceMsg(fmtQ),
        Sigma:   braceMsg(fmtSigma),
        initial: braceMsg(fmtInitial),
        final:   braceMsg(fmtFinal),
      });

      const msg = hasMissing && hasExtra
        ? 'Use { } com mais de 1 elemento — sem { } com 1 só'
        : hasMissing
        ? 'Com mais de 1 elemento, adicione { } — ex: {q0, q1}'
        : 'Com 1 elemento, retire as { } — ex: q0';
      showToast(msg, 'error');
      return;
    }

    // ── Passo 2: validar contra o canvas ──────────────────────────────────────
    const pQ       = parseInput(inputQ);
    const pSigma   = parseInput(inputSigma);
    const pInitial = parseInput(inputInitial);
    const pFinal   = parseInput(inputFinal);

    const canvasQ       = nodes.map(n => n.label ?? n.id);
    const canvasSigma   = alphabet || [];
    const canvasInitial = nodes.find(n => n.isInitial)?.label ?? nodes.find(n => n.isInitial)?.id;
    const canvasFinal   = nodes.filter(n => n.isFinal).map(n => n.label ?? n.id);

    const errors = { Q: null, Sigma: null, initial: null, final: null };

    // Q — estados
    const extraQ   = pQ.filter(x => !canvasQ.includes(x));
    const missingQ = canvasQ.filter(x => !pQ.includes(x));
    if (extraQ.length > 0 && missingQ.length > 0)
      errors.Q = `${extraQ.join(', ')} não pertence${extraQ.length > 1 ? 'm' : ''} — e ainda faltam estados`;
    else if (extraQ.length > 0)
      errors.Q = `${extraQ.join(', ')} não pertence${extraQ.length > 1 ? 'm' : ''} ao conjunto de estados`;
    else if (missingQ.length > 0)
      errors.Q = `Faltam estados no conjunto — verifique se há outros erros`;

    // Σ — alfabeto
    const extraSigma   = pSigma.filter(x => !canvasSigma.includes(x));
    const missingSigma = canvasSigma.filter(x => !pSigma.includes(x));
    if (extraSigma.length > 0 && missingSigma.length > 0)
      errors.Sigma = `${extraSigma.join(', ')} não pertence${extraSigma.length > 1 ? 'm' : ''} ao alfabeto — e ainda faltam símbolos`;
    else if (extraSigma.length > 0)
      errors.Sigma = `${extraSigma.join(', ')} não pertence${extraSigma.length > 1 ? 'm' : ''} ao alfabeto`;
    else if (missingSigma.length > 0)
      errors.Sigma = `Faltam símbolos no alfabeto`;

    // q₀ — estado inicial
    const wrongInitial = canvasInitial
      ? (pInitial.length !== 1 || pInitial[0] !== canvasInitial)
      : pInitial.length !== 0;
    if (wrongInitial)
      errors.initial = pInitial.length === 0
        ? 'Informe o estado inicial'
        : `${pInitial[0]} não é o estado inicial`;

    // F — estados finais
    const extraF   = pFinal.filter(x => !canvasFinal.includes(x));
    const missingF = canvasFinal.filter(x => !pFinal.includes(x));
    if (extraF.length > 0 && missingF.length > 0)
      errors.final = `${extraF.join(', ')} não é${extraF.length > 1 ? 'o' : ''} estado${extraF.length > 1 ? 's' : ''} final${extraF.length > 1 ? 'is' : ''} — e ainda faltam outros`;
    else if (extraF.length > 0)
      errors.final = `${extraF.join(', ')} não é${extraF.length > 1 ? 'o' : ''} estado${extraF.length > 1 ? 's' : ''} final${extraF.length > 1 ? 'is' : ''}`;
    else if (missingF.length > 0)
      errors.final = `Faltam estados finais`;

    setFieldErrors(errors);

    const errCount = Object.values(errors).filter(Boolean).length;
    if (errCount > 0) {
      showToast(`${errCount} campo(s) com erro — verifique os campos em vermelho.`, 'error');
      return;
    }

    const initialData = {};
    pQ.forEach(q => { initialData[q] = {}; pSigma.forEach(s => { initialData[q][s] = ''; }); });

    setParsedQ(pQ);
    setParsedSigma(pSigma);
    setTransitionTableData(initialData);
    setAreElementsValid(true);
  };

  const handleTableChange = (state, symbol, value) => {
    setTransitionTableData(prev => ({ ...prev, [state]: { ...prev[state], [symbol]: value.trim() } }));
    setTableErrors(prev => { const next = { ...prev }; delete next[`${state}_${symbol}`]; return next; });
  };

  const validateTransitions = () => {
    if (onValidateGraph && !onValidateGraph()) {
      setAreElementsValid(false); setParsedQ([]); setParsedSigma([]); setTransitionTableData({});
      return;
    }

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

    setTableErrors(errors);
    const errCount = Object.keys(errors).length;
    if (errCount > 0) {
      showToast(`${errCount} célula(s) incorreta(s) — verifique as células em vermelho.`, 'error');
    } else {
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const clearFieldError = (key) => {
    setFieldErrors(prev => ({ ...prev, [key]: null }));
  };

  return (
    <>
      <div className="formal-sidebar-content">
        <h2>Descrição Formal</h2>

        <div className={`form-group${fieldErrors.Q ? ' field-error' : ''}`}>
          <label>Q (Conjunto de Estados):</label>
          <input
            type="text"
            placeholder="ex: q0  ou  {q0, q1}"
            value={inputQ}
            onChange={e => { setInputQ(e.target.value); clearFieldError('Q'); }}
            onKeyDown={e => onBracketKeyDown(e, setInputQ)}
            readOnly={areElementsValid}
            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
          />
          {fieldErrors.Q && <span className="field-error-msg">✕ {fieldErrors.Q}</span>}
        </div>

        <div className={`form-group${fieldErrors.Sigma ? ' field-error' : ''}`}>
          <label>Σ (Alfabeto):</label>
          <input
            type="text"
            placeholder="ex: a  ou  {a, b}"
            value={inputSigma}
            onChange={e => { setInputSigma(e.target.value); clearFieldError('Sigma'); }}
            onKeyDown={e => onBracketKeyDown(e, setInputSigma)}
            readOnly={areElementsValid}
            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
          />
          {fieldErrors.Sigma && <span className="field-error-msg">✕ {fieldErrors.Sigma}</span>}
        </div>

        <div className={`form-group${fieldErrors.initial ? ' field-error' : ''}`}>
          <label>q₀ (Estado Inicial):</label>
          <input
            type="text"
            placeholder="ex: q0"
            value={inputInitial}
            onChange={e => { setInputInitial(e.target.value); clearFieldError('initial'); }}
            readOnly={areElementsValid}
            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
          />
          {fieldErrors.initial && <span className="field-error-msg">✕ {fieldErrors.initial}</span>}
        </div>

        <div className={`form-group${fieldErrors.final ? ' field-error' : ''}`}>
          <label>F (Estados Finais):</label>
          <input
            type="text"
            placeholder="ex: q1  ou  {q1, q2}"
            value={inputFinal}
            onChange={e => { setInputFinal(e.target.value); clearFieldError('final'); }}
            onKeyDown={e => onBracketKeyDown(e, setInputFinal)}
            readOnly={areElementsValid}
            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
          />
          {fieldErrors.final && <span className="field-error-msg">✕ {fieldErrors.final}</span>}
        </div>

        {!areElementsValid && (
          <button className="btn-validate" onClick={validateElements}>
            Validar Elementos
          </button>
        )}

        {areElementsValid && (
          <div className="table-section"
            onFocus={() => onTableFocusChange?.(true)}
            onBlur={() => onTableFocusChange?.(false)}
          >
            <h3>Tabela (δ)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="transition-table">
                <thead>
                  <tr>
                    <th>δ</th>
                    {parsedSigma.map(s => <th key={s}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {parsedQ.map(q => (
                    <tr key={q}>
                      <td className="row-header">{q}</td>
                      {parsedSigma.map(s => (
                        <td key={s} className={tableErrors[`${q}_${s}`] ? 'cell-error' : ''}>
                          <input
                            type="text"
                            value={transitionTableData[q]?.[s] ?? ''}
                            onChange={e => handleTableChange(q, s, e.target.value)}
                            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="btn-validate success" onClick={validateTransitions}>
              Validar Transições
            </button>
          </div>
        )}

        <button className="btn-close" onClick={onClose}>Fechar Painel</button>
      </div>
    </>
  );
}
