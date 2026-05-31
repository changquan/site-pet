const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  format: 'iife',
  outfile: 'site-pet.js',
  minify: false,
}).catch(() => process.exit(1));
