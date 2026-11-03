-- V2: Financial Accounting Engine (Double-entry, Chart of Accounts, Journal, Periods)

CREATE TABLE financial_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "FY 2024-25"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_fy UNIQUE (business_id, name)
);

CREATE TABLE financial_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    financial_year_id UUID NOT NULL REFERENCES financial_years(id) ON DELETE CASCADE,
    period_number INT NOT NULL, -- 1 to 12
    name VARCHAR(50) NOT NULL, -- e.g. "Apr 2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_fy_period UNIQUE (financial_year_id, period_number)
);

CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    sub_category VARCHAR(50) NOT NULL, -- CASH, BANK, RECEIVABLES, INVENTORY, PAYABLES, TAX, DIRECT_EXPENSE, INDIRECT_EXPENSE, CAPITAL, DRAWINGS, SALES_REVENUE
    normal_balance VARCHAR(10) NOT NULL DEFAULT 'DEBIT', -- DEBIT or CREDIT
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    current_balance NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_account_code UNIQUE (business_id, code)
);

CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    entry_number VARCHAR(100) NOT NULL,
    entry_date DATE NOT NULL,
    posting_date DATE NOT NULL,
    reference_no VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'POSTED', -- DRAFT, POSTED, REVERSED
    source_type VARCHAR(50) NOT NULL DEFAULT 'MANUAL', -- QUICK_ENTRY, SALE, PURCHASE, EXPENSE, PAYMENT, MANUAL, REVERSAL
    source_id UUID,
    financial_period_id UUID REFERENCES financial_periods(id),
    reversed_entry_id UUID REFERENCES journal_entries(id),
    created_by UUID REFERENCES users(id),
    posted_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_business_entry_number UNIQUE (business_id, entry_number)
);

CREATE TABLE journal_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id),
    debit_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    credit_amount NUMERIC(19,4) NOT NULL DEFAULT 0.0000,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_amounts CHECK (debit_amount >= 0 AND credit_amount >= 0),
    CONSTRAINT chk_one_sided CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);

CREATE INDEX idx_accounts_business ON accounts(business_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_entries_business_date ON journal_entries(business_id, entry_date);
CREATE INDEX idx_entries_status ON journal_entries(status);
CREATE INDEX idx_lines_entry ON journal_lines(journal_entry_id);
CREATE INDEX idx_lines_account ON journal_lines(account_id);
