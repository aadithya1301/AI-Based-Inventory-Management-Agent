import React, { useState, useMemo, useEffect } from 'react';
import { InventoryDashboard } from './components/InventoryDashboard';
import { ChatInterface } from './components/ChatInterface';
import { loadInventory, saveInventory, InventoryItem } from './lib/inventory';
import { LayoutDashboard, ShoppingCart, TrendingUp, PackageSearch, Plus, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadInventory());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', threshold: '10', unit: 'units' });

  useEffect(() => {
    saveInventory(inventory);
  }, [inventory]);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, stock: Math.max(0, newQuantity) } : item
    ));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.stock === '') return;

    const item: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: newItem.name,
      stock: parseInt(newItem.stock),
      threshold: parseInt(newItem.threshold),
      unit: newItem.unit,
    };

    setInventory(prev => [...prev, item]);
    setNewItem({ name: '', stock: '', threshold: '10', unit: 'units' });
    setIsAddDialogOpen(false);
  };

  const lowStockCount = useMemo(() => 
    inventory.filter(item => item.stock < item.threshold).length
  , [inventory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <PackageSearch className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">InvAgent AI</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              System Active
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Dashboard & Stats */}
          <div className="lg:col-span-5 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-slate-400" />
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Overview</h2>
                </div>
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger render={
                    <Button size="sm" className="h-8 gap-1">
                      <Plus className="h-4 w-4" />
                      Add Item
                    </Button>
                  } />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Inventory Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddItem} className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Item Name</Label>
                        <Input 
                          id="name" 
                          placeholder="e.g. Flour" 
                          value={newItem.name}
                          onChange={e => setNewItem({...newItem, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="stock">Initial Stock</Label>
                          <Input 
                            id="stock" 
                            type="number" 
                            value={newItem.stock}
                            onChange={e => setNewItem({...newItem, stock: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="threshold">Low Stock Threshold</Label>
                          <Input 
                            id="threshold" 
                            type="number" 
                            value={newItem.threshold}
                            onChange={e => setNewItem({...newItem, threshold: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Add to Inventory</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <InventoryDashboard 
                inventory={inventory} 
                onUpdateQuantity={handleUpdateQuantity}
              />
            </section>

            <section className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Total Products</span>
                </div>
                <div className="text-2xl font-bold">{inventory.length}</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium uppercase">Low Stock Alerts</span>
                </div>
                <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {lowStockCount}
                </div>
              </div>
            </section>

            <div className="bg-primary/5 border border-primary/10 p-6 rounded-2xl">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Smart Prediction
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our ML model analyzes historical data to predict next-day demand. 
                Ask the agent "Predict demand" to see the latest forecast.
              </p>
            </div>
          </div>

          {/* Right Column: AI Agent */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-slate-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">AI Inventory Assistant</h2>
            </div>
            <ChatInterface inventory={inventory} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-12">
        <p className="text-center text-slate-400 text-xs">
          &copy; 2026 InvAgent AI. Powered by Groq & LangChain.
        </p>
      </footer>
    </div>
  );
}

