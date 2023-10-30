# Setup

## Basic Setup

Install pnpm

```sh
$ pnpm i -g nx
```

## VSCode Plugin

### Init Nx monorepo

```sh
# "pnpm dlx" on Windows
# --skipGit to work in an existing repo
$ pnpx create-nx-workspace <name> --skipGit
$ pnpx create-nx-workspace@17
✔ Where would you like to create your workspace? · stc
✔ Which stack do you want to use? · angular
✔ Integrated monorepo, or standalone project? · integrated
✔ Application name · web
✔ Default stylesheet format · scss
✔ Test runner to use for end to end (E2E) tests · none
✔ Would you like to use Standalone Components in your application? · No
✔ Would you like to add routing? · Yes
✔ Enable distributed caching to make your CI faster · No
```

In existing repo, move the created folder one level up.

```sh
$ pnpm install
```

### Add Compiler

```sh
nx g lib compiler --directory libs
✔ Which generator would you like to use? · @nx/js:library
✔ Which unit test runner would you like to use? · jest
✔ Which bundler would you like to use to build the library? Choose 'none' to skip build setup. · tsc
✔ What should be the project name and where should it be generated? · compiler @ libs/compiler
```

In root package.json scripts:

```json
    "compiler:main": "ts-node libs/compiler/src/main.ts",
    "compiler:antlr": "nx antlr4ts compiler",
```

In compiler project.json add antlr4ts target.

### Add Nest

From https://nx.dev/packages/nest#setting-up-nest

```sh
$ pnpm i -D @nx/nest
$ nx g @nx/nest:app language-server
```

### Run language-server

Add to package.json scripts:

```json
    "language-server:build:watch": "nx run language-server:build:development --watch",
```

## GitHub Actions

- Settings > Actions > General > Workflow permissions > Read and write permissions
- Settings > Pages > Deploy from a branch, gh-pages
  - Optional: Custom domain, then set cname in deploy.yml and remove --base-href=...
