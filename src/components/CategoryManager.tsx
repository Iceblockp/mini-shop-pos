import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Stack,
  IconButton,
  Alert,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { dbOperations } from "../utils/database";

interface Category {
  id?: string;
  name: string;
  parentId?: string | null;
  description?: string;
}

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<Category>({
    name: "",
    parentId: null,
    description: "",
  });
  const [error, setError] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const loadedCategories = await dbOperations.getCategories();
      setCategories(loadedCategories);
    } catch (err) {
      setError("Failed to load categories");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory?.id) {
        await dbOperations.updateCategory({
          ...newCategory,
          id: editingCategory.id,
        });
      } else {
        await dbOperations.createCategory(newCategory);
      }
      await loadCategories();
      setNewCategory({ name: "", parentId: null, description: "" });
      setEditingCategory(null);
      setError("");
    } catch (err) {
      setError("Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setNewCategory(category);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await dbOperations.deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      setError("Failed to delete category");
    }
  };

  const getCategoryHierarchy = (category: Category): string => {
    const parent = categories.find((c) => c.id === category.parentId);
    return parent
      ? `${getCategoryHierarchy(parent)} > ${category.name}`
      : category.name;
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {editingCategory ? "Edit Category" : "Add New Category"}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Category Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Parent Category</InputLabel>
              <Select
                value={newCategory.parentId || ""}
                label="Parent Category"
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    parentId: e.target.value || null,
                  })
                }
              >
                <MenuItem value="">None (Top Level)</MenuItem>
                {categories.map((category) => (
                  <MenuItem
                    key={category.id}
                    value={category.id}
                    disabled={category.id === editingCategory?.id}
                  >
                    {getCategoryHierarchy(category)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {editingCategory && (
                <Button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategory({
                      name: "",
                      parentId: null,
                      description: "",
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="contained" color="primary">
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Categories
        </Typography>
        <Stack spacing={2}>
          {categories.map((category) => (
            <Paper key={category.id} variant="outlined" sx={{ p: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="subtitle1">
                    {getCategoryHierarchy(category)}
                  </Typography>
                  {category.description && (
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(category)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => category.id && handleDelete(category.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
};
