# Setup

## Workspace & Web Frontend

```
$ pnpx create-nx-workspace
✔ Choose what to create                 · integrated
✔ What to create in the new workspace   · angular-monorepo
✔ Repository name                       · stc
✔ Application name                      · web
✔ Default stylesheet format             · scss
✔ Enable distributed caching to make your CI faster · No
```

## Compiler Service

```
$ pnpm i @nrwl/nest
$ pnpm nx g @nrwl/nest:app compiler-service
```

## Types Library

```
$ pnpm nx g @nrwl/nest:lib types --buildable
                  # We need nest types
                                 # Incremental builds
```

## Mongoose

```
$ pnpm i mongoose @nestjs/mongoose
```

## User Module

```
$ cd apps/compiler-service
$ nx g @nrwl/nest:resource user
```

## Config

```
$ pnpm i @nestjs/config
```
