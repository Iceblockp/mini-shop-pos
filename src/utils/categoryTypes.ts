export interface Category {
  id?: string;
  name: string;
  parentId?: string | null;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryWithProducts extends Category {
  productCount: number;
  subcategories?: CategoryWithProducts[];
}
