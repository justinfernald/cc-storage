import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const storages = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name'),
  locationX: integer('location_x'),
  locationY: integer('location_y'),
  locationZ: integer('location_z'),
  locationWorld: text('location_world'),
  description: text('description'),
});
