-- 01-schema.sql
-- Base Schema for MANLY Project
-- PostgreSQL / Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

--------------------------------------------------------------------------------
-- 1. ENUMS
--------------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
    'super_admin',
    'resto_admin',
    'staff',
    'customer'
);

CREATE TYPE order_status AS ENUM (
    'pending',      -- Created, not yet confirmed/paid
    'confirmed',    -- Paid/Accepted by kitchen
    'preparing',    -- In kitchen
    'ready',        -- Ready for pickup/serving
    'delivered',    -- Served to table
    'completed',    -- Transaction done
    'cancelled'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'success',
    'failed',
    'refunded'
);

CREATE TYPE payment_provider AS ENUM (
    'LIGOS',
    'CASH',
    'OTHER'
);

--------------------------------------------------------------------------------
-- 2. TABLES
--------------------------------------------------------------------------------

-- 2.1 PROFILES (One-to-One with auth.users)
-- Public profiles for application logic
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.2 RESTAURANTS
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL, -- For URL access
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    owner_id UUID REFERENCES profiles(id), -- The main admin
    is_active BOOLEAN DEFAULT true,
    currency TEXT DEFAULT 'XOF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.3 RESTAURANT SETTINGS (Branding & Config)
CREATE TABLE restaurant_settings (
    restaurant_id UUID PRIMARY KEY REFERENCES restaurants(id) ON DELETE CASCADE,
    logo_url TEXT,
    cover_image_url TEXT,
    primary_color TEXT DEFAULT '#0f172a',
    font_family TEXT DEFAULT 'Inter',
    social_links JSONB DEFAULT '{}',
    is_open BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.4 TABLES (Physical Tables)
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Table 1", "Terrasse 2"
    capacity INTEGER DEFAULT 4,
    zone_id UUID, -- Future proofing for zones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.5 QR CODES
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID UNIQUE REFERENCES tables(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL, -- Secure random token for URL
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.6 MENU CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon_url TEXT,
    rank INTEGER DEFAULT 0, -- For sorting
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.7 DISHES
CREATE TABLE dishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image_urls TEXT[], -- Array of URLs
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    allergens TEXT[], -- Array ["Gluten", "Nuts"]
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.8 ORDER MODIFIERS (Options & Extras)
CREATE TABLE modifiers_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Cuisson", "Sauce"
    min_selection INTEGER DEFAULT 0,
    max_selection INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES modifiers_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- "Saignant", "Ketchup"
    price_extra DECIMAL(10,2) DEFAULT 0.00,
    is_available BOOLEAN DEFAULT true
);

-- Many-to-Many: Dishes <-> Modifier Groups
CREATE TABLE dish_modifiers (
    dish_id UUID REFERENCES dishes(id) ON DELETE CASCADE,
    group_id UUID REFERENCES modifiers_groups(id) ON DELETE CASCADE,
    rank INTEGER DEFAULT 0,
    PRIMARY KEY (dish_id, group_id)
);

-- 2.9 ORDERS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    table_id UUID REFERENCES tables(id),
    customer_id UUID REFERENCES profiles(id), -- Nullable (anonymous)
    
    status order_status DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    special_instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2.10 ORDER ITEMS
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    dish_id UUID REFERENCES dishes(id),
    
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL, -- Snapshot of price at ordering
    total_price DECIMAL(10,2) NOT NULL, -- (unit_price * qty) + modifiers
    
    selected_modifiers JSONB, -- Store snapshot of choices: [{name: "Saignant", price: 0}]
    notes TEXT
);

-- 2.11 PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id),
    
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'XOF',
    
    provider payment_provider DEFAULT 'LIGOS',
    provider_tx_id TEXT, -- External ID
    status payment_status DEFAULT 'pending',
    payment_method_detail TEXT, -- "OM", "MOMO", "CARD"
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE
);

--------------------------------------------------------------------------------
-- 3. INDEXES
--------------------------------------------------------------------------------

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_qr_codes_token ON qr_codes(token);
