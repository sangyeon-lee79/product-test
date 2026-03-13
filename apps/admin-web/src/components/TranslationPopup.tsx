// 🌐 버튼 클릭 → 팝업으로 다국어 번역 입력
import { useState } from 'react';
import { SUPPORTED_LANGS, LANG_LABELS } from '@petfolio/shared';
import { autoTranslate } from '../lib/catalogUtils';

interface Props {
  /** 필드 라벨 (예: "매장명") */
  label: string;
  /** 번역 소스 텍스트 (한국어 기본값) */
  sourceText: string;
  translations: Record<string, string>;
  onChange: (t: Record<string, string>) => void;
  t: (key: string, fallback?: string) => string;
}

export function TranslationPopup({ label, sourceText, translations, onChange, t }: Props) {
  const [open, setOpen] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState('');

  const filledCount = SUPPORTED_LANGS.filter(l => (translations[l] || '').trim()).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={t('provider.store.trans_popup_title', 'Translations')}
        style={{
          border: 'none', background: 'none', cursor: 'pointer', fontSize: 16, padding: '0 4px',
          opacity: filledCount > 0 ? 1 : 0.5,
        }}
      >
        🌐{filledCount > 0 && <span style={{ fontSize: 10, verticalAlign: 'super', color: 'var(--primary)', fontWeight: 700 }}>{filledCount}</span>}
      </button>

      {open && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480, maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title">{label} — {t('provider.store.trans_popup_title', 'Translations')}</div>
              <button className="modal-close" onClick={() => setOpen(false)}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 8 }}>
              {error && <div className="alert alert-error" style={{ fontSize: 12 }}>{error}</div>}

              {/* Auto-translate button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={translating || !(translations.ko || sourceText)}
                  onClick={() => void autoTranslate(translations.ko || sourceText, translations, onChange, setTranslating, setError)}
                >
                  {translating ? t('admin.master.loading_trans', '...') : t('admin.master.btn_trans_auto', 'Auto Translate')}
                </button>
              </div>

              {SUPPORTED_LANGS.map(langCode => (
                <div key={langCode} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{
                    fontSize: 12, width: 90, flexShrink: 0,
                    fontWeight: langCode === 'ko' ? 600 : 400,
                    color: langCode === 'ko' ? 'var(--text)' : 'var(--text-muted)',
                  }}>
                    {(LANG_LABELS as Record<string, string>)[langCode]}{langCode === 'ko' ? ' *' : ''}
                  </label>
                  <input
                    className="form-input"
                    style={{ fontSize: 13, flex: 1 }}
                    value={translations[langCode] ?? ''}
                    placeholder={langCode === 'ko' ? sourceText : ''}
                    onChange={e => onChange({ ...translations, [langCode]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
