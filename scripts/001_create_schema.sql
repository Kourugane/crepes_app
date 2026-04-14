-- Crepes & Waffles Database Schema
-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product customizations table
CREATE TABLE IF NOT EXISTS customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customization options table
CREATE TABLE IF NOT EXISTS customization_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customization_id UUID NOT NULL REFERENCES customizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'recibido' CHECK (status IN ('recibido', 'preparacion', 'en-camino', 'entregado', 'cancelado')),
  total INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB DEFAULT '{}',
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  subtotal INTEGER NOT NULL,
  tax INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dish recognition logs table
CREATE TABLE IF NOT EXISTS dish_recognition_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  recognized_dishes JSONB DEFAULT '[]',
  confidence_scores JSONB DEFAULT '[]',
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_recognition_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for products and categories (anyone can view menu)
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public can view active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view customizations" ON customizations FOR SELECT USING (true);
CREATE POLICY "Public can view customization options" ON customization_options FOR SELECT USING (true);

-- Authenticated users can manage all data (admin access)
CREATE POLICY "Authenticated users can manage categories" ON categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage products" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customizations" ON customizations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customization options" ON customization_options FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customers" ON customers FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage orders" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage order items" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage invoices" ON invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage dish recognition logs" ON dish_recognition_logs FOR ALL USING (auth.role() = 'authenticated');

-- Anyone can create orders and customers (for checkout)
CREATE POLICY "Anyone can create customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Anyone can view their order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Anyone can create dish recognition logs" ON dish_recognition_logs FOR INSERT WITH CHECK (true);
