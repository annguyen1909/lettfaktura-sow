-- PostgreSQL Schema for Lettfaktura SOW Pricelist Application
-- This script can be run in Supabase SQL Editor

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    article_no VARCHAR(50) NOT NULL,
    product TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    in_stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'pieces',
    in_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to existing table (in case table already exists)
ALTER TABLE products ADD COLUMN IF NOT EXISTS in_price DECIMAL(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_article_no ON products(article_no);
CREATE INDEX IF NOT EXISTS idx_products_product ON products(product);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO products (article_no, product, price, in_stock, unit, in_price, description) VALUES
('1234567890', 'This is a test product with fifty characters this!', 1500800, 1500800, 'kilometers/hour', 1200000, 'High-speed performance test product with advanced specifications'),
('1234567890', 'This is a test product with fifty characters this!', 1500800, 1500800, 'kilometers/hour', 1200000, 'Duplicate test item for validation purposes'),
('1234567892', 'Sony DSLR 12345', 15000, 15000, 'pieces', 12000, 'Professional digital camera with interchangeable lens system'),
('1234567893', 'Random product', 1234, 1234, 'items', 950, 'General purpose item for testing and development'),
('1234567894', 'Professional Camera Lens 85mm f/1.4', 2500, 50, 'pieces', 1800, 'Portrait lens with wide aperture for professional photography'),
('1234567895', 'Wireless Bluetooth Headphones', 299, 200, 'pieces', 220, 'High-quality audio headphones with noise cancellation'),
('1234567896', 'Gaming Mechanical Keyboard RGB', 189, 75, 'pieces', 140, 'Mechanical switches with customizable RGB backlighting'),
('1234567897', 'Smartphone 128GB Storage Black', 899, 150, 'pieces', 650, 'Latest generation smartphone with advanced camera system'),
('1234567898', 'Laptop 15.6 inch i7 16GB RAM 512GB SSD', 1299, 25, 'pieces', 980, 'High-performance laptop for professional and gaming use'),
('1234567899', 'Wireless Mouse Ergonomic Design', 45, 300, 'pieces', 32, 'Comfortable wireless mouse with precision tracking'),
('1234567900', 'External Hard Drive 2TB USB 3.0', 125, 100, 'pieces', 95, 'Portable storage solution with fast transfer speeds'),
('1234567901', 'Monitor 27 inch 4K Ultra HD', 599, 40, 'pieces', 450, 'Professional display with accurate color reproduction'),
('1234567902', 'Graphics Card RTX 4080 16GB', 1199, 15, 'pieces', 899, 'High-end graphics card for gaming and content creation'),
('1234567903', 'Desk Chair Ergonomic Office', 399, 80, 'pieces', 280, 'Comfortable office chair with lumbar support'),
('1234567904', 'Standing Desk Adjustable Height', 699, 35, 'pieces', 520, 'Electric height-adjustable desk for health and productivity'),
('1234567905', 'Webcam 1080p HD Auto Focus', 89, 120, 'pieces', 65, 'High-definition webcam for video conferencing'),
('1234567906', 'USB Hub 7 Port with Power Adapter', 35, 250, 'pieces', 25, 'Powered USB hub for multiple device connections'),
('1234567907', 'Tablet 10.1 inch Android 64GB', 329, 60, 'pieces', 240, 'Android tablet for entertainment and productivity'),
('1234567908', 'Smartwatch Fitness Tracker GPS', 249, 90, 'pieces', 180, 'Fitness tracking smartwatch with GPS and health monitoring'),
('1234567909', 'Wireless Charger 15W Fast Charging', 39, 180, 'pieces', 28, 'Fast wireless charging pad compatible with multiple devices'),
('1234567910', 'Power Bank 20000mAh USB-C PD', 55, 140, 'pieces', 40, 'High-capacity portable charger with fast charging support'),
('1234567911', 'Bluetooth Speaker Waterproof', 79, 110, 'pieces', 58, 'Portable waterproof speaker with excellent sound quality')
ON CONFLICT DO NOTHING;

