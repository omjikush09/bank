
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: "postgresql://bank_owner:npg_rxXe0pbCFZc2@ep-sparkling-mountain-a1a249wq-pooler.ap-southeast-1.aws.neon.tech/bank?sslmode=require",
	},
});
