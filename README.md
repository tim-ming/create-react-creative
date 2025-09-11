# 🚀 React Creative Starter

[![npm version](https://img.shields.io/npm/v/create-react-creative?color=brightgreen&logo=npm)](https://www.npmjs.com/package/create-react-creative)
[![CI](https://github.com/tim-ming/create-react-creative/actions/workflows/pr.yml/badge.svg)](https://github.com/tim-ming/create-react-creative/actions/workflows/pr.yml)
[![License](https://img.shields.io/github/license/tim-ming/create-react-creative?color=blue)](LICENSE)
[![npm downloads](https://img.shields.io/npm/dm/create-react-creative.svg)](https://www.npmjs.com/package/create-react-creative)
[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

An **interactive wizard** to scaffold a modern, creative **Vite + React** app.  
Choose Tailwind, animations, 3D, state management, and other creative tools — all in one command.

```bash
npm create react-creative
```

## ✨ Features at a Glance

- ⚡ Fast Vite + React + TypeScript setup
- 🎨 Tailwind CSS styling out of the box
- 📂 Path alias (@ → src/) via vite-tsconfig-paths
- 🖼️ Import SVGs as React components with vite-plugin-svgr
- 🔌 Optional add-ons: animations, 3D, creative utilities, and state managers

## 📦 Stack

### Default Setup

- Vite + React (extends `npx create vite@latest --template react-ts`)
- Tailwind CSS
- vite-tsconfig-paths
- vite-plugin-svgr

### Optional Add-ons

#### 🎞️ Animations

- GSAP
- Framer Motion
- react-spring

#### 🗂️ State Management

- Zustand
- Valtio
- Jotai
- Redux Toolkit

#### 🌐 3D

- React Three Fiber (r3f) + Drei
- @react-three-postprocessing
- leva
- Three.js

#### 🎨 Creative Tools

- Lenis (smooth scrolling)
- use-gesture

## ⚡ Getting Started

1. **Scaffold a new project**

   ```bash
   npm create react-creative
   ```

2. **Follow the wizard prompts** to pick your stack and add-ons.

3. **Install dependencies & run the dev server**
   ```bash
   cd my-app
   npm install
   npm run dev
   ```

That's it — you'll have a modern React + Vite app with all your chosen creative tools ready to go.
