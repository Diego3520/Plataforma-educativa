//import js from "@eslint/js";
//import globals from "globals";
//import tseslint from "typescript-eslint";
//import { defineConfig } from "eslint/config";
import * as js from "@eslint/js";
import * as globals from "globals";
import * as tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        ignores: ["node_modules/", "dist/", "build/", ".env","eslint.config.mts","src/db.ts","src/server.ts"],
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        plugins: { js, "@typescript-eslint": tseslint.plugin },
        extends: [
            "js/recommended",
            ...tseslint.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            globals: globals.node,
            parserOptions: {
                project: "./tsconfig.json",
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "variable", format: ["camelCase"] },
                { selector: "function", format: ["camelCase"] },
                { selector: "class", format: ["camelCase"] },
                { selector: "typeLike", format: ["camelCase"] },
                { selector: "variable", types: ["function"], format: ["camelCase"] },
            ],
        },
    },
]);