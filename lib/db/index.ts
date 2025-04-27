import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// Create Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle ORM client
export const db = drizzle({client:sql,schema});
