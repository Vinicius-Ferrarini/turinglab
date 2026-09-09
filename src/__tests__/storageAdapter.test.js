import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeGetItem, safeSetItem, safeRemoveItem } from '../modules/shared/persistence/storageAdapter.js';

// Storage falso (Map em memória) — mesmo padrão do `vitest.config.js`
// (environment: 'node', sem jsdom/localStorage real). Implementa só a
// interface Storage que o adapter usa.
function makeFakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    _map: map,
  };
}

let warnSpy;
beforeEach(() => { warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
afterEach(() => { warnSpy.mockRestore(); });

// ─── Suite 1: safeGetItem ──────────────────────────────────────────────────
describe('safeGetItem', () => {
  it('chave ausente → null', () => {
    const storage = makeFakeStorage();
    expect(safeGetItem('k', storage)).toBeNull();
  });

  it('chave presente com JSON válido → objeto parseado', () => {
    const storage = makeFakeStorage();
    storage.setItem('k', JSON.stringify({ a: 1 }));
    expect(safeGetItem('k', storage)).toEqual({ a: 1 });
  });

  it('leitura corrompida (JSON.parse falha) → null, sem lançar', () => {
    const storage = makeFakeStorage();
    storage.setItem('k', '{ isto não é json válido');
    expect(() => safeGetItem('k', storage)).not.toThrow();
    expect(safeGetItem('k', storage)).toBeNull();
  });

  it('storage.getItem lança (ex.: localStorage desabilitado) → null, sem lançar', () => {
    const storage = { getItem: () => { throw new Error('SecurityError: acesso negado'); } };
    expect(() => safeGetItem('k', storage)).not.toThrow();
    expect(safeGetItem('k', storage)).toBeNull();
  });

  it('storage ausente/undefined → null, sem lançar', () => {
    expect(() => safeGetItem('k', undefined)).not.toThrow();
    expect(safeGetItem('k', undefined)).toBeNull();
    expect(() => safeGetItem('k', null)).not.toThrow();
    expect(safeGetItem('k', null)).toBeNull();
  });
});

// ─── Suite 2: safeSetItem ──────────────────────────────────────────────────
describe('safeSetItem', () => {
  it('grava com sucesso → true, valor recuperável via safeGetItem', () => {
    const storage = makeFakeStorage();
    expect(safeSetItem('k', { a: 1 }, storage)).toBe(true);
    expect(safeGetItem('k', storage)).toEqual({ a: 1 });
  });

  it('storage.setItem lança (quota excedida) → false, engolido com log, não derruba o chamador', () => {
    const storage = { setItem: () => { throw new DOMException('QuotaExceededError'); } };
    expect(() => safeSetItem('k', { a: 1 }, storage)).not.toThrow();
    expect(safeSetItem('k', { a: 1 }, storage)).toBe(false);
    expect(warnSpy).toHaveBeenCalled();
  });

  it('storage ausente/undefined → false, sem lançar', () => {
    expect(() => safeSetItem('k', { a: 1 }, undefined)).not.toThrow();
    expect(safeSetItem('k', { a: 1 }, undefined)).toBe(false);
  });

  it('valor não serializável (referência circular) → false, sem lançar', () => {
    const storage = makeFakeStorage();
    const circular = {};
    circular.self = circular;
    expect(() => safeSetItem('k', circular, storage)).not.toThrow();
    expect(safeSetItem('k', circular, storage)).toBe(false);
  });
});

// ─── Suite 3: safeRemoveItem ────────────────────────────────────────────────
describe('safeRemoveItem', () => {
  it('remove chave existente → true, some do storage', () => {
    const storage = makeFakeStorage();
    storage.setItem('k', JSON.stringify({ a: 1 }));
    expect(safeRemoveItem('k', storage)).toBe(true);
    expect(safeGetItem('k', storage)).toBeNull();
  });

  it('storage.removeItem lança → false, sem lançar', () => {
    const storage = { removeItem: () => { throw new Error('boom'); } };
    expect(() => safeRemoveItem('k', storage)).not.toThrow();
    expect(safeRemoveItem('k', storage)).toBe(false);
  });

  it('storage ausente/undefined → false, sem lançar', () => {
    expect(() => safeRemoveItem('k', undefined)).not.toThrow();
    expect(safeRemoveItem('k', undefined)).toBe(false);
  });
});
