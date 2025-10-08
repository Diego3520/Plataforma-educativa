import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores([
        'dist',
        'node_modules',
        'build',
        '.env',
        'src/components/ui',
        'vite.config.ts',
        'eslint.config.js']),
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            '@typescript-eslint': tseslint.plugin,
        },
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                project: './tsconfig.json',
            },
        },
        rules: {
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "variable", format: ["camelCase"] },
                { selector: "function", format: ["camelCase"] },
                { selector: "class", format: ["camelCase"] },
                { selector: "typeLike", format: ["camelCase"] },
                { selector: "variable", types: ["function"], format: ["camelCase"] },
                { selector: "variable", modifiers: ["const"], format: ["camelCase", "UPPER_CASE"] },
            ],
            "react/react-in-jsx-scope": "off",
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
])