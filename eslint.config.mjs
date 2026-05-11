import eslint from '@eslint/js'
import globals from 'globals'

export default [
	eslint.configs.recommended,
	{
		languageOptions: {
			ecmaVersion: 2025,
			globals: globals.node,
		},
		rules: {
			'no-unused-vars': 'off',
		},
	},
]
