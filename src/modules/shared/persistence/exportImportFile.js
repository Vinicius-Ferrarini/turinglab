// ─── exportImportFile: exportar/importar sessão como arquivo .json ───────────
// Reaproveita o MESMO envelope de sessionSnapshot.js (ver ADR 0011) — este
// arquivo cobre só a parte específica de ARQUIVO: nomear/baixar (Blob +
// <a download>) e ler/validar um arquivo importado (FileReader).
//
// Segurança (input de arquivo é sempre não confiável — ver CLAUDE.md):
//   - só JSON.parse, nunca eval/new Function;
//   - tamanho rejeitado ANTES de qualquer leitura/parse (checkFileSize);
//   - shape/schema validado via isValidSnapshot (sessionSnapshot.js);
//   - profundidade/tamanho de array sanity-checados (checkPayloadSanity) —
//     um JSON tecnicamente válido mas absurdo (array gigante, aninhamento
//     profundo demais) é rejeitado antes de ser aplicado a qualquer state.
// Em toda rejeição, `snapshot` fica undefined — nunca aplicar parcialmente.
import { isValidSnapshot } from './sessionSnapshot.js';

export const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024; // 5 MB — folgado para os níveis grandes de MT (ver item 1 do plano)
const MAX_ARRAY_LENGTH = 20000;
const MAX_OBJECT_DEPTH = 20;

/** Nome de arquivo: turinglab_<moduleKey>_<levelId>_<timestamp>.json */
export function buildExportFilename(moduleKey, levelId, date = new Date()) {
  const ts = date.toISOString().replace(/[:.]/g, '-');
  return `turinglab_${moduleKey}_${levelId}_${ts}.json`;
}

/** Checa o tamanho em bytes ANTES de ler/parsear o arquivo. Nunca lança. */
export function checkFileSize(byteSize) {
  if (typeof byteSize !== 'number' || byteSize > MAX_IMPORT_FILE_BYTES) {
    return { ok: false, reason: 'file_too_large' };
  }
  return { ok: true };
}

/**
 * Detecta payload absurdo (array gigante demais ou aninhamento profundo
 * demais) — proteção contra "JSON-bomb" num arquivo tecnicamente válido.
 * Nunca lança nem estoura a pilha (bail out assim que o limite de
 * profundidade é ultrapassado, sem recursar além disso).
 */
export function checkPayloadSanity(value, depth = 0) {
  if (depth > MAX_OBJECT_DEPTH) return { ok: false, reason: 'too_deep' };
  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY_LENGTH) return { ok: false, reason: 'array_too_large' };
    for (const item of value) {
      const res = checkPayloadSanity(item, depth + 1);
      if (!res.ok) return res;
    }
    return { ok: true };
  }
  if (value !== null && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      const res = checkPayloadSanity(value[key], depth + 1);
      if (!res.ok) return res;
    }
    return { ok: true };
  }
  return { ok: true };
}

/**
 * Parseia e valida o conteúdo textual de um arquivo importado contra o
 * (moduleKey, levelId) da fase atualmente aberta. Só usa JSON.parse (nunca
 * eval/new Function). Retorna { ok: true, snapshot } ou { ok: false, reason }
 * — nunca lança, e em rejeição `snapshot` fica undefined (nunca aplicar
 * parcialmente).
 */
export function parseImportedSnapshot(text, expectedModuleKey, expectedLevelId) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid_json' };
  }
  const sanity = checkPayloadSanity(raw);
  if (!sanity.ok) return sanity;
  const res = isValidSnapshot(raw, expectedModuleKey, expectedLevelId);
  if (!res.ok) return res;
  return { ok: true, snapshot: raw };
}

/**
 * Baixa `snapshot` como arquivo .json (Blob + <a download>). Glue de
 * navegador só — sem lógica de validação. Retorna true/false, nunca lança.
 */
export function downloadSnapshotFile(snapshot, filename) {
  try {
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.warn('[exportImportFile] falha ao exportar arquivo:', err);
    return false;
  }
}

/**
 * Lê um File (de <input type="file">) e devolve o resultado de
 * parseImportedSnapshot — rejeita pelo tamanho ANTES de sequer ler o
 * conteúdo. Nunca lança (usar em .then/await; nunca rejeita a Promise).
 */
export function readImportedFile(file, expectedModuleKey, expectedLevelId) {
  return new Promise((resolve) => {
    if (!file) { resolve({ ok: false, reason: 'no_file' }); return; }
    const sizeCheck = checkFileSize(file.size);
    if (!sizeCheck.ok) { resolve(sizeCheck); return; }
    const reader = new FileReader();
    reader.onload = () => {
      resolve(parseImportedSnapshot(String(reader.result ?? ''), expectedModuleKey, expectedLevelId));
    };
    reader.onerror = () => resolve({ ok: false, reason: 'read_error' });
    reader.readAsText(file);
  });
}
