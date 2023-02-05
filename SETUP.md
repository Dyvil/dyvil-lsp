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

## GitHub Actions

- Settings > Actions > General > Workflow permissions > Read and write permissions
- Settings > Pages > Deploy from a branch, gh-pages
  - Optional: Custom domain, then set cname in deploy.yml and remove --base-href=...
