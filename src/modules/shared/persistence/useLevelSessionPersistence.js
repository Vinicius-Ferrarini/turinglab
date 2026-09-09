// ─── useLevelSessionPersistence: autosave de sessão por (módulo, fase) ───────
// Hook fino: só o efeito de autosave debounced. A HIDRATAÇÃO é imperativa —
// readLevelSession() é uma função pura (não-hook) chamada pelo orquestrador
// dentro de loadLevel, DEPOIS do reset em branco que já existe (ver ADR 0011
// e §4 do prompt original) — não dá pra hidratar de dentro de um useEffect
// genérico porque MTReconPart1/MTPart1 só sabem o levelId depois de um
// `await` (import() dinâmico do nível), e cada módulo aplica os campos
// restaurados nos seus próprios setters/reducers de formas diferentes.
//
// Sem teste unitário próprio (hook React com localStorage/timers) — cobertura
// via Playwright (item 6 do plano). A lógica pura que ele orquestra
// (sessionSnapshot.js/storageAdapter.js) já é testada isoladamente.
import { useEffect, useRef, useCallback } from 'react';
import { buildSnapshot, isValidSnapshot } from './sessionSnapshot.js';
import { safeGetItem, safeSetItem, safeRemoveItem } from './storageAdapter.js';

const AUTOSAVE_DEBOUNCE_MS = 500;
const STORAGE_PREFIX = 'turinglab_session_v1';

export function sessionStorageKey(moduleKey, levelId) {
  return `${STORAGE_PREFIX}:${moduleKey}:${levelId}`;
}

/**
 * Leitura síncrona e validada de uma sessão salva. Retorna o `payload` (não o
 * envelope) se existir e for válido para este (moduleKey, levelId); `null`
 * caso contrário (nunca lança — nunca trava o loadLevel).
 */
export function readLevelSession(moduleKey, levelId, storage) {
  if (moduleKey == null || levelId == null) return null;
  const raw = safeGetItem(sessionStorageKey(moduleKey, levelId), storage);
  if (raw == null) return null;
  const res = isValidSnapshot(raw, moduleKey, levelId);
  if (!res.ok) return null;
  return raw.payload;
}

/** Apaga a sessão salva de uma fase — usado ao sair pelo EndScreen (vitória/impossível). */
export function clearLevelSession(moduleKey, levelId, storage) {
  if (moduleKey == null || levelId == null) return;
  safeRemoveItem(sessionStorageKey(moduleKey, levelId), storage);
}

/**
 * Autosave debounced (~500ms): grava `payload` (objeto memoizado pelo
 * chamador — useMemo no orquestrador) sob a chave de (moduleKey, levelId)
 * sempre que ele muda. Não valida o grafo (nunca deve — ver ADR 0011).
 * Retorna `clearSession()` pro orquestrador chamar no gatilho de limpeza
 * (EndScreen: onMenu/onNext após vitória/impossível).
 */
export default function useLevelSessionPersistence({ moduleKey, levelId, payload, levelLabel, storage }) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (moduleKey == null || levelId == null || payload == null) return undefined;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      safeSetItem(sessionStorageKey(moduleKey, levelId), buildSnapshot(moduleKey, levelId, payload, levelLabel), storage);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [moduleKey, levelId, payload, levelLabel, storage]);

  const clearSession = useCallback(() => {
    clearTimeout(timerRef.current);
    clearLevelSession(moduleKey, levelId, storage);
  }, [moduleKey, levelId, storage]);

  return { clearSession };
}
