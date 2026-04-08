import { sql } from "drizzle-orm";
import { execSync } from "node:child_process";
import db from "../../db/connection.ts";
import { entries, habits, habitTags, tags, users } from "../../db/schema.ts";

export default async function setup() {
  console.log("💾 Setting up the test db");

  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

    console.log("🚀 Pushing schema using drizzle-kit...");

    execSync(
      `npx drizzle-kit push --url=${process.env.DATABASE_URL} --schema="./src/db/schema.ts" --dialect="postgresql"`,
      {
        stdio: "inherit",
        cwd: process.cwd(),
      },
    );

    console.log("✅ Test DB created");
  } catch (e) {
    console.error("❌ Fail to setup test db", e);
    throw e;
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

      process.exit(0);
    } catch (e) {
      console.error("❌ Fail to cleanup test db", e);
      throw e;
    }
  };
}
