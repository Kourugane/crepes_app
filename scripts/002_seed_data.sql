-- Seed Categories
INSERT INTO categories (name, slug, description) VALUES
  ('Desayunos', 'desayunos', 'Deliciosos desayunos para comenzar el día'),
  ('Postres', 'postres', 'Postres dulces y deliciosos'),
  ('Platos Fuertes', 'platos-fuertes', 'Platos principales para satisfacer tu apetito'),
  ('Bebidas', 'bebidas', 'Bebidas refrescantes y calientes')
ON CONFLICT (slug) DO NOTHING;

-- Seed Products
WITH cat AS (
  SELECT id, slug FROM categories
)
INSERT INTO products (name, description, price, image, category_id, is_active) VALUES
  -- Desayunos
  ('Crepe de Jamón y Queso', 'Delicioso crepe relleno de jamón ahumado y queso derretido, acompañado de ensalada fresca', 28000, '/images/crepe-jamon-queso.jpg', (SELECT id FROM cat WHERE slug = 'desayunos'), true),
  ('Waffle Clásico', 'Waffle belga tradicional con mantequilla y miel de maple, servido con frutas frescas', 24000, '/images/waffle-clasico.jpg', (SELECT id FROM cat WHERE slug = 'desayunos'), true),
  ('Crepe de Pollo', 'Crepe relleno de pollo desmenuzado con champiñones en salsa bechamel', 32000, '/images/crepe-pollo.jpg', (SELECT id FROM cat WHERE slug = 'desayunos'), true),
  -- Postres
  ('Crepe de Nutella', 'Crepe con generosa porción de Nutella, fresas frescas y crema chantilly', 22000, '/images/crepe-nutella.jpg', (SELECT id FROM cat WHERE slug = 'postres'), true),
  ('Waffle con Helado', 'Waffle tibio con tres bolas de helado, salsa de chocolate y nueces caramelizadas', 28000, '/images/waffle-helado.jpg', (SELECT id FROM cat WHERE slug = 'postres'), true),
  ('Tiramisú', 'Clásico tiramisú italiano con café espresso y cacao', 18000, '/images/tiramisu.jpg', (SELECT id FROM cat WHERE slug = 'postres'), true),
  -- Platos Fuertes
  ('Salmón a la Parrilla', 'Filete de salmón atlántico a la parrilla con vegetales grillados y arroz jazmín', 52000, '/images/salmon.jpg', (SELECT id FROM cat WHERE slug = 'platos-fuertes'), true),
  ('Lomo de Res', 'Medallón de lomo de res en salsa de champiñones, puré de papa y espárragos', 58000, '/images/lomo-res.jpg', (SELECT id FROM cat WHERE slug = 'platos-fuertes'), true),
  ('Pechuga de Pollo', 'Pechuga de pollo rellena de espinacas y queso, con salsa de albahaca', 42000, '/images/pechuga-pollo.jpg', (SELECT id FROM cat WHERE slug = 'platos-fuertes'), true),
  -- Bebidas
  ('Limonada Natural', 'Limonada refrescante con hierbabuena y un toque de jengibre', 12000, '/images/limonada.jpg', (SELECT id FROM cat WHERE slug = 'bebidas'), true),
  ('Café Americano', 'Café premium colombiano de origen único', 8000, '/images/cafe.jpg', (SELECT id FROM cat WHERE slug = 'bebidas'), true),
  ('Jugo Natural', 'Jugo de frutas frescas de temporada', 14000, '/images/jugo.jpg', (SELECT id FROM cat WHERE slug = 'bebidas'), true)
ON CONFLICT DO NOTHING;

-- Seed Customizations
WITH prod AS (
  SELECT id, name FROM products
)
INSERT INTO customizations (product_id, name) VALUES
  ((SELECT id FROM prod WHERE name = 'Crepe de Jamón y Queso'), 'Tipo de Queso'),
  ((SELECT id FROM prod WHERE name = 'Crepe de Nutella'), 'Topping Extra'),
  ((SELECT id FROM prod WHERE name = 'Salmón a la Parrilla'), 'Punto de Cocción'),
  ((SELECT id FROM prod WHERE name = 'Jugo Natural'), 'Fruta')
ON CONFLICT DO NOTHING;

-- Seed Customization Options
WITH cust AS (
  SELECT c.id, c.name, p.name as product_name 
  FROM customizations c 
  JOIN products p ON c.product_id = p.id
)
INSERT INTO customization_options (customization_id, name, price) VALUES
  -- Queso options
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Jamón y Queso' AND name = 'Tipo de Queso'), 'Mozzarella', 0),
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Jamón y Queso' AND name = 'Tipo de Queso'), 'Cheddar', 2000),
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Jamón y Queso' AND name = 'Tipo de Queso'), 'Gouda', 3000),
  -- Topping options
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Nutella' AND name = 'Topping Extra'), 'Sin topping extra', 0),
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Nutella' AND name = 'Topping Extra'), 'Helado de Vainilla', 5000),
  ((SELECT id FROM cust WHERE product_name = 'Crepe de Nutella' AND name = 'Topping Extra'), 'Banano', 3000),
  -- Cocción options
  ((SELECT id FROM cust WHERE product_name = 'Salmón a la Parrilla' AND name = 'Punto de Cocción'), 'Término Medio', 0),
  ((SELECT id FROM cust WHERE product_name = 'Salmón a la Parrilla' AND name = 'Punto de Cocción'), 'Bien Cocido', 0),
  -- Fruta options
  ((SELECT id FROM cust WHERE product_name = 'Jugo Natural' AND name = 'Fruta'), 'Naranja', 0),
  ((SELECT id FROM cust WHERE product_name = 'Jugo Natural' AND name = 'Fruta'), 'Mango', 2000),
  ((SELECT id FROM cust WHERE product_name = 'Jugo Natural' AND name = 'Fruta'), 'Maracuyá', 2000)
ON CONFLICT DO NOTHING;
