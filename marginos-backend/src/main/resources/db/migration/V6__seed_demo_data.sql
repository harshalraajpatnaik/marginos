-- V6: Seed Demo Data: Gupta Kirana & General Store, Chart of Accounts, FY 2024-25, Products, Cashbook

-- 1. Demo User
INSERT INTO users (id, email, password_hash, full_name, phone, is_verified, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'harshal@marginos.internal',
    '$2a$10$wK1.V6dY29e.oTzB1d.46ugVqE1iKkY0vVqHn8K2a5B0E1yD4F3u6', -- MarginOS@123
    'Harshal Raaj Patnaik',
    '+919876543210',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- 2. Demo Business
INSERT INTO businesses (
    id, name, trade_name, gstin, pan, business_type, operating_mode, currency,
    financial_year_start_month, address, city, state, pin_code, phone, email, is_active
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Gupta Kirana & General Store',
    'Gupta Traders',
    '07AAAAA0000A1Z5',
    'AAAAA0000A',
    'RETAIL_KIRANA',
    'QUICK_START',
    'INR',
    4,
    'Shop No. 12, Main Market, Karol Bagh',
    'New Delhi',
    'Delhi',
    '110005',
    '+919876543210',
    'guptastore@marginos.internal',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- 3. Business Membership (Owner)
INSERT INTO business_memberships (id, user_id, business_id, role)
VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'OWNER'
) ON CONFLICT (user_id, business_id) DO NOTHING;

-- 4. Financial Year FY 2024-25
INSERT INTO financial_years (id, business_id, name, start_date, end_date, is_closed)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'FY 2024-25',
    '2024-04-01',
    '2025-03-31',
    FALSE
) ON CONFLICT (business_id, name) DO NOTHING;

-- 5. Standard Indian Chart of Accounts for Gupta Kirana
INSERT INTO accounts (id, business_id, code, name, account_type, sub_category, normal_balance, is_system, current_balance)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '1000', 'Cash in Hand', 'ASSET', 'CASH', 'DEBIT', TRUE, 45200.0000),
    ('d0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', '1010', 'Bank Account (SBI Current)', 'ASSET', 'BANK', 'DEBIT', TRUE, 128500.0000),
    ('d0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', '1100', 'Accounts Receivable (Khata)', 'ASSET', 'RECEIVABLES', 'DEBIT', TRUE, 34200.0000),
    ('d0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', '1200', 'Merchandise Inventory', 'ASSET', 'INVENTORY', 'DEBIT', TRUE, 185000.0000),
    ('d0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', '2000', 'Accounts Payable (Suppliers)', 'LIABILITY', 'PAYABLES', 'CREDIT', TRUE, 56000.0000),
    ('d0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', '2100', 'GST Output Tax Payable', 'LIABILITY', 'TAX', 'CREDIT', TRUE, 8400.0000),
    ('d0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', '2200', 'GST Input Tax Credit (ITC)', 'ASSET', 'TAX', 'DEBIT', TRUE, 6200.0000),
    ('d0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000001', '2300', 'Business Loan Payable', 'LIABILITY', 'PAYABLES', 'CREDIT', TRUE, 150000.0000),
    ('d0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000001', '3000', 'Owner Capital', 'EQUITY', 'CAPITAL', 'CREDIT', TRUE, 174000.0000),
    ('d0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000001', '3100', 'Owner Drawings', 'EQUITY', 'DRAWINGS', 'DEBIT', TRUE, 25000.0000),
    ('d0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000001', '4000', 'Sales Revenue', 'REVENUE', 'SALES_REVENUE', 'CREDIT', TRUE, 385000.0000),
    ('d0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000001', '5000', 'Cost of Goods Sold (COGS)', 'EXPENSE', 'DIRECT_EXPENSE', 'DEBIT', TRUE, 298000.0000),
    ('d0000000-0000-0000-0000-000000000013', 'b0000000-0000-0000-0000-000000000001', '6000', 'Shop Rent', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 22000.0000),
    ('d0000000-0000-0000-0000-000000000014', 'b0000000-0000-0000-0000-000000000001', '6010', 'Helper Salaries', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 18000.0000),
    ('d0000000-0000-0000-0000-000000000015', 'b0000000-0000-0000-0000-000000000001', '6020', 'Electricity & Utilities', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 4500.0000),
    ('d0000000-0000-0000-0000-000000000016', 'b0000000-0000-0000-0000-000000000001', '6030', 'Transport & Delivery', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 3200.0000),
    ('d0000000-0000-0000-0000-000000000017', 'b0000000-0000-0000-0000-000000000001', '6050', 'Loan Interest Expense', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 1500.0000),
    ('d0000000-0000-0000-0000-000000000018', 'b0000000-0000-0000-0000-000000000001', '6060', 'Misc Expenses & Packaging', 'EXPENSE', 'INDIRECT_EXPENSE', 'DEBIT', TRUE, 2100.0000)
ON CONFLICT (business_id, code) DO NOTHING;

-- 6. Product Categories
INSERT INTO product_categories (id, business_id, name, description)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Staples & Grains', 'Rice, Atta, Pulses, Sugar'),
    ('e0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Edible Oils & Ghee', 'Mustard oil, Refined oil, Desi Ghee'),
    ('e0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Packaged Food & Snacks', 'Biscuits, Noodles, Namkeen'),
    ('e0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'Personal & Home Care', 'Soaps, Detergents, Cleaners')
ON CONFLICT (id) DO NOTHING;

-- 7. Key Fast-moving Products with realistic Indian Kirana pricing & WAVG costs
INSERT INTO products (
    id, business_id, category_id, sku, barcode, name, description, unit,
    purchase_price, selling_price, mrp, tax_rate, reorder_level, reorder_quantity,
    current_stock, weighted_average_cost, is_active
) VALUES
    ('10000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'SKU-ATTA-10K', '890103000001', 'Aashirvaad Shudh Chakki Atta 10kg', '100% whole wheat flour', 'PACKET', 380.0000, 435.0000, 460.0000, 0.00, 15.0000, 50.0000, 32.0000, 380.0000, TRUE),
    ('10000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'SKU-RICE-5K', '890103000002', 'Fortune Biryani Special Basmati Rice 5kg', 'Long grain aromatic rice', 'PACKET', 490.0000, 575.0000, 620.0000, 0.00, 10.0000, 30.0000, 18.0000, 490.0000, TRUE),
    ('10000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'SKU-OIL-MUST-1L', '890103000003', 'Engine Kachi Ghani Mustard Oil 1L Pouch', 'Pure cold pressed mustard oil', 'PACKET', 132.0000, 155.0000, 165.0000, 5.00, 25.0000, 60.0000, 45.0000, 132.0000, TRUE),
    ('10000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'SKU-DAL-TOOR-1K', '890103000004', 'Tata Sampann Unpolished Toor Dal 1kg', 'Natural unpolished pulses', 'PACKET', 145.0000, 172.0000, 185.0000, 0.00, 20.0000, 50.0000, 28.0000, 145.0000, TRUE),
    ('10000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'SKU-MAGGI-70G', '890103000005', 'Maggi 2-Minute Masala Noodles 70g', 'Classic instant noodles', 'PCS', 11.5000, 14.0000, 14.0000, 12.00, 50.0000, 200.0000, 8.0000, 11.5000, TRUE), -- LOW STOCK!
    ('10000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'SKU-SALT-1K', '890103000006', 'Tata Salt Vacuum Evaporated Iodised 1kg', 'Desh ka namak', 'PACKET', 23.0000, 28.0000, 28.0000, 0.00, 30.0000, 100.0000, 64.0000, 23.0000, TRUE),
    ('10000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000004', 'SKU-DETTOL-125G', '890103000007', 'Dettol Original Germ Protection Soap 125g', 'Antibacterial bath soap', 'PCS', 48.0000, 60.0000, 62.0000, 18.00, 20.0000, 80.0000, 35.0000, 48.0000, TRUE)
ON CONFLICT (business_id, sku) DO NOTHING;

-- 8. Customers (Khata / Credit)
INSERT INTO customers (id, business_id, name, phone, opening_balance, current_balance, credit_limit, is_active)
VALUES
    ('20000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Sharma Ji (Flat 402)', '+919811223344', 3500.0000, 5200.0000, 10000.0000, TRUE),
    ('20000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Verma Tea Stall', '+919822334455', 8400.0000, 12800.0000, 20000.0000, TRUE),
    ('20000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Anita Rastogi', '+919833445566', 0.0000, 1600.0000, 5000.0000, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 9. Suppliers
INSERT INTO suppliers (id, business_id, name, phone, gstin, opening_balance, current_balance, payment_terms_days, is_active)
VALUES
    ('30000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Aggarwal Wholesale Grains', '+919844556677', '07BBBBB1111B1Z2', 25000.0000, 38500.0000, 15, TRUE),
    ('30000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Hindustan Unilever Distributor (South Delhi)', '+919855667788', '07CCCCC2222C1Z3', 12000.0000, 17500.0000, 7, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Recent Cashbook Entries (Mode A Quick Start)
INSERT INTO cashbook_entries (
    business_id, entry_date, opening_cash, cash_sales, digital_sales, credit_sales,
    cash_purchases, operating_expenses, customer_collections, supplier_payments,
    cash_deposits, cash_withdrawals, owner_capital, owner_drawings, loan_received, loan_repaid,
    calculated_closing_cash, counted_cash, cash_variance, estimated_cost_of_goods,
    estimated_gross_profit, estimated_net_profit, notes, is_closed
) VALUES
    ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 DAY', 38000.0000, 18500.0000, 9200.0000, 2400.0000, 4500.0000, 1200.0000, 3200.0000, 8000.0000, 5000.0000, 0.0000, 0.0000, 1000.0000, 0.0000, 0.0000, 41000.0000, 41000.0000, 0.0000, 22160.0000, 5540.0000, 4340.0000, 'Busy Monday, milk & bread cleared fast', TRUE),
    ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '1 DAY', 41000.0000, 21400.0000, 11800.0000, 1800.0000, 6200.0000, 850.0000, 4100.0000, 10000.0000, 7000.0000, 0.0000, 0.0000, 500.0000, 0.0000, 0.0000, 41950.0000, 41900.0000, -50.0000, 26560.0000, 6640.0000, 5790.0000, 'Counted cash short by 50 Rs misc change', TRUE),
    ('b0000000-0000-0000-0000-000000000001', CURRENT_DATE, 41900.0000, 14200.0000, 8600.0000, 1200.0000, 2100.0000, 400.0000, 2500.0000, 5000.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 51100.0000, 51100.0000, 0.0000, 18240.0000, 4560.0000, 4160.0000, 'Today in progress', FALSE)
ON CONFLICT (business_id, entry_date) DO NOTHING;

-- 11. Sample Scenario: "What if Shop Rent increases by ₹5,000 and we hire an evening helper at ₹8,000?"
INSERT INTO scenarios (
    business_id, name, description,
    base_monthly_revenue, base_gross_margin_percent, base_monthly_fixed_costs,
    sales_change_percent, cost_change_percent, rent_change, salary_change,
    new_loan_amount, new_loan_interest_rate, new_loan_tenure_months, new_loan_emi,
    projected_revenue, projected_gross_profit, projected_operating_profit, projected_breakeven_revenue,
    is_hypothetical
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Rent Hike + Evening Helper',
    'Evaluating if adding ₹5,000 rent and ₹8,000 helper salary requires at least 15% more sales to stay profitable.',
    385000.0000, 22.50, 49300.0000,
    15.00, 0.00, 5000.0000, 8000.0000,
    0.0000, 0.00, 0, 0.0000,
    442750.0000, 99618.7500, 37318.7500, 276888.8889,
    TRUE
) ON CONFLICT (id) DO NOTHING;
