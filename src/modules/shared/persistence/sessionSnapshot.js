// ─── sessionSnapshot: envelope único (autosave + exportar/importar) ──────────
// Funções puras (sem window/document/localStorage) — reaproveitadas tanto pelo
// autosave em localStorage (useLevelSessionPersistence.js) quanto pelo arquivo
// .json exportado/importado (exportImportFile.js). Ver ADR 0011.
//
// `uid` dos nós NUNCA entra no payload — é regenerado a cada hidratação, ver
// ADR 0011/§2 do prompt original. O grafo é salvo exatamente como está no
// canvas (mesmo estruturalmente inválido) — este arquivo nunca valida a
// CORREÇÃO do autômato, só o SHAPE do envelope/payload.

export const SCHEMA_VERSION = 1;
export const APP_ID = 'turinglab';

// Allowlist de campos por moduleKey — evita que o payload de um módulo "vaze"
// campo de outro (ex.: linguagemTests só existe em mt-trans). Fail closed: um
// campo fora da lista rejeita o snapshot inteiro, em vez de tentar adivinhar.
const MODULE_PAYLOAD_KEYS = {
  'afd-p1':   ['nodes', 'transitions', 'testWords', 'isDrawingUnlocked', 'hintStage', 'showVictoryScreen', 'showImpossibleScreen', 'formal'],
  'ap':       ['nodes', 'transitions', 'testedWords', 'isDrawingUnlocked', 'hintStage', 'testMode', 'victory', 'formal'],
  'mt-recon': ['nodes', 'transitions', 'testedWords', 'isDrawingUnlocked', 'hintStage', 'testMode', 'victory', 'formal'],
  'mt-trans': ['nodes', 'transitions', 'linguagemTests', 'desenhoTests', 'activeTab', 'victory', 'formal'],
};

export const KNOWN_MODULE_KEYS = Object.keys(MODULE_PAYLOAD_KEYS);

/** Monta o envelope { schemaVersion, app, moduleKey, levelId, levelLabel?, savedAt, payload }. */
export function buildSnapshot(moduleKey, levelId, payload, levelLabel = null) {
  const snapshot = {
    schemaVersion: SCHEMA_VERSION,
    app: APP_ID,
    moduleKey,
    levelId,
    savedAt: new Date().toISOString(),
    payload,
  };
  if (levelLabel != null) snapshot.levelLabel = levelLabel;
  return snapshot;
}

/**
 * Valida o SHAPE de um envelope bruto (ex.: vindo de JSON.parse de
 * localStorage ou de um arquivo importado) contra o moduleKey/levelId
 * esperados pela tela atual. Nunca lança — sempre retorna { ok, reason }.
 */
export function isValidSnapshot(raw, expectedModuleKey, expectedLevelId) {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, reason: 'not_an_object' };
  }
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, reason: 'schema_version_mismatch' };
  }
  if (raw.app !== APP_ID) {
    return { ok: false, reason: 'bad_app' };
  }
  if (!MODULE_PAYLOAD_KEYS[raw.moduleKey]) {
    return { ok: false, reason: 'unknown_module_key' };
  }
  if (expectedModuleKey != null && raw.moduleKey !== expectedModuleKey) {
    return { ok: false, reason: 'module_mismatch' };
  }
  if (expectedLevelId != null && raw.levelId !== expectedLevelId) {
    return { ok: false, reason: 'level_mismatch' };
  }
  if (raw.payload === null || typeof raw.payload !== 'object' || Array.isArray(raw.payload)) {
    return { ok: false, reason: 'bad_payload_shape' };
  }
  const allowed = new Set(MODULE_PAYLOAD_KEYS[raw.moduleKey]);
  const extraKey = Object.keys(raw.payload).find(k => !allowed.has(k));
  if (extraKey) {
    return { ok: false, reason: 'unexpected_payload_field' };
  }
  if (raw.payload.nodes !== undefined && !Array.isArray(raw.payload.nodes)) {
    return { ok: false, reason: 'bad_payload_shape' };
  }
  if (raw.payload.transitions !== undefined && !Array.isArray(raw.payload.transitions)) {
    return { ok: false, reason: 'bad_payload_shape' };
  }
  return { ok: true };
}
