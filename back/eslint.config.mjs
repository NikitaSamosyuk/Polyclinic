// @ts-check

import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  // Игнорируем файлы, которые не должны анализироваться
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '**/*.spec.ts',
      'test/**',
      'prisma.config.ts',
    ],
  },

  {
    files: ['**/*.ts'],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier,
      import: importPlugin,
    },

    rules: {
      // строгая типизация
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',

      // асинхронность
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',

      // временно отключаем unsafe-правила
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',

      // импорты
      'import/no-unresolved': 'off',

      // prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
]
