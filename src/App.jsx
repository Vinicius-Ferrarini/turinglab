// TuringLab – App.jsx v3.0 (ROUTER CENTRAL)
import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import './App.css';

// Importar páginas e módulos
import MainMenu from './pages/MainMenu';
import ConsentGate from './components/ConsentGate';
import FeedbackButton from './components/FeedbackButton';
import FeedbackModal from './components/FeedbackModal';
import LoadingScreen from './components/LoadingScreen';
import { LEVEL_IDS, UNAVAILABLE_LEVELS, UNAVAILABLE_LEVELS_P2_ONLY, HIDDEN_LEVELS, LEVEL_DIFFICULTY } from './levels';
import { EXERCISES } from './modules/afd/afdMinimizerExercises';
import { MT_RECON_LEVEL_IDS, MT_LEVEL_IDS } from './levels_data/mt-ids.js';
import { BOSS_TRABALHO_EXERCISES } from './modules/boss/bossTrabalhoExercises.js';
import { BOSS_PROVA_EXERCISES } from './modules/boss/bossProvaExercises.js';
import { moduleEarnedStars, AFD_MODULE_MAX, AP_MODULE_MAX, MT_MODULE_MAX } from './services/starTotals.js';
import { TOTAL_WORD_EXERCISE_COUNT } from './modules/shared/wordExercises/wordExerciseCount.js';
import {
  logEvent, hasConsent,
  hasFeedbackShownOnce, markFeedbackShownOnce, hasFeedbackResponded,
} from './services/telemetry';
const AFDPart1    = lazy(() => import('./modules/afd/AFDPart1'));
const AFDPart2    = lazy(() => import('./modules/afd/AFDPart2'));
const AFDMinimizer = lazy(() => import('./modules/afd/AFDMinimizer'));
const APPart1     = lazy(() => import('./modules/ap/APPart1'));
const MTPart1     = lazy(() => import('./modules/mt/MTPart1'));
const MTReconPart1 = lazy(() => import('./modules/mt-recon/MTReconPart1'));
const BossTrabalho = lazy(() => import('./modules/boss/BossTrabalho'));
const BossProva    = lazy(() => import('./modules/boss/BossProva'));
const WordGuess    = lazy(() => import('./modules/word-guess/WordGuess'));

// Módulos com uma ÚNICA atividade pulam a tela de submódulos e vão direto ao jogo
// (ex.: AP só tem "Autômato com Pilha" — não faz sentido escolher pilha 2x).
// MT tem 2 atividades (Reconhecedora + Transdutora), então passa pela tela de
// submódulos como o AFD. minigames também tem 3 (Trabalho/Prova/Menor Palavra),
// então idem — passa pela tela de submódulos.
const DIRECT_GAME = { ap: 'ap-pilha' };

export default function App() {
  const [screen, setScreen] = useState('HOME');
  const [currentModule, setCurrentModule] = useState(null);
  // Consentimento de telemetria: enquanto false, mostra o ConsentGate no lugar do jogo.
  const [consented, setConsented] = useState(hasConsent());

  // ✨ Progresso Persistente
  const getProgress = () => {
    try {
      return JSON.parse(localStorage.getItem('turinglab_progress') || '{}');
    } catch {
      return {};
    }
  };

  const [progress, setProgress] = useState(getProgress);

  // Espelho sempre-atual do progresso: permite calcular `novo_recorde` em
  // updateProgress sem colocar `progress` nas deps do useCallback (mantém a
  // identidade da função estável para os módulos que a recebem por prop).
  const progressRef = useRef(progress);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // logTelemetry=false (ADR 0012): usado ao restaurar estrelas de um arquivo
  // importado — não é o aluno terminando a fase agora, é dado histórico
  // voltando, então não deve gerar um evento `fim_fase` (distorceria a
  // telemetria de pesquisa). O resto do comportamento (nunca regride,
  // localStorage) é idêntico nos dois casos.
  const updateProgress = useCallback((moduleId, stars, extras = {}, logTelemetry = true) => {
    const previousStars = progressRef.current[moduleId]?.stars || 0;
    setProgress(prev => {
      const cur = prev[moduleId]?.stars || 0;
      if (stars <= cur) return prev;
      const next = { ...prev, [moduleId]: { stars, timestamp: Date.now() } };
      localStorage.setItem('turinglab_progress', JSON.stringify(next));
      return next;
    });
    if (!logTelemetry) return;
    // Efeito colateral fora do updater do setProgress: sob StrictMode o updater
    // pode rodar 2x em dev, então logamos aqui para não duplicar o evento.
    // `novo_recorde` separa melhora real de rejogada; `extras` traz campos
    // específicos do módulo (modulo, nivel_id, tempo_gasto_segundos, dificuldade).
    logEvent({
      tipo_evento: 'fim_fase',
      modulo: moduleId,
      estrelas_obtidas: stars,
      novo_recorde: stars > previousStars,
      ...extras,
    });
  }, []);

  // TODO: showToast não renderiza feedback visual — toastData foi removido por
  // ser código morto, mas os chamadores (AFDPart1/2, MTPart1 etc.) ainda esperam
  // essa função. Precisa de um componente de toast de verdade no futuro.
  const showToast = useCallback(() => {}, []);

  // ── Fase 6: feedback de satisfação ──────────────────────────────────────────
  // O modal vive no nível do App (como o ConsentGate) para aparecer sobre
  // qualquer tela. `feedbackResponded` (visual do FAB) espelha a flag local.
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackResponded, setFeedbackResponded] = useState(hasFeedbackResponded());
  const openFeedback = useCallback(() => setFeedbackOpen(true), []);
  // Popup automático (forçado, 1x): só ao SAIR de uma fase (GAME → MODULES/HOME),
  // nunca no meio dela, e só se já houver ≥1 fase concluída E consentimento dado.
  const maybeAutoFeedback = useCallback(() => {
    if (!hasConsent()) return;                                  // não coleta sem consentimento
    if (hasFeedbackShownOnce()) return;                         // popup forçado é 1x só
    if (Object.keys(progressRef.current).length === 0) return;  // precisa de ≥1 fase concluída
    markFeedbackShownOnce();
    setFeedbackOpen(true);
  }, []);

  // ✨ Navegação
  const goHome = () => { const leavingGame = screen === 'GAME'; setScreen('HOME'); if (leavingGame) maybeAutoFeedback(); };
  const goModules = () => { const leavingGame = screen === 'GAME'; setScreen('MODULES'); setCurrentModule(null); if (leavingGame) maybeAutoFeedback(); };
  const loadGame = (gameId) => {
    setCurrentModule(gameId);
    setScreen('GAME');
  };
  const goSubmodule = (moduleId) => {
    // afd/mt saem da fase para a tela de SUBMÓDULOS (não p/ MODULES/HOME), então o
    // popup de feedback também precisa ser disparado aqui — senão só o AP (que volta
    // via goModules) acionaria. Mantém "só ao SAIR" (nunca ao entrar num módulo).
    const leavingGame = screen === 'GAME';
    const direct = DIRECT_GAME[moduleId];
    if (direct) { loadGame(direct); return; }   // pula a tela de submódulos (ex.: AP)
    setScreen('SUBMODULES'); setCurrentModule(moduleId);
    if (leavingGame) maybeAutoFeedback();
  };

  // ✨ Renderização
  const screenNode = (() => {
    if (screen === 'HOME') {
      return (
        <MainMenu
          onStart={goModules}
          progress={progress}
          onFeedback={openFeedback}
          feedbackResponded={feedbackResponded}
        />
      );
    }

    if (screen === 'MODULES') {
      return (
        <ModuleSelection
          progress={progress}
          onSelectModule={goSubmodule}
          onBack={goHome}
          onFeedback={openFeedback}
          feedbackResponded={feedbackResponded}
        />
      );
    }

    if (screen === 'SUBMODULES') {
      return (
        <SubmoduleSelection
          moduleId={currentModule}
          progress={progress}
          onSelectGame={loadGame}
          onBack={goModules}
        />
      );
    }

    if (screen === 'GAME') {
      const moduleProps = {
        onBack: goSubmodule,
        progress,
        updateProgress,
        showToast,
      };

      const gameNode = (() => {
        switch (currentModule) {
          case 'afd-p1':  return <AFDPart1 {...moduleProps} onBack={() => goSubmodule('afd')} />;
          case 'afd-p2':  return <AFDPart2 {...moduleProps} onBack={() => goSubmodule('afd')} />;
          case 'afd-min': return <AFDMinimizer {...moduleProps} onBack={() => goSubmodule('afd')} />;
          case 'ap-pilha':  return <APPart1  {...moduleProps} onBack={goModules} />;
          case 'word-guess-play': return <WordGuess {...moduleProps} onBack={() => goSubmodule('minigames')} />;
          case 'mt-trans':  return <MTPart1  {...moduleProps} onBack={() => goSubmodule('mt')} />;
          case 'mt-recon':  return <MTReconPart1 {...moduleProps} onBack={() => goSubmodule('mt')} />;
          case 'boss-trabalho': return <BossTrabalho {...moduleProps} onBack={() => goSubmodule('minigames')} />;
          case 'boss-prova':    return <BossProva {...moduleProps} onBack={() => goSubmodule('minigames')} />;
          default:          return <div>Módulo não encontrado</div>;
        }
      })();

      return (
        <Suspense fallback={<LoadingScreen />}>
          {gameNode}
        </Suspense>
      );
    }

    return <LoadingScreen />;
  })();

  // Banner de consentimento: overlay NÃO bloqueante (o jogo segue visível/jogável
  // por trás). Só o botão "Aceito" chama grantConsent(); fechar no ✕ apenas oculta.
  return (
    <>
      {screenNode}
      {!consented && <ConsentGate onAccept={() => setConsented(true)} />}
      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={() => setFeedbackResponded(true)}
        />
      )}
    </>
  );
}

// ✨ Seleção de Módulos Principais
function ModuleSelection({ progress, onSelectModule, onBack, onFeedback, feedbackResponded }) {
  // Contador de estrelas por módulo (soma os submódulos de cada um). Mesmas
  // fontes/chaves da tela de submódulos, agregadas em services/starTotals.
  const p2Progress = (() => {
    try { return JSON.parse(localStorage.getItem('turinglab_progress_p2') || '{}'); }
    catch { return {}; }
  })();
  const earned = moduleEarnedStars(progress, p2Progress);
  // Boss (Trabalho + Prova) tem chaves próprias, agregadas aqui.
  const bossTotal  = (BOSS_TRABALHO_EXERCISES.length + BOSS_PROVA_EXERCISES.length) * 3;
  const bossEarned =
    BOSS_TRABALHO_EXERCISES.reduce((s, ex) => s + (progress[`boss-trabalho-${ex.bossId}`]?.stars || 0), 0) +
    BOSS_PROVA_EXERCISES.reduce((s, ex) => s + (progress[`boss-prova-${ex.bossId}`]?.stars || 0), 0);
  // Minigame "Menor Palavra": estrela binária por exercício (0 ou 1) — soma
  // simples das chaves word-guess-* já conquistadas.
  const wordGuessEarned = Object.keys(progress)
    .filter(k => k.startsWith('word-guess-') && (progress[k]?.stars || 0) > 0).length;

  const modules = [
    { id: 'afd',     badge: 'AFD',   label: 'Autômatos Finitos',    icon: '🤖', color: '#60a5fa',
      desc: 'Desenhe, analise e minimize AFDs', earned: earned.afd, total: AFD_MODULE_MAX },
    { id: 'ap',      badge: 'AP',    label: 'Autômatos com Pilha',  icon: '📚', color: '#a78bfa',
      desc: 'Reconhecimento com memória (pilha)', earned: earned.ap, total: AP_MODULE_MAX },
    { id: 'mt',      badge: 'MT',    label: 'Máquinas de Turing',   icon: '⚙️', color: '#f97316',
      desc: 'Modelos Reconhecedora e Transdutora', earned: earned.mt, total: MT_MODULE_MAX },
    { id: 'minigames', badge: 'MINI', label: 'Mini-Games',          icon: '🎮', color: '#2dd4bf',
      desc: 'Desafios extras: Trabalho, Prova e Menor Palavra', earned: bossEarned + wordGuessEarned, total: bossTotal + TOTAL_WORD_EXERCISE_COUNT },
  ];

  return (
    <div className="nav-screen">
      <div className="nav-header">
        <button className="back-btn" onClick={onBack}>⬅ Voltar</button>
        <h1 className="menu-title" style={{ margin: 0 }}>TuringLab</h1>
        <div style={{ flex: 1 }} />
      </div>
      <div className="nav-section-label">Escolha um Módulo</div>
      <div className="module-cards">
        {modules.map(mod => (
          <button
            key={mod.id}
            className="module-card-neo"
            style={{ '--mc': mod.color }}
            onClick={() => !mod.locked && onSelectModule(mod.id)}
            disabled={!!mod.locked}
          >
            {mod.locked && <span className="nav-ribbon">Em breve!</span>}
            <div className="module-card-icon">{mod.icon}</div>
            <div className="module-card-name">
              <span className="module-badge-tag">{mod.badge}</span>
              {mod.label}
            </div>
            <div className="module-card-desc">{mod.desc}</div>
            {!mod.locked && (
              <ModuleProgress earned={mod.earned || 0} total={mod.total || 0} />
            )}
            {!mod.locked && (
              <div className="module-card-cta" style={{ background: mod.color }}>
                Entrar →
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Botão flutuante de feedback (position:fixed — não afeta o layout) */}
      <FeedbackButton onOpen={onFeedback} responded={feedbackResponded} />
    </div>
  );
}

function ModuleProgress({ earned, total }) {
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  const complete = earned === total && total > 0;
  return (
    <div className="module-progress">
      <span className="module-progress-text">⭐ {earned} / {total}</span>
      <div className="module-progress-bar-bg">
        <div
          className={`module-progress-bar-fill${complete ? ' complete' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ✨ Seleção de Submódulos
function SubmoduleSelection({ moduleId, progress, onSelectGame, onBack }) {
  const p2Progress = (() => {
    try { return JSON.parse(localStorage.getItem('turinglab_progress_p2') || '{}'); }
    catch { return {}; }
  })();

  // AFD_1 e AFD_2 têm listas de disponíveis diferentes desde que L14 (imposível
  // em AFD, ver L14.js) passou a ser jogável só em AFD_1: entra no total de P1,
  // mas continua bloqueada (fora do total) em P2. O máximo por nível também não
  // é mais fixo em 3 — L14 vale no máximo 1 estrela (LEVEL_DIFFICULTY 'impossible').
  const maxStarsFor = id => LEVEL_DIFFICULTY[id] === 'impossible' ? 1 : 3;
  const p1LevelIds = LEVEL_IDS.filter(id => !UNAVAILABLE_LEVELS.has(id) && !HIDDEN_LEVELS.has(id));
  const p2LevelIds = LEVEL_IDS.filter(id => !UNAVAILABLE_LEVELS.has(id) && !HIDDEN_LEVELS.has(id) && !UNAVAILABLE_LEVELS_P2_ONLY.has(id));
  const p1Total  = p1LevelIds.reduce((s, id) => s + maxStarsFor(id), 0);
  const p1Earned = p1LevelIds.reduce((s, id) => s + (progress[id]?.stars || 0), 0);
  const p2Total  = p2LevelIds.reduce((s, id) => s + maxStarsFor(id), 0);
  const p2Earned = p2LevelIds.reduce((s, id) => s + (p2Progress[id]?.stars || 0), 0);
  const minTotal  = EXERCISES.length * 3;
  const minEarned = EXERCISES.reduce((s, ex) => s + (progress[`afd-min-${ex.id}`]?.stars || 0), 0);
  const mtReconTotal  = MT_RECON_LEVEL_IDS.length * 3;
  const mtReconEarned = MT_RECON_LEVEL_IDS.reduce((s, id) => s + (progress[`mt-recon-${id}`]?.stars || 0), 0);
  const mtTransTotal  = MT_LEVEL_IDS.length * 3;
  const mtTransEarned = MT_LEVEL_IDS.reduce((s, id) => s + (progress[`mt-trans-${id}`]?.stars || 0), 0);
  const bossTrabalhoTotal  = BOSS_TRABALHO_EXERCISES.length * 3;
  const bossTrabalhoEarned = BOSS_TRABALHO_EXERCISES.reduce((s, ex) => s + (progress[`boss-trabalho-${ex.bossId}`]?.stars || 0), 0);
  const bossProvaTotal  = BOSS_PROVA_EXERCISES.length * 3;
  const bossProvaEarned = BOSS_PROVA_EXERCISES.reduce((s, ex) => s + (progress[`boss-prova-${ex.bossId}`]?.stars || 0), 0);
  const wordGuessEarned = Object.keys(progress)
    .filter(k => k.startsWith('word-guess-') && (progress[k]?.stars || 0) > 0).length;

  const submodules = {
    afd: [
      { id: 'afd-p1',  icon: '🎨', label: 'Desenhar & Formalizar',
        desc: 'Construa autômatos do zero no canvas interativo', color: '#fde68a',
        earned: p1Earned, total: p1Total },
      { id: 'afd-p2',  icon: '📊', label: 'Grafo → Linguagem',
        desc: 'Analise um grafo pronto e identifique a linguagem', color: '#bfdbfe',
        earned: p2Earned, total: p2Total },
      { id: 'afd-min', icon: '⚡', label: 'Minimização',
        desc: `${EXERCISES.length} exercícios de otimização`, color: '#bbf7d0',
        earned: minEarned, total: minTotal },
    ],
    mt: [
      { id: 'mt-recon', icon: '🔍', label: 'Reconhecedora', desc: 'Desenhe a MT e valide se aceita a linguagem',
        color: '#c7d2fe', earned: mtReconEarned, total: mtReconTotal },
      { id: 'mt-trans', icon: '🔄', label: 'Transdutora',   desc: 'Desenhe a MT e valide', color: '#fed7aa',
        earned: mtTransEarned, total: mtTransTotal },
    ],
    minigames: [
      { id: 'boss-trabalho', icon: '📝', label: 'Trabalho',
        desc: '5 exercícios já vistos, numa grade própria', color: '#fecaca',
        earned: bossTrabalhoEarned, total: bossTrabalhoTotal },
      { id: 'boss-prova', icon: '🎓', label: 'Prova',
        desc: `${BOSS_PROVA_EXERCISES.length} questões da última prova, numa grade própria`, color: '#c7d2fe',
        earned: bossProvaEarned, total: bossProvaTotal },
      { id: 'word-guess-play', icon: '🔤', label: 'Menor Palavra',
        desc: 'Descubra a menor palavra de exercícios de todos os módulos', color: '#99f6e4',
        earned: wordGuessEarned, total: TOTAL_WORD_EXERCISE_COUNT },
    ],
  };

  const MOD_META = {
    afd: { label: 'Autômatos Finitos',   icon: '🤖', color: '#60a5fa' },
    ap:  { label: 'Autômatos com Pilha', icon: '📚', color: '#a78bfa' },
    mt:  { label: 'Máquinas de Turing',  icon: '⚙️', color: '#f97316' },
    minigames: { label: 'Mini-Games', icon: '🎮', color: '#2dd4bf' },
  };
  const meta    = MOD_META[moduleId] || { label: moduleId, icon: '❓', color: '#ccc' };
  const current = submodules[moduleId] || [];

  return (
    <div className="nav-screen">
      <div className="nav-header">
        <button className="back-btn" onClick={onBack}>⬅ Voltar</button>
        <span className="nav-title-badge" style={{ background: meta.color }}>
          {meta.icon} {meta.label}
        </span>
        <div style={{ flex: 1 }} />
      </div>
      <div className="nav-section-label">Escolha uma Atividade</div>
      <div className="submodule-cards">
        {current.map(sub => (
          <button
            key={sub.id}
            className="submodule-card-neo"
            style={{ '--sc': sub.color || '#f3f4f6' }}
            onClick={() => !sub.locked && onSelectGame(sub.id)}
            disabled={!!sub.locked}
          >
            {sub.locked && <span className="nav-ribbon">Em breve!</span>}
            <div className="submodule-card-icon">{sub.icon}</div>
            <div className="submodule-card-name">{sub.label}</div>
            <div className="submodule-card-desc">{sub.desc}</div>
            {!sub.locked && (
              <ModuleProgress earned={sub.earned || 0} total={sub.total || 0} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
