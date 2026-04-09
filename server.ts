import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

// --- Inventory Data ---
const inventory = [
  { name: 'Rice', stock: 20 },
  { name: 'Oil', stock: 5 },
  { name: 'Sugar', stock: 12 },
];

// --- Simple ML Model (Linear Regression) ---
// Since we can't use sklearn, we'll implement a simple linear regression
// y = mx + b
function predictDemand(data: { day: number; demand: number }[]) {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const point of data) {
    sumX += point.day;
    sumY += point.demand;
    sumXY += point.day * point.demand;
    sumX2 += point.day * point.day;
  }
  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - m * sumX) / n;
  
  // Predict for the next day
  const nextDay = n + 1;
  return m * nextDay + b;
}

// --- Tools ---
const checkLowStockTool = new DynamicStructuredTool({
  name: 'check_low_stock',
  description: 'Checks for items with stock less than 10 units.',
  schema: z.object({}),
  func: async () => {
    const lowStock = inventory.filter(item => item.stock < 10);
    if (lowStock.length === 0) return 'All items are well-stocked.';
    return `Low stock items: ${lowStock.map(i => `${i.name} (${i.stock} units)`).join(', ')}`;
  },
});

const countProductsTool = new DynamicStructuredTool({
  name: 'count_products',
  description: 'Counts the total number of unique products in inventory.',
  schema: z.object({}),
  func: async () => {
    return `Total products: ${inventory.length}`;
  },
});

const predictDemandTool = new DynamicStructuredTool({
  name: 'predict_demand',
  description: 'Predicts the demand for the next day based on historical data.',
  schema: z.object({}),
  func: async () => {
    // Sample historical data: [day, demand]
    const historicalData = [
      { day: 1, demand: 10 },
      { day: 2, demand: 12 },
      { day: 3, demand: 15 },
      { day: 4, demand: 14 },
      { day: 5, demand: 18 },
    ];
    const prediction = predictDemand(historicalData);
    return `Predicted demand for tomorrow: ${prediction.toFixed(2)} units.`;
  },
});

const tools = [checkLowStockTool, countProductsTool, predictDemandTool];

// --- Agent Setup ---
async function runAgent(query: string) {
  const model = new ChatGoogleGenerativeAI({
    model: 'gemini-3-flash-preview',
    apiKey: process.env.GEMINI_API_KEY,
  });

  // Using the modern LangChain approach (AgentExecutor with tools)
  // Note: LangChain.js createReactAgent is slightly different from Python's
  // but we'll use a standard AgentExecutor pattern.
  
  const { createReactAgent } = await import('@langchain/langgraph/prebuilt');
  const agent = createReactAgent({
    llm: model,
    tools,
  });

  const result = await agent.invoke({
    messages: [{ role: 'user', content: query }],
  });

  // The result contains the full message history, the last one is the response
  return result.messages[result.messages.length - 1].content;
}

// --- Express Server ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Endpoint
  app.post('/api/ask', async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) return res.status(400).json({ error: 'Query is required' });
      
      const response = await runAgent(query);
      res.json({ response });
    } catch (error: any) {
      console.error('Agent Error:', error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
