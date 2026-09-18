import { describe, it, expect } from 'vitest';
import { strokeNearPoint } from '../modules/afd/hooks/useDrawing.js';

// ─── strokeNearPoint: testa se um clique (x,y) está perto o bastante de um
// traço pra apagá-lo (puro, testável). Bug original: CanvasArea.jsx tinha uma
// cópia colada dessa lógica que SÓ tratava o caso 'pencil' (s.points.some) e
// quebrava com "can't access property 'some', e.points is undefined" pra
// qualquer forma (linha/seta/retângulo), que não tem `points` — só
// x1/y1/x2/y2. Corrigido extraindo essa função única, reaproveitada nos dois
// lugares (useDrawing.js e CanvasArea.jsx).
describe('strokeNearPoint', () => {

  it('traço "pencil" com ponto próximo → true', () => {
    const stroke = { type: 'pencil', points: [{ x: 10, y: 10 }, { x: 20, y: 20 }] };
    expect(strokeNearPoint(stroke, 11, 11, 20)).toBe(true);
  });

  it('traço "pencil" com todos os pontos longe → false', () => {
    const stroke = { type: 'pencil', points: [{ x: 10, y: 10 }, { x: 20, y: 20 }] };
    expect(strokeNearPoint(stroke, 500, 500, 20)).toBe(false);
  });

  it('traço legado sem `type` (pencil implícito) → mesmo tratamento de pencil', () => {
    const stroke = { points: [{ x: 10, y: 10 }] };
    expect(strokeNearPoint(stroke, 12, 12, 20)).toBe(true);
  });

  it('retângulo ("rect", sem `points`) com clique perto de uma ponta → true (não deve lançar erro)', () => {
    const stroke = { type: 'rect', x1: 100, y1: 100, x2: 200, y2: 200 };
    expect(() => strokeNearPoint(stroke, 100, 100, 20)).not.toThrow();
    expect(strokeNearPoint(stroke, 100, 100, 20)).toBe(true);
  });

  it('retângulo com clique perto do meio do segmento diagonal → true', () => {
    const stroke = { type: 'rect', x1: 0, y1: 0, x2: 100, y2: 100 };
    expect(strokeNearPoint(stroke, 50, 50, 20)).toBe(true);
  });

  it('retângulo com clique longe de tudo → false', () => {
    const stroke = { type: 'rect', x1: 0, y1: 0, x2: 100, y2: 100 };
    expect(strokeNearPoint(stroke, 900, 900, 20)).toBe(false);
  });

  it('linha ("line") e seta ("arrow") usam o mesmo critério de pontas/meio que "rect"', () => {
    const line = { type: 'line', x1: 5, y1: 5, x2: 50, y2: 5 };
    const arrow = { type: 'arrow', x1: 5, y1: 5, x2: 50, y2: 5 };
    expect(strokeNearPoint(line, 5, 5, 10)).toBe(true);
    expect(strokeNearPoint(arrow, 50, 5, 10)).toBe(true);
  });

});
