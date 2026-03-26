// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: false,
    stylistic: true,
  },
  {
    ignores: [
      './dist',
      './.claude',
    ],
  },
)
