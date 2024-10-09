import {getStocksContainer, getProductsContainer} from "./client";
import { Product, StockEntity, ProductEntity } from "../models";

export async function getAllProducts(): Promise<Product[]> {
  const products = await getProductsContainer().items
    .readAll<ProductEntity>()
    .fetchAll();
  const stocks = getStocksContainer().items.readAll<StockEntity>().fetchAll();
  const [productsResult, stocksResult] = await Promise.all([products, stocks]);
  const stockById: Record<string, number> = {};
  stocksResult.resources.forEach(({ count, product_id }) => {
    stockById[product_id] = count;
  });

  return productsResult.resources.map(
    ({ title, price, description, id }): Product => {
      return {
        id,
        title,
        price,
        description,
        count: stockById[id] ?? 0,
      };
    },
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = getProductsContainer().item(id, id).read<ProductEntity>();
  const stock = getStocksContainer().item(id, id).read<StockEntity>();

  const [productResult, stockResult] = await Promise.all([product, stock]);

  if(!productResult.resource) {
    return null;
  }

  return {
    id: productResult.resource.id,
    title: productResult.resource.title,
    description: productResult.resource.description,
    price: productResult.resource.price,
    count: stockResult.resource.count,
  }
}
