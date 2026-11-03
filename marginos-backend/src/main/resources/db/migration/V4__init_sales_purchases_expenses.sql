-- V4: Sales Invoices, Purchase Invoices, Expenses and Lines

CREATE TABLE sales_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    subtotal NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    paid_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    balance_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH', -- CASH, UPI, CARD, BANK_TRANSFER, CREDIT
    status VARCHAR(50) NOT NULL DEFAULT 'PAID', -- DRAFT, ISSUED, PARTIALLY_PAID, PAID, CANCELLED
    notes TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_sales_invoice UNIQUE (business_id, invoice_number)
);

CREATE TABLE sales_invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES sales_invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    unit_price NUMERIC(19,4) NOT NULL,
    cost_price NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE purchase_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    bill_number VARCHAR(100) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    supplier_name VARCHAR(255) NOT NULL,
    subtotal NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    discount_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    paid_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    balance_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH', -- CASH, UPI, BANK_TRANSFER, CREDIT
    status VARCHAR(50) NOT NULL DEFAULT 'PAID', -- DRAFT, RECEIVED, PARTIALLY_PAID, PAID
    notes TEXT,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_purchase_bill UNIQUE (business_id, bill_number)
);

CREATE TABLE purchase_invoice_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity NUMERIC(19,4) NOT NULL,
    unit_cost NUMERIC(19,4) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    total_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL, -- RENT, SALARIES, UTILITIES, TRANSPORT, MARKETING, PACKAGING, REPAIRS, INTEREST, TAXES, OTHER
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'CASH', -- CASH, UPI, BANK_TRANSFER
    vendor_name VARCHAR(255),
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_business_date ON sales_invoices(business_id, invoice_date);
CREATE INDEX idx_purchases_business_date ON purchase_invoices(business_id, bill_date);
CREATE INDEX idx_expenses_business_date ON expenses(business_id, expense_date);
