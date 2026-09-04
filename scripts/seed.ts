import { seedDatabase } from "../lib/seed";

seedDatabase()
  .then(() => {
    console.log("Database seeded successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed database:", err);
    process.exit(1);
  });
