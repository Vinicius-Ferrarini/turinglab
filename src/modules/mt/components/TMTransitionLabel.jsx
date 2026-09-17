// ─── TMTransitionLabel: chip de uma transição da MT sobre uma aresta ─────────
// Formato exibido: "read ; write , move"  (ex: a ; A , R  |  □ ; □ , L)
// Props:
//   transition  — { read, write, move, tIdx }  (string vazia = branco)
//   style       — posicionamento absoluto passado pelo canvas
//   eraseMode   — boolean; chip fica vermelho e clique remove
//   lessonActive, onRemove(tIdx), onEdit(tIdx) — tIdx chega via prop (não
//   fechado num onClick inline) + onRemove/onEdit estáveis (useCallback na
//   origem) para o React.memo abaixo conseguir de fato pular re-renders.
import { memo, useCallback } from 'react';
import { BLANK } from '../utils/tmAlgorithms';
import './MTTransitions.css';

const show = (v) => (v === '' || v == null ? BLANK : v);

function TMTransitionLabel({ transition, style, eraseMode, lessonActive, onRemove, onEdit, isActive, isError }) {
  const tIdx = transition.tIdx;
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (eraseMode) onRemove(tIdx);
    else if (!lessonActive) onEdit(tIdx);
  }, [eraseMode, lessonActive, onRemove, onEdit, tIdx]);

  return (
    <div
      className={`tm-transition-label${eraseMode ? ' erasable' : ''}${isActive ? ' active-transition' : ''}${isError ? ' error-pulse-severe' : ''}`}
      style={style}
      onClick={handleClick}
      title={eraseMode ? 'Clique para remover' : 'Clique para editar'}
    >
      <span className="tm-tl-chip">
        <span className="tm-tl-sym">{show(transition.read)}</span>
        <span className="tm-tl-sep">;</span>
        <span className="tm-tl-sym">{show(transition.write)}</span>
        <span className="tm-tl-sep">,</span>
        <span className="tm-tl-move">{transition.move}</span>
      </span>
    </div>
  );
}

export default memo(TMTransitionLabel);
