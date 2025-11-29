import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export const monitors = sqliteTable('monitors', {
	id: text('id').primaryKey().$defaultFn(() => uuid()),
	name: text('name').notNull(),
	url: text('url').notNull(),
	interval: integer('interval').notNull().default(300),
	locations: text('locations').notNull(),
	active: integer('active', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updatedAt: text('updated_at')
		.notNull()
		.$defaultFn(() => new Date().toISOString())
});

export const measurements = sqliteTable(
	'measurements',
	{
		id: text('id').primaryKey().$defaultFn(() => uuid()),
		monitorId: text('monitor_id')
			.notNull()
			.references(() => monitors.id, { onDelete: 'cascade' }),
		location: text('location').notNull(),
		country: text('country'),
		city: text('city'),
		networkType: text('network_type'),
		statusCode: integer('status_code'),
		latency: real('latency').notNull(),
		status: text('status').notNull(),
		errorMessage: text('error_message'),
		timestamp: text('timestamp')
			.notNull()
			.$defaultFn(() => new Date().toISOString())
	},
	(table) => ({
		monitorIdTimestampIdx: index('monitor_id_timestamp_idx').on(table.monitorId, table.timestamp)
	})
);

export const monitorsRelations = relations(monitors, ({ many }) => ({
	measurements: many(measurements)
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
	monitor: one(monitors, {
		fields: [measurements.monitorId],
		references: [monitors.id]
	})
}));

export type Monitor = typeof monitors.$inferSelect;
export type NewMonitor = typeof monitors.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;