export interface InventoryMovement {
  id?: number;
  productId: number;
  adjustmentType: "add" | "remove";
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  timestamp: Date;
}

export interface InventoryAlert {
  productId: number;
  type: "low_stock" | "out_of_stock";
  threshold: number;
  currentStock: number;
  timestamp: Date;
}
