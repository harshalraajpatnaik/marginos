import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from './auth.service';
import {
  DashboardSummary,
  CashbookEntry,
  Product,
  Category,
  StockMovement,
  InventoryValuation,
  AbcAnalysisItem,
  SlowMovingItem,
  EoqResult,
  Customer,
  Supplier,
  KhataSummary,
  AgingBucket,
  SalesInvoice,
  SalesInvoiceRequest,
  PurchaseInvoice,
  Expense,
  Account,
  JournalEntry,
  TrialBalance,
  ProfitLossStatement,
  BalanceSheet,
  CashFlowStatement,
  PricingCalculationResult,
  BreakevenResult,
  WorkingCapitalMetrics,
  LoanAmortizationSchedule,
  DscrAnalysis,
  Scenario,
  Budget,
  ApiKeyInfo,
  ApiKeyCreateResult,
  AiExplanationResponse
} from '../models/types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = '/api/v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const token = this.authService.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    const bizId = this.authService.getActiveBusinessId();
    if (bizId) {
      headers = headers.set('X-Workspace-Id', bizId);
    }

    return headers;
  }

  private bizUrl(subPath: string): string {
    const bizId = this.authService.getActiveBusinessId() || 'b0000000-0000-0000-0000-000000000001';
    return `${this.baseUrl}/businesses/${bizId}${subPath}`;
  }

  // Dashboard
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<ApiResponse<DashboardSummary>>(this.bizUrl('/dashboard'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Mode A: Cashbook
  getCashbookEntries(startDate?: string, endDate?: string): Observable<CashbookEntry[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<CashbookEntry[]>>(this.bizUrl('/cashbook'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getDailyCashbook(date: string): Observable<CashbookEntry> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<CashbookEntry>>(this.bizUrl('/cashbook/daily'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  saveCashbookEntry(entry: Partial<CashbookEntry>): Observable<CashbookEntry> {
    return this.http.post<ApiResponse<CashbookEntry>>(this.bizUrl('/cashbook'), entry, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getWhatsAppSummary(date: string): Observable<{ summary: string }> {
    const params = new HttpParams().set('date', date);
    return this.http.get<ApiResponse<{ summary: string }>>(this.bizUrl('/cashbook/whatsapp-summary'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getCashbookTrends(days = 7): Observable<any[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<any[]>>(this.bizUrl('/cashbook/trends'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  // Mode B: Products & Inventory
  getProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.bizUrl('/products'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createProduct(product: Partial<Product>): Observable<Product> {
    return this.http.post<ApiResponse<Product>>(this.bizUrl('/products'), product, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product> {
    return this.http.put<ApiResponse<Product>>(this.bizUrl(`/products/${id}`), product, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<ApiResponse<Product[]>>(this.bizUrl('/products/low-stock'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<ApiResponse<Category[]>>(this.bizUrl('/products/categories'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getInventoryMovements(productId?: string): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (productId) params = params.set('productId', productId);
    return this.http.get<ApiResponse<StockMovement[]>>(this.bizUrl('/inventory/movements'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getInventoryValuation(): Observable<InventoryValuation> {
    return this.http.get<ApiResponse<InventoryValuation>>(this.bizUrl('/inventory/valuation'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getAbcAnalysis(): Observable<AbcAnalysisItem[]> {
    return this.http.get<ApiResponse<AbcAnalysisItem[]>>(this.bizUrl('/inventory/abc-analysis'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getSlowMovingInventory(days = 45): Observable<SlowMovingItem[]> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<ApiResponse<SlowMovingItem[]>>(this.bizUrl('/inventory/slow-moving'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  calculateEoq(productId: string, annualDemand: number, orderingCost: number, holdingCostPercent: number): Observable<EoqResult> {
    const params = new HttpParams()
      .set('productId', productId)
      .set('annualDemand', annualDemand.toString())
      .set('orderingCost', orderingCost.toString())
      .set('holdingCostPercent', holdingCostPercent.toString());
    return this.http.get<ApiResponse<EoqResult>>(this.bizUrl('/inventory/eoq'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  // Parties (Customers & Suppliers)
  getCustomers(): Observable<Customer[]> {
    return this.http.get<ApiResponse<Customer[]>>(this.bizUrl('/customers'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createCustomer(cust: Partial<Customer>): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(this.bizUrl('/customers'), cust, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<ApiResponse<Supplier[]>>(this.bizUrl('/suppliers'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createSupplier(supp: Partial<Supplier>): Observable<Supplier> {
    return this.http.post<ApiResponse<Supplier>>(this.bizUrl('/suppliers'), supp, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getKhataSummary(): Observable<KhataSummary> {
    return this.http.get<ApiResponse<KhataSummary>>(this.bizUrl('/khata-summary'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getReceivablesAging(): Observable<AgingBucket[]> {
    return this.http.get<ApiResponse<AgingBucket[]>>(this.bizUrl('/receivables-aging'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getPayablesAging(): Observable<AgingBucket[]> {
    return this.http.get<ApiResponse<AgingBucket[]>>(this.bizUrl('/payables-aging'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Sales
  getSalesInvoices(): Observable<SalesInvoice[]> {
    return this.http.get<ApiResponse<SalesInvoice[]>>(this.bizUrl('/sales/invoices'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createSalesInvoice(req: SalesInvoiceRequest): Observable<SalesInvoice> {
    return this.http.post<ApiResponse<SalesInvoice>>(this.bizUrl('/sales/invoices'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  quickCounterSale(req: { totalAmount: number; paymentMode: string; notes?: string }): Observable<SalesInvoice> {
    return this.http.post<ApiResponse<SalesInvoice>>(this.bizUrl('/sales/quick-counter-sale'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Purchases
  getPurchaseInvoices(): Observable<PurchaseInvoice[]> {
    return this.http.get<ApiResponse<PurchaseInvoice[]>>(this.bizUrl('/purchases/invoices'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createPurchaseInvoice(req: any): Observable<PurchaseInvoice> {
    return this.http.post<ApiResponse<PurchaseInvoice>>(this.bizUrl('/purchases/invoices'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Expenses
  getExpenses(): Observable<Expense[]> {
    return this.http.get<ApiResponse<Expense[]>>(this.bizUrl('/expenses'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createExpense(req: any): Observable<Expense> {
    return this.http.post<ApiResponse<Expense>>(this.bizUrl('/expenses'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getExpenseSummary(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<any>>(this.bizUrl('/expenses/summary'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  // Accounting Engine
  getChartOfAccounts(): Observable<Account[]> {
    return this.http.get<ApiResponse<Account[]>>(this.bizUrl('/accounting/coa'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createAccount(account: Partial<Account>): Observable<Account> {
    return this.http.post<ApiResponse<Account>>(this.bizUrl('/accounting/coa'), account, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getJournalEntries(): Observable<JournalEntry[]> {
    return this.http.get<ApiResponse<JournalEntry[]>>(this.bizUrl('/accounting/journal-entries'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createJournalEntry(entry: any): Observable<JournalEntry> {
    return this.http.post<ApiResponse<JournalEntry>>(this.bizUrl('/accounting/journal-entries'), entry, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  reverseJournalEntry(id: string, reason: string): Observable<JournalEntry> {
    return this.http.post<ApiResponse<JournalEntry>>(this.bizUrl(`/accounting/journal-entries/${id}/reverse`), { reason }, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getTrialBalance(asOfDate?: string): Observable<TrialBalance> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<ApiResponse<TrialBalance>>(this.bizUrl('/accounting/trial-balance'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getProfitLoss(startDate?: string, endDate?: string): Observable<ProfitLossStatement> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<ProfitLossStatement>>(this.bizUrl('/accounting/profit-loss'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getBalanceSheet(asOfDate?: string): Observable<BalanceSheet> {
    let params = new HttpParams();
    if (asOfDate) params = params.set('asOfDate', asOfDate);
    return this.http.get<ApiResponse<BalanceSheet>>(this.bizUrl('/accounting/balance-sheet'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  getCashFlow(startDate?: string, endDate?: string): Observable<CashFlowStatement> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<ApiResponse<CashFlowStatement>>(this.bizUrl('/accounting/cash-flow'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  // MBA & Decision Tools
  calculatePricing(req: { costPrice: number; targetPercentage: number; mode: 'FROM_MARKUP' | 'FROM_MARGIN'; taxRate?: number }): Observable<PricingCalculationResult> {
    return this.http.post<ApiResponse<PricingCalculationResult>>(this.bizUrl('/pricing/calculate'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  calculatePricingMatrix(costPrice: number): Observable<any[]> {
    return this.http.post<ApiResponse<any[]>>(this.bizUrl('/pricing/matrix'), { costPrice }, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  calculateBreakeven(req: { totalFixedCosts: number; averageSellingPrice: number; averageVariableCost: number }): Observable<BreakevenResult> {
    return this.http.post<ApiResponse<BreakevenResult>>(this.bizUrl('/breakeven/calculate'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  getWorkingCapitalMetrics(): Observable<WorkingCapitalMetrics> {
    return this.http.get<ApiResponse<WorkingCapitalMetrics>>(this.bizUrl('/working-capital/metrics'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  calculateLoanSchedule(req: { principal: number; annualInterestRate: number; tenureMonths: number }): Observable<LoanAmortizationSchedule> {
    return this.http.post<ApiResponse<LoanAmortizationSchedule>>(this.bizUrl('/loan/calculate'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  checkLoanAffordability(req: { principal: number; annualInterestRate: number; tenureMonths: number; monthlyOperatingProfit?: number }): Observable<DscrAnalysis> {
    return this.http.post<ApiResponse<DscrAnalysis>>(this.bizUrl('/loan/affordability'), req, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Mode C: Scenario Simulator
  getScenarios(): Observable<Scenario[]> {
    return this.http.get<ApiResponse<Scenario[]>>(this.bizUrl('/scenarios'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createScenario(scenario: Partial<Scenario>): Observable<Scenario> {
    return this.http.post<ApiResponse<Scenario>>(this.bizUrl('/scenarios'), scenario, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Budgets
  getBudgets(year?: number): Observable<Budget[]> {
    let params = new HttpParams();
    if (year) params = params.set('year', year.toString());
    return this.http.get<ApiResponse<Budget[]>>(this.bizUrl('/budgets'), {
      headers: this.getHeaders(),
      params
    }).pipe(map(r => r.data));
  }

  createBudget(budget: Partial<Budget>): Observable<Budget> {
    return this.http.post<ApiResponse<Budget>>(this.bizUrl('/budgets'), budget, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // Developer Platform: API Keys
  getApiKeys(): Observable<ApiKeyInfo[]> {
    return this.http.get<ApiResponse<ApiKeyInfo[]>>(this.bizUrl('/api-keys'), {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  createApiKey(name: string, role: string, expiresDays?: number): Observable<ApiKeyCreateResult> {
    return this.http.post<ApiResponse<ApiKeyCreateResult>>(this.bizUrl('/api-keys'), { name, role, expiresDays }, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  revokeApiKey(id: string): Observable<void> {
    return this.http.delete<void>(this.bizUrl(`/api-keys/${id}`), {
      headers: this.getHeaders()
    });
  }

  // AI Financial Advisor
  askAiAssistant(question: string): Observable<AiExplanationResponse> {
    return this.http.post<ApiResponse<AiExplanationResponse>>(this.bizUrl('/ai/explain'), { question }, {
      headers: this.getHeaders()
    }).pipe(map(r => r.data));
  }

  // CSV Import/Export
  exportCsv(type: 'products' | 'sales' | 'expenses' | 'cashbook' | 'trial-balance'): Observable<Blob> {
    return this.http.get(this.bizUrl(`/csv/export/${type}`), {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  importCsv(type: string, file: File): Observable<{ importedCount: number; errors: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    let headers = new HttpHeaders();
    const token = this.authService.getToken();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    return this.http.post<{ importedCount: number; errors: string[] }>(this.bizUrl(`/csv/import/${type}`), formData, {
      headers
    });
  }
}
