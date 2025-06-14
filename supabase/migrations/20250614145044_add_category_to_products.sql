-- Add category column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'other';

-- Update existing products to have a category if they don't already
UPDATE products SET category = 'other' WHERE category IS NULL;

-- Add a check constraint to ensure category is not empty
ALTER TABLE products ADD CONSTRAINT products_category_not_empty CHECK (category <> '');