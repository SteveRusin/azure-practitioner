import { coerce, string, z } from "zod";

export const productSchema = z.object({
  id: string(),
  title: string(),
  description: string(),
  price: coerce.number().positive(),
  count: coerce.number().positive(),
});

export const productDtoSchema = productSchema.omit({
  id: true,
});

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

export type ProductDto = z.infer<typeof productDtoSchema>;
export type Product = z.infer<typeof productSchema>;
