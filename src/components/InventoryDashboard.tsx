import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryItem } from "@/src/lib/inventory";
import { AlertTriangle, CheckCircle2, Package, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryDashboardProps {
  inventory: InventoryItem[];
  onUpdateQuantity: (id: string, newQuantity: number) => void;
}

export function InventoryDashboard({ inventory, onUpdateQuantity }: InventoryDashboardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Package className="h-5 w-5" />
          Current Inventory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.stock - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      type="number" 
                      className="h-7 w-16 text-center px-1" 
                      value={item.stock}
                      onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                    />
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => onUpdateQuantity(item.id, item.stock + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.stock < item.threshold ? (
                    <Badge variant="destructive" className="flex w-fit items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Low Stock
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 flex w-fit items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Healthy
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
