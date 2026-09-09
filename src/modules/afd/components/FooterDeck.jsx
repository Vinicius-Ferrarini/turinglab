// ─── FooterDeck: rodapé com a "mão" de cartas de ação/símbolos + HUD Maurílio ─
// Alterna entre o SimPanel (durante a simulação) e a fileira de cartas. Inclui o
// professor (balão de fala + figura). CSS: .bottom-hand / .card* / .professor-* .
import { useRef, useCallback } from 'react';
import './FooterDeck.css';
import SimPanel from './SimPanel';
import imgMaurilioSerio      from '../../../assets/maurilio1_serio.webp';
import imgMaurilioExplicando from '../../../assets/maurilio3_explicando.webp';
import imgBalaoFala          from '../../../assets/balao_fala_redondo.webp';

export default function FooterDeck({
  // Modo Aula V2 — colapsa o rodapé por completo
  isLessonActive,
  // Simulação
  showSimPanel, simWord, simMismatchNote, nodes, transitions, setShowSimPanel, setSimHighlight, setSimMismatchNote,
  // Cartas
  drawnCards, drawingStack, historyIndex, historyLen, drawUndo, undo, redo,
  interactionMode, setInteractionMode, highlightedError, resetMode,
  setInitialMode, addNodeMode, addTransitionMode, toggleFinalStateMode, setEraserMode, setDrawMode,
  selectedSymbolCard, setSelectedSymbolCard, setConnectingSource, discoveredSymbols,
  // HUD professor
  isDrawingUnlocked, guidedLessonStep, currentLevel, professorMessage, handleProfessorClick,
  // Drag da carta Estado → canvas
  onDeckNodeDrag, onDeckNodeDrop, onDeckNodeDragCancel,
}) {
  const addNodeDragRef = useRef(null);
  const justDraggedRef = useRef(false);

  // Onboarding de 2 passos: canvas vazio → só addNode livre; 1+ estado → tudo livre
  const isCanvasEmpty = nodes.length === 0;

  // Callbacks do SimPanel — precisam ser ESTÁVEIS (useCallback), não arrow
  // functions inline no JSX: SimPanel usa onHighlightNode nas deps do seu
  // useEffect de destaque; uma função recriada a cada render dispararia esse
  // efeito de novo a cada render → setSimHighlight → novo render → nova
  // função → loop infinito (isso também impedia a animação de piscar
  // terminar: o chip remontava a cada poucos ms, sempre reiniciando a
  // animação no frame 0%, nunca chegando ao pico amarelo em 50%).
  const closeSimPanel = useCallback(() => {
    setShowSimPanel(false);
    setSimMismatchNote?.(null);
    setSimHighlight({ nodeId: null, type: null, tIdx: null, symbol: null });
  }, [setShowSimPanel, setSimMismatchNote, setSimHighlight]);
  const highlightFromSim = useCallback((nid, type, tIdx, symbol) => {
    setSimHighlight(prev => ({ nodeId: nid, type, tIdx, symbol, seq: (prev?.seq ?? 0) + 1 }));
  }, [setSimHighlight]);

  // No modo Aula V2 mostra só o HUD do professor (sem cartas/sim)
  if (isLessonActive) {
    // ⚠️ SEGURANÇA: stepText vem de currentLevel.guidedLesson — conteúdo
    // ESTÁTICO escrito pelos devs (levels_data/*/L*.js), nunca do payload de
    // sessão salva/importada (ver MODULE_PAYLOAD_KEYS em
    // sessionSnapshot.js — guidedLesson/hint nunca fazem parte dessa
    // allowlist). dangerouslySetInnerHTML pula o escape automático do
    // React — NUNCA troque esta fonte por algo vindo de
    // applyRestoredPayload/testWords/formal ou qualquer outro estado que
    // um arquivo .json importado possa influenciar, ou isso vira XSS.
    const stepText = currentLevel?.guidedLesson?.[guidedLessonStep]?.text;
    return (
      <footer className="bottom-hand">
        <div className="professor-hud professor-hud--lesson">
          {stepText && (
            <div className="professor-balloon">
              <img src={imgBalaoFala} alt="" />
              <div className="professor-balloon-text">
                <div dangerouslySetInnerHTML={{ __html: stepText }} />
              </div>
            </div>
          )}
          <img src={imgMaurilioExplicando} alt="Professor Maurílio" className="prof-img"
            onClick={handleProfessorClick} />
        </div>
      </footer>
    );
  }

  return (
    <footer className="bottom-hand">
      {showSimPanel ? (
        <SimPanel
          word={simWord}
          mismatchNote={simMismatchNote}
          nodes={nodes}
          transitions={transitions}
          onClose={closeSimPanel}
          onHighlightNode={highlightFromSim}
        />
      ) : (
        <div className="cards-scroll-wrapper">
          {drawnCards.map(card => {
            if (card.type === 'separator') return <div key={card.id} className="card-separator slide-up-fade" />;

            if (card.type === 'action') {
              if (card.action === 'undo' || card.action === 'redo') {
                const isUndo = card.action === 'undo';
                const disabled = isUndo
                  ? drawingStack.length === 0 && historyIndex <= 0
                  : historyIndex >= historyLen - 1;
                return (
                  <div key={card.id}
                    data-icon={card.icon}
                    className={`card state slide-up-fade${disabled ? ' disabled' : ''}`}
                    onClick={() => {
                      if (disabled) return;
                      if (isUndo) { drawingStack.length > 0 ? drawUndo() : undo(); }
                      else redo();
                    }}>
                    <div className="card-header">{card.label}</div>
                    <div className="card-icon">{card.icon}</div>
                  </div>
                );
              }
              const classMap = { toggleInitial:'initial', addNode:'state', addTransition:'transition', toggleFinal:'final', erase:'erase', draw:'draw' };
              const clickMap = { toggleInitial: setInitialMode, addNode: addNodeMode, addTransition: addTransitionMode, toggleFinal: toggleFinalStateMode, erase: setEraserMode, draw: setDrawMode };
              const modeMap  = { toggleInitial:'TOGGLE_INITIAL', addNode:'ADD_NODE', addTransition:'CONNECTING', toggleFinal:'TOGGLE_FINAL', erase:'ERASE', draw:'DRAW' };
              const iconMap  = { toggleInitial:'▶', addNode:'◯', addTransition:'↗', toggleFinal:'◎', erase:'🗑', draw:'✏' };
              const isSelected       = interactionMode === modeMap[card.action];
              const isErr            = highlightedError === card.action;
              const isOnboardLocked  = card.action !== 'addNode' && isCanvasEmpty;
              return (
                <div key={card.id}
                  data-icon={iconMap[card.action] || ''}
                  className={`card ${classMap[card.action]} slide-up-fade ${isSelected?'selected-card':''} ${isErr?'error-pulse-severe':''} ${isOnboardLocked?'disabled':''}`}
                  title={isOnboardLocked ? 'Complete o passo atual primeiro' : undefined}
                  onClick={() => {
                    if (isOnboardLocked) return;
                    if (justDraggedRef.current) { justDraggedRef.current = false; return; }
                    if (isSelected) { setInteractionMode('IDLE'); resetMode(); } else { clickMap[card.action](); }
                  }}
                  onPointerDown={(e) => {
                    if (card.action !== 'addNode') return;
                    addNodeDragRef.current = { startX: e.clientX, startY: e.clientY, dragging: false };
                    e.currentTarget.setPointerCapture(e.pointerId);
                  }}
                  onPointerMove={(e) => {
                    if (!addNodeDragRef.current) return;
                    const dx = e.clientX - addNodeDragRef.current.startX;
                    const dy = e.clientY - addNodeDragRef.current.startY;
                    if (!addNodeDragRef.current.dragging && Math.hypot(dx, dy) > 8) {
                      addNodeDragRef.current.dragging = true;
                    }
                    if (addNodeDragRef.current.dragging) {
                      onDeckNodeDrag?.(e.clientX, e.clientY);
                    }
                  }}
                  onPointerUp={(e) => {
                    if (!addNodeDragRef.current) return;
                    const wasDragging = addNodeDragRef.current.dragging;
                    addNodeDragRef.current = null;
                    if (wasDragging) {
                      e.preventDefault();
                      justDraggedRef.current = true;
                      onDeckNodeDrop?.(e.clientX, e.clientY);
                    }
                  }}
                  onPointerCancel={() => {
                    if (addNodeDragRef.current?.dragging) onDeckNodeDragCancel?.();
                    addNodeDragRef.current = null;
                  }}
                >
                  <div className="card-header">{card.label}</div>
                  <div className="card-icon">{card.icon}</div>
                </div>
              );
            }

            if (card.type === 'symbol') {
              const isSel             = selectedSymbolCard === card.symbol;
              const isLocked          = !discoveredSymbols.has(card.symbol);
              const isSymOnboardLocked = isCanvasEmpty;
              return (
                <div key={card.id}
                  data-icon={isLocked ? '🔒' : card.symbol}
                  className={`card symbol-card slide-up-fade ${isSel?'selected-card':''} ${(isLocked || isSymOnboardLocked)?'locked-letter':''}`}
                  onClick={() => {
                    if (transitions.length === 0 || isLocked || isSymOnboardLocked) return;
                    setInteractionMode('IDLE'); setConnectingSource(null);
                    setSelectedSymbolCard(isSel ? null : card.symbol);
                  }}>
                  <div className="card-header">Usar Símbolo</div>
                  <div className="card-icon" style={{ fontSize:34, color:'#7c3aed' }}>{isLocked?'🔒':card.symbol}</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
      {/* ── HUD Maurílio ── */}
      {/* ⚠️ SEGURANÇA: currentProfMsg só pode vir de currentLevel.guidedLesson
          (estático, ver aviso acima) ou de `professorMessage` — que por sua
          vez só é setado em AFDPart1.jsx a partir de currentLevel.hint ou de
          uma string fixa no código (handleProfessorClick), NUNCA a partir de
          applyRestoredPayload nem de qualquer campo do payload de sessão
          (professorMessage não está em MODULE_PAYLOAD_KEYS). Mesma regra do
          bloco acima: NUNCA ligar isto a algo que um .json importado possa
          controlar — dangerouslySetInnerHTML não escapa o conteúdo. */}
      {isDrawingUnlocked && (() => {
        const isInLesson     = guidedLessonStep !== null;
        const currentProfMsg = isInLesson
          ? currentLevel?.guidedLesson?.[guidedLessonStep]?.text
          : professorMessage;
        const currentProfImg = isInLesson ? imgMaurilioExplicando : imgMaurilioSerio;
        return (
          <div className="professor-hud">
            {currentProfMsg && (
              <div className="professor-balloon">
                <img src={imgBalaoFala} alt="" />
                <div className="professor-balloon-text">
                  <div dangerouslySetInnerHTML={{ __html: currentProfMsg }} />
                </div>
              </div>
            )}
            <img src={currentProfImg} alt="Professor Maurílio" className="prof-img"
              onClick={handleProfessorClick} />
          </div>
        );
      })()}
    </footer>
  );
}
