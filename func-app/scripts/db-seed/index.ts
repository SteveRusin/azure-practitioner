import { seed } from "./products-and-stock";

async function main() {
  await seed();
}

main()
  .then(() => {
    console.log("Seeding db is done");
  })
  .catch((e) => {
    console.error(e);
    console.log("Something went wrong while seeding db");
  });
