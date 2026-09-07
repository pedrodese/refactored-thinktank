# thinktank

Monorepo (npm workspaces) da migração do backend do projeto `thinktank` (Ruby on Rails) para NestJS, com o front trazido pra cá também.

```
apps/
  api/   # backend NestJS + TypeORM (era a raiz deste repo antes da reestruturação)
  web/   # front React + Inertia, copiado de thinktank/app/frontend — ainda não adaptado
         # pra consumir a API (ver PROGRESS.md)
```

Ver `PROGRESS.md` na raiz para o status detalhado da migração (o que já foi feito, decisões, armadilhas conhecidas).

## Subindo o projeto do zero

Este backend **não é dono do schema nem dos dados**: ele aponta pro mesmo Postgres do monólito Rails (`thinktank`) e só mapeia as tabelas que já existem lá (`synchronize: false`). Por isso, banco e seed vêm do repo Rails — este repo só roda migration pras tabelas novas dele (hoje, só `refresh_tokens`).

### Pré-requisitos

* Node 24 (usado nos dois repos)
* Ruby 3.3.9 + Bundler (só pra subir/semear o banco pelo repo Rails)
* Docker (Postgres roda em container)
* O repo [`thinktank`](https://github.com/fablabjoinville/thinktank) (Rails) clonado à parte — os comandos abaixo assumem que ele está em `../thinktank`, ajuste o caminho conforme onde você clonou

### 1. Banco (a partir do repo Rails)

```bash
cd ../thinktank        # ou o caminho onde você clonou o repo Rails
bundle install          # só na primeira vez
docker compose up -d db # Postgres 14 em localhost:15432 (usuário/senha postgres/postgres)
bin/rails db:create db:migrate db:seed
```

Isso cria `thinktank_development` com o schema do Rails e os dados de seed — incluindo os usuários de teste (`admin@example.com`, `facilitator@example.com`, `secretary@example.com`, senha `password` pra todos). Se o banco já existir e você quiser recomeçar do zero, use `./bin/db-reset` no lugar do `db:create db:migrate db:seed`.

### 2. API (este repo)

```bash
npm install                         # instala as duas apps (workspaces)
cp apps/api/.env.example apps/api/.env
npm run migration:run:api           # cria as tabelas próprias deste backend (ex.: refresh_tokens)
npm run dev:api                     # sobe em :3000, Swagger em /docs
```

O `.env.example` já aponta pro Postgres do passo 1 (`localhost:15432`, banco `thinktank_development`). **Nunca** rode `migration:generate` contra as tabelas do Rails (users, companies, etc.) — ver "Armadilhas" no `PROGRESS.md`.

### 3. Front (este repo)

```bash
cp apps/web/.env.example apps/web/.env
npm run dev:web                     # Vite dev server em :5173
```

Acesse `http://localhost:5173/login` e entre com um dos usuários de teste do passo 1. Telas ainda não migradas para a API nova (fora `/login`, `/companies`, `/users`) continuam esperando o formato antigo do Inertia — ver `PROGRESS.md` para o que já funciona.

## Comandos

```bash
npm install                # instala as duas apps (workspaces)

npm run dev:api            # sobe o backend em :3000 (watch mode)
npm run build:api
npm run test:api
npm run test:api:e2e
npm run lint:api
npm run migration:run:api  # roda as migrations pendentes (tabelas próprias deste backend)

npm run dev:web            # sobe o Vite dev server do front em :5173
npm run build:web
npm run typecheck:web
```

Cada workspace também pode ser rodado diretamente de dentro da sua pasta (`cd apps/api && npm run start:dev`), já que os scripts internos de cada `package.json` continuam os mesmos.
