export type ProductEntity = {
  id: string; // UUID, primary and partition key
  title: string;
  description: string;
  price: number;
};

export type StockEntity = {
  id: ProductEntity["id"];
  product_id: ProductEntity["id"]; // primary and partition key
  count: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  count: number;
};
