# Setup

## Workspace & Web Frontend

```
$ pnpx create-nx-workspace
✔ Choose what to create                 · integrated
✔ What to create in the new workspace   · angular-monorepo
✔ Repository name                       · software-tools
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
