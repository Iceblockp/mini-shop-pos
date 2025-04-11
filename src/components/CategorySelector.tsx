import React from "react";
import { Category } from "../utils/categoryTypes";
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string | null;
  onChange: (categoryId: string | null) => void;
  placeholder?: string;
  className?: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onChange,
  placeholder = "Select Category",
  className = "",
}) => {
  const getCategoryHierarchy = (category: Category): string => {
    const findParentPath = (cat: Category, path: string = ""): string => {
      const parent = categories.find((c) => c.id === cat.parentId);
      if (!parent) return path ? `${cat.name} > ${path}` : cat.name;
      return findParentPath(parent, path ? `${cat.name} > ${path}` : cat.name);
    };
    return findParentPath(category);
  };

  const sortedCategories = [...categories].sort((a, b) => {
    const pathA = getCategoryHierarchy(a);
    const pathB = getCategoryHierarchy(b);
    return pathA.localeCompare(pathB);
  });

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value || null);
  };

  return (
    <FormControl fullWidth className={className}>
      <InputLabel>{placeholder}</InputLabel>
      <Select
        value={selectedCategoryId || ""}
        onChange={handleChange}
        label={placeholder}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {sortedCategories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {getCategoryHierarchy(category)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
