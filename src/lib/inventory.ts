export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  threshold: number;
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Rice', stock: 20, unit: 'units', threshold: 10 },
  { id: '2', name: 'Oil', stock: 5, unit: 'units', threshold: 10 },
  { id: '3', name: 'Sugar', stock: 12, unit: 'units', threshold: 10 },
];

const STORAGE_KEY = 'invagent_inventory';

export function loadInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return INITIAL_INVENTORY;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return INITIAL_INVENTORY;
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse stored inventory', e);
    return INITIAL_INVENTORY;
  }
}

export function saveInventory(inventory: InventoryItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
}

export function getLowStockItems(inventory: InventoryItem[]) {
  return inventory.filter(item => item.stock < item.threshold);
}

export function getTotalProductCount(inventory: InventoryItem[]) {
  return inventory.length;
}
