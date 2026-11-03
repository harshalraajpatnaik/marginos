-- V5: Planning, Scenarios, Budgets, Forecasts, Webhooks, Notifications, and Loans

CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    financial_year_id UUID REFERENCES financial_years(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    month_number INT NOT NULL, -- 1 to 12
    year INT NOT NULL,
    budgeted_revenue NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    budgeted_cogs NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    budgeted_expenses NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_budget_month UNIQUE (business_id, year, month_number)
);

CREATE TABLE forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    projected_growth_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    expected_revenue NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    expected_expenses NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    expected_cash_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    confidence_score NUMERIC(5,2) NOT NULL DEFAULT 70.00,
    assumptions TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    base_monthly_revenue NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    base_gross_margin_percent NUMERIC(5,2) NOT NULL DEFAULT 20.00,
    base_monthly_fixed_costs NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    sales_change_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    cost_change_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    rent_change NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    salary_change NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    new_loan_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    new_loan_interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    new_loan_tenure_months INT NOT NULL DEFAULT 0,
    new_loan_emi NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    projected_revenue NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    projected_gross_profit NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    projected_operating_profit NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    projected_breakeven_revenue NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    is_hypothetical BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loan_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    lender_name VARCHAR(150) NOT NULL,
    principal_amount NUMERIC(19,4) NOT NULL,
    annual_interest_rate NUMERIC(5,2) NOT NULL,
    tenure_months INT NOT NULL,
    monthly_emi NUMERIC(19,4) NOT NULL,
    total_interest NUMERIC(19,4) NOT NULL,
    total_payment NUMERIC(19,4) NOT NULL,
    debt_service_ratio NUMERIC(5,2),
    is_affordable BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(255) NOT NULL,
    events VARCHAR(500) NOT NULL DEFAULT 'sale.created,expense.created',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    response_status INT,
    duration_ms INT,
    is_success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    daily_digest BOOLEAN NOT NULL DEFAULT TRUE,
    low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    overdue_payment_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    whatsapp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_user_business_notifications UNIQUE (user_id, business_id)
);
