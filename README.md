# Dyvil LSP

This project provides a compiler, Language Server Protocol (LSP) implementation, VSCode extension and web editor for the Dyvil programming language.

It was made as part of the Winter Term 2023/24 course "Software Tool Construction" at the University of Kassel.
The full course (in German) is available on [YouTube](https://www.youtube.com/playlist?list=PLohPa1TMsVqqhHYCDIzjl3roqRRNcndze).

The web editor is a single-page Angular application with the [Monaco Editor](https://microsoft.github.io/monaco-editor/).
It is available at [dyvil.org](https://dyvil.org).

## Screenshots

![Screenshot of the Dyvil LSP web editor](docs/web-editor.png)

## Features

- Syntax highlighting and semantic tokens
- Validation/diagnostics
- Transpilation to JavaScript
- Editing
  - Code completion
  - Rename
  - Code formatting  
    <img src="docs/format.gif" alt="Code formatting GIF" width="292">
  - Code actions: specify type explicitly, simplify expression  
    <img src="docs/quick-fix.gif" alt="Quick Fix GIF" width="328">
- Information
  - Show references, definition, type definition
  - Hover documentation
  - Document highlight
  - Document symbols  
    <img src="docs/outline.png" alt="Outline screenshot" width="150">
  - Inlay hints (inferred type, parameter names)  
    <img src="docs/inlay-hints.png" alt="Inlay hints screenshot" width="352">

## Development

Run `nx serve web` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

Run `nx graph` to see a diagram of the dependencies of the projects.
