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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
INSERT INTO products (article_no, product, price, in_stock, unit) VALUES
('1234567890', 'This is a test product with fifty characters this!', 1500800, 1500800, 'kilometers/hour'),
('1234567890', 'This is a test product with fifty characters this!', 1500800, 1500800, 'kilometers/hour'),
('1234567892', 'Sony DSLR 12345', 15000, 15000, 'pieces'),
('1234567893', 'Random product', 1234, 1234, 'items'),
('1234567894', 'Professional Camera Lens 85mm f/1.4', 2500, 50, 'pieces'),
('1234567895', 'Wireless Bluetooth Headphones', 299, 200, 'pieces'),
('1234567896', 'Gaming Mechanical Keyboard RGB', 189, 75, 'pieces'),
('1234567897', 'Smartphone 128GB Storage Black', 899, 150, 'pieces'),
('1234567898', 'Laptop 15.6 inch i7 16GB RAM 512GB SSD', 1299, 25, 'pieces'),
('1234567899', 'Wireless Mouse Ergonomic Design', 45, 300, 'pieces'),
('1234567900', 'External Hard Drive 2TB USB 3.0', 125, 100, 'pieces'),
('1234567901', 'Monitor 27 inch 4K Ultra HD', 599, 40, 'pieces'),
('1234567902', 'Graphics Card RTX 4080 16GB', 1199, 15, 'pieces'),
('1234567903', 'Desk Chair Ergonomic Office', 399, 80, 'pieces'),
('1234567904', 'Standing Desk Adjustable Height', 699, 35, 'pieces'),
('1234567905', 'Webcam 1080p HD Auto Focus', 89, 120, 'pieces'),
('1234567906', 'USB Hub 7 Port with Power Adapter', 35, 250, 'pieces'),
('1234567907', 'Tablet 10.1 inch Android 64GB', 329, 60, 'pieces'),
('1234567908', 'Smartwatch Fitness Tracker GPS', 249, 90, 'pieces'),
('1234567909', 'Wireless Charger 15W Fast Charging', 39, 180, 'pieces'),
('1234567910', 'Power Bank 20000mAh USB-C PD', 55, 140, 'pieces'),
('1234567911', 'Bluetooth Speaker Waterproof', 79, 110, 'pieces')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions (if using RLS)
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Example RLS policy for read access (uncomment if needed)
-- CREATE POLICY "Allow read access to products" ON products
--     FOR SELECT USING (true);

-- Example RLS policy for write access (uncomment if needed)
-- CREATE POLICY "Allow insert access to products" ON products
--     FOR INSERT WITH CHECK (true);

-- Example RLS policy for update access (uncomment if needed)
-- CREATE POLICY "Allow update access to products" ON products
--     FOR UPDATE USING (true) WITH CHECK (true);

-- Example RLS policy for delete access (uncomment if needed)
-- CREATE POLICY "Allow delete access to products" ON products
--     FOR DELETE USING (true);
