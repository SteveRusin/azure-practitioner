export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
};
export const mockedProducts: Product[] = [
  {
    id: "1",
    title: "Mock product 1",
    description: "Mock product description 1!",
    price: 10,
  },
  {
    id: "2",
    title: "Mock product 2",
    description: "Mock product description 2",
    price: 20,
  },
];
