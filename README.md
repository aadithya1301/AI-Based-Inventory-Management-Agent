# InvAgent AI

InvAgent AI is a professional, AI-powered inventory management system designed to streamline stock tracking, demand forecasting, and inventory analysis through a conversational interface.

## Features

- **AI Inventory Assistant**: A sophisticated agent powered by **Groq (Llama 3.3)** and **LangChain**. It can list items, check low stock, provide detailed product info, and predict demand.
- **Interactive Dashboard**: A clean, modern UI built with **React**, **Tailwind CSS**, and **shadcn/ui** for real-time inventory monitoring.
- **Smart Demand Prediction**: Integrated machine learning model (Linear Regression) that analyzes historical trends to forecast next-day demand.
- **Local Persistence**: All inventory changes are automatically saved to your browser's `localStorage`, ensuring data is preserved across sessions.
- **Low Stock Alerts**: Visual indicators and automated agent checks for items falling below their defined thresholds.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS 4, Lucide Icons, Framer Motion
- **AI/LLM**: LangChain, Groq API (Llama 3.3 70B)
- **Data/ML**: Simple Statistics (Linear Regression)
- **Components**: shadcn/ui

## 📋 Prerequisites

To use the AI Assistant, you need a **Groq API Key**.
1. Get your key from the [Groq Console](https://console.groq.com/).
2. Add it to your environment variables as `GROQ_API_KEY`.

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## Agent Capabilities

You can ask the agent:
- "What items are currently in stock?"
- "Which items are running low?"
- "Predict the demand for tomorrow."
- "Tell me more about the item 'Rice'."
- "How many unique products do we have?"

