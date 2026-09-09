// ─── MTReconPart1: módulo MT Reconhecedora (desenhar a MT → Validar) ─────────
// Mesmo visual/motor do AP: canvas fixo 8000×8000px + zoom real, GameHeader
// compartilhado, overlay "descubra a menor palavra" antes de destravar o
// desenho, painel Linguagem/Desenho no estilo ap-test-panel.
// Validação via fuzzTMRecognizer (bateria acceptedWords/rejectedWords) —
// aceita se para em estado final, o conteúdo final da fita NÃO importa
// (diferente da transdutora — irmã deste módulo, ver MTPart1.jsx).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../afd/AFDPart1.css';
import '../afd/components/TestPanel.css';
import '../afd/FormalDescriptionModal.css';
import '../ap/APPart1.css';
import './MTReconPart1.css';
import { SvgStars } from '../afd/SvgStar';
import LevelGridScreen from '../afd/components/LevelGridScreen';
import EndScreen from '../afd/components/EndScreen';
import GameHeader from '../afd/components/GameHeader';
import MTCanvas from '../mt/components/MTCanvas';
import APFooterDeck from '../ap/components/APFooterDeck';
import MTSimPanel from '../mt/components/MTSimPanel';
import useTMGraph from '../mt/hooks/useTMGraph';
import useMTGuidedLesson from '../mt/hooks/useMTGuidedLesson';
import useAPDrawing from '../ap/hooks/useAPDrawing';
import useCanvasState, { INNER_W, INNER_H } from '../afd/hooks/useCanvasState.js';
import useToast from '../afd/hooks/useToast';
import usePhaseTelemetry from '../afd/hooks/usePhaseTelemetry';
import { MT_RECON_LEVEL_ORDER, loadMTReconLevel, getShortestWord, getGabaritoGraph } from '../../levels_data/mt-recon/index.js';
import { buildNoAttemptHintMessage, buildSizeHintMessage } from '../afd/utils/sizeHint';
import useWordGuessGame from '../shared/useWordGuessGame';
import { findSecondShortestWord } from '../shared/wordExercises/findSecondShortestWord';
import { fuzzTMRecognizer, simulateTM, simulateTMSteps } from '../mt/utils/tmAlgorithms';
import { validateMTFormalFields, validateMTFormalTransitions } from '../mt/utils/mtFormalValidation';
import { onBracketKeyDown } from '../afd/utils/bracketAutoClose';
import { DIFF_COLOR } from '../../levels';
import { logEvent, hasConsent } from '../../services/telemetry';
import useLevelSessionPersistence, { readLevelSession } from '../shared/persistence/useLevelSessionPersistence.js';
import { buildSnapshot } from '../shared/persistence/sessionSnapshot.js';
import {
  buildExportFilename, downloadSnapshotFile, readImportedFile, describeImportError,
} from '../shared/persistence/exportImportFile.js';

const SIM_MAX_STEPS = 500;

const EMPTY_FORMAL = { states: '', sigma: '', gamma: '', initial: '', blank: '', final: '', deltaCells: {} };

export default function MTReconPart1({ onBack, progress, updateProgress,
  forceLevelId, forceLevelLabel, onForcedPrev, onForcedNext, forceLabelColor }) {
  // ── Toast (local, ignora o showToast no-op do App.jsx) ─
  const { toastData, showToast } = useToast();

  const [screen, setScreen] = useState('MENU');
  const [level,  setLevel]  = useState(null);
  // Prefetch em paralelo, só popula quando TODOS resolverem — mesmo padrão de
  // MTPart1.jsx (ver comentário lá; evita a grade do menu "piscando" botão a
  // botão conforme cada import termina).
  const [mtReconLevels, setMtReconLevels] = useState([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(MT_RECON_LEVEL_ORDER.map(loadMTReconLevel)).then(levels => {
      if (!cancelled) setMtReconLevels(levels);
    });
    return () => { cancelled = true; };
  }, []);
  const [mode,   setMode]   = useState('IDLE');
  const [connectingSource, setConnectingSource] = useState(null);
  const [errAction, setErrAction] = useState(null);
  const [prof,   setProf]   = useState({ message: '', mood: 'serio' });
  const [simWord, setSimWord] = useState('');
  const [testedWords, setTestedWords] = useState([]);
  // Antes de destravar: sempre testa contra a LINGUAGEM (mecânica de achar a
  // menor palavra). Depois: o aluno escolhe LANGUAGE (gabarito) ou DRAWING (o
  // grafo que ele mesmo montou) — mesmo padrão do AP.
  const [testMode, setTestMode] = useState('LANGUAGE');
  const [isDrawingUnlocked, setIsDrawingUnlocked] = useState(false);
  const [deckGhost, setDeckGhost] = useState(null);
  const [victory, setVictory]     = useState(false);
  const [selectedNodes, setSelectedNodes]   = useState([]);
  const [selectionBox, setSelectionBox]     = useState(null);
  const [formalAnswers, setFormalAnswers]   = useState(EMPTY_FORMAL);
  const [formalMode, setFormalMode]         = useState(false);
  const [formalElementsValid, setFormalElementsValid] = useState(false); // campos (Q,Σ,Γ,q₀,□,F) já validados
  const [fieldErrors, setFieldErrors] = useState({}); // erros por campo — igual AFD/AP (borda vermelha)
  const [cellErrors,  setCellErrors]  = useState({}); // erros por célula da tabela δ — 'q0|a': true
  const [inputError, setInputError]           = useState(null);
  // ── Simulador passo a passo (botão "🔬 Simular") ────────────────────────────
  // sim: { configs, word, title, message } | null — mesmo padrão do AP
  // (openSim/closeSim/sim/simKey). simKey força o MTSimPanel a remontar (e
  // resetar seu índice de passo interno) a cada nova simulação, mesmo se a
  // palavra digitada for igual à anterior.
  const [sim, setSim] = useState(null);
  const [simKey, setSimKey] = useState(0);
  // { nodeId, type, tIdx, seq } do passo atual da simulação — realça o estado
  // E a transição percorrida no canvas fora da Aula Guiada (MTCanvas só
  // realça lessonActive por padrão; ver props simActiveNodeId/simActiveTIdx/
  // simActiveSeq abaixo). `seq` incrementa a cada passo (mesmo padrão do AP
  // — simHighlight.seq em APPart1.jsx) — é o que permite a animação de
  // "piscar" reiniciar mesmo quando o MESMO tIdx é destacado 2 passos
  // seguidos (ver MTCanvas.jsx: a key do chip usa tIdx+seq).
  const [simHighlight, setSimHighlight] = useState({ nodeId: null, type: null, tIdx: null, seq: 0 });
  const openSim  = useCallback((s) => { setSim(s); setSimKey(k => k + 1); }, []);
  const closeSim = useCallback(() => { setSim(null); setSimHighlight({ nodeId: null, type: null, tIdx: null, seq: 0 }); }, []);
  const handleSimHighlight = useCallback((nodeId, type, tIdx) =>
    setSimHighlight(prev => ({ nodeId, type, tIdx: tIdx ?? null, seq: prev.seq + 1 })), []);
  const canvasRef      = useRef(null);
  const innerCanvasRef = useRef(null);
  const viewportRef    = useRef(null);
  const formalRef      = useRef(null);
  const currentFormalElRef = useRef(null); // campo/linha δ revelado no passo atual da aula — alvo do auto-scroll
  const formalFieldRefs = useRef({}); // { [campo]: {current: <input>} } — p/ inserir símbolo no cursor
  const noopRef        = useRef(false);
  // Última palavra testada em modo LANGUAGE durante a fase de descoberta
  // (normalizada — 'null'/'vazio' já viram ''), usada só pela Dica de Tamanho.
  const lastAttemptRef = useRef(null);
  // Grade WordleBoard: segura a linha vencedora (toda verde) visível um
  // instante antes de destravar o tabuleiro (mesmo delay do AFD/AP).
  const unlockDelayRef = useRef(null);

  // Alvo JOGÁVEL da grade "descubra a menor palavra" — igual ao AFD/AP: a menor
  // palavra aceita; quando a menor é λ (não cabe na grade), a 2ª menor
  // não-vazia. Descobrir a menor palavra independe da MT que o aluno vai
  // montar — é só onboarding.
  const effectiveShortestWord = useMemo(() => {
    if (!level) return null;
    const sw = getShortestWord(level);
    if (sw == null) return null;
    if (sw !== '') return sw;
    const graph = getGabaritoGraph(level);
    const check = (w) => simulateTM(graph, w, 2000, level.startMarker ?? null).status === 'ACCEPTED';
    return findSecondShortestWord(check, level.alphabet ?? []);
  }, [level]);
  // Mecânica de grade/dica compartilhada com AFD/AP (ver
  // src/modules/shared/useWordGuessGame.js). 'guess' é o próprio `simWord`
  // (controlado) — digitar na grade e no campo lateral são a mesma coisa.
  const wordleGame = useWordGuessGame({
    shortestWord: effectiveShortestWord,
    guess: simWord,
    setGuess: setSimWord,
  });

  const lesson = useMTGuidedLesson(level);
  const g    = useTMGraph({ showToast, selectedNodes, setSelectedNodes });
  const draw = useAPDrawing(innerCanvasRef);

  // Canvas fixo (8000×8000px) + zoom real: mesmo motor do AP/AFD.
  const { zoom, setZoom, resetZoom } = useCanvasState({
    isDrawingUnlocked: true,
    setInteractionMode: () => {},
    squashNextHistoryRef: noopRef,
    setConnectingSource,
    setSelectedSymbolCard: () => {},
    setSelectedNodes,
    tela: screen === 'GAME' ? 'JOGO' : screen,
    isSidebarOpen: formalMode,
    canvasRef,
    viewportRef,
  });

  const viewNodes       = lesson.active ? lesson.displayNodes       : g.nodes;
  const viewTransitions = lesson.active ? lesson.displayTransitions : g.transitions;

  const say = useCallback((message, mood = 'serio') => setProf({ message, mood }), []);

  // ── Telemetria (módulo mt-recon) ────────────────────────────────────────────
  // Mesmo modelo do AP: 3 marcos com estrelas 1/2/3 — descoberta_palavra (★1, a
  // menor palavra que destrava o tabuleiro), validacao (★2, fuzzTMRecognizer OK)
  // e tabela_formal (★3, 7-tupla concluída). Tentativa nos testes de palavra em
  // modo LANGUAGE (resposta avaliada: gabarito) + no Validar. PULADO: modo
  // DRAWING (simulador do grafo do aluno = exploração, não avaliada).
  const phaseStartRef = useRef(null);
  const attemptsRef = useRef(0);
  const tutorialOpensRef = useRef(0);
  const errorSinceTutorialRef = useRef(false);
  const { phaseExtras, logTutorialOpen } = usePhaseTelemetry({
    modulo: 'mt-recon', nivelId: level?.id, dificuldade: level?.level ?? null,
    phaseStartRef, attemptsRef, tutorialOpensRef, errorSinceTutorialRef,
  });

  // ── Persistência de sessão (autosave debounced — ver ADR 0011) ─────────────
  const sessionPayload = useMemo(() => ({
    nodes: g.nodes, transitions: g.transitions, testedWords,
    isDrawingUnlocked, hintStage: wordleGame.hintStage,
    testMode, victory,
    formal: { formalAnswers, formalElementsValid },
  }), [g.nodes, g.transitions, testedWords, isDrawingUnlocked, wordleGame.hintStage,
      testMode, victory, formalAnswers, formalElementsValid]);
  const { clearSession } = useLevelSessionPersistence({
    moduleKey: 'mt-recon', levelId: level?.id ?? null, payload: sessionPayload, levelLabel: level?.label,
  });

  // Aplica um payload restaurado (autosave OU arquivo importado — mesmo
  // shape) ao estado do orquestrador. Usado por loadLevel (ao entrar na
  // fase) e por handleImportSessionFile (fase já aberta na tela).
  const applyRestoredPayload = useCallback((restored) => {
    g.reset({ nodes: restored.nodes ?? [], transitions: restored.transitions ?? [] });
    setSim(null); setSimHighlight({ nodeId: null, type: null, tIdx: null, seq: 0 });
    setMode('IDLE'); setConnectingSource(null);
    setVictory(!!restored.victory);
    setTestedWords(restored.testedWords ?? []);
    setTestMode(restored.testMode ?? 'LANGUAGE');
    wordleGame.setHintStage(restored.hintStage ?? 0);
    setIsDrawingUnlocked(!!restored.isDrawingUnlocked);
    setFormalAnswers(restored.formal?.formalAnswers ?? EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(!!restored.formal?.formalElementsValid);
    setFieldErrors({}); setCellErrors({});
  }, [g, wordleGame]);

  // ── Exportar/Importar sessão em .json (Feature B — ver ADR 0011) ───────────
  const handleExportSession = useCallback(() => {
    if (!level) return;
    // Estrelas (ADR 0012): chave de progresso é `mt-recon-<id>`, DIFERENTE
    // do moduleKey da sessão ('mt-recon') — não confundir os dois namespaces.
    const stars = progress?.[`mt-recon-${level.id}`]?.stars ?? 0;
    const snapshot = buildSnapshot('mt-recon', level.id, sessionPayload, level.label, stars);
    const ok = downloadSnapshotFile(snapshot, buildExportFilename('mt-recon', level.id));
    if (ok) {
      showToast?.('Fase exportada em .json!', 'success');
      if (hasConsent()) logEvent({ tipo_evento: 'exportar_fase', modulo: 'mt-recon', nivel_id: level.id });
    } else {
      showToast?.('Não foi possível exportar a fase.', 'error');
    }
  }, [level, sessionPayload, progress, showToast]);

  const handleImportSessionFile = useCallback(async (file) => {
    if (!level) return;
    const res = await readImportedFile(file, 'mt-recon', level.id);
    if (!res.ok) {
      showToast?.(describeImportError(res.reason), 'error');
      return;
    }
    applyRestoredPayload(res.snapshot.payload);
    if (res.snapshot.stars != null) updateProgress?.(`mt-recon-${level.id}`, res.snapshot.stars, {}, false);
    showToast?.('Fase importada com sucesso!', 'success');
    if (hasConsent()) logEvent({ tipo_evento: 'importar_fase', modulo: 'mt-recon', nivel_id: level.id });
  }, [level, applyRestoredPayload, updateProgress, showToast]);

  // Reset "em branco" puro — mesmos campos que o loadLevel zera quando NÃO
  // há sessão salva, mas sem telemetria/troca de tela (fica na mesma fase).
  // Reaproveitado só por handleClearSession — loadLevel mantém seu próprio
  // reset inline (decisão da Fase A: já testado, não valia reabrir).
  const resetToBlankState = useCallback(() => {
    g.reset();
    setSim(null); setSimHighlight({ nodeId: null, type: null, tIdx: null, seq: 0 });
    setMode('IDLE'); setConnectingSource(null);
    setSimWord('');
    setDeckGhost(null);
    setVictory(false);
    setSelectedNodes([]); setSelectionBox(null);
    setTestedWords([]);
    setTestMode('LANGUAGE');
    clearTimeout(unlockDelayRef.current);
    wordleGame.setHintStage(0);
    setIsDrawingUnlocked(false);
    setFormalAnswers(EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(false);
    setFieldErrors({}); setCellErrors({});
    draw.resetDrawings();
    resetZoom();
  }, [g, draw, resetZoom, wordleGame]);

  // ── "🗑 Limpar Fase" (ADR 0012) — ação manual, com confirmação na UI.
  const handleClearSession = useCallback(() => {
    if (!level) return;
    // clearSession() (do useLevelSessionPersistence) cancela também o
    // autosave debounced pendente, não só apaga o localStorage.
    clearSession();
    resetToBlankState();
    showToast?.('Fase limpa!', 'success');
  }, [level, clearSession, resetToBlankState, showToast]);

  // ── Modo Aula: iniciar / navegar / sair ─────────────────────────────────────
  const applyStep = useCallback((st) => {
    if (!st) return;
    setProf(st.prof ?? { message: '', mood: 'serio' });
  }, []);

  // Posição/zoom do canvas do ALUNO antes de entrar na aula — o Modo Aula
  // reenquadra a câmera pro grafo de cada passo (auto-fit em MTCanvas.jsx),
  // então sem isso, ao sair, a tela ficava onde o último passo da aula deixou
  // (quase sempre nada a ver com o que o aluno estava desenhando). Mesmo
  // padrão do AP (ver preLessonViewRef em APPart1.jsx).
  const preLessonViewRef = useRef(null);
  const startLesson = useCallback(() => {
    if (!lesson.hasLesson) return;
    logTutorialOpen('aula_guiada'); // mesma métrica de "uso de ajuda" da dica
    preLessonViewRef.current = {
      scrollLeft: viewportRef.current?.scrollLeft ?? 0,
      scrollTop: viewportRef.current?.scrollTop ?? 0,
      zoom,
    };
    setMode('IDLE'); setConnectingSource(null);
    setFormalAnswers(EMPTY_FORMAL); setFormalMode(false);
    setFormalElementsValid(false); setFieldErrors({}); setCellErrors({});
    lesson.goTo(0);
    applyStep(lesson.steps[0]);
  }, [lesson, applyStep, zoom, logTutorialOpen]);

  const finishLesson = useCallback(() => {
    lesson.finish();
    say('Aula encerrada! Agora monte a sua MT e clique em Validar. 💪', 'explicando');
    const saved = preLessonViewRef.current;
    if (saved) {
      setZoom(saved.zoom);
      // Aguarda o próximo frame (canvas volta a exibir o grafo do aluno antes
      // do scroll ser restaurado, senão o navegador clampa scrollLeft/Top ao
      // tamanho do conteúdo ainda em transição).
      requestAnimationFrame(() => {
        if (viewportRef.current) {
          viewportRef.current.scrollLeft = saved.scrollLeft;
          viewportRef.current.scrollTop = saved.scrollTop;
        }
      });
      preLessonViewRef.current = null;
    }
  }, [lesson, say, setZoom]);

  const lessonGo = useCallback((dir) => {
    if (!lesson.active) return;
    const next = Math.max(0, Math.min(lesson.steps.length - 1, (lesson.step ?? 0) + dir));
    lesson.goTo(next);
    applyStep(lesson.steps[next]);
  }, [lesson, applyStep]);

  useEffect(() => {
    const fill = lesson.cur?.formalFill;
    if (!fill) return;
    setFormalAnswers(prev => {
      const next = { ...prev, ...fill };
      if (fill.delta) {
        const cells = {};
        for (const t of fill.delta) {
          cells[`${t.from}|${t.read === '' ? '□' : t.read}`] = `${t.to}, ${t.write === '' ? '□' : t.write}, ${t.move}`;
        }
        next.deltaCells = cells;
        delete next.delta;
      }
      return next;
    });
  }, [lesson.step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll automático: ao revelar um novo campo/linha δ da descrição formal,
  // rola até ele (mesmo comportamento do AFD/AP — ver FormalDescriptionModal /
  // APFormalDescription). O ref é fixado no campo que o passo atual preenche
  // (lesson.cur.formalFill) ou, nos passos de δ, na última linha de estado tocada.
  useEffect(() => {
    if (lesson.phase !== 'FORMAL') return;
    if (currentFormalElRef.current) {
      currentFormalElRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else if (formalRef.current) {
      formalRef.current.scrollTo({ top: formalRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [lesson.step, lesson.phase]);

  // ── Atalhos de teclado ───────────────────────────────────────────────────────
  const { undo: gUndo, redo: gRedo, deleteSelected: gDeleteSelected } = g;
  const { drawUndo, drawingStack } = draw;
  useEffect(() => {
    const onKey = (e) => {
      if (lesson.active) { if (e.key === 'Escape') finishLesson(); return; }
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      if (ctrl && (k === 'z' || k === 'y')) {
        if (isInput) return;
        e.preventDefault();
        if (k === 'z' && !e.shiftKey) { drawingStack.length > 0 ? drawUndo() : gUndo(); }
        else { gRedo(); }
      }
      if (e.key === 'Delete' && !isInput) { gDeleteSelected(); }
      if (e.key === 'Escape') { setMode('IDLE'); setConnectingSource(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gUndo, gRedo, gDeleteSelected, drawUndo, drawingStack, lesson.active, finishLesson]);

  // ── Carregar nível ──────────────────────────────────────────────────────────
  // Aceita objeto já resolvido (caminho normal) ou id cru — ver mesmo padrão
  // em MTPart1.jsx.
  const loadLevel = useCallback(async (lvOrId) => {
    const lv = typeof lvOrId === 'string' ? await loadMTReconLevel(lvOrId) : lvOrId;
    // Hidratação SÓ depois do await acima resolver (id cru vindo do Boss) —
    // ver ADR 0011/§4 do prompt original.
    const restored = readLevelSession('mt-recon', lv.id);
    g.reset(restored ? { nodes: restored.nodes ?? [], transitions: restored.transitions ?? [] } : undefined);
    lesson.reset();
    // Telemetria: início da fase + reset de contadores.
    phaseStartRef.current = performance.now();
    attemptsRef.current = 0;
    tutorialOpensRef.current = 0;
    errorSinceTutorialRef.current = false;
    lastAttemptRef.current = null;
    logEvent({
      tipo_evento: 'inicio_fase',
      modulo: 'mt-recon',
      nivel_id: lv.id,
      dificuldade: lv.level ?? null,
    });
    setLevel(lv); setScreen('GAME'); setMode('IDLE'); setConnectingSource(null);
    setSimWord('');
    setTestedWords(restored?.testedWords ?? []);
    setDeckGhost(null);
    setVictory(!!restored?.victory);
    setSelectedNodes([]); setSelectionBox(null);
    setTestMode(restored?.testMode ?? 'LANGUAGE');
    setIsDrawingUnlocked(!!restored?.isDrawingUnlocked);
    clearTimeout(unlockDelayRef.current);
    wordleGame.setHintStage(restored?.hintStage ?? 0);
    setFormalAnswers(restored?.formal?.formalAnswers ?? EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(!!restored?.formal?.formalElementsValid);
    setFieldErrors({}); setCellErrors({});
    draw.resetDrawings();
    resetZoom();
    say('', 'serio');
  }, [g, lesson, draw, say, resetZoom, wordleGame]);

  const goLevel = useCallback((dir) => {
    const idx = mtReconLevels.findIndex(l => l.id === level?.id);
    const next = mtReconLevels[idx + dir];
    if (next) loadLevel(next);
  }, [level, loadLevel, mtReconLevels]);

  // Modo forçado (Boss): entra direto no nível indicado (async), pulando o menu.
  // Só na montagem — o componente é remontado (key) a cada troca no Boss.
  useEffect(() => {
    if (forceLevelId != null) loadLevel(forceLevelId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickMode = (m) => { setMode(m); setConnectingSource(null); };

  // ── Drag da carta ◯ → canvas ────────────────────────────────────────────────
  const handleDeckDrag   = useCallback((x, y) => setDeckGhost({ x, y }), []);
  const handleDeckDrop   = useCallback((clientX, clientY) => {
    setDeckGhost(null);
    const outer = canvasRef.current;
    const inner = innerCanvasRef.current;
    if (!outer || !inner) return;
    const r = outer.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return;
    const ri = inner.getBoundingClientRect();
    const x = ((clientX - ri.left) / ri.width)  * INNER_W;
    const y = ((clientY - ri.top)  / ri.height) * INNER_H;
    g.addNode(Math.max(5, Math.min(INNER_W - 5, x)), Math.max(5, Math.min(INNER_H - 5, y)));
  }, [g]);
  const handleDeckCancel = useCallback(() => setDeckGhost(null), []);

  // ── Testar palavra ───────────────────────────────────────────────────────────
  // Antes de destravar: sempre testa contra a LINGUAGEM (gabarito) — mecânica
  // de onboarding "descubra a menor palavra", igual ao AP/AFD.
  const testWord = useCallback(() => {
    if (!level) return;
    // MT-Recon não tem nível "impossível sem menor palavra" (diferente de
    // AFD-L14/AP-L16) — "null"/"vazio" digitados não têm sentinela aqui;
    // testar λ de verdade é deixar o campo em branco e confirmar.
    const word = simWord.trim();
    const display = word === '' ? 'λ' : word;

    if (word !== '') {
      const alphabet = level.alphabet ?? [];
      const invalid = [...word].find(ch => !alphabet.includes(ch));
      if (invalid) {
        setInputError(`O símbolo "${invalid}" não faz parte do alfabeto (${alphabet.join(', ')}).`);
        return;
      }
    }
    setInputError(null);

    if (!isDrawingUnlocked || testMode === 'LANGUAGE') {
      if (testedWords.some(t => t.word === display && t.mode === 'LANGUAGE')) { setSimWord(''); return; }

      // Grade WordleBoard: alvo jogável da descoberta (2ª menor quando a menor
      // é λ). Tentativa de tamanho errado não cabe na grade nem dá feedback
      // por letra — rejeitada antes de contar como tentativa, igual ao AFD/AP.
      const gridTarget = effectiveShortestWord ?? getShortestWord(level);
      if (!isDrawingUnlocked && gridTarget != null && word.length !== gridTarget.length) {
        showToast?.(`A menor palavra tem ${gridTarget.length} caractere(s) — sua tentativa tem ${word.length}.`, 'info');
        // Errou: abre a grade preenchível no centro (dica de tamanho) pra seguir
        // tentando ali, sem ter que clicar em 💡 Dica.
        if (effectiveShortestWord) wordleGame.setHintStage(s => (s === 0 ? 1 : s));
        return;
      }

      const graph = getGabaritoGraph(level);
      const { status } = simulateTM(graph, word, 2000, level.startMarker ?? null);
      const accepted = status === 'ACCEPTED';
      // Mostra "★ MENOR" sempre que a lista de testes em LANGUAGE estiver
      // vazia (não só antes do 1º destravamento) — o botão 🧹 de limpar
      // esvazia testedWords sem mexer em isDrawingUnlocked (destravar o
      // tabuleiro é permanente, mas "já vi a menor palavra" pode ser
      // reexibido se o jogador limpou o histórico e testou de novo).
      const languageListEmpty = !testedWords.some(t => t.mode === 'LANGUAGE');
      if (!isDrawingUnlocked || languageListEmpty) {
        // Igual ao AFD/AP: qualquer palavra aceita do tamanho do alvo conta
        // como "menor" (linguagens com várias menores do mesmo tamanho).
        const isShortest = accepted && gridTarget != null && word.length === gridTarget.length;
        const resultado = isShortest ? 'shortest' : accepted ? 'correct' : 'wrong';
        lastAttemptRef.current = word;
        // Telemetria: teste de palavra em LANGUAGE é resposta avaliada (gabarito).
        attemptsRef.current += 1;
        if (resultado === 'wrong') errorSinceTutorialRef.current = true;
        logEvent({ tipo_evento: 'tentativa', modulo: 'mt-recon', nivel_id: level.id, resultado, numero_tentativas: attemptsRef.current });
        setTestedWords(prev => [{ word: display, mode: 'LANGUAGE', status: resultado }, ...prev]);
        if (isShortest && !isDrawingUnlocked) {
          updateProgress?.(`mt-recon-${level.id}`, 1, phaseExtras('descoberta_palavra'));
          // Segura a linha vencedora (toda verde) na grade um instante antes de
          // trocar o overlay pelo tabuleiro — mesmo delay do AFD/AP.
          clearTimeout(unlockDelayRef.current);
          unlockDelayRef.current = setTimeout(() => {
            setIsDrawingUnlocked(true);
            showToast?.('Sucesso! Tabuleiro liberado.', 'success');
          }, 900);
        } else if (!isDrawingUnlocked && effectiveShortestWord) {
          // Não destravou: deixa a grade preenchível (hintStage ≥ 1) pro aluno
          // continuar tentando no centro da tela, sem clicar em 💡 Dica.
          wordleGame.setHintStage(s => (s === 0 ? 1 : s));
        }
      } else {
        const resultado = accepted ? 'correct' : 'wrong';
        attemptsRef.current += 1;
        if (resultado === 'wrong') errorSinceTutorialRef.current = true;
        logEvent({ tipo_evento: 'tentativa', modulo: 'mt-recon', nivel_id: level.id, resultado, numero_tentativas: attemptsRef.current });
        setTestedWords(prev => [{ word: display, mode: 'LANGUAGE', status: resultado }, ...prev]);
      }
      setSimWord('');
      return;
    }

    // testMode === 'DRAWING': testa contra a MT do ALUNO (exploração — não logada).
    const mtGraph = { states: g.nodes, transitions: g.transitions };
    const { status } = simulateTM(mtGraph, word, 2000, level.startMarker ?? null);
    setTestedWords(prev => prev.some(t => t.word === display && t.mode === 'DRAWING')
      ? prev : [{ word: display, mode: 'DRAWING', accepted: status === 'ACCEPTED' }, ...prev]);
    setSimWord('');
  }, [level, simWord, isDrawingUnlocked, testMode, testedWords, effectiveShortestWord, wordleGame, g.nodes, g.transitions, updateProgress, showToast, phaseExtras]);

  // ── Simular palavra: abre MTSimPanel passo a passo (rodapé) — SEMPRE contra
  // a MT do ALUNO (g.nodes/g.transitions), nunca o gabarito (igual ao
  // "Simular" do AP: é uma ferramenta de depuração do próprio desenho, não
  // uma resposta avaliada — não gera telemetria de 'tentativa'). node.id do
  // grafo do aluno já É o rótulo (ver useTMGraph — addNode grava
  // { id: label, label }), então stateId retornado por simulateTMSteps bate
  // direto com node.id, sem precisar de mapeamento label↔id como o AP faz
  // com PDAs importados do JFLAP.
  const simulate = useCallback(() => {
    if (!level) return;
    const word = simWord.trim();
    if (word !== '') {
      const alphabet = level.alphabet ?? [];
      const invalid = [...word].find(ch => !alphabet.includes(ch));
      if (invalid) {
        setInputError(`O símbolo "${invalid}" não faz parte do alfabeto (${alphabet.join(', ')}).`);
        return;
      }
    }
    setInputError(null);
    const show = word === '' ? 'λ' : word;
    const mtGraph = { states: g.nodes, transitions: g.transitions };
    const configs = simulateTMSteps(mtGraph, word, SIM_MAX_STEPS, level.startMarker ?? null);
    openSim({ configs, word, maxSteps: SIM_MAX_STEPS, title: `Simulação: "${show}"`,
      message: 'Passo a passo da SUA máquina (não é o gabarito):' });
    setSimWord('');
  }, [level, simWord, g.nodes, g.transitions, openSim]);

  // ── Validar (bateria) = ★1 ──────────────────────────────────────────────────
  const validate = useCallback(() => {
    if (!level) return;

    // Telemetria: cada Validar que falha é uma `tentativa` (validacao_falhou) com
    // o motivo estruturado em `tipo_erro`. Sucesso não gera tentativa (fica no fim_fase).
    const failAttempt = (tipo_erro) => {
      errorSinceTutorialRef.current = true;
      attemptsRef.current += 1;
      logEvent({
        tipo_evento: 'tentativa',
        modulo: 'mt-recon',
        nivel_id: level.id,
        resultado: 'validacao_falhou',
        tipo_erro,
        numero_tentativas: attemptsRef.current,
      });
    };

    if (!g.nodes.find(n => n.isInitial)) {
      failAttempt('no_initial');
      showToast('Defina um estado inicial (▶) antes de validar.', 'error');
      setErrAction('TOGGLE_INITIAL');
      setTimeout(() => setErrAction(null), 3000);
      return;
    }
    if (!g.nodes.some(n => n.isFinal)) {
      failAttempt('no_final');
      showToast('Defina um estado final (◎) antes de validar.', 'error');
      setErrAction('TOGGLE_FINAL');
      setTimeout(() => setErrAction(null), 3000);
      return;
    }
    const seen = new Map();
    for (const t of g.transitions) {
      const sym = t.read === '' ? '□' : t.read;
      const key = `${t.from}|${sym}`;
      const sig = `${t.to}|${t.write}|${t.move}`;
      if (seen.has(key) && seen.get(key) !== sig) {
        failAttempt('nondeterministic');
        const lbl = g.nodes.find(n => n.id === t.from)?.label ?? t.from;
        showToast(`O estado ${lbl} tem duas regras diferentes para o símbolo "${sym}" — ajuste antes de validar.`, 'error');
        return;
      }
      if (!seen.has(key)) seen.set(key, sig);
    }

    const mtGraph = { states: g.nodes, transitions: g.transitions };
    const res = fuzzTMRecognizer(mtGraph, level);
    if (res.ok) {
      updateProgress?.(`mt-recon-${level.id}`, 2, phaseExtras('validacao'));
      say('Perfeito! Sua MT reconhece a linguagem corretamente! Agora preencha a Descrição Formal. 📝', 'feliz');
      showToast?.('MT validada! ★★ — formalize a máquina.', 'success');
      setFormalMode(true);
    } else {
      failAttempt(res.reason ?? null);
      const show = res.counterexample === '' ? 'λ' : res.counterexample;
      const msg = res.reason === 'loop'
        ? `Loop detectado para "${show}". Verifique se a MT para em todos os casos.`
        : res.reason === 'wrongly-accepted'
        ? `Sua MT aceita "${show}" indevidamente (não pertence à linguagem).`
        : `Sua MT não aceita "${show}" (deveria pertencer à linguagem).`;
      // Erro fica só no toast do topo — o Maurílio não comenta erros, só
      // sucesso/dicas.
      showToast?.(msg, 'error');
      // Além do toast: abre o MTSimPanel já simulando o contraexemplo contra a
      // MT do ALUNO, pra ele ver passo a passo onde a máquina errou (mesmo
      // espírito do trace-on-failure do AFD/AP). Só quando há palavra concreta
      // — falhas estruturais (no_initial/no_final/nondeterministic) já
      // retornaram antes, sem chegar aqui.
      if (res.counterexample != null) {
        const configs = simulateTMSteps(mtGraph, res.counterexample, SIM_MAX_STEPS, level.startMarker ?? null);
        openSim({ configs, word: res.counterexample, maxSteps: SIM_MAX_STEPS,
          title: `Falhou em "${show}"`, message: msg });
      }
    }
  }, [level, g, say, updateProgress, showToast, phaseExtras, openSim]);

  // Valida a Descrição Formal preenchida — mesmo padrão de 2 etapas do
  // AFD/AP/MT-Trans (ver MTPart1.jsx): 1ª chamada valida os 6 campos da tupla
  // contra o grafo desenhado; passando, libera a tabela δ. 2ª chamada valida
  // a tabela célula a célula; só então dá a 3ª estrela e mostra a vitória.
  const validateFormal = useCallback(() => {
    if (!level) return;
    const sigmaCols = level.alphabet ?? [];
    const formalCols = [...sigmaCols, ...((level.tapeAlphabet ?? []).filter(s => !sigmaCols.includes(s)))];
    const formalStateRows = g.nodes.map(n => n.id);

    if (!formalElementsValid) {
      const res = validateMTFormalFields({
        formalAnswers, nodes: g.nodes, alphabet: level.alphabet, transitions: g.transitions,
      });
      if (!res.ok) {
        setFieldErrors(res.fieldErrors);
        const errCount = Object.values(res.fieldErrors).filter(Boolean).length;
        showToast?.(
          res.reason === 'brace_format'
            ? 'Confira o uso das chaves { } nos campos.'
            : `${errCount} campo(s) com erro — verifique os campos em vermelho.`,
          'error'
        );
        return;
      }
      setFieldErrors({});
      setFormalElementsValid(true);
      return;
    }

    const res = validateMTFormalTransitions({
      stateRows: formalStateRows, symbolCols: formalCols,
      deltaCells: formalAnswers.deltaCells, nodes: g.nodes, transitions: g.transitions,
    });
    if (!res.ok) {
      setCellErrors(res.cellErrors);
      const errCount = Object.keys(res.cellErrors).length;
      const suffix = errCount > 1 ? ` (+${errCount - 1} outra${errCount > 2 ? 's' : ''} em vermelho)` : '';
      showToast?.(`${res.firstError.message}${suffix}`, 'error');
      return;
    }
    setCellErrors({});
    updateProgress?.(`mt-recon-${level.id}`, 3, phaseExtras('tabela_formal'));
    setFormalMode(false);
    setVictory(true);
  }, [level, g, formalAnswers, formalElementsValid, updateProgress, showToast, phaseExtras]);

  // Dica do professor (Maurílio): mesma métrica de "uso de ajuda" da aula guiada.
  // Loga só na ABERTURA (balão vazio → vai abrir); fechar não conta.
  const handleProfClick = useCallback(() => {
    const isOpening = !prof.message;
    setProf(p => p.message
      ? { ...p, message: '' }
      : { message: level?.hint || 'Leia e mova o cabeçote até chegar ao estado final (ou rejeitar)!', mood: 'explicando' });
    if (isOpening) logTutorialOpen('dica');
  }, [prof.message, level, logTutorialOpen]);

  // ── Dica de Tamanho (fallback p/ nível sem grade jogável) ──────────────────
  const handleSizeHint = useCallback(() => {
    if (lastAttemptRef.current === null) {
      showToast?.(buildNoAttemptHintMessage(), 'info');
      return;
    }
    showToast?.(buildSizeHintMessage(level ? getShortestWord(level) : null, lastAttemptRef.current), 'info');
    logTutorialOpen('dica_tamanho');
  }, [level, showToast, logTutorialOpen]);

  // ── Dica da grade (igual ao AFD/AP): o 💡 é um controle de estágio, não um
  // toast — 1º clique mostra a grade com o TAMANHO, 2º revela o conjunto de
  // letras (sem posição). Trava em 2. Não exige chutar nada antes.
  const handleWordleHint = useCallback(() => {
    const before = wordleGame.hintStage;
    wordleGame.requestHint();
    if (before < 2) logTutorialOpen(before === 0 ? 'dica_tamanho' : 'dica_letras');
  }, [wordleGame, logTutorialOpen]);

  const stars = level ? (progress?.[`mt-recon-${level.id}`]?.stars || 0) : 0;

  // ── Menu ─────────────────────────────────────────────────────────────────────
  if (screen === 'MENU') {
    // No Boss (forçado), o nível carrega async: mostra um placeholder em vez de
    // piscar a grade do menu antes de entrar no exercício.
    if (forceLevelId != null) {
      return (
        <div className="menu-screen menu-screen-fases min-screen" style={{ justifyContent: 'center' }}>
          <div style={{ fontWeight: 900, color: '#888', padding: 24 }}>Carregando exercício…</div>
        </div>
      );
    }
    const maxStars   = MT_RECON_LEVEL_ORDER.length * 3;
    const totalStars = mtReconLevels.reduce((s, l) => s + (progress?.[`mt-recon-${l.id}`]?.stars || 0), 0);
    return (
      <LevelGridScreen
        onBack={onBack}
        badge="🔍 Máquina de Turing — Reconhecedora"
        badgeBg="#c7d2fe"
        totalStars={totalStars}
        maxStars={maxStars}
        extraClass="min-screen"
        loading={mtReconLevels.length === 0}
        legendKeys={['easy', 'medium', 'hard', 'prova']}
      >
        {mtReconLevels.map(l => (
          <button key={l.id} className="menu-btn primary" onClick={() => loadLevel(l)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: DIFF_COLOR[l.level] }}>
            <span>{l.label}</span>
            <SvgStars count={progress?.[`mt-recon-${l.id}`]?.stars || 0} size={14} max={3} />
          </button>
        ))}
      </LevelGridScreen>
    );
  }

  // ── Tela do jogo ─────────────────────────────────────────────────────────────
  const mtIdx  = mtReconLevels.findIndex(l => l.id === level.id);
  const nextMt = mtIdx >= 0 && mtIdx < mtReconLevels.length - 1 ? mtReconLevels[mtIdx + 1] : null;
  const isFormal   = lesson.phase === 'FORMAL';
  const formalOpen = isFormal || formalMode;

  const sigmaCols    = level.alphabet ?? [];
  const formalCols   = [...sigmaCols, ...((level.tapeAlphabet ?? []).filter(s => !sigmaCols.includes(s)))];
  const formalStateRows = (lesson.active ? (lesson.displayNodes ?? []) : g.nodes).map(n => n.id);

  // Aula: campo (ou linha δ) que o passo atual está revelando — alvo do auto-scroll.
  const curFormalFill = lesson.cur?.formalFill;
  const curFormalKey  = curFormalFill ? Object.keys(curFormalFill)[0] : null;
  const curDeltaRow   = curFormalKey === 'delta' && Array.isArray(curFormalFill.delta)
    ? [...formalStateRows].reverse().find(stId => curFormalFill.delta.some(t => t.from === stId)) ?? null
    : null;

  const setDeltaCell = (key, value) => setFormalAnswers(prev => ({
    ...prev, deltaCells: { ...prev.deltaCells, [key]: value },
  }));

  // insertSymbol: quando definido, mostra um botão colado ao campo que insere
  // o símbolo (ex.: □) na posição do cursor — o jogador não precisa saber
  // digitar o glifo de branco no teclado.
  // Campos com múltiplos elementos possíveis (states/sigma/gamma/final) aceitam
  // "{ }"; initial/blank são sempre 1 elemento só e nunca usam chaves.
  const MULTI_FIELDS = ['states', 'sigma', 'gamma', 'final'];
  const formalField = (label, k, placeholder, insertSymbol) => {
    const filled = !!formalAnswers[k];
    const error = fieldErrors[k];
    const inputRef = formalFieldRefs.current[k] ??= { current: null };
    const handleInsert = () => {
      const el = inputRef.current;
      const cur = formalAnswers[k] ?? '';
      const start = el?.selectionStart ?? cur.length;
      const end   = el?.selectionEnd   ?? cur.length;
      const next  = cur.slice(0, start) + insertSymbol + cur.slice(end);
      setFormalAnswers(prev => ({ ...prev, [k]: next }));
      requestAnimationFrame(() => {
        el?.focus();
        const pos = start + insertSymbol.length;
        el?.setSelectionRange(pos, pos);
      });
    };
    return (
      <div style={{ marginBottom: 8 }} ref={k === curFormalKey ? currentFormalElRef : null}>
        <label style={{ display: 'block', fontFamily: 'var(--font-comic)', fontSize: 11,
          fontWeight: 900, color: '#065f46', marginBottom: 3 }}>{label}</label>
        <div style={{ display: 'flex', gap: 4 }}>
          <input type="text" value={formalAnswers[k] ?? ''} placeholder={placeholder}
            disabled={lesson.active}
            readOnly={formalElementsValid}
            ref={el => { inputRef.current = el; }}
            onChange={e => {
              setFormalAnswers(prev => ({ ...prev, [k]: e.target.value }));
              if (error) setFieldErrors(prev => ({ ...prev, [k]: null }));
            }}
            onKeyDown={MULTI_FIELDS.includes(k)
              ? (e => onBracketKeyDown(e, v => setFormalAnswers(prev => ({ ...prev, [k]: v }))))
              : undefined}
            translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
            style={{ flex: 1, minWidth: 0, boxSizing: 'border-box', padding: '5px 7px',
              fontFamily: 'var(--font-comic)', fontSize: 13, fontWeight: 900,
              background: error ? '#fef2f2' : filled ? '#f0fdf4' : '#fff',
              color: error ? '#111' : filled ? '#111' : '#9ca3af',
              border: error ? '2px solid #ef4444' : filled ? '2px solid #22c55e' : '2px solid #d1d5db',
              boxShadow: error ? '2px 2px 0 #ef4444' : 'none', borderRadius: 6 }} />
          {insertSymbol && !lesson.active && !formalElementsValid && (
            <button type="button" onClick={handleInsert} title={`Inserir "${insertSymbol}"`}
              style={{ flexShrink: 0, width: 30, fontFamily: 'var(--font-comic)',
                fontSize: 14, fontWeight: 900, cursor: 'pointer', borderRadius: 6,
                border: '2px solid #143823', background: '#fde047', color: '#143823' }}>
              {insertSymbol}
            </button>
          )}
        </div>
        {error && <span className="field-error-msg">✕ {error}</span>}
      </div>
    );
  };

  return (
    <div className="workspace-wrapper">
      {toastData.show && <div className={`toast-notification ${toastData.type}`}>{toastData.message}</div>}

      {deckGhost && createPortal(
        <div className="deck-drag-ghost" style={{ left: deckGhost.x, top: deckGhost.y }} />,
        document.body)}

      {/* Header (compartilhado com AFD/AP — mesmo componente/estilo/motor) */}
      <GameHeader
        // Objetivo sempre no formato canônico "L = { … }" (igual AP). O strip
        // remove qualquer prefixo "L… =" espúrio antes de recolocar o "L = ".
        objective={`L = ${level.language.replace(/^\s*L[^=]*=\s*/, '')}`}
        label={forceLevelLabel ?? level.label}
        diffColor={forceLabelColor ?? DIFF_COLOR[level.level] ?? '#fff'}
        stars={stars}
        starsMax={3}
        isFirst={forceLevelId != null ? !onForcedPrev : mtIdx === 0}
        isLast={forceLevelId != null ? !onForcedNext : mtIdx === mtReconLevels.length - 1}
        toggleSidebar={() => setFormalMode(o => !o)}
        onBack={forceLevelId != null ? onBack : () => { lesson.finish(); setScreen('MENU'); }}
        onPrevLevel={forceLevelId != null ? onForcedPrev : () => goLevel(-1)}
        onNextLevel={forceLevelId != null ? onForcedNext : () => goLevel(1)}
        hasLesson={lesson.hasLesson}
        lessonActive={lesson.active}
        lessonDisabled={!lesson.hasLesson}
        onStartLesson={startLesson}
        onCloseLesson={finishLesson}
        showSizeHint={!isDrawingUnlocked && (!effectiveShortestWord || wordleGame.hintStage < 2)}
        onSizeHint={effectiveShortestWord ? handleWordleHint : handleSizeHint}
        onExportSession={handleExportSession}
        onImportSessionFile={handleImportSessionFile}
        onClearSession={handleClearSession}
      />

      <div className="workspace">
        {formalOpen && (
          <aside className={`formal-panel open`} ref={formalRef} style={{
            width: 300, display: 'flex', flexDirection: 'column', gap: 0,
            overflowY: 'auto', background: '#fff', position: 'static',
          }}>
            <div style={{ padding: '8px 10px', background: '#143823',
              fontFamily: 'var(--font-comic)', fontSize: 11, fontWeight: 900,
              color: '#fbbf24', letterSpacing: 0.5 }}>
              📝 DESCRIÇÃO FORMAL {formalMode && '— preencha e conclua'}
            </div>

            <div style={{ padding: '10px' }}>
              <div style={{ fontFamily: 'var(--font-comic)', fontSize: 13, fontWeight: 900,
                color: '#065f46', marginBottom: 8 }}>
                M = (Q, Σ, Γ, δ, q₀, □, F)
              </div>
              {formalField('Q (Estados):',          'states',  '{…}')}
              {formalField('Σ (Alfabeto entrada):', 'sigma',   '{…}')}
              {formalField('Γ (Alfabeto da fita):', 'gamma',   '{…}', '□')}
              {formalField('q₀ (Estado inicial):',  'initial', '…')}
              {formalField('□ (Símbolo branco):',   'blank',   '…', '□')}
              {formalField('F (Estados finais):',   'final',   '{…}')}

              {(formalElementsValid || lesson.active) && (
                <>
                  <div style={{ fontFamily: 'var(--font-comic)', fontSize: 11, fontWeight: 900,
                    color: '#065f46', margin: '10px 0 4px' }}>
                    Função de transição δ:
                  </div>
                  <div className="mt-formal-delta-hint">
                    ✏️ Preencha cada célula como <b>"destino, escreve, move"</b><br />
                    ex: <code>q1, a, R</code> — direção só pode ser <b>L</b> ou <b>R</b>.
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="mt-formal-delta-table">
                      <thead>
                        <tr>
                          <th className="mt-formal-delta-corner">δ</th>
                          {formalCols.map(sym => (
                            <th key={sym} className="mt-formal-delta-colhead">{sym === '' ? '□' : sym}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {formalStateRows.map(stId => (
                          <tr key={stId} ref={stId === curDeltaRow ? currentFormalElRef : null}>
                            <td className="mt-formal-delta-rowhead">{stId}</td>
                            {formalCols.map(sym => {
                              const key = `${stId}|${sym}`;
                              const val = formalAnswers.deltaCells?.[key] ?? '';
                              const err = cellErrors[key];
                              return (
                                <td key={sym} className={`mt-formal-delta-cell${err ? ' cell-error' : ''}`}
                                  style={{ background: err ? undefined : (val ? '#f0fdf4' : '#fff') }}>
                                  <input type="text" value={val} disabled={lesson.active} placeholder="—"
                                    onChange={e => {
                                      setDeltaCell(key, e.target.value);
                                      if (err) setCellErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
                                    }}
                                    translate="no" spellCheck={false}
                                    className="mt-formal-delta-input"
                                    style={{ color: err ? undefined : (val ? '#111' : '#cbd5e1') }} />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}

        <MTCanvas
          canvasRef={canvasRef}
          innerCanvasRef={innerCanvasRef}
          viewportRef={viewportRef}
          zoom={zoom}
          setZoom={setZoom}
          nodes={viewNodes}
          transitions={viewTransitions}
          mode={mode}
          setMode={setMode}
          beginDrag={g.beginDrag}
          draw={draw}
          lessonActive={lesson.active}
          activeNodeId={lesson.cur?.activeNode}
          activeTransition={lesson.activeTransition}
          simActiveNodeId={simHighlight.nodeId}
          simActiveTIdx={simHighlight.tIdx}
          simActiveSeq={simHighlight.seq}
          connectingSource={connectingSource}
          setConnectingSource={setConnectingSource}
          addNode={g.addNode}
          moveNodes={g.moveNodes}
          toggleInitial={g.toggleInitial}
          toggleFinal={g.toggleFinal}
          setNodeLabel={g.setNodeLabel}
          renameNode={g.renameNode}
          deleteNode={g.deleteNode}
          addTriple={g.addTriple}
          editTriple={g.editTriple}
          removeTriple={g.removeTriple}
          removeEdge={g.removeEdge}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          selectionBox={selectionBox}
          setSelectionBox={setSelectionBox}
          guidedLessonStep={lesson.step}
          isDrawingUnlocked={isDrawingUnlocked}
          wordleGame={wordleGame}
          effectiveShortestWord={effectiveShortestWord}
          rawShortestWord={getShortestWord(level)}
          languageAttempts={testedWords.filter(t => t.mode === 'LANGUAGE')}
          simWord={simWord}
          onTestWord={testWord}
        />

        {/* Painel direito: modo aula ou teste */}
        {lesson.active ? (
          <aside className="test-panel ap-test-panel" style={{
            display: 'flex', flexDirection: 'column', gap: 0,
            background: '#242424', border: '3px solid #143823',
          }}>
            <div style={{
              padding: '8px 10px', background: '#143823',
              fontFamily: 'var(--font-comic)', fontSize: 11, fontWeight: 900,
              color: '#fbbf24', letterSpacing: 0.5,
            }}>
              👨‍🏫 MODO AULA — {isFormal ? 'DESCRIÇÃO FORMAL' : 'MONTANDO O GRAFO'}
            </div>

            {lesson.cur?.formalIntro && (
              <div style={{ padding: '20px 12px', textAlign: 'center' }}>
                <button onClick={() => lessonGo(1)}
                  style={{ width: '100%', padding: '14px 10px', fontFamily: 'var(--font-comic)',
                    fontWeight: 900, fontSize: 15, color: '#143823', background: '#fde047',
                    border: '3px solid #a16207', borderRadius: 12, cursor: 'pointer',
                    boxShadow: '3px 3px 0 #000' }}>
                  📝 Iniciar Descrição Formal
                </button>
              </div>
            )}

            {isFormal && (
              <div style={{
                padding: '10px 12px', margin: '8px 8px 0',
                background: '#143823', borderRadius: 6, border: '1.5px solid #2f5d40',
                fontFamily: 'var(--font-comic)', fontSize: 12, fontWeight: 900, color: '#d1d5db',
              }}>
                👈 Veja o painel à esquerda revelando a tupla<br />
                <b style={{ color: '#fde047' }}>M = (Q, Σ, Γ, δ, q₀, □, F)</b> passo a passo.
              </div>
            )}

            {lesson.cur?.simulateWord !== undefined && (
              <div style={{
                padding: '6px 10px', margin: '8px 8px 0',
                background: '#143823', borderRadius: 6, border: '1.5px solid #2f5d40',
                borderBottom: '2px dashed #4b6a55',
                fontFamily: 'var(--font-comic)', fontSize: 11, fontWeight: 900, color: '#d1d5db',
              }}>
                Simulando: "<b style={{ color: '#fbbf24' }}>{lesson.cur.simulateWord || 'λ'}</b>"
                {lesson.cur?.status && (
                  <span style={{ marginLeft: 8, color: lesson.cur.status === 'ACCEPTED' ? '#86efac' : '#fca5a5' }}>
                    → {lesson.cur.status === 'ACCEPTED' ? '✓ Aceita' : lesson.cur.status === 'LOOP' ? '⟳ Loop' : '✗ Rejeitada'}
                  </span>
                )}
              </div>
            )}

            <div style={{ flex: 1 }} />

            <div style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af',
              fontFamily: 'var(--font-comic)', marginBottom: 8 }}>
              Passo {(lesson.step ?? 0) + 1} / {lesson.steps.length}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, padding: '4px 10px' }}>
              {lesson.steps.map((_, idx) => (
                <div key={idx} style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: idx === lesson.step ? '#fbbf24' : 'transparent',
                  border: `2px solid ${idx === lesson.step ? '#fbbf24' : '#555'}`,
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>

            {/* padding-bottom 245px: espaço pro balão do Maurílio (professor-hud
                do rodapé), que "flutua" por cima do painel — o rodapé de MT é
                compacto durante a aula (compactWhenLesson no APFooterDeck), então
                o balão sobe mais alto na tela do que um rodapé de altura cheia
                exigiria; sem essa folga extra, os botões Ant./Próx. ficavam atrás
                do balão. */}
            <div style={{ padding: '6px 8px 245px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => lessonGo(-1)}
                  disabled={(lesson.step ?? 0) === 0}
                  style={{ flex: 1, padding: '6px 0', fontFamily: 'var(--font-comic)', fontWeight: 900,
                    fontSize: 13, border: '2.5px solid #555', borderRadius: 8,
                    cursor: (lesson.step ?? 0) === 0 ? 'not-allowed' : 'pointer',
                    background: '#3a3a3a', color: '#e5e7eb', boxShadow: '2px 2px 0 #000',
                    opacity: (lesson.step ?? 0) === 0 ? 0.35 : 1 }}>
                  ◀ Ant.
                </button>
                <button
                  onClick={() => lessonGo(1)}
                  disabled={(lesson.step ?? 0) >= lesson.steps.length - 1}
                  style={{ flex: 1, padding: '6px 0', fontFamily: 'var(--font-comic)', fontWeight: 900,
                    fontSize: 13, border: '2.5px solid #166534', borderRadius: 8,
                    cursor: (lesson.step ?? 0) >= lesson.steps.length - 1 ? 'not-allowed' : 'pointer',
                    background: '#14532d', color: '#bbf7d0', boxShadow: '2px 2px 0 #000',
                    opacity: (lesson.step ?? 0) >= lesson.steps.length - 1 ? 0.45 : 1 }}>
                  Próx. ➔
                </button>
              </div>
              <button
                onClick={finishLesson}
                style={{ padding: '6px 0', fontFamily: 'var(--font-comic)', fontWeight: 900,
                  fontSize: 12, border: '2.5px solid #7f1d1d', borderRadius: 8, cursor: 'pointer',
                  background: '#450a0a', color: '#fca5a5', boxShadow: '2px 2px 0 #7f1d1d' }}>
                ✕ Sair da Aula
              </button>
            </div>
          </aside>
        ) : (
        <aside className="test-panel ap-test-panel">
          <div className="section-header ap-section-header-thin" style={{ fontSize: 11 }}>Palavras aceitas</div>

          {isDrawingUnlocked && (
            <div className="ap-test-mode-toggle">
              <button
                className={`ap-test-mode-btn${testMode === 'LANGUAGE' ? ' active' : ''}`}
                onClick={() => setTestMode('LANGUAGE')}
                title="Testar contra o enunciado da linguagem">
                📖 Linguagem
              </button>
              <button
                className={`ap-test-mode-btn${testMode === 'DRAWING' ? ' active' : ''}`}
                onClick={() => setTestMode('DRAWING')}
                title="Testar contra a MT que você desenhou">
                ✏️ Desenho
              </button>
            </div>
          )}

          <div className="test-input-area">
            <input type="text" className="word-input"
              placeholder="ex: aabb (vazio = λ)"
              value={simWord} onChange={e => { setSimWord(e.target.value); setInputError(null); }}
              onKeyDown={e => e.key === 'Enter' && testWord()}
              translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
              style={inputError ? { border: '2px solid #dc2626' } : {}} />
            <button className="add-test-btn" onClick={testWord}>+</button>
            <button className="add-test-btn clear-test-btn" title="Limpar palavra e histórico"
              disabled={testedWords.length === 0 && simWord === ''}
              onClick={() => { setTestedWords([]); setSimWord(''); setInputError(null); }}
              style={{ opacity: testedWords.length === 0 && simWord === '' ? 0.5 : 1 }}>🧹</button>
          </div>
          {inputError && (
            <div style={{ padding: '3px 10px 4px', fontFamily: 'var(--font-comic)',
              fontSize: 11, fontWeight: 900, color: '#dc2626' }}>
              ⛔ {inputError}
            </div>
          )}

          {isDrawingUnlocked && (
            <button className="simulate-btn" onClick={simulate}>🔬 Simular</button>
          )}

          <div className="words-list">
            {testedWords.map((t, i) => (
              <div key={i} className={`word-row ${t.status ? t.status : t.accepted ? 'correct' : 'wrong'}`}>
                <span>
                  {isDrawingUnlocked && (
                    <span className={`ap-word-mode-tag ${t.mode === 'DRAWING' ? 'drawing' : 'language'}`}>
                      {t.mode === 'DRAWING' ? 'D' : 'L'}
                    </span>
                  )}
                  {t.word === '' ? 'λ' : t.word}
                </span>
                <span>
                  {t.status === 'shortest' ? '★ MENOR'
                    : t.status === 'correct' ? '✓'
                    : t.status === 'wrong' ? '✕'
                    : t.accepted ? '✓' : '✕'}
                </span>
              </div>
            ))}
          </div>

          {isDrawingUnlocked && (
            <button className="validate-btn slide-up-fade" onClick={formalMode ? validateFormal : validate}>
              {formalMode ? (formalElementsValid ? '✓ Validar Transições' : '✓ Validar Elementos') : '✓ Validar MT'}
            </button>
          )}
        </aside>
        )}
      </div>

      {/* Rodapé: deck de cartas + Maurílio */}
      <APFooterDeck
        mode={mode}
        onPick={pickMode}
        lessonActive={lesson.active}
        isDrawingUnlocked={isDrawingUnlocked}
        showFinalCard
        hasNodes={viewNodes.length > 0}
        canUndo={g.canUndo}
        canRedo={g.canRedo}
        onUndo={g.undo}
        onRedo={g.redo}
        profMessage={prof.message}
        profMood={prof.mood}
        onProfClick={handleProfClick}
        onCloseBalloon={() => setProf(p => ({ ...p, message: '' }))}
        onNodeDrag={handleDeckDrag}
        onNodeDrop={handleDeckDrop}
        onNodeDragCancel={handleDeckCancel}
        tape={lesson.active && lesson.cur?.tape ? lesson.cur.tape : null}
        tapeHead={lesson.cur?.head ?? 0}
        errAction={errAction}
        compactWhenLesson
        simPanel={sim && (
          <MTSimPanel key={simKey} configs={sim.configs} word={sim.word} maxSteps={sim.maxSteps}
            title={sim.title} message={sim.message}
            onHighlight={handleSimHighlight} onClose={closeSim} />
        )}
        simPanelClassName="mt-simp-footer"
      />

      {victory && (
        <EndScreen
          currentLevelId={level.id}
          nextLevel={nextMt}
          message={`Parabéns! Sua MT Reconhecedora está correta! ⭐⭐⭐`}
          balloon={{ width: 320, height: 220, marginTop: -150 }}
          textStyle={{ padding: '20px 38px 52px', fontSize: 15 }}
          nextPrefix="Próximo: "
          onMenu={() => setScreen('MENU')}
          onNext={(lv) => loadLevel(lv)}
          onExport={handleExportSession}
          onAccessBoard={() => setVictory(false)}
        />
      )}
    </div>
  );
}
