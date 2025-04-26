import {
	pgTable,
	uuid,
	varchar,
	decimal,
	timestamp,
	text,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: varchar("id", { length: 36 }).primaryKey().notNull(),
	accountNumber: varchar("account_number", { length: 10 }).unique().notNull(),
	email: varchar("email", { length: 255 }).unique().notNull(),
	role: text("role", { enum: ["user", "admin"] })
		.default("user")
		.notNull(),
	balance: decimal("balance", { precision: 10, scale: 2 })
		.default("0")
		.notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
	id: uuid("id").primaryKey().defaultRandom().notNull(),
	fromAccount: varchar("from_account", { length: 10 }),
	toAccount: varchar("to_account", { length: 10 }).notNull(),
	amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
	type: text("type", { enum: ["transfer", "deposit"] }).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
