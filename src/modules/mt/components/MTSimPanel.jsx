// ─── MTSimPanel: simulação passo a passo da MT, no estilo compacto do
// SimPanel do AFD/APSimPanel (rodapé, veredicto, navegação ◀/▶), com a fita
// visível (TuringTape) em vez da pilha do AP. Reusa .sim-panel-*
// (AFDPart1.css) para o painel + .mt-simp-* (MTReconPart1.css) para o
// wrapper da fita.
import { useEffect, useState } from 'react';
import TuringTape from './TuringTape';
import { BLANK } from '../utils/tmAlgorithms';

const show = (v) => (v === '' || v == null ? '□' : v);

const STATUS_LABEL = { ACCEPTED: '✅ ACEITA', REJECTED: '❌ REJEITADA', LOOP: '⟳ LOOP' };

export default function MTSimPanel({
  configs, word, title, message, maxSteps,
  // headRewound: true/false quando a simulação termina ACCEPTED numa palavra
  // não-vazia (indica se o cabeçote voltou pro 1º caractere — ver
  // docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md); null/undefined quando não se
  // aplica (REJECTED/LOOP, ou palavra vazia). Chegar em estado final SEM
  // recuar não conta como aceitação de verdade — mostra um selo/mensagem
  // dedicados, distintos de ACEITA e de REJEITADA.
  headRewound,
  onHighlight, onClose,
}) {
  const safeConfigs = configs && configs.length > 0
    ? configs
    : [{ tape: [BLANK], head: 0, stateId: null, step: 0, status: 'REJECTED' }];

  const [i, setI] = useState(0);
  const cur  = safeConfigs[Math.min(i, safeConfigs.length - 1)];
  const last = i >= safeConfigs.length - 1;
  const status = last ? cur.status : null;

  // tIdx da transição que trouxe a máquina até este passo (null no passo 0 —
  // configuração inicial, nenhuma transição ainda) — repassado pro canvas
  // destacar/piscar o chip da regra usada (ver MTCanvas.jsx activeTIdx).
  useEffect(() => {
    onHighlight?.(cur.stateId, last ? (status === 'REJECTED' ? 'error' : 'done') : 'active', cur.tIdx);
  }, [cur, last, status, onHighlight]);
  useEffect(() => () => onHighlight?.(null, null, null), [onHighlight]);

  // Travou (não é loop, não terminou em final): não existe transição a partir
  // do estado/símbolo atuais. Distinto de LOOP (rodou até maxSteps sem
  // parar). Pode acontecer já no passo 0 (0 transições disponíveis logo de
  // cara, ou nem sequer há estado inicial) — por isso a checagem de "step
  // inicial" abaixo usa `!isStuck && !isLoop`, não só `cur.step === 0`,
  // senão o travamento imediato ficaria mascarado pela mensagem neutra de
  // "Configuração inicial".
  const isStuck = last && status === 'REJECTED';
  const isLoop  = last && status === 'LOOP';
  const noInitialState = isStuck && cur.stateId == null;
  // Chegou em estado final, mas o cabeçote não voltou pro 1º caractere da
  // palavra — não conta como aceitação de verdade (ver
  // docs/PLAN_CABECOTE_RETORNO_INICIO_MT.md). Distinto de isStuck (não achou
  // transição) e de "aceita de verdade" — selo/mensagem próprios.
  const headNotRewound = last && status === 'ACCEPTED' && headRewound === false;

  return (
    <div className="sim-panel-container">
      <button className="sim-panel-close" onClick={onClose} title="Fechar">✕</button>
      <div className="mt-simp-body">
        {(title || message) && (
          <div className="ap-simp-banner">
            {title && <b>{title}</b>}
            {message && <span>{message}</span>}
          </div>
        )}
        <div className="sim-panel-header">
          <span className="sim-panel-title">🔍 MT</span>
          <div className="sim-word-display">
            {(word || '') === ''
              ? <span className="sim-char">λ</span>
              : word}
          </div>
          {last && (
            <span className={`sim-result-badge ${headNotRewound ? 'head-not-rewound' : status === 'ACCEPTED' ? 'accepted' : 'rejected'}`}>
              {headNotRewound ? '⚠️ CABEÇOTE NÃO VOLTOU' : STATUS_LABEL[status] ?? status}
            </span>
          )}
        </div>

        <div className="sim-panel-body">
          <div className="mt-simp-tape-wrap">
            <TuringTape tape={cur.tape} headPosition={cur.head} compact />
          </div>
          <div className={`sim-current-step ${isStuck || isLoop || headNotRewound ? 'error' : cur.step === 0 ? 'info' : last ? 'done' : 'ok'} ap-simp-step`}>
            {noInitialState ? (
              <>
                <span className="sim-step-icon">❌</span>
                <span>Travou! Nenhum estado inicial (▶) definido na sua MT.</span>
              </>
            ) : isStuck ? (
              <>
                <span className="sim-step-icon">❌</span>
                <span>Travou! Sem transição a partir de <b>{cur.stateId}</b> lendo "{show(cur.tape[cur.head])}".</span>
              </>
            ) : headNotRewound ? (
              <>
                <span className="sim-step-icon">⚠️</span>
                <span>Chegou no estado final <b>{cur.stateId}</b>, mas o cabeçote não voltou pro 1º caractere da palavra — não conta como aceita.</span>
              </>
            ) : isLoop ? (
              <>
                <span className="sim-step-icon">⟳</span>
                <span>Loop! Passou de {maxSteps ?? cur.step} passos sem parar.</span>
              </>
            ) : cur.step === 0 ? (
              <>
                <span className="sim-step-icon">▶</span>
                <span>Configuração inicial — estado <b>{cur.stateId ?? '—'}</b></span>
              </>
            ) : (
              <>
                <span className="sim-step-icon">➡</span>
                <span>Passo {cur.step}: estado <b>{cur.stateId ?? '—'}</b>, lendo "{show(cur.tape[cur.head])}"</span>
              </>
            )}
          </div>
        </div>

        <div className="sim-panel-nav">
          <button className="sim-nav-btn" onClick={() => setI(0)} disabled={i === 0} title="Início">⏮</button>
          <button className="sim-nav-btn" onClick={() => setI(v => Math.max(0, v - 1))} disabled={i === 0}>◀</button>
          <span className="sim-progress">{i} / {safeConfigs.length - 1}</span>
          <button className="sim-nav-btn" onClick={() => setI(v => Math.min(safeConfigs.length - 1, v + 1))} disabled={last}>▶</button>
        </div>
      </div>
    </div>
  );
}
