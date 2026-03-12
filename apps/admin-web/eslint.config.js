import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// Custom rule: warn when JSX contains hardcoded Korean/CJK text (should use t(key))
const noHardcodedI18n = {
  meta: { type: 'suggestion', messages: { hardcoded: 'Hardcoded text "{{text}}" — use t(key) instead.' } },
  create(context) {
    // Match Korean (Hangul), CJK Unified, Hiragana, Katakana
    const CJK_RE = /[\u3131-\uD79D\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/
    return {
      JSXText(node) {
        const raw = node.value.trim()
        if (raw && CJK_RE.test(raw)) {
          context.report({ node, messageId: 'hardcoded', data: { text: raw.slice(0, 30) } })
        }
      },
    }
  },
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'petfolio': { rules: { 'no-hardcoded-i18n': noHardcodedI18n } },
    },
    rules: {
      'petfolio/no-hardcoded-i18n': 'warn',
    },
  },
])
