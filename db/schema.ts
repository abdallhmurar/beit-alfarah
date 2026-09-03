// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const events = sqliteTable("events", {id: integer("id").primaryKey({autoIncrement:true}),eventType:text("event_type").notNull(),customerName:text("customer_name").notNull(),phone1:text("phone_1").notNull(),phone2:text("phone_2").notNull().default(""),area:text("area").notNull(),eventDate:text("event_date").notNull().default(""),notes:text("notes").notNull().default(""),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)});
export const categories = sqliteTable("categories", {id:integer("id").primaryKey({autoIncrement:true}),name:text("name").notNull(),icon:text("icon").notNull().default("sparkles"),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)});
export const catalogItems = sqliteTable("catalog_items", {id:integer("id").primaryKey({autoIncrement:true}),categoryId:integer("category_id").notNull(),name:text("name").notNull(),description:text("description").notNull().default(""),price:integer("price"),imageKey:text("image_key").notNull().default(""),isPremium:integer("is_premium",{mode:"boolean"}).notNull().default(false),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)});
export const eventItems = sqliteTable("event_items", {id:integer("id").primaryKey({autoIncrement:true}),eventId:integer("event_id").notNull(),itemId:integer("item_id").notNull(),quantity:integer("quantity").notNull().default(1),createdAt:text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)});
