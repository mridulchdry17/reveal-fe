import { readdirSync } from 'node:fs'

import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'
import importX from 'eslint-plugin-import-x'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// One zone per feature folder, read from disk so new features are covered automatically.
const features = readdirSync('./src/features', { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)

const sharedFolders = ['components', 'hooks', 'lib', 'types', 'utils', 'config', 'stores', 'testing']

export default defineConfig(
  { ignores: ['dist', 'dev-dist', 'src/lib/api/schema.d.ts'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver-next': [createTypeScriptImportResolver({ project: './tsconfig.app.json' })],
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      // Imports flow one way: shared -> features -> app (see CLAUDE.md).
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            ...features.map((feature) => ({
              target: `./src/features/${feature}`,
              from: './src/features',
              except: [`./${feature}`],
              message: 'A feature must not import another feature. Compose them in src/app.',
            })),
            {
              target: './src/features',
              from: './src/app',
              message: 'Features must not import from src/app.',
            },
            ...sharedFolders.map((folder) => ({
              target: `./src/${folder}`,
              from: ['./src/features', './src/app'],
              message: 'Shared code must not import features or app.',
            })),
          ],
        },
      ],
    },
  },
  {
    files: ['src/sw.ts'],
    languageOptions: { globals: globals.serviceworker },
  },
)
