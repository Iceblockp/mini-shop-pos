import { useState } from "react";
import { Product } from "../utils/database";

interface ProductSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onClose: () => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  onProductSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="product-search-overlay">
      <div className="product-search-modal">
        <div className="modal-header">
          <h2>Search Products</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          autoFocus
        />
        <div className="product-list">
          {filteredProducts.map((product) => (
            <div
              key={product.barcode}
              className="product-item"
              onClick={() => {
                onProductSelect(product);
                onClose();
              }}
            >
              <span className="product-name">{product.name}</span>
              <span className="product-price">${product.price}</span>
            </div>
          ))}
        </div>

        <style>
          {`
            .product-search-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              justify-content: center;
              align-items: center;
              z-index: 1000;
            }

            .product-search-modal {
              background: white;
              border-radius: 8px;
              width: 90%;
              max-width: 600px;
              max-height: 80vh;
              display: flex;
              flex-direction: column;
              overflow: hidden;
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 1rem;
              border-bottom: 1px solid #eee;
            }

            .close-button {
              background: none;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              padding: 0.5rem;
            }

            .search-input {
              margin: 1rem;
              padding: 0.5rem;
              border: 1px solid #ddd;
              border-radius: 4px;
              font-size: 1rem;
            }

            .product-list {
              overflow-y: auto;
              padding: 0 1rem 1rem;
            }

            .product-item {
              display: flex;
              justify-content: space-between;
              padding: 0.75rem;
              border: 1px solid #eee;
              border-radius: 4px;
              margin-bottom: 0.5rem;
              cursor: pointer;
              transition: background-color 0.2s;
            }

            .product-item:hover {
              background-color: #f5f5f5;
            }

            .product-name {
              font-weight: 500;
            }

            .product-price {
              color: #2196f3;
              font-weight: 500;
            }
          `}
        </style>
      </div>
    </div>
  );
};
