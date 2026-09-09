import { describe, it, expect } from 'vitest';
import {
  MAX_IMPORT_FILE_BYTES,
  buildExportFilename,
  checkFileSize,
  checkPayloadSanity,
  parseImportedSnapshot,
  describeImportError,
} from '../modules/shared/persistence/exportImportFile.js';
import { buildSnapshot } from '../modules/shared/persistence/sessionSnapshot.js';

const afdPayload = {
  nodes: [{ id: 'q0', label: 'q0', x: 0, y: 0, isInitial: true, isFinal: false }],
  transitions: [],
  testWords: [],
  isDrawingUnlocked: false,
  hintStage: 0,
  showVictoryScreen: false,
  showImpossibleScreen: false,
  formal: { inputQ: '', inputSigma: '', inputInitial: '', inputFinal: '', areElementsValid: false, parsedQ: [], parsedSigma: [], transitionTableData: {} },
};

// ─── Suite 1: buildExportFilename ─────────────────────────────────────────────
describe('buildExportFilename', () => {

  it('segue o padrão turinglab_<moduleKey>_<levelId>_<timestamp>.json', () => {
    const name = buildExportFilename('afd-p1', 12, new Date('2026-09-09T12:00:00.000Z'));
    expect(name).toMatch(/^turinglab_afd-p1_12_.+\.json$/);
  });

  it('nomes gerados em instantes diferentes são diferentes (timestamp muda)', () => {
    const n1 = buildExportFilename('ap', 1, new Date('2026-01-01T00:00:00.000Z'));
    const n2 = buildExportFilename('ap', 1, new Date('2026-01-01T00:00:01.000Z'));
    expect(n1).not.toBe(n2);
  });

});

// ─── Suite 2: checkFileSize — rejeita ANTES de qualquer parse ─────────────────
describe('checkFileSize', () => {

  it('arquivo dentro do limite → ok', () => {
    expect(checkFileSize(1024)).toEqual({ ok: true });
  });

  it('arquivo no limite exato → ok', () => {
    expect(checkFileSize(MAX_IMPORT_FILE_BYTES)).toEqual({ ok: true });
  });

  it('arquivo acima do limite → ok:false, file_too_large', () => {
    const res = checkFileSize(MAX_IMPORT_FILE_BYTES + 1);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('file_too_large');
  });

  it('arquivo absurdamente grande (ex.: 500MB) → rejeitado, nunca lança', () => {
    expect(() => checkFileSize(500 * 1024 * 1024)).not.toThrow();
    expect(checkFileSize(500 * 1024 * 1024).ok).toBe(false);
  });

});

// ─── Suite 3: checkPayloadSanity — profundidade/tamanho de array absurdos ─────
describe('checkPayloadSanity', () => {

  it('payload normal (shape de um snapshot real) → ok', () => {
    expect(checkPayloadSanity(afdPayload)).toEqual({ ok: true });
  });

  it('array com 150 entradas (fixture grande de MT, ver sessionSnapshot.test.js) → ok, não trunca/rejeita', () => {
    const bigArray = Array.from({ length: 150 }, (_, i) => ({ word: `w${i}`, status: 'ACCEPTED' }));
    expect(checkPayloadSanity({ linguagemTests: bigArray })).toEqual({ ok: true });
  });

  it('array absurdamente grande (ex.: 100000 entradas) → ok:false, array_too_large', () => {
    const huge = new Array(100000).fill(0);
    const res = checkPayloadSanity({ transitions: huge });
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('array_too_large');
  });

  it('aninhamento absurdamente profundo (JSON-bomb) → ok:false, too_deep, sem estourar a pilha', () => {
    let bomb = { leaf: true };
    for (let i = 0; i < 5000; i++) bomb = { nested: bomb };
    expect(() => checkPayloadSanity(bomb)).not.toThrow();
    const res = checkPayloadSanity(bomb);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('too_deep');
  });

});

// ─── Suite 4: parseImportedSnapshot — só JSON.parse, nunca eval ───────────────
describe('parseImportedSnapshot', () => {

  it('roundtrip válido: snapshot serializado → parseado de volta idêntico', () => {
    const snap = buildSnapshot('afd-p1', 12, afdPayload);
    const text = JSON.stringify(snap);
    const res = parseImportedSnapshot(text, 'afd-p1', 12);
    expect(res.ok).toBe(true);
    expect(res.snapshot.payload).toEqual(afdPayload);
  });

  it('JSON corrompido (tecnicamente inválido) → ok:false, invalid_json, sem lançar', () => {
    expect(() => parseImportedSnapshot('{ isto não é json', 'afd-p1', 12)).not.toThrow();
    const res = parseImportedSnapshot('{ isto não é json', 'afd-p1', 12);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('invalid_json');
    expect(res.snapshot).toBeUndefined();
  });

  it('schema errado (schemaVersion incompatível) → ok:false, sem aplicar nada', () => {
    const snap = buildSnapshot('afd-p1', 12, afdPayload);
    snap.schemaVersion = 999;
    const res = parseImportedSnapshot(JSON.stringify(snap), 'afd-p1', 12);
    expect(res.ok).toBe(false);
    expect(res.snapshot).toBeUndefined();
  });

  it('moduleKey de outro módulo (arquivo do AP importado numa fase de AFD) → ok:false', () => {
    const snap = buildSnapshot('ap', 12, { nodes: [], transitions: [], testedWords: [], isDrawingUnlocked: false, hintStage: 0, testMode: 'LANGUAGE', victory: false, formal: {} });
    const res = parseImportedSnapshot(JSON.stringify(snap), 'afd-p1', 12);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('module_mismatch');
    expect(res.snapshot).toBeUndefined();
  });

  it('levelId diferente do nível atualmente aberto → ok:false, level_mismatch', () => {
    const snap = buildSnapshot('afd-p1', 5, afdPayload);
    const res = parseImportedSnapshot(JSON.stringify(snap), 'afd-p1', 6);
    expect(res.ok).toBe(false);
    expect(res.reason).toBe('level_mismatch');
    expect(res.snapshot).toBeUndefined();
  });

  it('payload com array absurdo → ok:false, nunca aplica parcialmente', () => {
    const snap = buildSnapshot('afd-p1', 12, { ...afdPayload, testWords: new Array(100000).fill({ word: 'a', status: 'wrong' }) });
    const res = parseImportedSnapshot(JSON.stringify(snap), 'afd-p1', 12);
    expect(res.ok).toBe(false);
    expect(res.snapshot).toBeUndefined();
  });

  it('nunca usa eval/new Function — string contendo código malicioso é tratada só como dado', () => {
    // Se parseImportedSnapshot usasse eval, isto executaria o construtor Error.
    const malicious = '{"schemaVersion":1,"app":"turinglab","moduleKey":"afd-p1","levelId":12,"payload":{"nodes":"1); throw new Error(\'exploited\'); (\'"}}';
    expect(() => parseImportedSnapshot(malicious, 'afd-p1', 12)).not.toThrow();
  });

});

// ─── Suite 5: describeImportError — mensagem de toast por motivo ──────────────
describe('describeImportError', () => {

  it('cada reason conhecido tem uma mensagem específica não genérica', () => {
    const reasons = [
      'file_too_large', 'invalid_json', 'too_deep', 'array_too_large',
      'not_an_object', 'bad_payload_shape', 'unexpected_payload_field',
      'unknown_module_key', 'schema_version_mismatch', 'bad_app',
      'module_mismatch', 'level_mismatch', 'no_file', 'read_error',
    ];
    const messages = reasons.map(describeImportError);
    expect(new Set(messages).size).toBeGreaterThan(1); // não são todas a mesma string genérica
    for (const msg of messages) expect(typeof msg).toBe('string');
  });

  it('module_mismatch avisa especificamente que é de outro módulo', () => {
    expect(describeImportError('module_mismatch')).toMatch(/outro módulo/i);
  });

  it('level_mismatch avisa especificamente que é de outra fase', () => {
    expect(describeImportError('level_mismatch')).toMatch(/outra fase/i);
  });

  it('reason desconhecido/undefined → mensagem genérica, nunca lança', () => {
    expect(() => describeImportError(undefined)).not.toThrow();
    expect(() => describeImportError('algo_novo_nunca_visto')).not.toThrow();
    expect(typeof describeImportError(undefined)).toBe('string');
  });

});
