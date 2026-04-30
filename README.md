# Canonic

A local-first markdown document editor with Git versioning, built for seamless documentation and product management. Canonic features a built-in AI assistant to help you think through requirements and ideas, without writing them for you.

## Features

- **Local-first Architecture**: All your files stay on your machine.
- **Git Version Control**: Document versioning built-in. Every workspace is a Git repository, allowing branching, history, and conflict resolution directly within the app.
- **AI Assistant**: Context-aware AI assistant designed to help you brainstorm and review, configurable with different models (requires an Anthropic API key).
- **Workspace Templates**: Start with a blank canvas or jumpstart your projects with structured templates like the PM Framework.
- **Sharing Scope & Permissions**: Share securely via token-secured links with granular access controls (file, directory, or workspace level).
- **Inline Comments**: Anchor comments to specific document selections to collaborate effectively.

## Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- **Desktop Environment:** [Electron](https://www.electronjs.org/)
- **Editor:** [Milkdown](https://milkdown.dev/)
- **Version Control:** [isomorphic-git](https://isomorphic-git.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Search:** [FlexSearch](https://github.com/nextapps-de/flexsearch)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd canonic-local
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Run the application in development mode
   ```bash
   npm run dev
   ```
   This will start both the Vite development server and the Electron application concurrently.

### Build for Production

To create a production-ready application executable:

```bash
npm run build
```
The output will be placed in the `dist-electron` directory.

## Project Structure

- `src/` - Vue frontend source code
- `electron/` - Electron main process and IPC handlers
- `docs/` - Project documentation and requirements (e.g., `REQUIREMENTS.md`)
- `public/` - Static assets

## Architecture Notes

- Configuration, such as user preferences and API keys, is stored locally in `~/.canonic/config.json`.
- Comments are persisted locally at `~/.canonic/comments/`.
- Git commands are executed transparently via `isomorphic-git`, meaning no terminal interaction is required for typical version control workflows.

## Documentation

For a detailed breakdown of product requirements, architecture, and testing strategy, refer to [docs/REQUIREMENTS.md](./docs/REQUIREMENTS.md).
