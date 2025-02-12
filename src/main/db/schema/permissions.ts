import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

export const permissions = sqliteTable('permissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  label: text('label').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  defaultEnabled: integer('default_enabled').notNull().default(0),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
})

export const initialPermissions = [
  // Products Management
  { name: 'products.view', label: 'View Products', category: 'Products', description: 'Can view product list and details', defaultEnabled: 1 },
  { name: 'products.create', label: 'Create Products', category: 'Products', description: 'Can add new products', defaultEnabled: 0 },
  { name: 'products.edit', label: 'Edit Products', category: 'Products', description: 'Can modify existing products', defaultEnabled: 0 },
  { name: 'products.delete', label: 'Delete Products', category: 'Products', description: 'Can remove products', defaultEnabled: 0 },

  // Categories Management
  { name: 'categories.view', label: 'View Categories', category: 'Categories', description: 'Can view categories list', defaultEnabled: 1 },
  { name: 'categories.create', label: 'Create Categories', category: 'Categories', description: 'Can create new categories', defaultEnabled: 0 },
  { name: 'categories.edit', label: 'Edit Categories', category: 'Categories', description: 'Can modify existing categories', defaultEnabled: 0 },
  { name: 'categories.delete', label: 'Delete Categories', category: 'Categories', description: 'Can remove categories', defaultEnabled: 0 },

  // Orders Management
  { name: 'orders.view', label: 'View Orders', category: 'Orders', description: 'Can view orders list and details', defaultEnabled: 1 },
  { name: 'orders.create', label: 'Create Orders', category: 'Orders', description: 'Can create new orders', defaultEnabled: 1 },
  { name: 'orders.edit', label: 'Edit Orders', category: 'Orders', description: 'Can modify existing orders', defaultEnabled: 0 },
  { name: 'orders.delete', label: 'Delete Orders', category: 'Orders', description: 'Can cancel/delete orders', defaultEnabled: 0 },

  // Clients Management
  { name: 'clients.view', label: 'View Clients', category: 'Clients', description: 'Can view clients list and details', defaultEnabled: 1 },
  { name: 'clients.create', label: 'Create Clients', category: 'Clients', description: 'Can add new clients', defaultEnabled: 1 },
  { name: 'clients.edit', label: 'Edit Clients', category: 'Clients', description: 'Can modify client information', defaultEnabled: 0 },
  { name: 'clients.delete', label: 'Delete Clients', category: 'Clients', description: 'Can remove clients', defaultEnabled: 0 },

  // Spents Management
  { name: 'spents.view', label: 'View Expenses', category: 'Expenses', description: 'Can view expenses list', defaultEnabled: 1 },
  { name: 'spents.create', label: 'Create Expenses', category: 'Expenses', description: 'Can record new expenses', defaultEnabled: 0 },
  { name: 'spents.edit', label: 'Edit Expenses', category: 'Expenses', description: 'Can modify expense records', defaultEnabled: 0 },
  { name: 'spents.delete', label: 'Delete Expenses', category: 'Expenses', description: 'Can remove expense records', defaultEnabled: 0 },

  // Reports Access
  { name: 'reports.sales', label: 'Sales Reports', category: 'Reports', description: 'Can view sales reports', defaultEnabled: 0 },
  { name: 'reports.inventory', label: 'Inventory Reports', category: 'Reports', description: 'Can view inventory reports', defaultEnabled: 0 },
  { name: 'reports.financial', label: 'Financial Reports', category: 'Reports', description: 'Can view financial reports', defaultEnabled: 0 },

  // Users Management
  { name: 'users.view', label: 'View Users', category: 'Users', description: 'Can view user list and details', defaultEnabled: 1 },
  { name: 'users.create', label: 'Create Users', category: 'Users', description: 'Can add new users', defaultEnabled: 0 },
  { name: 'users.edit', label: 'Edit Users', category: 'Users', description: 'Can modify user information', defaultEnabled: 0 },
  { name: 'users.delete', label: 'Delete Users', category: 'Users', description: 'Can remove users', defaultEnabled: 0 }
]

export const userPermissions = sqliteTable('user_permissions', {
  userId: integer('user_id').references(() => users.id),
  permissionId: integer('permission_id').references(() => permissions.id),
  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`)
})

export type Permission = typeof permissions.$inferSelect 