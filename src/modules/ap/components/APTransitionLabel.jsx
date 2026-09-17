// ─── APTransitionLabel: rótulo de uma aresta do AP (várias triplas) ──────────
// Estilo JFLAP: cada tripla é "lê, desempilha ; empilha" (λ p/ vazio). Uma aresta
// pode ter várias (não-determinismo). Clicar numa tripla edita; "＋" adiciona.
// Em modo ERASE, clicar numa tripla a remove.
// Memoizado: left/top/pointerEventsNone/labelSide chegam como valores escalares
// (não um `style` inline recriado a cada render do pai), e onAddTriple recebe
// from/to como argumentos em vez de vir pré-fechado por edge — ambos eram
// necessários pra comparação do memo funcionar de verdade.
import { useState, useRef, useEffect, memo, useCallback } from 'react';

const LAMBDA = 'λ';
const show = (v) => (v === '' || v == null ? LAMBDA : v);
// Sentinela distinta de qualquer autoEdit real (null | 'new' | number).
const NO_AUTO_EDIT_YET = Symbol('no-auto-edit-yet');

// Dica contextual por campo — explica o que cada um dos 3 significa (JFLAP:
// lê, desempilha ; empilha), mostrada acima do campo focado no momento.
const FIELD_HINT = { read: 'Letra lida', pop: 'Letra no topo que remove', push: 'Letra a inserir' };

function TripleEditor({ initial, onCommit, onCancel }) {
  const [read, setRead] = useState(initial?.read ?? '');
  const [pop,  setPop]  = useState(initial?.pop  ?? '');
  const [push, setPush] = useState(initial?.push ?? '');
  const [focusedField, setFocusedField] = useState(null); // 'read' | 'pop' | 'push' | null
  const firstRef = useRef(null);
  useEffect(() => { const t = setTimeout(() => firstRef.current?.focus(), 20); return () => clearTimeout(t); }, []);

  const commit = () => onCommit({ read: read.trim(), pop: pop.trim(), push: push.trim() });
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  };
  const inp = (field, val, set, ref) => (
    <input ref={ref} className={`ap-tl-input${field === 'push' ? ' ap-tl-input-wide' : ''}`} value={val} placeholder={LAMBDA}
      onChange={e => set(e.target.value)} onKeyDown={onKey}
      onFocus={() => setFocusedField(field)} onBlur={() => setFocusedField(null)}
      onClick={e => e.stopPropagation()} maxLength={6} autoComplete="off" spellCheck={false} />
  );
  return (
    <div className="ap-tl-editor" onClick={e => e.stopPropagation()}>
      {focusedField && <div className="ap-tl-field-hint">{FIELD_HINT[focusedField]}</div>}
      <div className="ap-tl-fields">
        {inp('read', read, setRead, firstRef)}<span className="ap-tl-sep">,</span>
        {inp('pop', pop, setPop)}<span className="ap-tl-sep">;</span>
        {inp('push', push, setPush)}
      </div>
      <div className="ap-tl-actions">
        <button className="ap-tl-ok" onClick={commit} title="Confirmar">✓</button>
        <button className="ap-tl-cancel" onClick={onCancel} title="Cancelar">✕</button>
      </div>
    </div>
  );
}

function APTransitionLabel({
  from, to, triples, left, top, pointerEventsNone, labelSide, eraseMode, lessonActive,
  onAddTriple, onEditTriple, onRemoveTriple,
  autoEdit = null, onAutoEditConsumed,
  highlightTIdx = null, highlightSeq = null,
  errorTransitionIndices = null,
}) {
  const [editing, setEditing] = useState(null); // null | 'new' | tIdx
  // Setas de um par bidirecional (q0<->q1): o ponto-âncora (left/top) fica
  // sobre a curva, mas o chip de triplas cresce verticalmente — sem ancorar
  // pela borda externa (não o centro), cada chip cresceria pros dois lados e
  // acabaria cobrindo a seta oposta (mesmo raciocínio do AFD, TransitionLabel.jsx).
  const anchorTransform = labelSide === 'bottom' ? 'translate(-50%, 0%)'
    : labelSide === 'top' ? 'translate(-50%, -100%)'
    : undefined; // aresta simples: sem labelSide, mantém o centralizado default do CSS
  const style = {
    left: `${left}px`, top: `${top}px`,
    pointerEvents: pointerEventsNone ? 'none' : undefined,
    ...(anchorTransform && { transform: anchorTransform }),
  };
  const addTripleHere = useCallback((tr) => onAddTriple(from, to, tr), [onAddTriple, from, to]);

  // O "+" fica fixo do lado direito, na altura do chip mais PRÓXIMO DA SETA (não
  // no fim da pilha) — mesmo padrão do AFD (ver TransitionLabel.jsx). Em
  // label-top o bloco cresce pra cima e a seta fica embaixo dele → o chip mais
  // próximo é o ÚLTIMO (ancora no bottom). Em label-bottom o bloco cresce pra
  // baixo e a seta fica em cima → o chip mais próximo é o PRIMEIRO (ancora no
  // top). Sem labelSide (aresta simples), mantém o default 'bottom'.
  const addBtnAnchor = labelSide === 'bottom' ? 'top' : 'bottom';

  // Tripla recém-criada (seta nova, ainda "λ, λ ; λ"): abre o editor sozinha,
  // sem exigir que o aluno descubra que precisa clicar na tripla depois. O
  // próprio estado (editing) é ajustado durante o render — padrão oficial do
  // React p/ "derivar de prop" — para não disparar um cascading render via
  // setState num efeito. Avisar o pai (onAutoEditConsumed) já mexe em estado
  // de OUTRO componente, então isso continua num efeito.
  // Garante que o 1º render de uma tripla NOVA (que já nasce com autoEdit
  // setado, pois o componente monta na mesma passada em que a seta é criada)
  // conte como "mudou" — useRef(autoEdit) tomaria o mesmo valor logo no mount.
  const prevAutoEditRef = useRef(NO_AUTO_EDIT_YET);
  if (autoEdit !== prevAutoEditRef.current) {
    prevAutoEditRef.current = autoEdit;
    if (autoEdit != null) setEditing(autoEdit);
  }
  useEffect(() => {
    if (autoEdit != null) onAutoEditConsumed?.();
  }, [autoEdit, onAutoEditConsumed]);

  const clickChip = (e, t) => {
    e.stopPropagation();
    if (eraseMode) { onRemoveTriple(t.tIdx); return; }
    setEditing(t.tIdx);
  };

  return (
    <div className={`ap-transition-label${eraseMode ? ' erasable' : ''}`} style={style}
      onClick={e => e.stopPropagation()}>
      <div className="ap-tl-chips">
        {triples.map((t) => (
          editing === t.tIdx ? (
            <TripleEditor key={t.tIdx} initial={t}
              onCommit={(tr) => { if (onEditTriple(t.tIdx, tr) !== false) setEditing(null); }}
              onCancel={() => setEditing(null)} />
          ) : (
            <span key={t.tIdx === highlightTIdx ? `${t.tIdx}-${highlightSeq}` : t.tIdx}
              className={`ap-tl-chip${t.tIdx === highlightTIdx ? ' sim-active' : ''}${errorTransitionIndices?.has(t.tIdx) ? ' error-pulse-severe' : ''}`}
              onClick={e => clickChip(e, t)}>
              {show(t.read)}, {show(t.pop)} <b>;</b> {show(t.push)}
            </span>
          )
        ))}
        {editing === 'new' ? (
          <TripleEditor
            onCommit={(tr) => { if (addTripleHere(tr) !== false) setEditing(null); }}
            onCancel={() => setEditing(null)} />
        ) : (!eraseMode && !lessonActive) ? (
          <button className={`ap-tl-add ap-tl-add-${addBtnAnchor}`} onClick={e => { e.stopPropagation(); setEditing('new'); }}
            title="Adicionar transição (não-determinismo)">＋</button>
        ) : null}
      </div>
    </div>
  );
}

export default memo(APTransitionLabel);
