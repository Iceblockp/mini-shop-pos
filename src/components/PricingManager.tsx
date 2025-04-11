import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { BulkPrice, Promotion } from "../utils/database";

interface PricingManagerProps {
  open: boolean;
  onClose: () => void;
  bulkPrices: BulkPrice[];
  promotion?: Promotion;
  onBulkPricesChange: (prices: BulkPrice[]) => void;
  onPromotionChange: (promotion: Promotion | undefined) => void;
}

const PricingManager: React.FC<PricingManagerProps> = ({
  open,
  onClose,
  bulkPrices,
  promotion,
  onBulkPricesChange,
  onPromotionChange,
}) => {
  const handleAddBulkPrice = () => {
    const newBulkPrice: BulkPrice = { quantity: 0, price: 0 };
    onBulkPricesChange([...bulkPrices, newBulkPrice]);
  };

  const handleBulkPriceChange = (
    index: number,
    field: keyof BulkPrice,
    value: number
  ) => {
    const updatedPrices = bulkPrices.map((price, i) =>
      i === index ? { ...price, [field]: value } : price
    );
    onBulkPricesChange(updatedPrices);
  };

  const handleDeleteBulkPrice = (index: number) => {
    const updatedPrices = bulkPrices.filter((_, i) => i !== index);
    onBulkPricesChange(updatedPrices);
  };

  const handlePromotionChange = (field: keyof Promotion, value: any) => {
    const updatedPromotion: Promotion = {
      ...(promotion || {
        startDate: new Date(),
        endDate: new Date(),
        discountType: "percentage",
        discountValue: 0,
      }),
      [field]: value,
    };
    onPromotionChange(updatedPromotion);
  };

  const clearPromotion = () => {
    onPromotionChange(undefined);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Manage Pricing</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Bulk Pricing Section */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Bulk Pricing
            </Typography>
            {bulkPrices.map((price, index) => (
              <Grid container spacing={2} key={index} alignItems="center">
                <Grid size={4}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={price.quantity}
                    onChange={(e) =>
                      handleBulkPriceChange(
                        index,
                        "quantity",
                        Number(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 1 } }}
                  />
                </Grid>
                <Grid size={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={price.price}
                    onChange={(e) =>
                      handleBulkPriceChange(
                        index,
                        "price",
                        Number(e.target.value)
                      )
                    }
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>
                <Grid size={4}>
                  <IconButton onClick={() => handleDeleteBulkPrice(index)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              onClick={handleAddBulkPrice}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Bulk Price
            </Button>
          </Grid>

          {/* Promotion Section */}
          <Grid size={12}>
            <Typography variant="h6" gutterBottom>
              Promotion
            </Typography>
            {promotion ? (
              <Grid container spacing={2}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={promotion.startDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      handlePromotionChange(
                        "startDate",
                        new Date(e.target.value)
                      )
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={promotion.endDate.toISOString().split("T")[0]}
                    onChange={(e) =>
                      handlePromotionChange("endDate", new Date(e.target.value))
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={6}>
                  <FormControl fullWidth>
                    <InputLabel>Discount Type</InputLabel>
                    <Select
                      value={promotion.discountType}
                      onChange={(e) =>
                        handlePromotionChange(
                          "discountType",
                          e.target.value as "percentage" | "fixed"
                        )
                      }
                      label="Discount Type"
                    >
                      <MenuItem value="percentage">Percentage</MenuItem>
                      <MenuItem value="fixed">Fixed Amount</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    label="Discount Value"
                    type="number"
                    value={promotion.discountValue}
                    onChange={(e) =>
                      handlePromotionChange(
                        "discountValue",
                        Number(e.target.value)
                      )
                    }
                    InputProps={{
                      inputProps: {
                        min: 0,
                        max:
                          promotion.discountType === "percentage"
                            ? 100
                            : undefined,
                        step: 0.01,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            ) : (
              <Button
                onClick={() =>
                  onPromotionChange({
                    startDate: new Date(),
                    endDate: new Date(),
                    discountType: "percentage",
                    discountValue: 0,
                  })
                }
                variant="outlined"
              >
                Add Promotion
              </Button>
            )}
            {promotion && (
              <Button onClick={clearPromotion} color="error" sx={{ mt: 2 }}>
                Remove Promotion
              </Button>
            )}
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PricingManager;
