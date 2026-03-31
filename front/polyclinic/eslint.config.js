import vue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default [
  // Vue
  {
    files: ['**/*.vue'],
    ...vue.configs['vue3-recommended'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // TypeScript
  {
    files: ['**/*.ts'],
    ...ts.configs.recommended,
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  },

  // Prettier (отключает конфликтующие правила)
  {
    files: ['**/*.{ts,vue}'],
    ...prettierConfig
  },

  // Prettier как правило
  {
    files: ['**/*.{ts,vue}'],
    plugins: {
      prettier
    },
    rules: {
      'prettier/prettier': 'error'
    }
  }
]
