import { createRequire } from 'node:module'

// O script `typeorm` do package.json roda dentro deste workspace (apps/api),
// mas em monorepo com npm workspaces o pacote `typeorm` fica hasteado (hoisted)
// pro node_modules da raiz — um caminho relativo fixo
// (`./node_modules/typeorm/cli.js`) não existe mais aqui. `require.resolve`
// sobe a árvore de node_modules como o Node faz normalmente, então encontra o
// pacote onde quer que o npm o tenha colocado.
const require = createRequire(import.meta.url)
await import(require.resolve('typeorm/cli.js'))
