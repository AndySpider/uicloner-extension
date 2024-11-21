<div align="center">
  <img src="https://github.com/AndySpider/uicloner-extension/blob/main/public/icon/128.png?raw=true" width="128" height="128" alt="UICloner Logo">
</div>

# UICloner Extension

UICloner is a AI-powered browser extension that allows you to **clone any UI component from any webpage** with a single click and automatically generates the corresponding code implementation.

## ✨ Key Features

- 🎯 One-Click Selection - Select UI components to clone with a simple click on any website
- 🎨 Multiple Format Support - Generate to HTML + Tailwind CSS or HTML + pure CSS code
- 🔄 Live Preview - Real-time preview of cloned UI and generated code

### Demo - clone the Facebook login form

![Demo](https://github.com/AndySpider/uicloner-extension/blob/develop/screenshots/clone-facebook-login-demo.gif?raw=true)

## 🚀 Quick Start

### Install and Setup

1. Install UICloner extension from Chrome Web Store
2. Click the extension icon and setup a vision LLM API (**GPT-4o** or **Claude 3.5** recommended, your API is saved locally!)

![Setup](https://github.com/AndySpider/uicloner-extension/blob/develop/screenshots/llm-settings.png?raw=true)

### Usage

1. Open any webpage and click the extension icon
2. Use the selection tool to pick UI components on the webpage
3. Wait for code generation to complete
4. Copy the generated code to your project

## 🛠️ Development Setup
Install dependencies
``` bash
pnpm install
```
Development mode
``` bash
pnpm run dev
```
Build for production
``` bash
pnpm build
```

## 🔧 Tech Stack

- WXT (Browser Extension Development)
- React 18
- Tailwind CSS
- Shadcn UI Components
- Langchain
- TypeScript

## 🤝 Contributing

Contributions via Pull Requests and Issues are welcome!

## 📄 License

MIT
