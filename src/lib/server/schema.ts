import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export const monitors = sqliteTable(
	'monitors',
	{
		id: text('id').primaryKey().$defaultFn(() => uuid()),
		name: text('name').notNull(),
		url: text('url').notNull(),
		interval: integer('interval').notNull().default(300),
		locations: text('locations').notNull(),
		discordWebhook: text('discord_webhook'),
		active: integer('active', { mode: 'boolean' }).notNull().default(true),
		public: integer('public', { mode: 'boolean' }).notNull().default(false),
		lastCheckedAt: text('last_checked_at'),
		createdAt: text('created_at')
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updatedAt: text('updated_at')
			.notNull()
			.$defaultFn(() => new Date().toISOString())
	},
	(table) => ({
		activeLastCheckedIdx: index('active_last_checked_idx').on(table.active, table.lastCheckedAt)
	})
);

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

export const alerts = sqliteTable(
	'alerts',
	{
		id: text('id').primaryKey().$defaultFn(() => uuid()),
		monitorId: text('monitor_id')
			.notNull()
			.references(() => monitors.id, { onDelete: 'cascade' }),
		type: text('type').notNull(),
		message: text('message').notNull(),
		acknowledged: integer('acknowledged', { mode: 'boolean' }).notNull().default(false),
		createdAt: text('created_at')
			.notNull()
			.$defaultFn(() => new Date().toISOString())
	},
	(table) => ({
		monitorIdCreatedAtIdx: index('monitor_id_created_at_idx').on(table.monitorId, table.createdAt)
	})
);

export const monitorsRelations = relations(monitors, ({ many }) => ({
	measurements: many(measurements),
	alerts: many(alerts)
}));

export const measurementsRelations = relations(measurements, ({ one }) => ({
	monitor: one(monitors, {
		fields: [measurements.monitorId],
		references: [monitors.id]
	})
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
	monitor: one(monitors, {
		fields: [alerts.monitorId],
		references: [monitors.id]
	})
}));

export type Monitor = typeof monitors.$inferSelect;
export type NewMonitor = typeof monitors.$inferInsert;
export type Measurement = typeof measurements.$inferSelect;
export type NewMeasurement = typeof measurements.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;