import { sqliteTable, AnySQLiteColumn, uniqueIndex, integer, text } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const users = sqliteTable("users", {
	id: integer("id").primaryKey().notNull(),
	name: text("name").notNull(),
	display_name: text("display_name"),
	location_x: integer("location_x"),
	location_y: integer("location_y"),
	location_z: integer("location_z"),
	location_world: text("location_world"),
	description: text("description"),
},
(table) => {
	return {
		name_unique: uniqueIndex("users_name_unique").on(table.name),
	}
});

export const tags = sqliteTable("tags", {
	id: integer("id").primaryKey().notNull(),
	name: text("name").notNull(),
},
(table) => {
	return {
		name_unique: uniqueIndex("tags_name_unique").on(table.name),
	}
});