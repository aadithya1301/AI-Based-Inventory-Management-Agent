import { ChatGroq } from "@langchain/groq";
import { DynamicTool } from "@langchain/core/tools";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { InventoryItem } from "./inventory";
import { predictNextDayDemand } from "./ml";

export async function createInventoryAgent(inventory: InventoryItem[]) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey || apiKey === "YOUR_GROQ_API_KEY" || apiKey === "") {
    throw new Error("Groq API Key is missing or invalid. Please set it in the Secrets panel.");
  }

  const model = new ChatGroq({
    apiKey: apiKey,
    modelName: "llama-3.3-70b-versatile",
    temperature: 0,
  });

  const tools = [
    new DynamicTool({
      name: "list_all_items",
      description: "Returns a list of all items currently in the inventory with their current stock levels.",
      func: async () => {
        if (inventory.length === 0) return "The inventory is currently empty.";
        return `Current Inventory: ${inventory.map(i => `${i.name} (${i.stock} ${i.unit})`).join(", ")}`;
      },
    }),
    new DynamicTool({
      name: "get_item_details",
      description: "Returns detailed information about a specific item in the inventory. Provide the item name as input.",
      func: async (name: string) => {
        const item = inventory.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!item) return `Item '${name}' not found in inventory.`;
        return `Details for ${item.name}: Stock: ${item.stock} ${item.unit}, Threshold: ${item.threshold} ${item.unit}, ID: ${item.id}`;
      },
    }),
    new DynamicTool({
      name: "check_low_stock",
      description: "Checks which items in the inventory are low in stock (below threshold).",
      func: async () => {
        const lowStock = inventory.filter(item => item.stock < item.threshold);
        if (lowStock.length === 0) return "All items are well-stocked.";
        return `Low stock items: ${lowStock.map(i => `${i.name} (${i.stock} ${i.unit})`).join(", ")}`;
      },
    }),
    new DynamicTool({
      name: "count_products",
      description: "Returns the total number of unique products in the inventory.",
      func: async () => {
        const count = inventory.length;
        return `There are a total of ${count} unique products in the inventory.`;
      },
    }),
    new DynamicTool({
      name: "predict_demand",
      description: "Predicts the next-day demand using a linear regression model based on historical data.",
      func: async () => {
        const result = predictNextDayDemand();
        return `Predicted demand for tomorrow: ${result.prediction} units. Trend: ${result.trend}. Confidence: ${result.confidence}.`;
      },
    }),
  ];

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a professional AI Inventory Management Agent. Use the provided tools to help the user with their inventory questions."],
    ["human", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);

  const agent = await createToolCallingAgent({
    llm: model,
    tools,
    prompt,
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    maxIterations: 10,
    verbose: true,
  });

  return executor;
}
