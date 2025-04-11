import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";

export interface Supplier {
  id?: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier) => void;
  supplier?: Supplier;
}

const initialSupplier: Supplier = {
  name: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

const SupplierForm: React.FC<SupplierFormProps> = ({
  open,
  onClose,
  onSave,
  supplier,
}) => {
  const [formData, setFormData] = useState<Supplier>(
    supplier || initialSupplier
  );

  useEffect(() => {
    setFormData(supplier || initialSupplier);
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {supplier ? "Edit Supplier" : "Add New Supplier"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Supplier Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Contact Person"
                value={formData.contactPerson}
                onChange={(e) =>
                  setFormData({ ...formData, contactPerson: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                multiline
                rows={2}
                required
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {supplier ? "Update" : "Add"} Supplier
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SupplierManager: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openForm, setOpenForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<
    Supplier | undefined
  >();

  useEffect(() => {
    // Load suppliers from database
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      // Implement loading suppliers from database
      // const loadedSuppliers = await dbOperations.getSuppliers();
      // setSuppliers(loadedSuppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const handleAddSupplier = async (supplier: Supplier) => {
    try {
      // Implement adding supplier to database
      // const newSupplier = await dbOperations.addSupplier(supplier);
      setSuppliers([...suppliers, { ...supplier, id: Date.now() }]);
    } catch (error) {
      console.error("Error adding supplier:", error);
    }
  };

  const handleUpdateSupplier = async (supplier: Supplier) => {
    try {
      // Implement updating supplier in database
      // await dbOperations.updateSupplier(supplier);
      setSuppliers(suppliers.map((s) => (s.id === supplier.id ? supplier : s)));
    } catch (error) {
      console.error("Error updating supplier:", error);
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      // Implement deleting supplier from database
      // await dbOperations.deleteSupplier(supplierId);
      setSuppliers(suppliers.filter((s) => s.id !== supplierId));
    } catch (error) {
      console.error("Error deleting supplier:", error);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setOpenForm(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Supplier Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedSupplier(undefined);
            setOpenForm(true);
          }}
        >
          Add Supplier
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.contactPerson}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.phone}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(supplier)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      supplier.id && handleDeleteSupplier(supplier.id)
                    }
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SupplierForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSave={selectedSupplier ? handleUpdateSupplier : handleAddSupplier}
        supplier={selectedSupplier}
      />
    </Box>
  );
};

export default SupplierManager;
