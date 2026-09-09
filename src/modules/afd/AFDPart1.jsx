// TuringLab — App.jsx v3.0
// v3.0: Undo/Redo, Simulação no Rodapé, Cores Zoom Corrigidas, Validação Duplicata Aprimorada
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './AFDPart1.css';
import FormalDescriptionModal from './FormalDescriptionModal';
import LevelMenu from './components/LevelMenu';
import GameHeader from './components/GameHeader';
import TestPanel from './components/TestPanel';
import BlackboardPanel from './components/BlackboardPanel';
import FooterDeck from './components/FooterDeck';
import CanvasArea from './components/CanvasArea';
import EndScreen from './components/EndScreen';
import useHistory from './hooks/useHistory';
import useToast from './hooks/useToast';
import usePhaseTelemetry from './hooks/usePhaseTelemetry';
import useGuidedLesson from './hooks/useGuidedLesson';
import useAFDGraph, { lvlAccepts, validateAFDPure } from './hooks/useAFDGraph';
import useCanvasState from './hooks/useCanvasState';
import { traceWord } from './utils/traceWord';
import { buildNoAttemptHintMessage, buildSizeHintMessage } from './utils/sizeHint';
import { EMPTY_FORMAL_STATE } from './utils/formalDescriptionLogic';
import useWordGuessGame from '../shared/useWordGuessGame';
import useLevelSessionPersistence, { readLevelSession } from '../shared/persistence/useLevelSessionPersistence.js';
import { buildSnapshot } from '../shared/persistence/sessionSnapshot.js';
import {
  buildExportFilename, downloadSnapshotFile, readImportedFile, describeImportError,
} from '../shared/persistence/exportImportFile.js';
import { findSecondShortestWord } from '../shared/wordExercises/findSecondShortestWord.js';
import { UNAVAILABLE_LEVELS, HIDDEN_LEVELS, LEVEL_DIFFICULTY, DIFF_COLOR } from '../../levels';
import { AFD_LEVELS as GAME_LEVELS } from '../../levels_data/afd/index.js';
import { logEvent, hasConsent } from '../../services/telemetry';

// ─── Utilitário: gera um UID curto ───────────────────────────────────────────
let _uidCounter = 0;
const genUid = () => `_n${++_uidCounter}_${Math.random().toString(36).slice(2, 6)}`;

// Baralho de cartas do rodapé quando o tabuleiro está destravado — depende só
// de `level` (allowedCards/alphabet), então é reaproveitado tanto pelo
// unlock() normal (handleTestWord) quanto pela hidratação de sessão salva
// (loadLevel: isDrawingUnlocked=true restaurado precisa repopular as cartas,
// senão o canvas aparece destravado sem nenhuma carta pra jogar).
function buildDrawnCards(level) {
  const allowed = level?.allowedCards;
  const initialCards = [
    { id: 'c0', type: 'action', action: 'toggleInitial', icon: '▶', label: 'Estado Inicial' },
    { id: 'c3', type: 'action', action: 'toggleFinal',   icon: '◎', label: 'Definir Final' },
    { id: 'c1', type: 'action', action: 'addNode',       icon: '◯', label: 'Novo Estado' },
    { id: 'c2', type: 'action', action: 'addTransition', icon: '↗', label: 'Criar Seta' },
    { id: 'c4', type: 'action', action: 'erase',         icon: '🗑', label: 'Apagar' },
    { id: 'cu', type: 'action', action: 'undo',          icon: '↶', label: 'Desfazer' },
    { id: 'cr', type: 'action', action: 'redo',          icon: '↷', label: 'Refazer' },
  ].filter(c => !allowed || allowed.includes(c.action));
  const symbolCards = (level?.alphabet || []).map((sym, i) => ({
    id: `s${i}`, type: 'symbol', symbol: sym, label: `Símbolo ${sym}`,
  }));
  return [...initialCards, { type: 'separator', id: 'sep1' }, ...symbolCards];
}

// Dimensões lógicas do canvas interno (devem casar com INNER_W/INNER_H de CanvasArea.jsx)
const INNER_W = 8000;
const INNER_H = 8000;

// Níveis que usam a grade estilo Wordle/Termo na fase 1 (descubra a menor
// palavra) — ver docs/MENOR_PALAVRA_MINIGAME.md. Piloto original: L08. Hoje
// vale para TODOS os níveis ativos de AFD_1 (todo id fora de HIDDEN_LEVELS/
// UNAVAILABLE_LEVELS) — incluindo L14: ele é IMPOSSÍVEL DE DESENHAR em AFD
// (por isso `impossible: true` — ver o próprio L14.js), mas a linguagem em
// si (|w|a=|w|b) tem menor palavra normalíssima (λ) e não há razão pra negar
// a mecânica de "descubra a menor palavra" só porque o desenho depois é
// impossível — essas são duas coisas independentes. `impossible` continua
// controlando só o que acontece DEPOIS de achar a palavra (abre a Aula
// Guiada em vez de liberar o canvas — ver handleTestWord).
// Calculado a partir de GAME_LEVELS em vez de listado à mão: acompanha
// sozinho qualquer nível novo/reativado/ocultado depois, sem precisar tocar
// aqui. Níveis com shortestWord==='' (λ aceita, ex.: L11 e L14) usam a 2ª
// menor palavra como alvo jogável — ver effectiveShortestWord/findSecondShortestWord.js.
const WORDLE_GRID_LEVEL_IDS = new Set(
  GAME_LEVELS
    .filter(l => !HIDDEN_LEVELS.has(l.id) && !UNAVAILABLE_LEVELS.has(l.id))
    .map(l => l.id)
);

// ─── App Principal ────────────────────────────────────────────────────────────
export default function AFDPart1({ onBack, progress, updateProgress, forceLevelId, forceLevelLabel, onForcedPrev, onForcedNext, forceLabelColor }) {


  // ── Toast ──────────────────────────────────────────────────────────────────
  const { toastData, showToast } = useToast();

  // ── Grafo: estado base (nós/transições) ────────────────────────────────────
  // Vive aqui (no orquestrador) para quebrar a dependência circular entre
  // useHistory (precisa dos setters) e useAFDGraph (precisa de recordHistory).
  const [nodes, setNodes]           = useState([]);
  const [transitions, setTransitions] = useState([]);

  // ── UNDO/REDO ──────────────────────────────────────────────────────────────
  // Quando true, o próximo recordHistory substitui o último entry (squash)
  // em vez de empurrar um novo — usado para fundir "criar seta" + "adicionar símbolo"
  const squashNextHistoryRef = useRef(false);
  const { historyIndex, historyLen, recordHistory, undo, redo, resetHistory } =
    useHistory({ setNodes, setTransitions, showToast });

  // ── Estado geral ───────────────────────────────────────────────────────────
  const [tela, setTela]             = useState('MENU');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [isDrawingUnlocked, setIsDrawingUnlocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [testWords, setTestWords]   = useState([]);
  const [newWord, setNewWord]       = useState('');
  // effectiveShortestWord só é não-nulo nos níveis com grade estilo Termo
  // (WORDLE_GRID_LEVEL_IDS, hoje todo nível ativo exceto L14) — é o gate que
  // CanvasArea.jsx usa pra decidir se desenha o WordleBoard, então precisa
  // ser null/undefined em todo nível fora da lista. Quando shortestWord===''
  // (λ aceita — ex.: L11 e outros 13 níveis), a grade não tem célula pra
  // digitar λ e o gatilho de envio nunca dispara (mesmo bug corrigido no
  // minigame "Menor Palavra" — ver findSecondShortestWord.js) — usa a 2ª
  // menor palavra (não-vazia) como alvo jogável nesse caso; nos demais
  // níveis (shortestWord nunca é '') é idêntico a shortestWord.
  const effectiveShortestWord = useMemo(() => {
    if (!WORDLE_GRID_LEVEL_IDS.has(currentLevel?.id)) return null;
    const sw = currentLevel.shortestWord;
    if (sw !== '') return sw;
    return findSecondShortestWord((word) => lvlAccepts(currentLevel, word), currentLevel.alphabet ?? []);
  }, [currentLevel]);
  // Grade WordleBoard: mecânica de grade/dica compartilhada (ver
  // src/modules/shared/useWordGuessGame.js) — 'guess' é o próprio newWord
  // (controlado), então digitar na grade e no campo lateral do TestPanel são
  // a mesma coisa. Genérico o bastante para ser reaproveitado pelo minigame
  // standalone "Menor Palavra" (ver docs/MENOR_PALAVRA_MINIGAME.md).
  const wordleGame = useWordGuessGame({
    shortestWord: effectiveShortestWord,
    guess: newWord,
    setGuess: setNewWord,
  });
  // Última palavra testada (normalizada — 'null'/'vazio' já viram ''), usada
  // só pela Dica de Tamanho (regra: diff = tentativa.length - shortestWord.length).
  const lastAttemptRef = useRef(null);
  // Grade WordleBoard: timeout do "segurar a linha vencedora visível"
  // antes de destravar — limpo ao trocar de nível pra não disparar setState
  // num nível que o aluno já saiu.
  const unlockDelayRef = useRef(null);
  const [drawnCards, setDrawnCards] = useState([]);
  const [selectedSymbolCard, setSelectedSymbolCard] = useState(null);

  const [interactionMode, setInteractionMode] = useState('IDLE');
  const [connectingSource, setConnectingSource] = useState(null);

  const [selectionBox, setSelectionBox]   = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [dragInfo, setDragInfo] = useState({ isDragging: false, initialNodes: [], startX: 0, startY: 0 });
  const [deckGhostPos, setDeckGhostPos] = useState(null);

  const canvasRef      = useRef(null);
  const viewportRef    = useRef(null);
  const innerCanvasRef = useRef(null);

  const [highlightedError, setHighlightedError] = useState(null);
  const [professorMessage, setProfessorMessage] = useState('');
  const [showVictoryScreen, setShowVictoryScreen]     = useState(false);
  const [showImpossibleScreen, setShowImpossibleScreen] = useState(false);
  // Snapshot do formulário da Descrição Formal, içado do FormalDescriptionModal
  // (componente controlado — ver ADR 0011 §3.1) via onStateChange. null =
  // formulário nunca tocado nesta fase (payload salva EMPTY_FORMAL_STATE).
  const [formalSnapshot, setFormalSnapshot] = useState(null);
  const isTableFocusedRef = useRef(false);
  const tableBlurTimeoutRef = useRef(null);

  // ── Aula Guiada + tutoriais contextuais ────────────────────────────────────
  const {
    guidedLessonStep, setGuidedLessonStep,
    userNodesSnapshot, userTransitionsSnapshot,
    lessonActive, lessonPhase, lessonAtGraphEnd,
    lessonReveal, lessonAllSteps, lessonCurStepData, lessonCur, lessonGoFormal,
  } = useGuidedLesson(currentLevel);

  // ── Estado do canvas (desenho, zoom, modos) ───────────────────────────────
  const {
    drawings, setDrawings, drawingStack, setDrawingStack,
    currentStroke, setCurrentStroke, drawColor, setDrawColor,
    drawSize, setDrawSize, isErasing, setIsErasing, drawTool, setDrawTool,
    isDrawingRef, currentStrokeRef, drawingsRef,
    drawUndo, resetDraw,
    zoom, setZoom,
    resetZoom, resetMode,
    setInitialMode, addNodeMode, addTransitionMode,
    toggleFinalStateMode, setEraserMode, setDrawMode,
  } = useCanvasState({
    isDrawingUnlocked, setInteractionMode, squashNextHistoryRef,
    setConnectingSource, setSelectedSymbolCard, setSelectedNodes,
    tela, isSidebarOpen, canvasRef, viewportRef,
  });

  // Simulação no rodapé (não modal)
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [simWord, setSimWord]           = useState('');
  // Aviso exibido no topo do painel quando a simulação é aberta automaticamente
  // por uma validação que falhou numa palavra específica (reason ===
  // 'word_mismatch'): explica o que deu errado (ex.: "A palavra 'a' foi
  // rejeitada, mas deveria ser aceita."). O painel abre no passo 1 pra o aluno
  // percorrer o rastro do começo. String | null — null no uso manual do botão
  // "🔬 Simular".
  const [simMismatchNote, setSimMismatchNote] = useState(null);
  const [simHighlight, setSimHighlight] = useState({ nodeId: null, type: null, tIdx: null, seq: 0 });
  // Animação de rastreio de palavra no Modo Aula: { word, frames, idx }
  const [lessonSim, setLessonSim]       = useState(null);
  const [simReplay, setSimReplay]       = useState(0); // bump → re-roda a animação
  const [manualTrace, setManualTrace]   = useState(null); // { word, step, key } — ▶ sob demanda (lousa interativa)

  // ── Lógica de grafo (validação, mutações de nós/setas, dados de exibição) ──
  const {
    validateAFDSilent,
    deleteSelected,
    handleNodeLabelFocus, handleNodeLabelChange, handleNodeLabelBlur,
    handleAddSymbol, handleEditSymbol, handleEraseTransition, handleEraseSymbol, handleAppendCardToTransition,
    transitionLabelRefs, handleTransitionLineClick,
    displayNodes, displayTransitions, transitionRenders,
  } = useAFDGraph({
    nodes, setNodes,
    transitions, setTransitions,
    recordHistory, squashNextHistoryRef,
    selectedNodes, setSelectedNodes,
    isDrawingUnlocked,
    interactionMode,
    selectedSymbolCard, setSelectedSymbolCard,
    currentLevel,
    testWords,
    showToast,
    setHighlightedError,
    guidedLessonStep,
    lessonCurStepData,
  });

  // ── Animação de rastreio (passos da aula com simulateWord) ─────────────────
  // Quando o passo atual tem simulateWord, percorremos a palavra no grafo
  // congelado, destacando estado a estado (amarelo → verde/vermelho no fim).
  const lessonSimWord = lessonCur?.simulateWord;
  // Trace manual (botão ▶ da lousa interativa): vale só no passo em que foi
  // disparado e tem prioridade sobre a palavra nativa daquele passo.
  const manualWord = (manualTrace && manualTrace.step === guidedLessonStep) ? manualTrace.word : undefined;
  const wordToTrace = manualWord !== undefined ? manualWord : lessonSimWord;
  useEffect(() => {
    if (guidedLessonStep === null || wordToTrace === undefined) { setLessonSim(null); return; }
    const frames = traceWord(displayNodes, displayTransitions, wordToTrace);
    if (frames.length === 0) { setLessonSim(null); return; }
    setLessonSim({ word: wordToTrace, frames, idx: 0 });
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      if (i >= frames.length) { clearInterval(id); return; }
      setLessonSim(prev => (prev ? { ...prev, idx: i } : prev));
    }, 650);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guidedLessonStep, wordToTrace, simReplay, manualTrace]);

  // Reinicia a animação da palavra atual (botão ↺ Repetir).
  const replayLessonSim = useCallback(() => setSimReplay(k => k + 1), []);
  // Dispara o rastreio de uma palavra específica clicada na lousa (▶).
  const onTriggerManualTrace = useCallback((word) => {
    setManualTrace({ word, step: guidedLessonStep, key: Date.now() });
  }, [guidedLessonStep]);

  // Palavras já "ensinadas": apareceram como simulateWord no passo atual ou anterior.
  const unlockedWords = useMemo(() => {
    const set = new Set();
    if (guidedLessonStep === null) return set;
    for (let i = 0; i <= guidedLessonStep && i < lessonAllSteps.length; i++) {
      const w = lessonAllSteps[i]?.simulateWord;
      if (w !== undefined) set.add(w);
    }
    return set;
  }, [guidedLessonStep, lessonAllSteps]);

  // Destaque efetivo dos nós/transições: a animação da aula tem prioridade sobre
  // a sim manual. `idx` do frame vira o `seq` — já muda a cada passo do
  // rastreio, então serve de "seq" pra remontar o chip e reiniciar o piscar
  // mesmo quando a mesma transição é usada 2 passos seguidos (self-loop).
  const effectiveSimHighlight = lessonSim
    ? { nodeId: lessonSim.frames[lessonSim.idx].nodeId, type: lessonSim.frames[lessonSim.idx].type,
        tIdx: lessonSim.frames[lessonSim.idx].tIdx ?? null, symbol: lessonSim.frames[lessonSim.idx].symbol ?? null,
        seq: lessonSim.idx }
    : simHighlight;

  // ── Telemetria: cronômetro + contadores por fase (helpers em usePhaseTelemetry) ─
  const phaseStartRef = useRef(null);          // performance.now() do início da fase
  const attemptsRef = useRef(0);               // numero_tentativas (reset no loadLevel)
  const tutorialOpensRef = useRef(0);          // aberturas de ajuda (dica + aula) na fase
  const errorSinceTutorialRef = useRef(false); // houve erro desde a última ajuda?
  const { phaseExtras, logTutorialOpen } = usePhaseTelemetry({
    modulo: 'afd-p1', nivelId: currentLevel?.id, dificuldade: LEVEL_DIFFICULTY[currentLevel?.id] ?? null,
    phaseStartRef, attemptsRef, tutorialOpensRef, errorSinceTutorialRef,
  });

  // ── Persistência de sessão (autosave debounced — ver ADR 0011) ─────────────
  // Salva EXATAMENTE o que está no canvas, mesmo estruturalmente inválido —
  // nunca valida antes de salvar. uid não entra no payload (nodes/transitions
  // já não carregam uid neste módulo; genUid() é regenerado ao hidratar).
  const sessionPayload = useMemo(() => ({
    nodes, transitions, testWords,
    isDrawingUnlocked, hintStage: wordleGame.hintStage,
    showVictoryScreen, showImpossibleScreen,
    formal: formalSnapshot ?? EMPTY_FORMAL_STATE,
  }), [nodes, transitions, testWords, isDrawingUnlocked, wordleGame.hintStage,
      showVictoryScreen, showImpossibleScreen, formalSnapshot]);
  const { clearSession } = useLevelSessionPersistence({
    moduleKey: 'afd-p1', levelId: currentLevel?.id ?? null, payload: sessionPayload, levelLabel: currentLevel?.label,
  });

  // Aplica um payload restaurado (autosave OU arquivo importado — mesmo
  // shape) ao estado do orquestrador. `level` é passado explicitamente (em
  // vez de ler `currentLevel`) porque loadLevel chama isto ANTES do
  // setCurrentLevel(level) surtir efeito (state ainda não commitado nesse
  // ponto do callback); handleImportSessionFile passa currentLevel (a fase
  // já aberta na tela).
  const applyRestoredPayload = useCallback((restored, level) => {
    const restoredNodes = restored.nodes ?? [];
    const restoredTransitions = restored.transitions ?? [];
    setNodes(restoredNodes);
    setTransitions(restoredTransitions);
    resetHistory(restoredNodes, restoredTransitions);
    setTestWords(restored.testWords ?? []);
    setIsDrawingUnlocked(!!restored.isDrawingUnlocked);
    // Tabuleiro restaurado destravado precisa repopular as cartas do rodapé
    // (só existem no state normalmente via unlock() — ver buildDrawnCards
    // acima), senão o canvas aparece destravado sem nada pra jogar.
    setDrawnCards(restored.isDrawingUnlocked ? buildDrawnCards(level) : []);
    wordleGame.setHintStage(restored.hintStage ?? 0);
    setShowVictoryScreen(!!restored.showVictoryScreen);
    setShowImpossibleScreen(!!restored.showImpossibleScreen);
    setFormalSnapshot(restored.formal ?? null);
  }, [resetHistory, wordleGame]);

  // ── Exportar/Importar sessão em .json (Feature B — ver ADR 0011) ───────────
  const handleExportSession = useCallback(() => {
    if (!currentLevel) return;
    // Estrelas (ADR 0012): chave de progresso do AFD é o id cru do nível,
    // DIFERENTE do moduleKey da sessão ('afd-p1') — não confundir os dois
    // namespaces (ver §3 do plano).
    const stars = progress?.[currentLevel.id]?.stars ?? 0;
    const snapshot = buildSnapshot('afd-p1', currentLevel.id, sessionPayload, currentLevel.label, stars);
    const ok = downloadSnapshotFile(snapshot, buildExportFilename('afd-p1', currentLevel.id));
    if (ok) {
      showToast('Fase exportada em .json!', 'success');
      if (hasConsent()) logEvent({ tipo_evento: 'exportar_fase', modulo: 'afd-p1', nivel_id: currentLevel.id });
    } else {
      showToast('Não foi possível exportar a fase.', 'error');
    }
  }, [currentLevel, sessionPayload, progress, showToast]);

  const handleImportSessionFile = useCallback(async (file) => {
    if (!currentLevel) return;
    const res = await readImportedFile(file, 'afd-p1', currentLevel.id);
    if (!res.ok) {
      showToast(describeImportError(res.reason), 'error');
      return;
    }
    applyRestoredPayload(res.snapshot.payload, currentLevel);
    // Restaura as estrelas do arquivo (nunca regride — updateProgress já
    // garante isso) sem gerar telemetria de fim_fase falsa (logTelemetry=false).
    if (res.snapshot.stars != null) updateProgress(currentLevel.id, res.snapshot.stars, {}, false);
    showToast('Fase importada com sucesso!', 'success');
    if (hasConsent()) logEvent({ tipo_evento: 'importar_fase', modulo: 'afd-p1', nivel_id: currentLevel.id });
  }, [currentLevel, applyRestoredPayload, updateProgress, showToast]);

  // ── Carrega fase ──────────────────────────────────────────────────────────
  const loadLevel = useCallback((level) => {
    _uidCounter = 0;
    // Telemetria: marca o início da fase, zera os contadores e registra inicio_fase.
    phaseStartRef.current = performance.now();
    attemptsRef.current = 0;
    tutorialOpensRef.current = 0;
    errorSinceTutorialRef.current = false;
    logEvent({
      tipo_evento: 'inicio_fase',
      modulo: 'afd-p1',
      nivel_id: level.id,
      dificuldade: LEVEL_DIFFICULTY[level.id] ?? null,
    });
    setCurrentLevel(level);
    setCurrentPage(1);
    setTela('JOGO');
    setNodes([]);
    setTransitions([]);
    setTestWords([]);
    setIsDrawingUnlocked(false);
    setIsSidebarOpen(false);
    setNewWord('');
    lastAttemptRef.current = null;
    clearTimeout(unlockDelayRef.current);
    wordleGame.reset();
    setProfessorMessage('');
    setInteractionMode('IDLE');
    setDrawnCards([]);
    setSelectedSymbolCard(null);
    setShowVictoryScreen(false);
    setShowImpossibleScreen(false);
    setGuidedLessonStep(null);
    setProfessorMessage('');
    resetZoom();
    setSelectedNodes([]);
    setShowSimPanel(false);
    setSimMismatchNote(null);
    setSimHighlight({ nodeId: null, type: null });
    resetHistory([], []);
    resetDraw();
    userNodesSnapshot.current = null;
    userTransitionsSnapshot.current = null;
    isTableFocusedRef.current = false;

    // ── Hidrata sessão salva (se houver), depois do reset em branco acima ────
    const restored = readLevelSession('afd-p1', level.id);
    if (restored) applyRestoredPayload(restored, level);
    else setFormalSnapshot(null);
  }, [resetHistory, resetDraw, resetZoom, applyRestoredPayload]);

  // ── Modo forçado (ex.: Boss/Trabalho): pula o menu interno e entra direto
  // no nível indicado. Só roda uma vez ao montar — o componente é remontado
  // (key diferente) a cada troca de exercício dentro do Boss. loadLevel faz
  // >15 setState (reset completo do tabuleiro) — não dá pra virar inicializador
  // de useState sem duplicar toda a lógica de reset; supressão intencional.
  useEffect(() => {
    if (forceLevelId == null) return;
    const level = GAME_LEVELS.find(l => l.id === forceLevelId);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (level) loadLevel(level);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Navegação entre fases (pula fases indisponíveis) ──────────────────────
  const handlePrevLevel = useCallback(() => {
    if (!currentLevel) return;
    const idx = GAME_LEVELS.findIndex(l => l.id === currentLevel.id);
    for (let i = idx - 1; i >= 0; i--)
      if (!UNAVAILABLE_LEVELS.has(GAME_LEVELS[i].id) && !HIDDEN_LEVELS.has(GAME_LEVELS[i].id)) { loadLevel(GAME_LEVELS[i]); return; }
  }, [currentLevel, loadLevel]);

  const handleNextLevel = useCallback(() => {
    if (!currentLevel) return;
    const idx = GAME_LEVELS.findIndex(l => l.id === currentLevel.id);
    for (let i = idx + 1; i < GAME_LEVELS.length; i++)
      if (!UNAVAILABLE_LEVELS.has(GAME_LEVELS[i].id) && !HIDDEN_LEVELS.has(GAME_LEVELS[i].id)) { loadLevel(GAME_LEVELS[i]); return; }
  }, [currentLevel, loadLevel]);

  // Abre o painel lateral automaticamente ao entrar na fase FORMAL da aula.
  useEffect(() => {
    if (lessonPhase === 'FORMAL') setIsSidebarOpen(true);
  }, [lessonPhase]);

  // ── Encerrar Aula Guiada (restaura snapshot do aluno) ─────────────────────
  // isImpossibleLessonRef: marca que a aula em andamento foi a auto-aberta pelo
  // L14 (menor palavra = λ) — nesse caso, ao fechar (✓ Fechar da lousa), em vez
  // de só devolver o canvas ao aluno, encadeia direto para a tela de 1 estrela
  // ("impossível/só resolve com AP"). Níveis normais nunca setam essa ref, então
  // handleLessonFinish continua neutro para eles.
  const isImpossibleLessonRef = useRef(false);
  const handleLessonFinish = useCallback(() => {
    setGuidedLessonStep(null);
    setIsSidebarOpen(false);
    const sn = userNodesSnapshot.current ?? [];
    const st = userTransitionsSnapshot.current ?? [];
    setNodes(sn);
    setTransitions(st);
    resetHistory(sn, st);
    if (isImpossibleLessonRef.current) {
      isImpossibleLessonRef.current = false;
      setShowImpossibleScreen(true);
    }
  }, [setGuidedLessonStep, setNodes, setTransitions, resetHistory, userNodesSnapshot, userTransitionsSnapshot]);

  // ── Teste de palavra ───────────────────────────────────────────────────────
  const handleTestWord = useCallback(() => {
    if (!currentLevel) return;
    const target       = currentLevel.shortestWord;
    // gridTarget é o alvo que a MECÂNICA DE VITÓRIA usa (tamanho certo pra
    // vencer a fase 1) — igual a target, EXCETO nos níveis com grade
    // (WORDLE_GRID_LEVEL_IDS) quando target==='' (ex.: L11 e L14), onde a 2ª
    // menor palavra (effectiveShortestWord) é o alvo jogável de verdade. Fora
    // da lista, effectiveShortestWord é sempre null (ver sua definição
    // acima), então caímos de volta em target — nunca null.length nos poucos
    // níveis fora da grade (L01-L04 ocultos).
    const gridTarget   = WORDLE_GRID_LEVEL_IDS.has(currentLevel.id) ? effectiveShortestWord : target;
    const lower        = newWord.toLowerCase();
    // "null"/"vazio" digitados só viram o sentinela quando target === null
    // (L01, L = ∅ — linguagem sem NENHUMA palavra, nem λ): ali não existe
    // menor palavra nenhuma, então "null"/"vazio" são o único jeito de
    // sinalizar essa resposta especial (mesma normalização usada em
    // APPart1/MTReconPart1). Quando target É a string vazia de verdade (ex.:
    // L14 — λ é aceita), a vitória passa pela grade (2ª menor palavra, ex.:
    // "ab") — digitar o TEXTO "null" ali não deve contar como achar λ por
    // atalho (achado real, de antes da grade cobrir L14: "null" "aceitava",
    // abrindo a Aula Guiada, mesmo "null" não sendo uma palavra de {a,b}*).
    const isSpecialNull = target === null && (lower === 'null' || lower === 'vazio');
    const word = isSpecialNull ? '' : newWord;

    // Grade WordleBoard: a grade já revela o tamanho da menor palavra
    // jogável como células vazias — uma tentativa de tamanho errado não
    // cabe na grade e não geraria feedback por letra útil, então é
    // rejeitada antes de contar como tentativa (sem telemetria de
    // 'tentativa', sem consumir attemptsRef).
    if (WORDLE_GRID_LEVEL_IDS.has(currentLevel.id) && !isDrawingUnlocked && gridTarget != null && word.length !== gridTarget.length) {
      showToast(`A menor palavra tem ${gridTarget.length} caracteres — sua tentativa tem ${word.length}.`, 'info');
      // Errou: abre a grade preenchível no centro (dica de tamanho) pra seguir
      // tentando ali, sem ter que clicar em 💡 Dica.
      wordleGame.setHintStage(s => (s === 0 ? 1 : s));
      return;
    }

    let isShortest = false, isValid = false;

    if (target === null) { if (isSpecialNull) isShortest = true; }
    else if (gridTarget != null && word.length === gridTarget.length && lvlAccepts(currentLevel, word)) isShortest = true;

    if ((currentLevel.regex || currentLevel.validate) && !(target === null && isSpecialNull))
      isValid = lvlAccepts(currentLevel, word);

    const wordDisplay = word === '' ? 'λ' : word;
    if (testWords.some(w => w.word === wordDisplay)) {
      showToast('Você já testou essa palavra!', 'info'); return;
    }
    lastAttemptRef.current = word;

    // Telemetria: registra cada tentativa nova (repetições saem no early-return acima).
    const resultado = isShortest ? 'shortest' : (isValid ? 'correct' : 'wrong');
    if (resultado === 'wrong') errorSinceTutorialRef.current = true; // "sem erro desde a ajuda" quebra
    attemptsRef.current += 1;
    logEvent({
      tipo_evento: 'tentativa',
      modulo: 'afd-p1',
      nivel_id: currentLevel.id,
      resultado,
      numero_tentativas: attemptsRef.current,
    });

    if (isShortest) {
      if (!isDrawingUnlocked) {
        updateProgress(currentLevel.id, 1, phaseExtras('descoberta_palavra'));
        if (currentLevel.impossible && currentLevel.guidedLesson?.length) {
          // L14: abre a Aula Guiada de verdade (mesmo fluxo do botão "🎓 Aula"),
          // sem deixar desenhar — ao fechar (✓ Fechar da lousa), encadeia para
          // a tela de 1 estrela via isImpossibleLessonRef (ver handleLessonFinish).
          userNodesSnapshot.current = JSON.parse(JSON.stringify(nodes));
          userTransitionsSnapshot.current = JSON.parse(JSON.stringify(transitions));
          isImpossibleLessonRef.current = true;
          setGuidedLessonStep(0);
        } else if (currentLevel.impossible || currentLevel.wordOnly) {
          setShowImpossibleScreen(true);
        } else {
        const unlock = () => {
          setIsDrawingUnlocked(true);
          showToast('Sucesso! Tabuleiro liberado.', 'success');
          setDrawnCards(buildDrawnCards(currentLevel));
        };
        // Grade WordleBoard: segura a última linha (toda verde) visível por
        // um instante antes de destravar — sem o delay, o overlay some
        // junto com o acerto e o aluno nunca chega a ver a vitória na
        // grade. Níveis fora da grade destravam na hora, como sempre.
        if (WORDLE_GRID_LEVEL_IDS.has(currentLevel.id)) unlockDelayRef.current = setTimeout(unlock, 900);
        else unlock();
        }
      }
      setTestWords(prev => [{ word: wordDisplay, status: 'shortest' }, ...prev]);
    } else if (isValid) {
      setTestWords(prev => [{ word: wordDisplay, status: 'correct' }, ...prev]);
    } else {
      setTestWords(prev => [{ word: wordDisplay, status: 'wrong' }, ...prev]);
    }
    // Tentativa que NÃO destravou: a grade já apareceu mostrando o erro por
    // letra — deixa ela preenchível (hintStage ≥ 1) pro aluno continuar no
    // centro da tela, em vez de exigir um clique em 💡 Dica.
    if (WORDLE_GRID_LEVEL_IDS.has(currentLevel.id) && !isDrawingUnlocked && !isShortest) {
      wordleGame.setHintStage(s => (s === 0 ? 1 : s));
    }
    setNewWord('');
  }, [currentLevel, effectiveShortestWord, newWord, testWords, isDrawingUnlocked, showToast, updateProgress, phaseExtras, nodes, transitions, setGuidedLessonStep, userNodesSnapshot, userTransitionsSnapshot, wordleGame]);

  const clearTests = useCallback(() => {
    setTestWords([]);
    setNewWord('');
  }, []);

  // ── Dica de Tamanho: mostra num toast, nunca revela a palavra em si ────────
  const handleSizeHint = useCallback(() => {
    if (lastAttemptRef.current === null) {
      showToast(buildNoAttemptHintMessage(), 'info');
      return;
    }
    showToast(buildSizeHintMessage(currentLevel?.shortestWord, lastAttemptRef.current), 'info');
    logTutorialOpen('dica_tamanho');
  }, [currentLevel, showToast, logTutorialOpen]);

  // Grade WordleBoard: o botão 💡 vira um controle de estágio em vez de
  // um toast — 1º clique revela o tamanho (bordas vazias), 2º clique revela o
  // texto fixo com as letras da palavra (sem posição). Trava em 2: a 3ª dica
  // seria a resposta. Mecânica delegada ao hook compartilhado (wordleGame).
  const handleWordleHint = useCallback(() => {
    const before = wordleGame.hintStage;
    wordleGame.requestHint();
    if (before < 2) logTutorialOpen(before === 0 ? 'dica_tamanho' : 'dica_letras');
  }, [wordleGame, logTutorialOpen]);

  // Atalhos de teclado: Ctrl+Z, Ctrl+Y, Esc, Delete
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (drawingStack.length > 0) drawUndo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        setInteractionMode('IDLE');
        resetMode();
      }
      if (e.key === 'Delete' && !isInput) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, drawUndo, drawingStack, resetMode, deleteSelected]);

  const toggleSidebar = () => setIsSidebarOpen(o => !o);

  const handleProfessorClick = useCallback(() => {
    if (guidedLessonStep !== null) return;
    const isOpening = !professorMessage; // vazio → o clique vai ABRIR a dica
    setProfessorMessage(msg =>
      msg
        ? ''
        : (currentLevel?.hint || 'Dica: verifique se todos os estados têm transições para cada letra do alfabeto!')
    );
    // Telemetria: loga só na abertura (via helper unificado de "uso de ajuda").
    if (isOpening) logTutorialOpen('dica');
  }, [guidedLessonStep, currentLevel, professorMessage, logTutorialOpen]);

  const validateAFD = useCallback(() => {
    if (!validateAFDSilent(true)) {
      errorSinceTutorialRef.current = true; // validação falha quebra "sem erro desde a ajuda"
      // Telemetria: reusa validateAFDPure (gêmea pura, mesma ordem de checagens)
      // só para extrair o motivo estruturado — validateAFDSilent não é alterada.
      const { reason, word: mismatchWord, shouldAccept, counterexample } =
        validateAFDPure({ nodes, transitions, testWords, currentLevel });
      logEvent({
        tipo_evento: 'tentativa',
        modulo: 'afd-p1',
        nivel_id: currentLevel.id,
        resultado: 'validacao_falhou',
        tipo_erro: reason ?? null,
        numero_tentativas: attemptsRef.current,
      });
      // Sempre que a falha for sobre uma PALAVRA concreta, abre a simulação já
      // carregada com ela, no passo 1, com um aviso no topo — pro aluno
      // percorrer o rastro do começo (mesmo espírito do trace-on-failure do
      // AP — ver ADR 0010). Duas fontes de palavra:
      //   • 'word_mismatch'     — palavra que o aluno testou e o grafo errou;
      //   • 'language_mismatch' — contraexemplo achado pelo fuzzer de
      //     equivalência (o aluno pode nem ter testado essa palavra).
      // Motivos estruturais (no_initial, no_final, empty_symbol,
      // nondeterministic, invalid_symbol) seguem só com o toast de
      // validateAFDSilent — não há palavra específica pra mostrar.
      const badWord =
        reason === 'word_mismatch'      ? { word: mismatchWord, shouldAccept }
        : reason === 'language_mismatch' ? counterexample
        : null;
      if (badWord?.word != null) {
        const w = badWord.word === '' ? 'λ' : badWord.word;
        setSimMismatchNote(
          badWord.shouldAccept
            ? `"${w}" foi rejeitada — deveria ser aceita`
            : `"${w}" foi aceita — deveria ser rejeitada`
        );
        setSimWord(badWord.word);
        setShowSimPanel(true);
      }
      return;
    }
    updateProgress(currentLevel.id, 2, phaseExtras('validacao'));
    showToast('Autômato Validado! Preencha a Tabela Formal.', 'success');
    setIsSidebarOpen(true);
  }, [validateAFDSilent, currentLevel, updateProgress, showToast, phaseExtras, nodes, transitions, testWords]);

  const handleFormalSuccess = useCallback(() => {
    updateProgress(currentLevel.id, 3, phaseExtras('tabela_formal'));
    showToast('Fase Concluída com Perfeição! 3ª Estrela conquistada!', 'success');
    setShowVictoryScreen(true);
  }, [currentLevel, updateProgress, showToast, phaseExtras]);

  // ── Simulação no Rodapé ────────────────────────────────────────────────────
  const openSimulation = useCallback(() => {
    if (!isDrawingUnlocked) { showToast('Monte o autômato primeiro!', 'info'); return; }
    if (!nodes.some(n => n.isInitial)) { showToast('Defina o estado inicial antes.', 'error'); return; }
    if (!newWord.trim()) { showToast('Digite uma palavra no campo para simular.', 'info'); return; }
    setSimWord(newWord);
    setSimMismatchNote(null);
    setShowSimPanel(true);
  }, [isDrawingUnlocked, nodes, newWord, showToast]);

  // ── Drag da carta Estado → canvas ─────────────────────────────────────────
  const handleDeckNodeDrag = useCallback((x, y) => {
    setDeckGhostPos({ x, y });
  }, []);

  const handleDeckNodeDrop = useCallback((clientX, clientY) => {
    setDeckGhostPos(null);
    if (!isDrawingUnlocked || !innerCanvasRef.current) return;
    const rect = innerCanvasRef.current.getBoundingClientRect();
    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return;
    const rawX = ((clientX - rect.left) / rect.width)  * INNER_W;
    const rawY = ((clientY - rect.top)  / rect.height) * INNER_H;
    const ix = Math.max(5, Math.min(INNER_W - 5, rawX));
    const iy = Math.max(5, Math.min(INNER_H - 5, rawY));
    let num = nodes.length;
    const usedLabels = new Set(nodes.map(n => n.label));
    while (usedLabels.has(`q${num}`)) num++;
    const newLabel = `q${num}`;
    const newNodes = [...nodes, { uid: genUid(), id: newLabel, label: newLabel, x: ix, y: iy, isInitial: false, isFinal: false }];
    setNodes(newNodes);
    recordHistory(newNodes, transitions);
  }, [isDrawingUnlocked, nodes, transitions, recordHistory]);

  const handleDeckNodeDragCancel = useCallback(() => {
    setDeckGhostPos(null);
  }, []);

  // ══════════════════════════════════════════════════════════════
  // TELA MENU (FASES)
  // ══════════════════════════════════════════════════════════════
  if (tela === 'MENU') {
    return (
      <LevelMenu
        progress={progress}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onBack={onBack}
        onSelect={loadLevel}
      />
    );
  }

  // ══════════════════════════════════════════════════════════════
  // TELA DO JOGO
  // ══════════════════════════════════════════════════════════════
  // Ativa o layout V2 (BlackboardPanel) apenas quando a fase tem boardWords
  const isNewLessonUI = guidedLessonStep !== null && (currentLevel?.boardWords?.length ?? 0) > 0;

  const discoveredSymbols = new Set(
    testWords.filter(w => w.status === 'correct' || w.status === 'shortest')
      .flatMap(w => w.word.split(''))
  );

  return (
    <div className="workspace-wrapper">
      {toastData.show && <div className={`toast-notification ${toastData.type}`}>{toastData.message}</div>}

      {deckGhostPos && createPortal(
        <div className="deck-drag-ghost" style={{ left: deckGhostPos.x, top: deckGhostPos.y }} />,
        document.body
      )}

      {/* ── Header ── */}
      <GameHeader
        currentLevel={currentLevel}
        label={forceLevelLabel ?? currentLevel?.label}
        progress={progress}
        diffColor={forceLabelColor ?? DIFF_COLOR[LEVEL_DIFFICULTY[currentLevel?.id]] ?? '#fff'}
        starsMax={currentLevel?.impossible || currentLevel?.wordOnly ? 1 : 3}
        isFirst={forceLevelId != null ? !onForcedPrev : !GAME_LEVELS.slice(0, GAME_LEVELS.findIndex(l => l.id === currentLevel?.id)).some(l => !UNAVAILABLE_LEVELS.has(l.id) && !HIDDEN_LEVELS.has(l.id))}
        isLast={forceLevelId != null ? !onForcedNext : !GAME_LEVELS.slice(GAME_LEVELS.findIndex(l => l.id === currentLevel?.id) + 1).some(l => !UNAVAILABLE_LEVELS.has(l.id) && !HIDDEN_LEVELS.has(l.id))}
        toggleSidebar={toggleSidebar}
        onBack={forceLevelId != null ? onBack : () => setTela('MENU')}
        onPrevLevel={forceLevelId != null ? onForcedPrev : handlePrevLevel}
        onNextLevel={forceLevelId != null ? onForcedNext : handleNextLevel}
        onStartLesson={() => {
          userNodesSnapshot.current = JSON.parse(JSON.stringify(nodes));
          userTransitionsSnapshot.current = JSON.parse(JSON.stringify(transitions));
          setGuidedLessonStep(0);
          logTutorialOpen('aula_guiada'); // mesma métrica de "uso de ajuda" da dica
        }}
        lessonActive={lessonActive}
        onCloseLesson={handleLessonFinish}
        showSizeHint={!isDrawingUnlocked && (!WORDLE_GRID_LEVEL_IDS.has(currentLevel?.id) || wordleGame.hintStage < 2)}
        onSizeHint={WORDLE_GRID_LEVEL_IDS.has(currentLevel?.id) ? handleWordleHint : handleSizeHint}
        onExportSession={handleExportSession}
        onImportSessionFile={handleImportSessionFile}
      />

      <div className="workspace">
        {/* ── Sidebar Esquerda ── */}
        <aside className={`formal-panel ${isSidebarOpen ? 'open' : ''}`}>
          <FormalDescriptionModal
            isOpen={isSidebarOpen}
            onClose={() => { setIsSidebarOpen(false); }}
            nodes={nodes}
            transitions={transitions}
            alphabet={currentLevel?.alphabet}
            onSuccess={handleFormalSuccess}
            showToast={showToast}
            onValidateGraph={() => validateAFDSilent(true)}
            demo={lessonActive && lessonPhase === 'FORMAL' ? lessonReveal : null}
            initialValues={formalSnapshot}
            onStateChange={setFormalSnapshot}
            onTableFocusChange={v => {
              if (v) {
                clearTimeout(tableBlurTimeoutRef.current);
                isTableFocusedRef.current = true;
              } else {
                tableBlurTimeoutRef.current = setTimeout(() => { isTableFocusedRef.current = false; }, 300);
              }
            }}
          />
        </aside>

        {/* Coluna do canvas: barra de palavras testadas + canvas, lado a lado
            com o painel direito (que ocupa a altura inteira, começando do topo). */}
        <div className="canvas-column">
        {/* ── Barra de palavras testadas (oculta no modo Aula V2) ── */}
        {currentLevel && !isNewLessonUI && (
          <div className="words-hint-bar">
            <div className="words-hint-group">
              <span className="words-hint-label accept">✓ Aceita</span>
              {testWords.filter(w => w.status === 'correct' || w.status === 'shortest').map((w, i) => (
                <span key={i} className="words-hint-chip accept">{w.word}</span>
              ))}
            </div>
            <div className="words-hint-sep" />
            <div className="words-hint-group">
              <span className="words-hint-label reject">✗ Rejeita</span>
              {testWords.filter(w => w.status === 'wrong').map((w, i) => (
                <span key={i} className="words-hint-chip reject">{w.word}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── Canvas ── */}
        <CanvasArea
          canvasRef={canvasRef}
          innerCanvasRef={innerCanvasRef}
          viewportRef={viewportRef}
          genUid={genUid}
          isDrawingUnlocked={isDrawingUnlocked}
          interactionMode={interactionMode}
          setInteractionMode={setInteractionMode}
          isErasing={isErasing}
          setIsErasing={setIsErasing}
          drawTool={drawTool}
          setDrawTool={setDrawTool}
          drawColor={drawColor}
          setDrawColor={setDrawColor}
          drawSize={drawSize}
          setDrawSize={setDrawSize}
          zoom={zoom}
          setZoom={setZoom}
          nodes={nodes}
          setNodes={setNodes}
          transitions={transitions}
          setTransitions={setTransitions}
          recordHistory={recordHistory}
          squashNextHistoryRef={squashNextHistoryRef}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          connectingSource={connectingSource}
          setConnectingSource={setConnectingSource}
          selectionBox={selectionBox}
          setSelectionBox={setSelectionBox}
          dragInfo={dragInfo}
          setDragInfo={setDragInfo}
          drawings={drawings}
          setDrawings={setDrawings}
          setDrawingStack={setDrawingStack}
          currentStroke={currentStroke}
          setCurrentStroke={setCurrentStroke}
          drawingsRef={drawingsRef}
          isDrawingRef={isDrawingRef}
          currentStrokeRef={currentStrokeRef}
          selectedSymbolCard={selectedSymbolCard}
          transitionRenders={transitionRenders}
          highlightedError={highlightedError}
          handleTransitionLineClick={handleTransitionLineClick}
          transitionLabelRefs={transitionLabelRefs}
          handleAddSymbol={handleAddSymbol}
          handleEditSymbol={handleEditSymbol}
          handleEraseTransition={handleEraseTransition}
          handleEraseSymbol={handleEraseSymbol}
          handleAppendCardToTransition={handleAppendCardToTransition}
          displayNodes={displayNodes}
          simHighlight={effectiveSimHighlight}
          handleNodeLabelFocus={handleNodeLabelFocus}
          handleNodeLabelChange={handleNodeLabelChange}
          handleNodeLabelBlur={handleNodeLabelBlur}
          setDrawMode={setDrawMode}
          showToast={showToast}
          guidedLessonStep={guidedLessonStep}
          setGuidedLessonStep={setGuidedLessonStep}
          currentLevel={currentLevel}
          userNodesSnapshot={userNodesSnapshot}
          userTransitionsSnapshot={userTransitionsSnapshot}
          resetHistory={resetHistory}
          lessonActive={lessonActive}
          testWords={testWords}
          wordleGame={wordleGame}
          effectiveShortestWord={effectiveShortestWord}
          newWord={newWord}
          handleTestWord={handleTestWord}
        />
        </div>

        {/* ── Painel Direito: TestPanel normal ou BlackboardPanel (Aula V2) ── */}
        {isNewLessonUI ? (
          <BlackboardPanel
            boardWords={currentLevel.boardWords}
            rejectedWords={currentLevel.rejectedWords}
            step={guidedLessonStep}
            steps={lessonAllSteps}
            phase={lessonPhase}
            sim={lessonSim}
            levelId={currentLevel?.id}
            unlockedWords={unlockedWords}
            onReplaySim={replayLessonSim}
            onTriggerManualTrace={onTriggerManualTrace}
            atGraphEnd={lessonAtGraphEnd}
            onGoFormal={() => { setManualTrace(null); lessonGoFormal(); }}
            onDoGraph={handleLessonFinish}
            onNext={() => { setManualTrace(null); setGuidedLessonStep(s => Math.min(s + 1, lessonAllSteps.length - 1)); }}
            onPrev={() => { setManualTrace(null); setGuidedLessonStep(s => Math.max(s - 1, 0)); }}
            onFinish={handleLessonFinish}
          />
        ) : (
          <TestPanel
            currentLevel={currentLevel}
            newWord={newWord}
            setNewWord={setNewWord}
            handleTestWord={handleTestWord}
            isDrawingUnlocked={isDrawingUnlocked}
            openSimulation={openSimulation}
            testWords={testWords}
            validateAFD={validateAFD}
            clearTests={clearTests}
          />
        )}
      </div>

      {/* ── Rodapé: Cartas / Simulação (colapsa no modo Aula V2) ── */}
      <FooterDeck
        isLessonActive={isNewLessonUI}
        showSimPanel={showSimPanel}
        simWord={simWord}
        simMismatchNote={simMismatchNote}
        nodes={nodes}
        transitions={transitions}
        setShowSimPanel={setShowSimPanel}
        setSimMismatchNote={setSimMismatchNote}
        setSimHighlight={setSimHighlight}
        drawnCards={drawnCards}
        drawingStack={drawingStack}
        historyIndex={historyIndex}
        historyLen={historyLen}
        drawUndo={drawUndo}
        undo={undo}
        redo={redo}
        interactionMode={interactionMode}
        setInteractionMode={setInteractionMode}
        highlightedError={highlightedError}
        resetMode={resetMode}
        setInitialMode={setInitialMode}
        addNodeMode={addNodeMode}
        addTransitionMode={addTransitionMode}
        toggleFinalStateMode={toggleFinalStateMode}
        setEraserMode={setEraserMode}
        setDrawMode={setDrawMode}
        selectedSymbolCard={selectedSymbolCard}
        setSelectedSymbolCard={setSelectedSymbolCard}
        setConnectingSource={setConnectingSource}
        discoveredSymbols={discoveredSymbols}
        isDrawingUnlocked={isDrawingUnlocked}
        guidedLessonStep={guidedLessonStep}
        currentLevel={currentLevel}
        professorMessage={professorMessage}
        handleProfessorClick={handleProfessorClick}
        onDeckNodeDrag={handleDeckNodeDrag}
        onDeckNodeDrop={handleDeckNodeDrop}
        onDeckNodeDragCancel={handleDeckNodeDragCancel}
      />

      {/* ── Tela Impossível ── */}
      {showImpossibleScreen && (
        <EndScreen
          currentLevelId={currentLevel?.id}
          nextLevel={forceLevelId != null ? null : undefined}
          message={currentLevel?.wordOnly
            ? (currentLevel?.successMsg || 'Muito bem! Fase concluída.')
            : 'Este exercício é impossível de resolver com AFD! Com AP nós vamos resolvê-lo! 🚫🔄'}
          balloon={{ width: 320, height: 220, marginTop: -150 }}
          textStyle={{ padding: '20px 38px 52px', fontSize: 15 }}
          nextPrefix="Entendido! Próxima: "
          onMenu={() => { clearSession(); setShowImpossibleScreen(false); forceLevelId != null ? onBack() : setTela('MENU'); }}
          onNext={next => { clearSession(); setShowImpossibleScreen(false); loadLevel(next); }}
        />
      )}

      {/* ── Tela de Vitória ── */}
      {showVictoryScreen && (
        <EndScreen
          currentLevelId={currentLevel?.id}
          nextLevel={forceLevelId != null ? null : undefined}
          message={currentLevel?.successMsg || 'Parabéns, você dominou esta linguagem!'}
          balloon={{ width: 300, height: 210, marginTop: -140 }}
          textStyle={{ padding: '18px 36px 48px', fontSize: 17 }}
          nextPrefix="Próxima: "
          onMenu={() => { clearSession(); setShowVictoryScreen(false); forceLevelId != null ? onBack() : setTela('MENU'); }}
          onNext={next => { clearSession(); setShowVictoryScreen(false); loadLevel(next); }}
        />
      )}
    </div>
  );
}
