import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import './TestProgress.css';

const PHASES = [
  { id: 'connecting', label: 'IP & Server' },
  { id: 'ping', label: 'Latenza (Ping)' },
  { id: 'download', label: 'Download' },
  { id: 'upload', label: 'Upload' }
];

export function TestProgress({
  currentPhase = 'ready',
  overallProgress = 0
}) {
  const getPhaseStatus = (phaseId) => {
    const order = ['connecting', 'ping', 'download', 'upload'];
    const currentIndex = order.indexOf(currentPhase);
    const phaseIndex = order.indexOf(phaseId);

    if (currentPhase === 'completed') return 'done';
    if (currentPhase === 'ready' || currentPhase === 'aborted' || currentPhase === 'error') {
      return 'pending';
    }

    if (currentIndex > phaseIndex) return 'done';
    if (currentIndex === phaseIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="test-progress-wrapper" aria-label="Avanzamento del test di velocità">
      <div className="phases-steps-row">
        {PHASES.map((p) => {
          const status = getPhaseStatus(p.id);
          return (
            <div key={p.id} className={`phase-step-item ${status}`}>
              <div className="step-indicator">
                {status === 'done' ? (
                  <Check size={14} className="icon-check" />
                ) : status === 'active' ? (
                  <Loader2 size={14} className="icon-spin" />
                ) : (
                  <span className="step-dot" />
                )}
              </div>
              <span className="step-label">{p.label}</span>
            </div>
          );
        })}
      </div>

      <div className="overall-progress-bar-track">
        <div 
          className="overall-progress-bar-fill" 
          style={{ width: `${Math.max(0, Math.min(100, overallProgress))}%` }} 
        />
      </div>
    </div>
  );
}
