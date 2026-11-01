/**
 * Formatta valori di latenza e jitter con valutazione qualitativa
 * @param {number|string} val - Valore in millisecondi
 * @param {'ping'|'jitter'} type - Tipo di metrica
 * @returns {{ value: string, unit: string, quality: string, qualityColor: string }}
 */
export function formatLatency(val, type = 'ping') {
  if (val === null || val === undefined || val === '' || isNaN(Number(val))) {
    return { value: '--', unit: 'ms', quality: 'In attesa', qualityColor: 'var(--text-muted)' };
  }

  const num = parseFloat(val);

  if (num < 0) {
    return { value: '--', unit: 'ms', quality: 'In attesa', qualityColor: 'var(--text-muted)' };
  }

  const formattedVal = num < 10 ? num.toFixed(1) : Math.round(num).toString();

  let quality = 'Ottimo';
  let qualityColor = 'var(--color-green)';

  if (type === 'ping') {
    if (num < 15) {
      quality = 'Ultra Veloce';
      qualityColor = 'var(--color-green-neon)';
    } else if (num < 35) {
      quality = 'Ottimo';
      qualityColor = 'var(--color-green)';
    } else if (num < 65) {
      quality = 'Buono';
      qualityColor = 'var(--color-cyan)';
    } else if (num < 120) {
      quality = 'Medio';
      qualityColor = 'var(--color-amber)';
    } else {
      quality = 'Elevato';
      qualityColor = 'var(--color-red)';
    }
  } else {
    // Jitter
    if (num <= 2) {
      quality = 'Stabile';
      qualityColor = 'var(--color-green-neon)';
    } else if (num <= 6) {
      quality = 'Buono';
      qualityColor = 'var(--color-green)';
    } else if (num <= 15) {
      quality = 'Accettabile';
      qualityColor = 'var(--color-amber)';
    } else {
      quality = 'Instabile';
      qualityColor = 'var(--color-red)';
    }
  }

  return {
    value: formattedVal,
    unit: 'ms',
    quality,
    qualityColor
  };
}
