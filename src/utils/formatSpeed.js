/**
 * Formatta la velocità di trasmissione di rete (Mbps o Gbps)
 * @param {number|string} speedVal - Velocità in Mbps
 * @returns {{ value: string, unit: string, raw: number }}
 */
export function formatSpeed(speedVal) {
  if (speedVal === null || speedVal === undefined || speedVal === '' || isNaN(Number(speedVal))) {
    return { value: '--', unit: 'Mbps', raw: 0 };
  }

  const num = parseFloat(speedVal);

  if (num < 0) {
    return { value: '--', unit: 'Mbps', raw: 0 };
  }

  // Se supera 1000 Mbps, converti dinamicamente in Gbps per un'esperienza moderna
  if (num >= 1000) {
    return {
      value: (num / 1000).toFixed(2),
      unit: 'Gbps',
      raw: num
    };
  }

  // Precisione a 2 decimali sotto i 10 Mbps, a 1 o 2 sopra
  return {
    value: num < 10 ? num.toFixed(2) : num.toFixed(1),
    unit: 'Mbps',
    raw: num
  };
}
