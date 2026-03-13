import type { ReactNode } from 'react';

export interface WizardStep {
  title: string;
}

interface WizardModalProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  title: string;
  children: ReactNode;
  saveLabel?: string;
  t: (key: string, fallback?: string) => string;
}

export default function WizardModal({
  steps, currentStep, onStepChange, onClose, onSave, saving, title, children, saveLabel, t,
}: WizardModalProps) {
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={onClose}>x</button>
        </div>

        {/* Step Indicator */}
        <div className="wiz-steps">
          {steps.map((step, i) => {
            const completed = i < currentStep;
            const active = i === currentStep;
            return (
              <div key={i} style={{ display: 'contents' }}>
                {i > 0 && <div className={`wiz-connector${completed ? ' done' : ''}`} />}
                <div
                  className={`wiz-step${active ? ' active' : ''}${completed ? ' completed' : ''}`}
                  onClick={() => onStepChange(i)}
                >
                  <div className="wiz-step-num">
                    {completed ? '\u2713' : i + 1}
                  </div>
                  <span className="wiz-step-label">{step.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="wiz-body">
          {children}
        </div>

        {/* Footer */}
        <div className="wiz-footer">
          <div>
            {currentStep === 0 ? (
              <button className="btn btn-secondary" onClick={onClose}>
                {t('common.cancel', 'Cancel')}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => onStepChange(currentStep - 1)}>
                {t('supplier.wizard.prev', 'Previous')}
              </button>
            )}
          </div>
          <div>
            {isLast ? (
              <button className="btn btn-primary" onClick={onSave} disabled={saving}>
                {saving ? '...' : (saveLabel || t('admin.common.save', 'Save'))}
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => onStepChange(currentStep + 1)}>
                {t('supplier.wizard.next', 'Next')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
