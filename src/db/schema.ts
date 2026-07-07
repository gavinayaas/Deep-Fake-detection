import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const analyses = pgTable('analyses', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  fileType: text('file_type').notNull(), // 'image' or 'video'
  isDeepfake: boolean('is_deepfake').default(false),
  confidence: integer('confidence').default(50), // 0-100
  result: text('result').default('Pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
