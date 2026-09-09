// ─── GameHeader: cabeçalho da tela de jogo ───────────────────────────────────
// Compartilhado entre AFD e AP. Botões de sidebar/voltar, objetivo (fórmula ou
// linguagem) + atalho de Aula Guiada (e, opcionalmente, um 2º botão de ação —
// usado pelo AP para "Descrição Formal"), rótulo de dificuldade e estrelas.
// CSS: .game-header em AFDPart1.css (reusado também pelo AP).
//
// Props exclusivas do AFD (`toggleSidebar`) e do AP (`secondaryAction`) são
// opcionais — omitidas, o header se comporta exatamente como antes.
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './GameHeader.css';
import { SvgStars } from '../SvgStar';
import { navBtnStyle, navBtnDisabledStyle } from './navButtonStyles';

export default function GameHeader({
  // Dados do nível (genéricos): objective = texto mostrado como "Objetivo".
  objective, label, diffColor, stars = 0, starsMax = 3,
  isFirst, isLast,
  progress, currentLevel, // legado (AFD): se objective/stars não vierem prontos, derivamos daqui
  toggleSidebar, onBack, onPrevLevel, onNextLevel,
  // Aula guiada: mostrada só se hasLesson (AFD passa currentLevel.guidedLesson).
  // lessonToggleMode 'badge' (AFD, default): botão fica opaco + badge ✕ flutuante
  // fecha a aula. 'swap' (AP): o próprio botão vira "✕ Sair da Aula" clicável.
  hasLesson, onStartLesson, lessonActive, onCloseLesson, lessonLabel = '👨‍🏫 Aula',
  lessonActiveLabel, lessonToggleMode = 'badge', lessonDisabled = false,
  // Ação secundária opcional (AP: "📝 Descrição Formal"). Omitida no AFD.
  secondaryAction,
  // Dica de tamanho (fase "descubra a menor palavra"): visível só enquanto
  // showSizeHint for true (o módulo pai decide, mesma condição já usada para
  // saber se ainda está na fase de descoberta). onSizeHint calcula e mostra a
  // mensagem (ex.: via showToast) — este componente não sabe o conteúdo dela.
  showSizeHint = false, onSizeHint,
  // Exportar/Importar sessão em .json (Feature B — ver ADR 0011). Duas ações
  // lado a lado (não cabiam no slot único de secondaryAction): mostradas só
  // quando os 2 módulos passam onExportSession/onImportSessionFile — os 4
  // orquestradores-alvo passam sempre os dois juntos. onImportSessionFile
  // recebe o File escolhido no <input type="file"> oculto.
  onExportSession, onImportSessionFile,
  // "🗑 Limpar Fase" (ADR 0012): apaga o estado salvo da fase (nunca as
  // estrelas), com confirmação num balão (Sim verde/Não vermelho). Mostrado
  // só quando o módulo passa onClearSession — os 4 orquestradores-alvo
  // sempre passam.
  onClearSession,
}) {
  const importFileInputRef = useRef(null);
  const clearBtnRef = useRef(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmClearPos, setConfirmClearPos] = useState(null);
  // O balão precisa ir num portal pro <body> — renderizado dentro do header
  // (z-index:10), qualquer overlay de tela cheia com z-index igual ou maior
  // que apareça DEPOIS no DOM (ex.: .locked-overlay da grade "descubra a
  // menor palavra") cobriria o balão e bloquearia o clique em Sim/Não,
  // mesmo com um z-index local mais alto — stacking context não escapa do
  // header sem portal. Posição calculada a partir do botão (getBoundingClientRect).
  const toggleConfirmClear = () => {
    if (!confirmClearOpen) {
      const rect = clearBtnRef.current?.getBoundingClientRect();
      if (rect) setConfirmClearPos({ top: rect.bottom + 8, left: rect.right - 220 });
    }
    setConfirmClearOpen(o => !o);
  };
  const objectiveText = objective ?? currentLevel?.formula ?? '';
  const levelLabel = label ?? currentLevel?.label;
  const diffBg = diffColor ?? '#fff';
  const starsCount = progress ? (progress[currentLevel?.id]?.stars || 0) : stars;
  const showLesson = hasLesson ?? !!currentLevel?.guidedLesson;

  return (
    <header className="game-header">
      <div className="header-left">
        {toggleSidebar && (
          <button className="sidebar-toggle" onClick={toggleSidebar} title="Abrir Descrição Formal">☰</button>
        )}
        <button className="back-btn" onClick={onBack}>⬅ Voltar</button>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
        <span className="mission-label">Objetivo</span>
        <div className="mission-formula">{objectiveText}</div>
        {showLesson && lessonToggleMode === 'swap' && (
          <button
            className="menu-btn"
            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6, opacity: lessonDisabled ? 0.5 : 1, cursor: lessonDisabled ? 'not-allowed' : 'pointer' }}
            onClick={lessonActive ? onCloseLesson : onStartLesson}
            disabled={lessonDisabled}
          >
            {lessonActive ? (lessonActiveLabel ?? lessonLabel) : lessonLabel}
          </button>
        )}
        {showLesson && lessonToggleMode === 'badge' && (
          <div style={{ position: 'relative', display: 'inline-block', marginLeft: 6 }}>
            <button
              className="menu-btn"
              style={{ padding: '4px 12px', fontSize: 12, opacity: lessonActive ? 0.5 : 1, cursor: lessonActive ? 'default' : 'pointer' }}
              onClick={lessonActive ? undefined : onStartLesson}
              title={lessonActive ? undefined : 'Assistir demonstração passo a passo'}
            >
              {lessonLabel}
            </button>
            {lessonActive && (
              <span
                onClick={onCloseLesson}
                title="Fechar aula"
                style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 16, height: 16,
                  background: '#ef4444', border: '2px solid #000', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 900, color: '#fff',
                  cursor: 'pointer',
                }}>✕</span>
            )}
          </div>
        )}
        {showSizeHint && (
          <button
            className="menu-btn"
            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6 }}
            onClick={onSizeHint}
            title="Dica sobre o tamanho da menor palavra"
          >
            💡 Dica
          </button>
        )}
        {secondaryAction && (
          <button
            className="menu-btn"
            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6, opacity: secondaryAction.disabled ? 0.5 : 1, cursor: secondaryAction.disabled ? 'not-allowed' : 'pointer' }}
            onClick={secondaryAction.disabled ? undefined : secondaryAction.onClick}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.label}
          </button>
        )}
        {onExportSession && (
          <button
            className="menu-btn"
            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6 }}
            onClick={onExportSession}
            title="Baixar o estado desta fase em .json"
          >
            ⬇ Exportar
          </button>
        )}
        {onImportSessionFile && (
          <>
            <button
              className="menu-btn"
              style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6 }}
              onClick={() => importFileInputRef.current?.click()}
              title="Importar um .json salvo antes (mesma fase)"
            >
              ⬆ Importar
            </button>
            <input
              ref={importFileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = ''; // permite reimportar o mesmo arquivo em seguida
                if (file) onImportSessionFile(file);
              }}
            />
          </>
        )}
        {onClearSession && (
          <button
            ref={clearBtnRef}
            className="menu-btn"
            style={{ padding: '4px 12px', fontSize: 12, marginLeft: 6 }}
            onClick={toggleConfirmClear}
            title="Apagar o estado salvo desta fase (mantém as estrelas)"
          >
            🗑 Limpar Fase
          </button>
        )}
      </div>
      {onClearSession && confirmClearOpen && confirmClearPos && createPortal(
        <div style={{
          position: 'fixed', top: confirmClearPos.top, left: confirmClearPos.left, zIndex: 99999,
          width: 220, padding: '12px 14px',
          background: '#fff9c4', border: '3px solid #000', borderRadius: 12,
          boxShadow: '4px 4px 0 #000',
          fontFamily: 'var(--font-comic)',
        }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#000', lineHeight: 1.3 }}>
            Isso vai apagar os dados da fase
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              onClick={() => setConfirmClearOpen(false)}
              style={{
                padding: '5px 14px', fontSize: 12, fontWeight: 900,
                background: 'var(--accent-red)', border: '2px solid #000', borderRadius: 7,
                boxShadow: '2px 2px 0 #000', cursor: 'pointer', color: '#000',
              }}
            >
              Não
            </button>
            <button
              onClick={() => { setConfirmClearOpen(false); onClearSession(); }}
              style={{
                padding: '5px 14px', fontSize: 12, fontWeight: 900,
                background: 'var(--accent-green)', border: '2px solid #000', borderRadius: 7,
                boxShadow: '2px 2px 0 #000', cursor: 'pointer', color: '#000',
              }}
            >
              Sim
            </button>
          </div>
        </div>,
        document.body
      )}
      <div style={{ width: 180, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            style={isFirst ? navBtnDisabledStyle : navBtnStyle}
            onClick={onPrevLevel}
            disabled={isFirst}
            title="Fase anterior"
          >◀</button>
          <span className="mission-label" style={{ background: diffBg }}>{levelLabel}</span>
          <button
            style={isLast ? navBtnDisabledStyle : navBtnStyle}
            onClick={onNextLevel}
            disabled={isLast}
            title="Próxima fase"
          >▶</button>
        </div>
        <SvgStars count={starsCount} size={15} max={starsMax} />
      </div>
    </header>
  );
}
