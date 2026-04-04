const fs = require('fs')
const path = require('path')

const tokensPath = path.join(__dirname, '..', 'data', 'design-tokens.json')
const outPath = path.join(__dirname, '..', 'styles', 'tokens.css')

function toCss(tokens) {
  const { colors = {}, dark = {}, radius = {} } = tokens

  const lightVars = Object.entries(colors)
    .map(([k, v]) => `  --${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n')

  const radiusVars = `  --radius: ${radius.base || radius.lg || '0.75rem'};`

  const darkVars = Object.entries(dark)
    .map(([k, v]) => `  --${k.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${v};`)
    .join('\n')

  return `/* Design tokens (generated) */\n:root {\n${lightVars}\n${radiusVars}\n}\n\n.dark {\n${darkVars}\n}\n` 
}

try {
  const raw = fs.readFileSync(tokensPath, 'utf8')
  const tokens = JSON.parse(raw)
  const css = toCss(tokens)
  fs.writeFileSync(outPath, css, 'utf8')
  console.log(`Wrote tokens to ${outPath}`)
} catch (err) {
  console.error('Failed to sync tokens:', err)
  process.exit(1)
}
