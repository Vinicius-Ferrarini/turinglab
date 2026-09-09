// ─── MTPart1: módulo MT Transdutora (desenhar a MT → Validar) ────────────────
// Fluxo: menu → escolher nível → desenhar MT no canvas → Validar (★★★).
// Validação via fuzzTMTransducer (bateria de testWords).
// Modo Aula: overlay com grafo demonstrativo + animação da fita passo a passo.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../afd/AFDPart1.css';
import '../afd/components/TestPanel.css';
import '../afd/FormalDescriptionModal.css';
import '../ap/APPart1.css';
import { SvgStars } from '../afd/SvgStar';
import LevelGridScreen from '../afd/components/LevelGridScreen';
import EndScreen from '../afd/components/EndScreen';
import GameHeader from '../afd/components/GameHeader';
import MTCanvas from './components/MTCanvas';
import APFooterDeck from '../ap/components/APFooterDeck';
import useTMGraph from './hooks/useTMGraph';
import useMTGuidedLesson from './hooks/useMTGuidedLesson';
import useAPDrawing from '../ap/hooks/useAPDrawing';
import useCanvasState, { INNER_W, INNER_H } from '../afd/hooks/useCanvasState.js';
import useToast from '../afd/hooks/useToast';
import usePhaseTelemetry from '../afd/hooks/usePhaseTelemetry';
import { MT_LEVEL_ORDER, loadMTLevel } from '../../levels_data/mt/index.js';
import { fuzzTMTransducer, simulateTM, extractTapeOutput, headRewound, BLANK } from './utils/tmAlgorithms';
import { validateMTFormalFields, validateMTFormalTransitions } from './utils/mtFormalValidation';
import { onBracketKeyDown } from '../afd/utils/bracketAutoClose';
import { DIFF_COLOR } from '../../levels';
import { logEvent, hasConsent } from '../../services/telemetry';
import { buildSnapshot } from '../shared/persistence/sessionSnapshot.js';
import {
  buildExportFilename, downloadSnapshotFile, readImportedFile, describeImportError,
} from '../shared/persistence/exportImportFile.js';
import useLevelSessionPersistence, { readLevelSession } from '../shared/persistence/useLevelSessionPersistence.js';

// Estado inicial vazio do formulário da descrição formal (7-tupla)
// deltaCells: mapa "estado|símbolo" → "destino, escreve, move" (matriz δ)
const EMPTY_FORMAL = { states: '', sigma: '', gamma: '', initial: '', blank: '', final: '', deltaCells: {} };

export default function MTPart1({ onBack, progress, updateProgress,
  forceLevelId, forceLevelLabel, onForcedPrev, onForcedNext, forceLabelColor }) {
  // ── Toast (local, ignora o showToast no-op do App.jsx) ─
  const { toastData, showToast } = useToast();

  const [screen, setScreen] = useState('MENU');
  const [level,  setLevel]  = useState(null);
  // Prefetch: dispara o import() de todos os níveis em PARALELO ao montar, e só
  // popula mtLevels quando TODOS resolverem — evita carregar os 18 níveis
  // (~23MB) de uma vez só como import estático (só o(s) nível(is) realmente
  // abertos ficam "pesados" em memória depois), mas sem popular a grade do
  // menu 1 botão de cada vez conforme cada import termina, que ficava com uma
  // aparência de "site quebrado" (reportado pelo usuário). Preferível esperar
  // ~meio segundo com um placeholder único a ter a grade "piscando" botões.
  const [mtLevels, setMtLevels] = useState([]);
  useEffect(() => {
    let cancelled = false;
    Promise.all(MT_LEVEL_ORDER.map(loadMTLevel)).then(levels => {
      if (!cancelled) setMtLevels(levels);
    });
    return () => { cancelled = true; };
  }, []);
  const [mode,   setMode]   = useState('IDLE');
  const [connectingSource, setConnectingSource] = useState(null);
  const [errAction, setErrAction] = useState(null);
  const [prof,   setProf]   = useState({ message: '', mood: 'serio' });
  const [simWord, setSimWord]     = useState('');
  const [linguagemTests, setLinguagemTests] = useState([]); // histórico isolado: gabarito estático
  const [desenhoTests,   setDesenhoTests]   = useState([]); // histórico isolado: simulação do grafo
  const [activeTab, setActiveTab] = useState('linguagem'); // 'linguagem' | 'desenho'
  const [deckGhost, setDeckGhost] = useState(null);
  const [victory, setVictory]     = useState(false);
  const [selectedNodes, setSelectedNodes]   = useState([]);
  const [selectionBox, setSelectionBox]     = useState(null);
  const [formalAnswers, setFormalAnswers]   = useState(EMPTY_FORMAL);
  const [formalMode, setFormalMode]         = useState(false); // jogo: MT válida → preencher descrição formal
  const [formalElementsValid, setFormalElementsValid] = useState(false); // campos (Q,Σ,Γ,q₀,□,F) já validados
  const [fieldErrors, setFieldErrors] = useState({}); // erros por campo — igual AFD/AP (borda vermelha)
  const [cellErrors,  setCellErrors]  = useState({}); // erros por célula da tabela δ — 'q0|a': true
  const [inputError, setInputError]           = useState(null); // erro inline no campo de teste de palavra
  const canvasRef      = useRef(null);
  const innerCanvasRef = useRef(null);
  const viewportRef    = useRef(null);
  const formalRef = useRef(null); // container rolável do painel formal (auto-scroll)
  const currentFormalElRef = useRef(null); // campo/linha δ revelado no passo atual da aula — alvo do auto-scroll
  const formalFieldRefs = useRef({}); // { [campo]: {current: <input>} } — p/ inserir símbolo no cursor
  const noopRef = useRef(false);

  // ── Aula Guiada ──────────────────────────────────────────────────────────────
  // Storyboard frame a frame: cada passo é um objeto independente (grafo + fita).
  // Não há motor de animação interno — a fita é dado puro vindo de lesson.cur.
  const lesson = useMTGuidedLesson(level);

  const g    = useTMGraph({ showToast, selectedNodes, setSelectedNodes });
  const draw = useAPDrawing(innerCanvasRef);

  // Canvas fixo (8000×8000px) + zoom real: mesmo motor do AP/AFD/MTRecon.
  const { zoom, setZoom, resetZoom } = useCanvasState({
    isDrawingUnlocked: true,
    setInteractionMode: () => {},
    squashNextHistoryRef: noopRef,
    setConnectingSource,
    setSelectedSymbolCard: () => {},
    setSelectedNodes,
    tela: screen === 'GAME' ? 'JOGO' : screen,
    isSidebarOpen: formalMode || lesson.phase === 'FORMAL',
    canvasRef,
    viewportRef,
  });

  // O canvas exibe o grafo da aula (overlay) ou o grafo real do aluno
  const viewNodes       = lesson.active ? lesson.displayNodes       : g.nodes;
  const viewTransitions = lesson.active ? lesson.displayTransitions : g.transitions;

  const say = useCallback((message, mood = 'serio') => setProf({ message, mood }), []);

  // ── Telemetria (módulo mt-trans) ────────────────────────────────────────────
  // Mesmo padrão dos demais orquestradores (AFDPart1/AP). A MT Transdutora dá as
  // 3 estrelas de uma vez ao Validar (fuzzTMTransducer) e só depois pede a
  // Descrição Formal → 2 marcos: `validacao` (★★★, MT correta) e `tabela_formal`
  // (7-tupla concluída). Tentativa só no Validar — o teste de palavra é
  // exploração (aba Linguagem = gabarito estático; aba Desenho = simulador do
  // grafo do aluno), não resposta avaliada.
  const phaseStartRef = useRef(null);
  const attemptsRef = useRef(0);
  const tutorialOpensRef = useRef(0);
  const errorSinceTutorialRef = useRef(false);
  const { phaseExtras, logTutorialOpen } = usePhaseTelemetry({
    modulo: 'mt-trans', nivelId: level?.id, dificuldade: level?.level ?? null,
    phaseStartRef, attemptsRef, tutorialOpensRef, errorSinceTutorialRef,
  });

  // ── Persistência de sessão (autosave debounced — ver ADR 0011) ─────────────
  // Sem isDrawingUnlocked/hintStage: MT Transdutora não tem a mecânica de
  // "descubra a menor palavra" (isDrawingUnlocked é sempre true — ver
  // CLAUDE.md, "Star count for MT Transducer").
  const sessionPayload = useMemo(() => ({
    nodes: g.nodes, transitions: g.transitions,
    linguagemTests, desenhoTests, activeTab, victory,
    formal: { formalAnswers, formalElementsValid },
  }), [g.nodes, g.transitions, linguagemTests, desenhoTests, activeTab, victory,
      formalAnswers, formalElementsValid]);
  const { clearSession } = useLevelSessionPersistence({
    moduleKey: 'mt-trans', levelId: level?.id ?? null, payload: sessionPayload, levelLabel: level?.label,
  });

  // Aplica um payload restaurado (autosave OU arquivo importado — mesmo
  // shape) ao estado do orquestrador. Usado por loadLevel (ao entrar na
  // fase) e por handleImportSessionFile (fase já aberta na tela).
  const applyRestoredPayload = useCallback((restored) => {
    g.reset({ nodes: restored.nodes ?? [], transitions: restored.transitions ?? [] });
    setMode('IDLE'); setConnectingSource(null);
    setVictory(!!restored.victory);
    setLinguagemTests(restored.linguagemTests ?? []);
    setDesenhoTests(restored.desenhoTests ?? []);
    setActiveTab(restored.activeTab ?? 'linguagem');
    setFormalAnswers(restored.formal?.formalAnswers ?? EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(!!restored.formal?.formalElementsValid);
    setFieldErrors({}); setCellErrors({});
  }, [g]);

  // ── Exportar/Importar sessão em .json (Feature B — ver ADR 0011) ───────────
  const handleExportSession = useCallback(() => {
    if (!level) return;
    // Estrelas (ADR 0012): chave de progresso é `mt-trans-<id>`, DIFERENTE
    // do moduleKey da sessão ('mt-trans') — não confundir os dois namespaces.
    const stars = progress?.[`mt-trans-${level.id}`]?.stars ?? 0;
    const snapshot = buildSnapshot('mt-trans', level.id, sessionPayload, level.label, stars);
    const ok = downloadSnapshotFile(snapshot, buildExportFilename('mt-trans', level.id));
    if (ok) {
      showToast?.('Fase exportada em .json!', 'success');
      if (hasConsent()) logEvent({ tipo_evento: 'exportar_fase', modulo: 'mt-trans', nivel_id: level.id });
    } else {
      showToast?.('Não foi possível exportar a fase.', 'error');
    }
  }, [level, sessionPayload, progress, showToast]);

  const handleImportSessionFile = useCallback(async (file) => {
    if (!level) return;
    const res = await readImportedFile(file, 'mt-trans', level.id);
    if (!res.ok) {
      showToast?.(describeImportError(res.reason), 'error');
      return;
    }
    applyRestoredPayload(res.snapshot.payload);
    if (res.snapshot.stars != null) updateProgress?.(`mt-trans-${level.id}`, res.snapshot.stars, {}, false);
    showToast?.('Fase importada com sucesso!', 'success');
    if (hasConsent()) logEvent({ tipo_evento: 'importar_fase', modulo: 'mt-trans', nivel_id: level.id });
  }, [level, applyRestoredPayload, updateProgress, showToast]);

  // Reset "em branco" puro — mesmos campos que o loadLevel zera quando NÃO
  // há sessão salva, mas sem telemetria/troca de tela (fica na mesma fase).
  // Reaproveitado só por handleClearSession — loadLevel mantém seu próprio
  // reset inline (decisão da Fase A: já testado, não valia reabrir).
  const resetToBlankState = useCallback(() => {
    g.reset();
    setMode('IDLE'); setConnectingSource(null);
    setSimWord('');
    setLinguagemTests([]);
    setDesenhoTests([]);
    setActiveTab('linguagem');
    setDeckGhost(null);
    setVictory(false);
    setSelectedNodes([]); setSelectionBox(null);
    setFormalAnswers(EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(false);
    setFieldErrors({}); setCellErrors({});
    draw.resetDrawings();
    resetZoom();
  }, [g, draw, resetZoom]);

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

  // Navegação estritamente passo a passo (cada clique = um frame do storyboard)
  const lessonGo = useCallback((dir) => {
    if (!lesson.active) return;
    const next = Math.max(0, Math.min(lesson.steps.length - 1, (lesson.step ?? 0) + dir));
    lesson.goTo(next);
    applyStep(lesson.steps[next]);
  }, [lesson, applyStep]);

  // Auto-preenchimento do formulário formal — simula o "Maurílio digitando" cada campo
  useEffect(() => {
    const fill = lesson.cur?.formalFill;
    if (!fill) return;
    setFormalAnswers(prev => {
      const next = { ...prev, ...fill };
      if (fill.delta) {
        // converte o array de transições na matriz de células δ
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
  // APFormalDescription). O ref é fixado no campo cujo passo atual preenche
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
  // Aceita o objeto já resolvido (caminho normal: menu/EndScreen só oferecem
  // níveis já presentes em mtLevels) ou um id cru — nesse caso resolve via
  // loadMTLevel (cache-hit instantâneo se o prefetch já rodou; import() real
  // só no caso raro de clique antes do prefetch terminar).
  const loadLevel = useCallback(async (lvOrId) => {
    const lv = typeof lvOrId === 'string' ? await loadMTLevel(lvOrId) : lvOrId;
    // Hidratação SÓ depois do await acima resolver (id cru vindo do Boss) —
    // ver ADR 0011/§4 do prompt original.
    const restored = readLevelSession('mt-trans', lv.id);
    g.reset(restored ? { nodes: restored.nodes ?? [], transitions: restored.transitions ?? [] } : undefined);
    lesson.reset();
    // Telemetria: início da fase + reset de contadores.
    phaseStartRef.current = performance.now();
    attemptsRef.current = 0;
    tutorialOpensRef.current = 0;
    errorSinceTutorialRef.current = false;
    logEvent({
      tipo_evento: 'inicio_fase',
      modulo: 'mt-trans',
      nivel_id: lv.id,
      dificuldade: lv.level ?? null,
    });
    setLevel(lv); setScreen('GAME'); setMode('IDLE'); setConnectingSource(null);
    setSimWord('');
    setLinguagemTests(restored?.linguagemTests ?? []);
    setDesenhoTests(restored?.desenhoTests ?? []);
    setActiveTab(restored?.activeTab ?? 'linguagem');
    setDeckGhost(null);
    setVictory(!!restored?.victory);
    setSelectedNodes([]); setSelectionBox(null);
    setFormalAnswers(restored?.formal?.formalAnswers ?? EMPTY_FORMAL);
    setFormalMode(false);
    setFormalElementsValid(!!restored?.formal?.formalElementsValid);
    setFieldErrors({}); setCellErrors({});
    draw.resetDrawings();
    resetZoom();
    say(`Monte a MT Transdutora que ${lv.description.toLowerCase()} e clique em Validar!`, 'explicando');
  }, [g, lesson, draw, say, resetZoom]);

  const goLevel = useCallback((dir) => {
    const idx = mtLevels.findIndex(l => l.id === level?.id);
    const next = mtLevels[idx + dir];
    if (next) loadLevel(next);
  }, [level, loadLevel, mtLevels]);

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
  // Laboratórios independentes: a aba ativa decide contra QUEM a palavra é testada
  // e em qual histórico isolado o resultado entra.
  const testWord = useCallback(() => {
    if (!level) return;
    const word = simWord.trim();

    if (word !== '') {
      const alphabet = level.alphabet ?? ['a', 'b'];
      const invalid = [...word].find(ch => !alphabet.includes(ch));
      if (invalid) {
        setInputError(`O símbolo "${invalid}" não faz parte do alfabeto (${alphabet.join(', ')}).`);
        return;
      }
    }
    setInputError(null);

    if (activeTab === 'linguagem') {
      // Gabarito estático do nível: saída = level.validate(word). null/undefined → REJEITADA
      const expected = level.validate?.(word);
      const status = expected != null ? 'ACCEPTED' : 'REJECTED';
      // Insere no TOPO — o mais recente fica visível sem precisar rolar a lista.
      setLinguagemTests(prev => [{ word, status, output: expected ?? '' }, ...prev]);
    } else {
      // Simulação contra o grafo atual do aluno
      const mtGraph = { states: g.nodes, transitions: g.transitions };
      const marker = level.startMarker ?? level.outputMarker ?? null;
      const { status, tape, head } = simulateTM(mtGraph, word, 2000, level.startMarker ?? null);
      let output = '';
      // Chegou em estado final mas o cabeçote não voltou pro 1º caractere do
      // resultado não conta como aceita de verdade — ver
      // docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md.
      const headNotRewound = status === 'ACCEPTED' && !headRewound(word, tape, head, marker);
      if (status === 'ACCEPTED') {
        output = extractTapeOutput(tape, marker) || BLANK;
      }
      setDesenhoTests(prev => [{ word, status, output, headNotRewound }, ...prev]);
    }
    setSimWord('');
  }, [level, simWord, activeTab, g.nodes, g.transitions]);

  // ── Validar (bateria) = ★★★ ──────────────────────────────────────────────────
  const validate = useCallback(() => {
    if (!level) return;

    // Telemetria: cada Validar que falha é uma `tentativa` (resultado
    // validacao_falhou) com o motivo estruturado em `tipo_erro`. O sucesso não
    // gera tentativa própria — fica registrado no fim_fase (marco validacao).
    const failAttempt = (tipo_erro) => {
      errorSinceTutorialRef.current = true;
      attemptsRef.current += 1;
      logEvent({
        tipo_evento: 'tentativa',
        modulo: 'mt-trans',
        nivel_id: level.id,
        resultado: 'validacao_falhou',
        tipo_erro,
        numero_tentativas: attemptsRef.current,
      });
    };

    // ── Validações estruturais (toast do topo, como no AP) ──────────────────
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
    // Não-determinismo: mesmo estado lendo o mesmo símbolo com ações diferentes
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
    const res = fuzzTMTransducer(mtGraph, level);
    if (res.ok) {
      // ★★ aqui (grafo correto) — a 3ª só vem ao validar a Descrição Formal
      // (igual AFD/AP: a última estrela nunca é dada antes da tupla+δ certas).
      updateProgress?.(`mt-trans-${level.id}`, 2, phaseExtras('validacao'));
      say('Perfeito! Sua MT está correta! Agora preencha a Descrição Formal à esquerda e valide. 📝', 'feliz');
      showToast?.('MT validada! ★★ — formalize a máquina para a 3ª estrela.', 'success');
      setFormalMode(true); // abre o painel formal (editável); vitória só ao validar a formal
    } else {
      failAttempt(res.reason ?? null);
      const show = res.counterexample === '' ? 'λ' : res.counterexample;
      const msg = res.reason === 'loop'
        ? `Loop detectado para "${show}". Verifique se a MT para em todos os casos.`
        : res.reason === 'rejected'
        ? `Sua MT não aceita "${show}" (parou em estado não-final).`
        : res.reason === 'head-not-rewound'
        ? `Sua MT aceita "${show}" e escreve certo, mas o cabeçote não volta pro 1º caractere do resultado antes de parar — revise a "volta" antes do estado final.`
        : `Para "${show}": sua MT escreveu "${res.got}" na fita, mas o esperado era "${res.expected}".`;
      // Erro fica só no balão vermelho do painel lateral (result.*) — o
      // Maurílio não comenta erros, só sucesso/dicas.
      showToast?.(msg, 'error');
    }
  }, [level, g, say, updateProgress, showToast, phaseExtras]);

  // Valida a Descrição Formal preenchida — mesmo padrão de 2 etapas do
  // AFD/AP: 1ª chamada valida os 6 campos da tupla (Q,Σ,Γ,q₀,□,F) contra o
  // grafo desenhado; passando, libera a tabela δ para edição. 2ª chamada
  // (botão muda de rótulo) valida a tabela δ célula a célula; só então dá a
  // 3ª estrela e mostra a tela de vitória. Erro fica só no toast + bordas
  // vermelhas nos campos/células — Maurílio não comenta erro (mesmo padrão
  // já usado no "Validar MT" acima, comentário nas linhas 402-403).
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
    updateProgress?.(`mt-trans-${level.id}`, 3, phaseExtras('tabela_formal'));
    setFormalMode(false);
    setVictory(true);
  }, [level, g, formalAnswers, formalElementsValid, updateProgress, showToast, phaseExtras]);

  // Dica do professor (Maurílio): mesma métrica de "uso de ajuda" da aula guiada.
  // Loga só na ABERTURA (balão vazio → vai abrir); fechar não conta.
  const handleProfClick = useCallback(() => {
    const isOpening = !prof.message;
    setProf(p => p.message
      ? { ...p, message: '' }
      : { message: level?.hint || 'Leia, escreva e mova o cabeçote até chegar ao estado final!', mood: 'explicando' });
    if (isOpening) logTutorialOpen('dica');
  }, [prof.message, level, logTutorialOpen]);

  const stars = level ? (progress?.[`mt-trans-${level.id}`]?.stars || 0) : 0;

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
    const maxStars   = MT_LEVEL_ORDER.length * 3;
    const totalStars = mtLevels.reduce((s, l) => s + (progress?.[`mt-trans-${l.id}`]?.stars || 0), 0);
    return (
      <LevelGridScreen
        onBack={onBack}
        badge="⚙️ Máquina de Turing — Transdutora"
        badgeBg="#fed7aa"
        totalStars={totalStars}
        maxStars={maxStars}
        extraClass="min-screen"
        loading={mtLevels.length === 0}
        legendKeys={['easy', 'medium', 'hard', 'prova']}
      >
        {mtLevels.map(l => (
          <button key={l.id} className="menu-btn primary" onClick={() => loadLevel(l)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              background: DIFF_COLOR[l.level] }}>
            <span>{l.label}</span>
            <SvgStars count={progress?.[`mt-trans-${l.id}`]?.stars || 0} size={14} max={3} />
          </button>
        ))}
      </LevelGridScreen>
    );
  }

  // ── Tela do jogo ─────────────────────────────────────────────────────────────
  const mtIdx  = mtLevels.findIndex(l => l.id === level.id);
  const nextMt = mtIdx >= 0 && mtIdx < mtLevels.length - 1 ? mtLevels[mtIdx + 1] : null;
  const isFormal   = lesson.phase === 'FORMAL';
  const formalOpen = isFormal || formalMode; // mostra o painel formal à esquerda

  // Matriz δ: colunas = Σ depois Γ (sem repetir) incluindo □; linhas = estados de Q
  const sigmaCols    = level.alphabet ?? [];
  const formalCols   = [...sigmaCols, ...((level.tapeAlphabet ?? []).filter(s => !sigmaCols.includes(s)))];
  const formalStateRows = (lesson.active ? (lesson.displayNodes ?? []) : g.nodes).map(n => n.id);

  // Aula: campo (ou linha δ) que o passo atual está revelando — alvo do auto-scroll.
  const curFormalFill = lesson.cur?.formalFill;
  const curFormalKey  = curFormalFill ? Object.keys(curFormalFill)[0] : null;
  const curDeltaRow   = curFormalKey === 'delta' && Array.isArray(curFormalFill.delta)
    ? [...formalStateRows].reverse().find(stId => curFormalFill.delta.some(t => t.from === stId)) ?? null
    : null;

  // ── Formulário da descrição formal (inputs auto-preenchidos / editáveis) ─────
  const setDeltaCell = (key, value) => setFormalAnswers(prev => ({
    ...prev, deltaCells: { ...prev.deltaCells, [key]: value },
  }));

  // insertSymbol: quando definido, mostra um botão colado ao campo que insere
  // o símbolo (ex.: □) na posição do cursor — o jogador não precisa saber
  // digitar o glifo de branco no teclado.
  // Campo fica travado (readOnly) depois que os elementos são validados —
  // mesmo padrão do AFD/AP: só a tabela δ continua editável na 2ª etapa.
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

      {/* Header (compartilhado com AFD/AP/MTRecon — mesmo componente/estilo/motor) */}
      <GameHeader
        objective={level.description}
        label={forceLevelLabel ?? level.label}
        diffColor={forceLabelColor ?? DIFF_COLOR[level.level] ?? '#fff'}
        stars={stars}
        starsMax={3}
        isFirst={forceLevelId != null ? !onForcedPrev : mtIdx === 0}
        isLast={forceLevelId != null ? !onForcedNext : mtIdx === mtLevels.length - 1}
        toggleSidebar={() => setFormalMode(o => !o)}
        onBack={forceLevelId != null ? onBack : () => { lesson.finish(); setScreen('MENU'); }}
        onPrevLevel={forceLevelId != null ? onForcedPrev : () => goLevel(-1)}
        onNextLevel={forceLevelId != null ? onForcedNext : () => goLevel(1)}
        hasLesson={lesson.hasLesson}
        lessonActive={lesson.active}
        lessonDisabled={!lesson.hasLesson}
        onStartLesson={startLesson}
        onCloseLesson={finishLesson}
        onExportSession={handleExportSession}
        onImportSessionFile={handleImportSessionFile}
        onClearSession={handleClearSession}
      />

      <div className="workspace">
        {/* Painel ESQUERDO: Descrição Formal (espelha o AFD) — aula formal OU pós-validação */}
        {formalOpen && (
          <aside className="test-panel ap-test-panel" ref={formalRef} style={{
            width: 300, display: 'flex', flexDirection: 'column', gap: 0,
            overflowY: 'auto', background: '#fff',
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

        {/* Canvas */}
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
        />

        {/* Painel direito: modo aula ou teste */}
        {lesson.active ? (
          <aside className="test-panel ap-test-panel" style={{
            display: 'flex', flexDirection: 'column', gap: 0,
            background: '#242424', border: '3px solid #143823',
          }}>
            {/* Cabeçalho verde-escuro */}
            <div style={{
              padding: '8px 10px', background: '#143823',
              fontFamily: 'var(--font-comic)', fontSize: 11, fontWeight: 900,
              color: '#fbbf24', letterSpacing: 0.5,
            }}>
              👨‍🏫 MODO AULA — {isFormal ? 'DESCRIÇÃO FORMAL' : 'MONTANDO O GRAFO'}
            </div>

            {/* Transição grafo → formal: botão grande "Iniciar Descrição Formal" */}
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

            {/* Fase FORMAL: a lousa só aponta para o formulário à esquerda */}
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

            {/* Status do passo atual — "Simulando: ab" */}
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

            {/* Contador de passos */}
            <div style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af',
              fontFamily: 'var(--font-comic)', marginBottom: 8 }}>
              Passo {(lesson.step ?? 0) + 1} / {lesson.steps.length}
            </div>

            {/* Bolinhas de progresso (quebram em linhas p/ roteiros longos) */}
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

            {/* Navegação — paddingBottom alto mantém os botões acima do balão do
                professor. 245px (não 160px): o rodapé de MT é compacto durante
                a aula (compactWhenLesson no APFooterDeck), então o balão sobe
                mais alto na tela do que um rodapé de altura cheia exigiria. */}
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
            {/* Abas: Linguagem (default, azul ativo) vs Desenho (verde inativo) */}
            <div style={{ display: 'flex', gap: 4, padding: '6px 6px 0' }}>
              {[['linguagem', '#2563eb', '⚙ Linguagem'], ['desenho', '#16a34a', '✏ Desenho']].map(([tab, color, label]) => {
                const on = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, padding: '6px 0', fontFamily: 'var(--font-comic)', fontWeight: 900,
                    fontSize: 12, cursor: 'pointer', borderRadius: '8px 8px 0 0',
                    border: `2px solid ${color}`,
                    background: on ? '#2563eb' : '#fff',
                    color: on ? '#fff' : color,
                  }}>
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Aba Linguagem: laboratório do GABARITO estático (histórico isolado) */}
            {activeTab === 'linguagem' && (
              <>
                <div style={{ padding: '6px 10px 0', fontFamily: 'var(--font-comic)',
                  fontSize: 11, fontWeight: 900, color: '#2563eb' }}>
                  📋 Objetivo: Entrada ({(level.alphabet ?? []).join(',')}) → Saída esperada
                </div>

                <div className="test-input-area">
                  <input type="text" className="word-input" placeholder="ex: ab (vazio = λ)"
                    value={simWord} onChange={e => { setSimWord(e.target.value); setInputError(null); }}
                    onKeyDown={e => e.key === 'Enter' && testWord()}
                    translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
                    style={inputError ? { border: '2px solid #dc2626' } : {}} />
                  <button className="add-test-btn" onClick={testWord}>+</button>
                  <button className="add-test-btn clear-test-btn" title="Limpar palavra e histórico"
                    disabled={linguagemTests.length === 0 && simWord === ''}
                    onClick={() => { setLinguagemTests([]); setSimWord(''); setInputError(null); }}
                    style={{ opacity: linguagemTests.length === 0 && simWord === '' ? 0.5 : 1 }}>🧹</button>
                </div>
                {inputError && (
                  <div style={{ padding: '3px 10px 4px', fontFamily: 'var(--font-comic)',
                    fontSize: 11, fontWeight: 900, color: '#dc2626' }}>
                    ⛔ {inputError}
                  </div>
                )}

                <div className="words-list" style={{ overflowX: 'hidden' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Entrada', 'Saída esperada'].map(h => (
                          <th key={h} style={{ border: '1.5px solid #2563eb', padding: '3px 4px',
                            background: '#dbeafe', color: '#1e3a8a',
                            fontFamily: 'var(--font-comic)', fontSize: 11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linguagemTests.map((t, i) => (
                        <tr key={`l${i}`} style={{ background: i % 2 === 0 ? '#f0f9ff' : '#fff' }}>
                          <td style={{ border: '1.5px solid #bfdbfe', padding: '3px 6px', textAlign: 'center',
                            fontFamily: 'var(--font-comic)', fontWeight: 900, color: '#111' }}>
                            {t.word === '' ? 'λ' : t.word}
                          </td>
                          <td style={{ border: '1.5px solid #bfdbfe', padding: '3px 6px', textAlign: 'center' }}>
                            {t.status === 'ACCEPTED'
                              ? <b style={{ color: '#1d4ed8', fontFamily: 'var(--font-comic)' }}>{t.output === '' ? 'λ' : t.output}</b>
                              : <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4,
                                  background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 900,
                                  fontFamily: 'var(--font-comic)' }}>REJEITADA</span>}
                          </td>
                        </tr>
                      ))}
                      {linguagemTests.length === 0 && (
                        <tr><td colSpan={2} style={{ border: '1.5px solid #bfdbfe', padding: 8,
                          textAlign: 'center', color: '#9ca3af', fontFamily: 'var(--font-comic)',
                          fontSize: 11 }}>Nenhum teste ainda</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Aba Desenho: laboratório do SIMULADOR (histórico isolado, grafo atual) */}
            {activeTab === 'desenho' && (
              <>
                <div style={{ padding: '6px 10px 0', fontFamily: 'var(--font-comic)',
                  fontSize: 11, fontWeight: 900, color: '#16a34a' }}>
                  ✏ Saída da SUA máquina (testada no grafo atual)
                </div>

                <div className="test-input-area">
                  <input type="text" className="word-input" placeholder="ex: ab (vazio = λ)"
                    value={simWord} onChange={e => { setSimWord(e.target.value); setInputError(null); }}
                    onKeyDown={e => e.key === 'Enter' && testWord()}
                    translate="no" spellCheck={false} autoCorrect="off" autoCapitalize="off"
                    style={inputError ? { border: '2px solid #dc2626' } : {}} />
                  <button className="add-test-btn" onClick={testWord}>+</button>
                  <button className="add-test-btn clear-test-btn" title="Limpar palavra e histórico"
                    disabled={desenhoTests.length === 0 && simWord === ''}
                    onClick={() => { setDesenhoTests([]); setSimWord(''); setInputError(null); }}
                    style={{ opacity: desenhoTests.length === 0 && simWord === '' ? 0.5 : 1 }}>🧹</button>
                </div>
                {inputError && (
                  <div style={{ padding: '3px 10px 4px', fontFamily: 'var(--font-comic)',
                    fontSize: 11, fontWeight: 900, color: '#dc2626' }}>
                    ⛔ {inputError}
                  </div>
                )}

                <div className="words-list" style={{ overflowX: 'hidden' }}>
                  <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Entrada', 'Saída gerada'].map(h => (
                          <th key={h} style={{ border: '1.5px solid #16a34a', padding: '3px 4px',
                            background: '#dcfce7', color: '#14532d',
                            fontFamily: 'var(--font-comic)', fontSize: 11 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {desenhoTests.map((t, i) => (
                        <tr key={`d${i}`} style={{ background: i % 2 === 0 ? '#f0fdf4' : '#fff' }}>
                          <td style={{ border: '1.5px solid #bbf7d0', padding: '3px 6px', textAlign: 'center',
                            fontFamily: 'var(--font-comic)', fontWeight: 900, color: '#111' }}>
                            {t.word === '' ? 'λ' : t.word}
                          </td>
                          <td style={{ border: '1.5px solid #bbf7d0', padding: '3px 6px', textAlign: 'center' }}>
                            {t.status === 'ACCEPTED' && t.headNotRewound
                              ? <span title="Chegou no estado final, mas o cabeçote não voltou pro 1º caractere do resultado — não conta como aceita."
                                  style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4,
                                  background: '#fde68a', color: '#854d0e', fontSize: 10, fontWeight: 900,
                                  fontFamily: 'var(--font-comic)' }}>
                                  ⚠️ CABEÇOTE NÃO VOLTOU
                                </span>
                              : t.status === 'ACCEPTED'
                              ? <b style={{ color: '#15803d', fontFamily: 'var(--font-comic)' }}>{t.output}</b>
                              : <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: 4,
                                  background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 900,
                                  fontFamily: 'var(--font-comic)' }}>
                                  {t.status === 'LOOP' ? 'ERRO' : 'REJEITADA'}
                                </span>}
                          </td>
                        </tr>
                      ))}
                      {desenhoTests.length === 0 && (
                        <tr><td colSpan={2} style={{ border: '1.5px solid #bbf7d0', padding: 8,
                          textAlign: 'center', color: '#9ca3af', fontFamily: 'var(--font-comic)',
                          fontSize: 11 }}>Nenhum teste ainda</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <button className="validate-btn slide-up-fade" onClick={formalMode ? validateFormal : validate}>
              {formalMode ? (formalElementsValid ? '✓ Validar Transições' : '✓ Validar Elementos') : '✓ Validar MT'}
            </button>
          </aside>
        )}
      </div>

      {/* Rodapé: deck de cartas + Maurílio (fita integrada quando a aula exibir tape) */}
      <APFooterDeck
        mode={mode}
        onPick={pickMode}
        lessonActive={lesson.active}
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
      />

      {victory && (
        <EndScreen
          currentLevelId={level.id}
          nextLevel={nextMt}
          message={`Parabéns! Sua MT Transdutora está correta! ⭐⭐⭐`}
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
