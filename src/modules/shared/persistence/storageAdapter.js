// ─── storageAdapter: acesso a localStorage nunca quebra a tela ───────────────
// Quota excedida, modo privado, localStorage desabilitado ou indisponível
// (SSR/testes) — nenhum desses cenários pode lançar pro chamador. `storage` é
// injetável (default globalThis.localStorage) pra permitir testar com um Map
// em memória no Vitest (environment: 'node', sem jsdom/localStorage real).
//
// Diferente de um adapter genérico de string, safeGetItem/safeSetItem já
// fazem o JSON.parse/stringify — o único uso deste módulo hoje é ler/escrever
// os envelopes de sessionSnapshot.js.

function resolveStorage(storage) {
  return storage ?? (typeof globalThis !== 'undefined' ? globalThis.localStorage : undefined);
}

/** Lê e faz JSON.parse de `key`. Retorna null em qualquer falha (ausente, corrompido, storage indisponível). */
export function safeGetItem(key, storage) {
  const s = resolveStorage(storage);
  if (!s) return null;
  try {
    const raw = s.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storageAdapter] falha ao ler "${key}":`, err);
    return null;
  }
}

/** Faz JSON.stringify e grava `value` em `key`. Retorna true/false, nunca lança. */
export function safeSetItem(key, value, storage) {
  const s = resolveStorage(storage);
  if (!s) return false;
  try {
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storageAdapter] falha ao gravar "${key}":`, err);
    return false;
  }
}

/** Remove `key`. Retorna true/false, nunca lança. */
export function safeRemoveItem(key, storage) {
  const s = resolveStorage(storage);
  if (!s) return false;
  try {
    s.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[storageAdapter] falha ao remover "${key}":`, err);
    return false;
  }
}
