// 다국어 번역 입력 폼 — DevicePage / FeedPage / MasterPage 공용
import { SUPPORTED_LANGS, LANG_LABELS } from '@petfolio/shared';

interface Props {
  translations: Record<string, string>;
  onChange: (t: Record<string, string>) => void;
  translating: boolean;
  onAutoTranslate: () => void;
  t: (key: string, fallback?: string) => string;
}

export function TranslationFields({ translations, onChange, translating, onAutoTranslate, t }: Props) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{t('admin.master.btn_trans_auto')}</div>
        <button
          className="btn btn-secondary btn-sm"
          onClick={onAutoTranslate}
          disabled={translating || !translations.ko}
        >
          {translating ? t('admin.master.loading_trans') : t('admin.master.btn_trans_auto')}
        </button>
      </div>
      {SUPPORTED_LANGS.map((langCode) => (
        <div key={langCode} className="form-group" style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 12, width: 110, flexShrink: 0, color: langCode === 'ko' ? 'var(--text)' : 'var(--text-muted)' }}>
            {(LANG_LABELS as Record<string, string>)[langCode]}{langCode === 'ko' ? ' *' : ''}
          </label>
          <input
            className="form-input"
            style={{ fontSize: 13 }}
            value={translations[langCode] ?? ''}
            onChange={(e) => onChange({ ...translations, [langCode]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}
