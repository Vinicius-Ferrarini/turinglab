import { useState, useCallback, useEffect, useRef } from 'react';
import './TestPanel.css';
import { LEVEL_GRAPHS } from '../../../levels_graphs';
import { UNAVAILABLE_LEVELS_P2_ONLY, HIDDEN_LEVELS, LEVEL_DIFFICULTY } from '../../../levels';
import { AFD_LEVELS as GAME_LEVELS } from '../../../levels_data/afd/index.js';
import { logEvent } from '../../../services/telemetry';
import { SvgStars } from '../SvgStar';
import { navBtnStyle, navBtnDisabledStyle } from './navButtonStyles';
import GraphView       from './GraphView';
import { DrawStroke }  from './StrokeEl';
import SimPanel        from './SimPanel';
import CheatsheetPanel from './CheatsheetPanel';
import useP2Answer     from '../hooks/useP2Answer';
import useDrawing, { DRAW_COLORS } from '../hooks/useDrawing';
import imgMaurilioSerio      from '../../../assets/maurilio1_serio.webp';
import imgMaurilioExplicando from '../../../assets/maurilio3_explicando.webp';
import imgBalaoFala          from '../../../assets/balao_fala_redondo.webp';

const VW = 580, VH = 340;

// forced (opcional, ex.: Boss/Trabalho): suprime a navegação prev/next entre
// TODOS os níveis do AFD (calculada aqui via GAME_LEVELS) — dentro do Boss só
// faz sentido voltar pra grade do Boss, não pular pro L59/L57 do AFD normal.
export default function ExerciseScreen({ level, progress, updateProgress, showToast, onBack, onNext, onPrev, forced = false, forceLevelLabel, onForcedPrev, onForcedNext, forceLabelColor }) {
  const graph = LEVEL_GRAPHS[level.id];
  const displayLabel = forceLevelLabel ?? level.label;

  // .p2-svg-box raramente tem a mesma proporção 580:340 do viewBox default —
  // sobra margem vazia nas bordas. Medimos o container real via ResizeObserver
  // e ajustamos vw/vh para casar com o tamanho REAL do container em px
  // (escala ~1:1 unidade de viewBox = 1px CSS), em vez de manter vh fixo em
  // 340 e só esticar vw — essa era a causa de nós/traços/fontes (definidos em
  // unidades fixas) aparecerem gigantes em telas grandes: o container real
  // podia ter quase 900px de altura espremidos em 340 unidades, inflando o
  // fator de escala (px reais por unidade) bem acima do valor de referência.
  const svgBoxRef = useRef(null);
  const [dynVw, setDynVw] = useState(VW);
  const [dynVh, setDynVh] = useState(VH);

  useEffect(() => {
    const el = svgBoxRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) {
        setDynVh(Math.round(height));
        setDynVw(Math.round(width));
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const {
    answer,
    setAnswerText,
    attempts,
    result,
    showExpected,
    showVictory,
    earnedStars,
    profMsg,
    errorAlert,
    answerInputRef,
    savedCursor,
    showProf,
    clearProf,
    handleCheck,
    handleReset,
  } = useP2Answer({ level, graph, updateProgress, showToast });

  const {
    overlayRef,
    drawings,
    currentStroke,
    drawColor, setDrawColor,
    drawSize,  setDrawSize,
    isErasing, setIsErasing,
    drawTool,  setDrawTool,
    drawUndo,
    clearDrawings,
    handleOverlayDown,
    handleOverlayMove,
    handleOverlayUp,
  } = useDrawing({ cssZoomCompensation: false });

  const [isDrawMode,   setIsDrawMode]   = useState(false);
  const [simWords,     setSimWords]     = useState([]);
  const [newSimWord,   setNewSimWord]   = useState('');
  const [simWord,      setSimWord]      = useState('');
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simHighlight, setSimHighlight] = useState({ nodeId: null, type: null });
  // O simulador observa estes callbacks em efeitos; identidades estáveis evitam
  // que o destaque provoque uma nova atualização a cada renderização do pai.
  const closeSimPanel = useCallback(() => {
    setShowSimPanel(false);
    setSimHighlight({ nodeId: null, type: null });
  }, []);
  const highlightSimNode = useCallback((nodeId, type) => {
    setSimHighlight({ nodeId, type });
  }, []);

  useEffect(() => {
    if (!isDrawMode) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        drawUndo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDrawMode, drawUndo]);

  // ── Telemetria (módulo afd-p2) ─────────────────────────────────────────────
  // ExerciseScreen remonta por nível (key={level.id} no AFDPart2), então cada
  // nível = novo mount = refs zeradas.
  const phaseStartRef = useRef(null);
  const tutorialOpensRef = useRef(0);
  const errorSinceTutorialRef = useRef(false);
  const starsBeforeRef = useRef(0);
  const loggedAttemptRef = useRef(0);
  const initedRef = useRef(false);

  // inicio_fase — uma vez por nível (initedRef evita a duplicação do StrictMode em dev).
  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    phaseStartRef.current = performance.now();
    logEvent({
      tipo_evento: 'inicio_fase',
      modulo: 'afd-p2',
      nivel_id: level.id,
      dificuldade: LEVEL_DIFFICULTY[level.id] ?? null,
    });
  }, [level.id]);

  // tentativa (+ fim_fase no acerto) — reage a cada avaliação: handleCheck
  // incrementa `attempts` e define `result`. P2 dá 1 fim_fase por nível.
  useEffect(() => {
    if (attempts === 0) { loggedAttemptRef.current = 0; return; }  // mount/reset
    if (attempts === loggedAttemptRef.current) return;             // já logado
    loggedAttemptRef.current = attempts;
    const resultado = result === 'correct' ? 'correct' : 'wrong';
    if (resultado === 'wrong') errorSinceTutorialRef.current = true;
    logEvent({
      tipo_evento: 'tentativa',
      modulo: 'afd-p2',
      nivel_id: level.id,
      resultado,
      numero_tentativas: attempts,
    });
    if (result === 'correct') {
      logEvent({
        tipo_evento: 'fim_fase',
        modulo: 'afd-p2',
        nivel_id: level.id,
        estrelas_obtidas: earnedStars,
        novo_recorde: earnedStars > starsBeforeRef.current,
        tempo_gasto_segundos: phaseStartRef.current == null
          ? null : Math.round((performance.now() - phaseStartRef.current) / 1000),
        numero_tentativas: attempts,
        dificuldade: LEVEL_DIFFICULTY[level.id] ?? null,
        assistiu_tutorial: tutorialOpensRef.current > 0,
        acertou_apos_tutorial: tutorialOpensRef.current > 0 && !errorSinceTutorialRef.current,
      });
    }
  }, [attempts, result, earnedStars, level.id]);

  // Captura o recorde ANTES de avaliar (para novo_recorde no fim_fase).
  const handleCheckTelemetry = useCallback(() => {
    starsBeforeRef.current = progress[level.id]?.stars || 0;
    handleCheck();
  }, [handleCheck, progress, level.id]);

  // Abertura de ajuda (dica do professor) — mesma métrica de "uso de ajuda" do afd-p1.
  const openHelp = useCallback((msg) => {
    tutorialOpensRef.current += 1;
    errorSinceTutorialRef.current = false;
    logEvent({
      tipo_evento: tutorialOpensRef.current === 1 ? 'tutorial_aberto' : 'tutorial_reaberto',
      modulo: 'afd-p2',
      nivel_id: level.id,
      origem: 'dica',
    });
    showProf(msg);
  }, [showProf, level.id]);

  const stars    = progress[level.id]?.stars || 0;
  const levelIdx = GAME_LEVELS.findIndex(l => l.id === level.id);
  let prevLevel = null;
  let nextLevel = null;
  if (!forced) {
    for (let i = levelIdx - 1; i >= 0; i--) {
      if (!HIDDEN_LEVELS.has(GAME_LEVELS[i].id) && !UNAVAILABLE_LEVELS_P2_ONLY.has(GAME_LEVELS[i].id)) { prevLevel = GAME_LEVELS[i]; break; }
    }
    for (let i = levelIdx + 1; i < GAME_LEVELS.length; i++) {
      if (!HIDDEN_LEVELS.has(GAME_LEVELS[i].id) && !UNAVAILABLE_LEVELS_P2_ONLY.has(GAME_LEVELS[i].id)) { nextLevel = GAME_LEVELS[i]; break; }
    }
  }

  // Em modo forçado (Boss/Trabalho), os botões ◀/▶ navegam ENTRE os exercícios
  // do Boss (onForcedPrev/onForcedNext), não entre os níveis do AFD.
  const canPrev = forced ? !!onForcedPrev : !!prevLevel;
  const canNext = forced ? !!onForcedNext : !!nextLevel;
  const goPrev  = forced ? onForcedPrev : () => onPrev(prevLevel);
  const goNext  = forced ? onForcedNext : () => onNext(nextLevel);

  const handleAddSimWord = useCallback(() => {
    if (!graph) { showToast('Grafo não disponível.', 'error'); return; }
    const wordDisplay = newSimWord === '' ? 'λ' : newSimWord;
    if (simWords.some(w => w.word === wordDisplay)) {
      showToast('Já testou essa palavra!', 'info'); return;
    }
    const w = wordDisplay === 'λ' ? '' : wordDisplay;
    let cur      = graph.nodes.find(n => n.isInitial)?.id ?? null;
    let accepted = false;
    if (cur !== null) {
      let ok = true;
      for (const ch of w) {
        const tr = graph.transitions.find(t => t.from === cur && t.symbol.split(',').map(s => s.trim()).includes(ch));
        if (!tr) { ok = false; break; }
        cur = tr.to;
      }
      if (ok) accepted = !!graph.nodes.find(n => n.id === cur)?.isFinal;
    }
    setSimWords(prev => [{ word: wordDisplay, status: accepted ? 'correct' : 'wrong' }, ...prev]);
    setNewSimWord('');
  }, [graph, newSimWord, simWords, showToast]);

  const openSimulation = useCallback(() => {
    if (!graph) { showToast('Grafo não disponível.', 'error'); return; }
    if (!graph.nodes.some(n => n.isInitial)) { showToast('Grafo sem estado inicial.', 'error'); return; }
    if (!newSimWord && newSimWord !== '') { showToast('Digite uma palavra para simular.', 'info'); return; }
    setSimWord(newSimWord);
    setShowSimPanel(true);
  }, [graph, newSimWord, showToast]);

  return (
    <div className="workspace-wrapper">
      {/* Header */}
      <header className="game-header">
        <div className="header-left">
          <button className="back-btn" onClick={onBack}>⬅ Voltar</button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <span className="mission-label">Identifique a Linguagem</span>
          <div className="mission-formula">{displayLabel}</div>
        </div>
        <div style={{ width: 160, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button style={canPrev ? navBtnStyle : navBtnDisabledStyle}
              disabled={!canPrev} onClick={() => canPrev && goPrev()}
              title="Fase anterior">◀</button>
            <span className="mission-label" style={forceLabelColor ? { background: forceLabelColor } : undefined}>{displayLabel}</span>
            <button style={canNext ? navBtnStyle : navBtnDisabledStyle}
              disabled={!canNext} onClick={() => canNext && goNext()}
              title="Próxima fase">▶</button>
          </div>
          <SvgStars count={stars} size={20} />
        </div>
      </header>

      {/* Words hint bar */}
      <div className="words-hint-bar">
        <div className="words-hint-group">
          <span className="words-hint-label accept">✓ Aceita</span>
          {simWords.filter(w => w.status === 'correct').map((w, i) => (
            <span key={i} className="words-hint-chip accept">{w.word}</span>
          ))}
        </div>
        <div className="words-hint-sep" />
        <div className="words-hint-group">
          <span className="words-hint-label reject">✗ Rejeita</span>
          {simWords.filter(w => w.status === 'wrong').map((w, i) => (
            <span key={i} className="words-hint-chip reject">{w.word}</span>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="workspace">
        {/* Canvas — fixed graph */}
        <section className="canvas-area" style={{
          cursor: isDrawMode ? (isErasing ? 'cell' : 'crosshair') : 'default' }}>
          <div className="canvas-label">Autômato Finito Determinístico</div>

          {/* ── Draw toolbar ── */}
          {isDrawMode && (
            <div className="draw-toolbar">
              {[
                { id: 'pencil', title: 'Lápis', icon: (
                  <svg width="15" height="15" viewBox="0 0 15 15">
                    <path d="M2 13 Q4 8 7 7.5 Q10 7 13 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  </svg>) },
                { id: 'line', title: 'Linha reta', icon: (
                  <svg width="15" height="15" viewBox="0 0 15 15">
                    <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                  </svg>) },
                { id: 'arrow', title: 'Seta', icon: (
                  <svg width="15" height="15" viewBox="0 0 15 15">
                    <line x1="2" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    <polygon points="11,4.5 15,7.5 11,10.5" fill="currentColor"/>
                  </svg>) },
                { id: 'rect', title: 'Retângulo', icon: (
                  <svg width="14" height="14" viewBox="0 0 14 14">
                    <rect x="2" y="3" width="10" height="8" fill="none" stroke="currentColor" strokeWidth="2" rx="1"/>
                  </svg>) },
              ].map(({ id, icon, title }) => (
                <button key={id}
                  className={`draw-tool-btn draw-type-btn${drawTool === id && !isErasing ? ' active' : ''}`}
                  title={title}
                  onClick={() => { setDrawTool(id); setIsErasing(false); }}>
                  {icon}
                </button>
              ))}
              <div className="draw-toolbar-sep" />
              {DRAW_COLORS.map(({ hex, label }) => (
                <button key={hex}
                  className={`draw-color-btn${drawColor === hex && !isErasing ? ' active' : ''}`}
                  style={{ background: hex, border: hex === '#f8f8f8' ? '2.5px solid #aaa' : '2.5px solid #000' }}
                  title={label}
                  onClick={() => { setDrawColor(hex); setIsErasing(false); }} />
              ))}
              <div className="draw-toolbar-sep" />
              <div className="draw-stroke-size">
                {[2, 4, 7].map(sz => (
                  <button key={sz} className={drawSize === sz ? 'active' : ''}
                    style={{ width: 8 + sz * 3, height: 8 + sz * 3 }}
                    title={`Espessura ${sz}`}
                    onClick={() => { setDrawSize(sz); setIsErasing(false); }}>
                    <span style={{ display: 'block', width: sz * 1.5, height: sz * 1.5, background: '#000', borderRadius: '50%' }} />
                  </button>
                ))}
              </div>
              <div className="draw-toolbar-sep" />
              <button className={`draw-tool-btn${isErasing ? ' active' : ''}`} title="Borracha"
                onClick={() => setIsErasing(v => !v)}>⌫</button>
              <button className="draw-tool-btn" title="Apagar todos os rabiscos"
                onClick={clearDrawings}>🗑</button>
              <button className="draw-tool-btn" title="Desfazer (Ctrl+Z)"
                onClick={drawUndo}>↶</button>
              <div className="draw-toolbar-sep" />
              <button className="draw-tool-btn" title="Fechar ferramenta"
                style={{ fontSize: 11, fontWeight: 900 }}
                onClick={() => setIsDrawMode(false)}>✕</button>
            </div>
          )}

          {/* ── Toggle button (top-right) ── */}
          <button
            className={`p2-draw-toggle${isDrawMode ? ' active' : ''}`}
            title={isDrawMode ? 'Fechar ferramenta de desenho' : 'Abrir ferramenta de desenho'}
            onClick={() => setIsDrawMode(m => !m)}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 12 L10 5 L12 7 L5 14 Z" fill="#fbbf24" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M10 5 L12 3 L14 5 L12 7 Z" fill="#fb923c" stroke="#000" strokeWidth="1.3" strokeLinejoin="round"/>
              <path d="M3 12 L1.5 14.5 L5 14 Z" fill="#374151" stroke="#000" strokeWidth="1.2" strokeLinejoin="round"/>
            </svg>
          </button>

          {graph ? (
            <div className="p2-svg-box" ref={svgBoxRef}>
              <GraphView
                nodes={graph.nodes}
                transitions={graph.transitions}
                highlightNodeId={simHighlight.nodeId}
                highlightType={simHighlight.type}
                rawLayout={level.layout}
                vw={dynVw}
                vh={dynVh}
              />
              {/* Drawing overlay */}
              <svg ref={overlayRef}
                viewBox={`0 0 ${dynVw} ${dynVh}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
                  pointerEvents: isDrawMode ? 'auto' : 'none' }}
                onPointerDown={handleOverlayDown}
                onPointerMove={handleOverlayMove}
                onPointerUp={handleOverlayUp}>
                {drawings.map((s, i) => <DrawStroke key={i} stroke={s} idx={i} />)}
                {currentStroke && <DrawStroke stroke={currentStroke} idx="cur" />}
              </svg>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '100%', height: '100%', color: '#999', fontWeight: 900 }}>
              Grafo não disponível para este exercício
            </div>
          )}

          <div className="p2-legend">
            <span>
              <span style={{ fontWeight: 'bold', fontSize: 16, marginRight: 4 }}>▶</span>
              <span className="p2-legend-dot initial" />
              {' '}Inicial
            </span>
            <span>
              <span className="p2-legend-dot final" style={{ outline: '3px solid #000', outlineOffset: 3 }} />
              {' '}Final
            </span>
          </div>

          {/* Quadro-negro de notações */}
          <CheatsheetPanel />
        </section>

        {/* Right panel */}
        <aside className="test-panel p2-test-panel">
          {/* Word tester */}
          <div className="section-header" style={{ fontSize: 10, marginTop: 2 }}>Testar Palavra</div>
          <div className="test-input-area">
            <input
              type="text"
              className="word-input"
              placeholder="Ex: aab  (vazia = λ)"
              value={newSimWord}
              onChange={e => setNewSimWord(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSimWord()}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
            <button className="add-test-btn" onClick={handleAddSimWord}>+</button>
          </div>
          <button className="simulate-btn" onClick={openSimulation}>🔬 Simular</button>
          <div className="words-list">
            {simWords.map((item, idx) => (
              <div key={idx} className={`word-row ${item.status}`}>
                <span>{item.word}</span>
                <span>{item.status === 'correct' ? '✓' : '✕'}</span>
              </div>
            ))}
          </div>

          {/* Answer */}
          <div className="p2-answer-sep" />
          <div className="section-header" style={{ fontSize: 10, marginTop: 0 }}>Sua Resposta</div>
          <div className="test-input-area">
            <textarea
              ref={answerInputRef}
              className={`word-input p2-answer-textarea ${result === 'correct' ? 'p2-ok' : result === 'wrong' ? 'p2-err' : ''}`}
              placeholder="Ex: { a^n | n > 0 }"
              value={answer}
              onChange={e => setAnswerText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (result !== 'correct') handleCheckTelemetry(); } }}
              onSelect={e => { savedCursor.current = { start: e.target.selectionStart, end: e.target.selectionEnd }; }}
              onBlur={e => { savedCursor.current = { start: e.target.selectionStart, end: e.target.selectionEnd }; }}
              disabled={result === 'correct'}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              rows={2}
            />
          </div>

          {showExpected && result !== 'correct' && (
            <div className="p2-expected">
              <strong>Resposta correta:</strong>
              <br />
              <code>{level.formula.replace(/^L\s*=\s*/, '')}</code>
            </div>
          )}

          {/* Actions */}
          {result !== 'correct' && (
            <button className="validate-btn slide-up-fade" onClick={handleCheckTelemetry}>
              ✔ Verificar Resposta
            </button>
          )}

          {(result === 'correct' || showExpected) && (
            <button className="simulate-btn" style={{ marginTop: 4 }} onClick={handleReset}>
              🔄 Tentar Novamente
            </button>
          )}

          {attempts > 0 && result !== 'correct' && attempts < 2 && (
            <button className="simulate-btn" style={{ background: '#fef08a', marginTop: 4 }}
              onClick={() => openHelp(level.hint || 'Analise os estados finais e as transições!')}>
              💡 Pedir Dica
            </button>
          )}

          <div style={{ fontSize: 11, color: '#666', fontWeight: 'bold', marginTop: 4 }}>
            Tentativas: {attempts} | Recorde: <SvgStars count={stars} size={12} />
          </div>
        </aside>
      </div>

      {/* SimPanel footer */}
      {showSimPanel && graph && (
        <footer className="bottom-hand">
          <SimPanel
            word={simWord}
            nodes={graph.nodes}
            transitions={graph.transitions}
            onClose={closeSimPanel}
            onHighlightNode={highlightSimNode}
          />
        </footer>
      )}

      {/* Error alert */}
      {errorAlert && (
        <div className="p2-error-alert">{errorAlert}</div>
      )}

      {/* Professor HUD */}
      <div className="professor-hud" style={{ bottom: showSimPanel ? 186 : 18 }}>
        {profMsg && (
          <div className="professor-balloon">
            <img src={imgBalaoFala} alt="" />
            <div className="professor-balloon-text">{profMsg}</div>
          </div>
        )}
        <img
          src={imgMaurilioSerio}
          alt="Professor Maurílio"
          className="prof-img"
          onClick={() => profMsg ? clearProf() : openHelp(
            attempts === 0
              ? 'Observe os estados: iniciais, finais e as transições entre eles!'
              : (level.hint || 'Siga o caminho das setas e note onde o autômato aceita!')
          )}
        />
      </div>

      {/* Victory popup */}
      {showVictory && (
        <div className="p2-victory-overlay">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
            <img
              src={imgMaurilioExplicando}
              alt="Professor"
              style={{ height: 320, zIndex: 2, marginRight: -55 }}
            />
            <div style={{ position: 'relative', width: 300, height: 210, marginTop: -140, zIndex: 1 }}>
              <img
                src={imgBalaoFala}
                alt=""
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '18px 36px 48px', boxSizing: 'border-box',
                color: '#000', textAlign: 'center', zIndex: 2,
              }}>
                <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.4 }}>
                  {earnedStars === 3
                    ? '🌟 Incrível! Acertou de primeira!'
                    : earnedStars === 2
                    ? '⭐⭐ Muito bem! Você conseguiu!'
                    : '✅ Parabéns! Vai treinando!'}
                </div>
                <div style={{ marginTop: 10 }}>
                  <SvgStars count={earnedStars} size={26} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginTop: 36 }}>
            <button className="menu-btn" onClick={onBack} style={{ padding: '14px 28px', fontSize: 20 }}>
              Voltar ao Menu
            </button>
            {nextLevel && (
              <button className="menu-btn primary"
                onClick={() => onNext(nextLevel)}
                style={{ padding: '14px 28px', fontSize: 20 }}>
                Próxima: {nextLevel.label} →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
