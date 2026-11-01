import React from 'react';
import { Play, Square, RotateCcw } from 'lucide-react';
import './TestControls.css';

export function TestControls({
  status = 'ready', // 'ready' | 'connecting' | 'ping' | 'download' | 'upload' | 'completed' | 'aborted' | 'error'
  onStart,
  onAbort
}) {
  const isRunning = ['connecting', 'ping', 'download', 'upload'].includes(status);
  const isFinished = ['completed', 'aborted', 'error'].includes(status);

  return (
    <div className="test-controls-container">
      {!isRunning ? (
        <button
          type="button"
          className={`btn-start-test ${isFinished ? 'btn-retest' : ''}`}
          onClick={onStart}
          aria-label={isFinished ? 'Esegui un nuovo test di velocità' : 'Avvia il test di velocità NetFlash'}
        >
          <span className="btn-glow-aura" />
          <span className="btn-content">
            {isFinished ? (
              <>
                <RotateCcw size={20} className="btn-icon" />
                <span>NUOVO TEST</span>
              </>
            ) : (
              <>
                <Play size={22} className="btn-icon play-icon" fill="currentColor" />
                <span>AVVIA TEST</span>
              </>
            )}
          </span>
        </button>
      ) : (
        <button
          type="button"
          className="btn-abort-test"
          onClick={onAbort}
          aria-label="Annulla il test in corso"
        >
          <Square size={16} className="btn-icon" fill="currentColor" />
          <span>ANNULLA TEST</span>
        </button>
      )}
    </div>
  );
}
