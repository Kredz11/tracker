import { getDb } from "../src/db/connection";
import fs from "fs";
import path from "path";

async function seed() {
  const db = await getDb();
  const seedsDir = path.join(__dirname, "..", "src", "db", "seeds");
  if (!fs.existsSync(seedsDir)) {
    console.log("No seeds directory found");
    return;
  }
  const files = fs.readdirSync(seedsDir).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedsDir, file), "utf-8");
    await db.exec(sql);
    console.log(`Applied seed: ${file}`);
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
