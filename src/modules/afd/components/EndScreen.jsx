// ─── EndScreen: overlay de fim de fase (Vitória / Impossível) ────────────────
// Tela cheia com Maurílio + balão e botões "Voltar ao Menu" / "Próxima". Usada
// tanto na vitória quanto no caso "impossível com AFD". Mantém o visual gibi.
import { AFD_LEVELS as GAME_LEVELS } from '../../../levels_data/afd/index.js';
import imgMaurilioExplicando from '../../../assets/maurilio3_explicando.webp';
import imgBalaoFala          from '../../../assets/balao_fala_redondo.webp';

export default function EndScreen({
  currentLevelId, nextLevel, message, balloon, textStyle, nextPrefix, onMenu, onNext,
  // ADR 0012: onExport reaproveita o MESMO handler do GameHeader (exportar
  // funciona igual, em qualquer um dos 2 lugares); onAccessBoard fecha este
  // overlay SEM navegar nem limpar nada — necessário porque este overlay
  // cobre o GameHeader por baixo (position:fixed;inset:0), e sem sair
  // limpando automaticamente (ver ADR 0012), reabrir uma fase já
  // vencida/impossível sempre reabre esta tela — sem este botão, o
  // GameHeader (Exportar/Importar/Limpar) ficaria inacessível pra sempre
  // nessas fases. Ambos opcionais — omitidos, os botões somem, sem quebrar
  // quem ainda não os passa.
  onExport, onAccessBoard,
}) {
  // `nextLevel` (opcional) sobrepõe o cálculo via GAME_LEVELS — usado por módulos
  // com sua própria lista de fases (ex.: AP). Ausente ⇒ comportamento do AFD.
  const idx  = GAME_LEVELS.findIndex(l => l.id === currentLevelId);
  const next = nextLevel !== undefined
    ? nextLevel
    : (idx >= 0 && idx < GAME_LEVELS.length - 1 ? GAME_LEVELS[idx + 1] : null);
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:9999,
      display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center' }}>
        <img src={imgMaurilioExplicando} alt="Professor" style={{ height:320, zIndex:2, marginRight:-55 }} />
        <div style={{ position:'relative', width:balloon.width, height:balloon.height, marginTop:balloon.marginTop, zIndex:1 }}>
          <img src={imgBalaoFala} style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1 }} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
            boxSizing:'border-box', color:'#000', fontWeight:900, textAlign:'center', zIndex:2, ...textStyle }}>
            {message}
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:16, marginTop:36, flexWrap:'wrap', justifyContent:'center' }}>
        <button className="menu-btn" onClick={onMenu}
          style={{ padding:'14px 28px', fontSize:20 }}>Voltar ao Menu</button>
        {onExport && (
          <button className="menu-btn" onClick={onExport}
            style={{ padding:'14px 22px', fontSize:16 }} title="Baixar o estado desta fase em .json">
            ⬇ Exportar
          </button>
        )}
        {onAccessBoard && (
          <button className="menu-btn" onClick={onAccessBoard}
            style={{ padding:'14px 22px', fontSize:16 }} title="Fechar e ver o tabuleiro desta fase">
            🎮 Acessar Tabuleiro
          </button>
        )}
        {next && (
          <button className="menu-btn primary" onClick={() => onNext(next)}
            style={{ padding:'14px 28px', fontSize:20 }}>
            {nextPrefix}{next.label}
          </button>
        )}
      </div>
    </div>
  );
}
