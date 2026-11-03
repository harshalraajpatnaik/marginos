-- V3: Mode A Quick Start Cashbook, Customers, Suppliers, Products, and Inventory Movements

CREATE TABLE cashbook_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    opening_cash NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    cash_sales NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    digital_sales NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    credit_sales NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    cash_purchases NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    operating_expenses NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    customer_collections NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    supplier_payments NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    cash_deposits NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    cash_withdrawals NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    owner_capital NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    owner_drawings NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    loan_received NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    loan_repaid NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    calculated_closing_cash NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    counted_cash NUMERIC(19,4),
    cash_variance NUMERIC(19,4),
    estimated_cost_of_goods NUMERIC(19,4),
    estimated_gross_profit NUMERIC(19,4),
    estimated_net_profit NUMERIC(19,4),
    notes TEXT,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_entry_date UNIQUE (business_id, entry_date)
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    gstin VARCHAR(50),
    address TEXT,
    credit_limit NUMERIC(19,4) DEFAULT 0.0000,
    opening_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    current_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    gstin VARCHAR(50),
    address TEXT,
    payment_terms_days INT DEFAULT 30,
    opening_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    current_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(20) NOT NULL DEFAULT 'PCS', -- PCS, KG, LITRE, BOX, PACKET, METER
    purchase_price NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    selling_price NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    mrp NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- e.g. 0, 5, 12, 18, 28
    reorder_level NUMERIC(19,4) NOT NULL DEFAULT 10.0000,
    reorder_quantity NUMERIC(19,4) NOT NULL DEFAULT 20.0000,
    current_stock NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    weighted_average_cost NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_product_sku UNIQUE (business_id, sku)
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- PURCHASE, SALE, RETURN_IN, RETURN_OUT, ADJUSTMENT, OPENING
    quantity NUMERIC(19,4) NOT NULL,
    unit_cost NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    total_cost NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    reference_type VARCHAR(50), -- INVOICE, BILL, MANUAL, STOCKTAKE
    reference_id UUID,
    notes VARCHAR(255),
    movement_date DATE NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cashbook_business_date ON cashbook_entries(business_id, entry_date);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_products_sku ON products(business_id, sku);
CREATE INDEX idx_inventory_product_date ON inventory_movements(product_id, movement_date);
