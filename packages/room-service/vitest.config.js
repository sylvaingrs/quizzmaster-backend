import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    resolve: {
        alias: {
            '#errors': resolve(__dirname, './src/errors.js'),
            '#types': resolve(__dirname, './src/types/enums.d.ts'),
        },
    },
    test: {
        environment: 'node',
        globals: false,
    },
})