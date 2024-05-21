import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const storages = sqliteTable('storages', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
  displayName: text('display_name'),
  locationX: integer('location_x'),
  locationY: integer('location_y'),
  locationZ: integer('location_z'),
  locationWorld: text('location_world'),
  description: text('description'),
});

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const storageTags = sqliteTable(
  'storage_tags',
  {
    storageId: integer('storage_id').references(() => storages.id),
    tagId: integer('tag_id').references(() => tags.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.storageId, t.tagId] }),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  storages: many(storages, { relationName: 'storages' }),
}));

export const storageRelations = relations(storages, ({ many }) => ({
  tags: many(tags, { relationName: 'tags' }),
}));

export const storageTagsRelations = relations(storageTags, ({ one }) => ({
  storage: one(storages, { fields: [storageTags.storageId], references: [storages.id] }),
  tag: one(tags, { fields: [storageTags.tagId], references: [tags.id] }),
}));
