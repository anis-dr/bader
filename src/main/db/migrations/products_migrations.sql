CREATE TABLE `products` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `price` real NOT NULL,
  `description` text,
  `image` text,
  `stockQuantity` integer NOT NULL DEFAULT 0,
  `trackStock` integer NOT NULL DEFAULT true,
  `active` integer NOT NULL DEFAULT true,
  `categoryId` integer NOT NULL,
  `createdAt` text DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` text DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`)
);
--> statement-breakpoint
CREATE INDEX `products_categoryId_idx` ON `products` (`categoryId`); 