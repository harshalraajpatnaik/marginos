export type OperatingMode = 'QUICK_START' | 'DETAILED' | 'SIMULATOR';
export type BusinessType = 'RETAIL_KIRANA' | 'ELECTRICAL' | 'HARDWARE' | 'APPAREL' | 'DISTRIBUTOR' | 'SERVICE' | 'OTHER';
export type Role = 'OWNER' | 'ADMIN' | 'ACCOUNTANT' | 'MANAGER' | 'STAFF' | 'VIEWER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isVerified: boolean;
}

export interface Business {
  id: string;
  name: string;
  tradeName?: string;
  gstin?: string;
  pan?: string;
  businessType: BusinessType;
  operatingMode: OperatingMode;
  currency: string;
  role: string;
  active: boolean;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  phone?: string;
  email?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
  businesses: Business[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  businessType: BusinessType;
  operatingMode: OperatingMode;
}

export interface DashboardSummary {
  businessName?: string;
  operatingMode?: OperatingMode;
  cashInHand: number;
  bankBalance: number;
  totalCashAvailable?: number;
  todaySales: number;
  monthToDateSales?: number;
  monthToDateGrossProfit?: number;
  monthToDateGrossMarginPercent?: number;
  monthToDateExpenses?: number;
  monthToDateNetProfit?: number;
  pendingReceivables?: number;
  pendingPayables?: number;
  netReceivablePayableGap?: number;
  totalInventoryValuation?: number;
  lowStockCount: number;
  totalSkus?: number;
  recentSalesTrend?: { date: string; amount: number }[];
  topExpenses?: any[];
  // Fallback aliases
  mtdSales?: number;
  grossMarginPercent?: number;
  netProfit?: number;
  netMarginPercent?: number;
  cashConversionCycleDays?: number;
  totalReceivables?: number;
  totalPayables?: number;
  stockValuation?: number;
}

export interface CashbookEntry {
  id?: string;
  entryDate: string;
  openingCash: number;
  cashSales: number;
  digitalSales: number;
  creditSales: number;
  totalSales: number;
  cashPurchases: number;
  operatingExpenses: number;
  customerCollections: number;
  supplierPayments: number;
  ownerCapital: number;
  ownerDrawings: number;
  closingCash: number;
  countedCash?: number;
  cashVariance?: number;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  unitOfMeasure: string;
  costPrice: number;
  sellingPrice: number;
  taxRate?: number;
  currentStock: number;
  reorderPoint?: number;
  active?: boolean;
}

export interface StockMovement {
  id: string;
  productId: string;
  movementType: string;
  quantity: number;
  unitCost: number;
  createdAt: string;
}

export interface InventoryValuation {
  totalValuation: number;
  totalItemCount: number;
}

export interface AbcAnalysisItem {
  productId: string;
  productName: string;
  stockValue: number;
  valuePercentage: number;
  cumulativePercentage: number;
  category: 'A' | 'B' | 'C';
}

export interface SlowMovingItem {
  productId: string;
  productName: string;
  currentStock: number;
  costPrice: number;
  tiedUpCapital: number;
  daysWithoutSale: number;
}

export interface EoqResult {
  optimalBatchSize: number;
  ordersPerYear: number;
  orderIntervalDays: number;
  totalAnnualCost: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  creditLimit?: number;
  creditPeriodDays?: number;
  balanceOutstanding: number;
  currentBalance?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: string;
  creditPeriodDays?: number;
  paymentTermsDays?: number;
  balancePayable: number;
  currentBalance?: number;
}

export interface KhataSummary {
  totalReceivables: number;
  activeCustomerCount: number;
}

export interface AgingBucket {
  bucketName: string;
  totalAmount: number;
  count: number;
}

export interface SalesInvoiceLineRequest {
  productId: string | null;
  productName?: string;
  quantity: number;
  unitPrice: number;
  costPrice?: number;
  discountPercent?: number;
  taxRate: number;
  lineTotal: number;
}

export interface SalesInvoiceRequest {
  customerId: string | null;
  customerName?: string;
  customerPhone?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentMode: string;
  paidAmount?: number | null;
  discountAmount?: number;
  notes?: string | null;
  lines: SalesInvoiceLineRequest[];
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId?: string;
  customerName?: string;
  paymentMode: string;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNumber?: string;
  billNumber?: string;
  invoiceDate?: string;
  billDate?: string;
  supplierId?: string;
  supplierName?: string;
  paymentMode: string;
  taxableAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
}

export interface Expense {
  id: string;
  expenseDate: string;
  category: string;
  payeeName?: string;
  paymentMode: string;
  description?: string;
  amount: number;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  category: string;
  normalBalance: string;
  currentBalance: number;
}

export interface JournalLine {
  id?: string;
  accountId: string;
  accountCode?: string;
  accountName?: string;
  debit: number;
  credit: number;
  memo?: string;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  entryDate: string;
  description: string;
  referenceNumber?: string;
  totalAmount: number;
  status: string;
  lines: JournalLine[];
}

export interface TrialBalanceLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountCategory: string;
  debitBalance: number;
  creditBalance: number;
}

export interface TrialBalance {
  asOfDate: string;
  lines: TrialBalanceLine[];
  totalDebit: number;
  totalCredit: number;
  isBalanced: boolean;
}

export interface ProfitLossStatement {
  startDate?: string;
  endDate?: string;
  operatingRevenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
  totalOperatingExpenses: number;
  operatingProfit: number;
  netProfit: number;
  netMarginPercent: number;
  expenseBreakdown: { name: string; amount: number }[];
}

export interface BalanceSheet {
  asOfDate: string;
  cashInHand: number;
  bankBalance: number;
  receivables: number;
  inventory: number;
  totalCurrentAssets: number;
  totalAssets: number;
  payables: number;
  taxPayable: number;
  totalLiabilities: number;
  ownerCapital: number;
  retainedEarnings: number;
  totalEquity: number;
}

export interface CashFlowStatement {
  startDate: string;
  endDate: string;
  operatingInflow: number;
  operatingOutflow: number;
  netOperatingCash: number;
  financingInflow: number;
  financingOutflow: number;
  netCashChange: number;
}

export interface PricingCalculationResult {
  costPrice?: number;
  sellingPrice: number;
  taxRate?: number;
  taxAmount?: number;
  finalPriceWithTax: number;
  profitAmount: number;
  grossMarginPercent: number;
  markupPercent: number;
  plainLanguageExplanation?: string;
}

export interface BreakevenResult {
  totalFixedCosts: number;
  averageSellingPrice: number;
  averageVariableCost: number;
  contributionMarginPerUnit: number;
  contributionMarginRatio: number;
  breakevenUnits: number;
  breakevenRevenue: number;
}

export interface WorkingCapitalMetrics {
  inventoryValue: number;
  receivablesValue: number;
  payablesValue: number;
  netWorkingCapital: number;
  daysInventoryOutstanding: number;
  daysSalesOutstanding: number;
  daysPayableOutstanding: number;
  cashConversionCycleDays: number;
  healthStatus: string;
}

export interface LoanAmortizationEntry {
  monthNumber: number;
  emiAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

export interface LoanAmortizationSchedule {
  principal?: number;
  annualInterestRate?: number;
  tenureMonths?: number;
  monthlyEmi: number;
  totalInterest: number;
  totalAmount?: number;
  entries?: LoanAmortizationEntry[];
  debtServiceCoverageRatio?: number;
  affordabilityStatus?: string;
  recommendation?: string;
}

export interface DscrAnalysis {
  dscrRatio?: number;
  annualOperatingProfit?: number;
  annualDebtService?: number;
  verdict: string;
  explanation: string;
  monthlyEmi?: number;
  monthlyOperatingProfit?: number;
  dscr?: number;
  status?: string;
}

export interface Scenario {
  id?: string;
  name: string;
  revenueChangePercent: number;
  cogsChangePercent: number;
  extraFixedCosts: number;
  capex: number;
  loanEmi: number;
  projectedNetProfit: number;
}

export interface Budget {
  id?: string;
  category: string;
  month: number;
  year: number;
  budgetedAmount: number;
  actualAmount: number;
}

export interface ApiKeyInfo {
  id: string;
  name: string;
  maskedToken: string;
  role: string;
  active: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ApiKeyCreateResult {
  id: string;
  name: string;
  rawApiKey: string;
  maskedToken: string;
  role: string;
}

export interface AiExplanationResponse {
  explanation: string;
  groundedDataSources: string[];
}
