// ─── APFormalDescription: descrição formal do AP (tupla + função δ) ──────────
// Fork do FormalDescriptionModal do AFD (mesmo CSS/visual), adaptado ao AP:
//  • tupla (E, Σ, Γ, i, B=Z) — SEM F (aceita por pilha vazia);
//  • função δ: linhas geradas do grafo do aluno T(estado, lê, desempilha), o
//    aluno preenche (destino, empilha). Tudo validado contra o DESENHO do aluno
//    (não contra gabarito), então o L1 não exige o λ,Z;λ.
// Estrelas: validar elementos = ★2; validar transições = ★3.
import { useState, useRef, useEffect } from 'react';
import '../../afd/FormalDescriptionModal.css';
import { onBracketKeyDown } from '../../afd/utils/bracketAutoClose';
import {
  validateApFormalElements, validateApFormalTransitions,
  buildApFormalStateSnapshot, normalizeApFormalInitialValues,
} from '../utils/apFormalDescriptionLogic';

const LAMBDA = 'λ';
const showF = (v) => (v === '' || v == null ? LAMBDA : v);

export default function APFormalDescription({
  isOpen, onClose, nodes, transitions, alphabet, demo,
  onValidateGraph, onElementsSuccess, onSuccess, showToast,
  // Componente controlado (persistência de sessão — ver ADR 0011 §3.1):
  // initialValues hidrata o formulário ao montar (snapshot salvo ou null pra
  // fase nova); onStateChange emite o snapshot atual a cada mudança (sem
  // debounce aqui — quem debounça é o hook de persistência).
  initialValues, onStateChange,
}) {
  const initNorm = normalizeApFormalInitialValues(initialValues);
  const [inE, setInE]             = useState(initNorm.inE);
  const [inSigma, setInSigma]     = useState(initNorm.inSigma);
  const [inGamma, setInGamma]     = useState(initNorm.inGamma);
  const [inInitial, setInInitial] = useState(initNorm.inInitial);
  const [inBottom, setInBottom]   = useState(initNorm.inBottom);

  const [elementsValid, setElementsValid] = useState(initNorm.elementsValid);
  const [rows, setRows]   = useState(initNorm.rows); // [{ key, from, read, pop }]
  const [cells, setCells] = useState(initNorm.cells); // key -> { dest, push }
  const [fieldErrors, setFieldErrors] = useState({});
  const [cellErrors, setCellErrors]   = useState({});

  // Emite o snapshot atual a cada mudança relevante — roda mesmo com o
  // painel fechado (isOpen controla só a remontagem via `key` no pai, ver
  // APPart1.jsx), necessário pro autosave capturar preenchimento parcial.
  useEffect(() => {
    onStateChange?.(buildApFormalStateSnapshot({ inE, inSigma, inGamma, inInitial, inBottom, elementsValid, rows, cells }));
  }, [inE, inSigma, inGamma, inInitial, inBottom, elementsValid, rows, cells, onStateChange]);

  // Aula (demo): rola até o campo/linha que está sendo revelado quando ele muda.
  const currentElRef = useRef(null);
  const demoKey = demo?.current
    ? (demo.current.kind === 'delta'
        ? `d:${demo.current.rowKey}`
        : `t:${Object.keys(demo.current.fields || {}).join(',')}`)
    : null;
  useEffect(() => {
    if (demoKey) currentElRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [demoKey]);

  // O reset ao abrir é por remontagem (o pai passa key ao alternar isOpen).
  if (!isOpen) return null;

  const fromLabel = (id) => nodes.find(n => n.id === id)?.label ?? id;
  const toLabel = (id) => nodes.find(n => n.id === id)?.label ?? id;

  const clearField = (k) => setFieldErrors(prev => ({ ...prev, [k]: null }));

  const validateElements = () => {
    if (onValidateGraph && !onValidateGraph()) return;

    const res = validateApFormalElements({ inE, inSigma, inGamma, inInitial, inBottom, nodes, transitions, alphabet });
    if (!res.ok) {
      setFieldErrors(res.fieldErrors);
      const msg = res.reason === 'brace_format'
        ? 'Confira o uso das chaves { }.'
        : `${Object.values(res.fieldErrors).filter(Boolean).length} campo(s) com erro.`;
      showToast?.(msg, 'error');
      return;
    }

    setFieldErrors({});
    setRows(res.rows);
    setCells(Object.fromEntries(res.rows.map(x => [x.key, { dest: '', push: '' }])));
    setElementsValid(true);
    onElementsSuccess?.(); // ★2
  };

  const setCell = (key, field, val) => {
    setCells(prev => ({ ...prev, [key]: { ...prev[key], [field]: val } }));
    setCellErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validateTransitions = () => {
    if (onValidateGraph && !onValidateGraph()) { setElementsValid(false); return; }
    const res = validateApFormalTransitions({ transitions, nodes, cells });
    if (!res.ok) {
      setCellErrors(res.cellErrors);
      showToast?.(`${Object.keys(res.cellErrors).length} transição(ões) incorreta(s).`, 'error');
      return;
    }
    setCellErrors({});
    onSuccess?.(); // ★3
    onClose?.();
  };

  // multi=true: campo aceita { } (conjunto com vários elementos) — só esses
  // recebem o auto-fechamento de chaves; campos "single" (initial/bottom)
  // nunca usam chaves, então não faz sentido auto-fechar ali.
  const field = (key, label, value, setter, placeholder, multi = false) => (
    <div className={`form-group${fieldErrors[key] ? ' field-error' : ''}`}>
      <label>{label}</label>
      <input type="text" placeholder={placeholder} value={value} readOnly={elementsValid}
        onChange={e => { setter(e.target.value); clearField(key); }}
        onKeyDown={multi ? (e => onBracketKeyDown(e, setter)) : undefined}
        translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off" />
      {fieldErrors[key] && <span className="field-error-msg">✕ {fieldErrors[key]}</span>}
    </div>
  );

  // ── Modo demonstração (Aula Guiada): read-only, revela tupla + δ por passo ──
  if (demo) {
    const fields = demo.fields || {};
    const revealed = (k) => Object.prototype.hasOwnProperty.call(fields, k);
    const currentField = demo.current?.kind === 'tuple'
      ? Object.keys(demo.current.fields || {})[0] : null;
    const demoField = (key, label, placeholder) => (
      <div ref={key === currentField ? currentElRef : null}
        className={`form-group ap-demo-group${revealed(key) ? '' : ' ap-demo-dim'}`}>
        <label>{label}</label>
        <input type="text" readOnly value={revealed(key) ? fields[key] : ''}
          placeholder={revealed(key) ? '' : placeholder} translate="no" />
      </div>
    );
    const curRow = demo.current?.kind === 'delta' ? demo.current.rowKey : null;
    return (
      <div className="formal-sidebar-content">
        <h2>Descrição Formal (AP)</h2>
        <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px' }}>
          👨‍🏫 <b>Modo Aula</b> — lendo a descrição formal direto do grafo.
        </p>

        {demoField('E', 'E (Estados):', '…')}
        {demoField('Sigma', 'Σ (Alfabeto de entrada):', '…')}
        {demoField('Gamma', 'Γ (Alfabeto da pilha):', '…')}
        {demoField('initial', 'i (Estado inicial):', '…')}
        {demoField('bottom', 'B (Fundo da pilha):', '…')}

        <div className="table-section">
          <h3>Função de transição (δ)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="transition-table ap-delta-table">
              <thead>
                <tr><th>T(estado, lê, desempilha)</th><th>=&nbsp;( destino,</th><th>empilha )</th></tr>
              </thead>
              <tbody>
                {transitions.map((t, i) => {
                  const key = String(i);
                  const shown = demo.rows?.has(key);
                  return (
                    <tr key={key} ref={curRow === key ? currentElRef : null}
                      className={`${shown ? '' : 'ap-demo-dim'}${curRow === key ? ' ap-delta-row-current' : ''}`}>
                      <td className="row-header">T({fromLabel(t.from)}, {showF(t.read)}, {showF(t.pop)})</td>
                      <td>{shown ? toLabel(t.to) : '…'}</td>
                      <td>{shown ? showF(t.push) : '…'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="formal-sidebar-content">
      <h2>Descrição Formal (AP)</h2>
      <p style={{ fontSize: 12, color: '#555', margin: '0 0 8px' }}>
        Aceita por <b>pilha vazia</b> — sem estado final (F).
      </p>

      {field('E', 'E (Estados):', inE, setInE, 'ex: {q0, q1}', true)}
      {field('Sigma', 'Σ (Alfabeto de entrada):', inSigma, setInSigma, 'ex: {a, b}', true)}
      {field('Gamma', 'Γ (Alfabeto da pilha):', inGamma, setInGamma, 'ex: {A, Z}', true)}
      {field('initial', 'i (Estado inicial):', inInitial, setInInitial, 'ex: q0')}
      {field('bottom', 'B (Fundo da pilha):', inBottom, setInBottom, 'ex: Z')}

      {!elementsValid && (
        <button className="btn-validate" onClick={validateElements}>Validar Elementos</button>
      )}

      {elementsValid && (
        <div className="table-section">
          <h3>Função de transição (δ)</h3>
          <p style={{ fontSize: 11, color: '#555', margin: '0 0 6px' }}>
            Preencha o <b>destino</b> e o que se <b>empilha</b> (λ se nada).
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className="transition-table ap-delta-table">
              <thead>
                <tr><th>T(estado, lê, desempilha)</th><th>=&nbsp;( destino,</th><th>empilha )</th></tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.key}>
                    <td className="row-header">T({r.from}, {showF(r.read)}, {showF(r.pop)})</td>
                    <td className={cellErrors[r.key] ? 'cell-error' : ''}>
                      <input value={cells[r.key]?.dest ?? ''} placeholder="q?"
                        onChange={e => setCell(r.key, 'dest', e.target.value)}
                        translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off" />
                    </td>
                    <td className={cellErrors[r.key] ? 'cell-error' : ''}>
                      <input value={cells[r.key]?.push ?? ''} placeholder={LAMBDA}
                        onChange={e => setCell(r.key, 'push', e.target.value)}
                        translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-validate success" onClick={validateTransitions}>Validar Transições</button>
        </div>
      )}

      <button className="btn-close" onClick={onClose}>Fechar Painel</button>
    </div>
  );
}
