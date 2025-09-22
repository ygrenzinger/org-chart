import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        'd3': 'readonly',
        'console': 'readonly',
        'document': 'readonly',
        'window': 'readonly',
        'performance': 'readonly',
        'setTimeout': 'readonly',
        'clearTimeout': 'readonly',
        'process': 'readonly',
        'XMLHttpRequest': 'readonly',
        'FileReader': 'readonly',
        'location': 'readonly',
        'NodeFilter': 'readonly',
        'XMLSerializer': 'readonly',
        'Blob': 'readonly',
        'URL': 'readonly',
        'navigator': 'readonly',
        'vi': 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'object-shorthand': 'warn',
      'prefer-arrow-callback': 'warn'
    }
  }
];