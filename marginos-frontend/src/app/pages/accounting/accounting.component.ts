import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TrialBalance, ProfitLossStatement, BalanceSheet, CashFlowStatement, Account, JournalEntry } from '../../models/types';

@Component({
  selector: 'app-accounting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
            <span>⚖️ Double-Entry Engine</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Financial Statements & General Ledger</h1>
          <p class="text-xs text-slate-500 mt-1">
            Compliant with Indian Accounting Standards (AS / Ind-AS). Strict immutable posted entries and debit-credit balancing.
          </p>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex flex-wrap items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button (click)="activeTab = 'TB'" [class.bg-white]="activeTab === 'TB'" [class.shadow-xs]="activeTab === 'TB'" [class.text-indigo-600]="activeTab === 'TB'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Trial Balance
          </button>
          <button (click)="activeTab = 'PL'" [class.bg-white]="activeTab === 'PL'" [class.shadow-xs]="activeTab === 'PL'" [class.text-indigo-600]="activeTab === 'PL'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Profit & Loss
          </button>
          <button (click)="activeTab = 'BS'" [class.bg-white]="activeTab === 'BS'" [class.shadow-xs]="activeTab === 'BS'" [class.text-indigo-600]="activeTab === 'BS'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Balance Sheet
          </button>
          <button (click)="activeTab = 'CF'" [class.bg-white]="activeTab === 'CF'" [class.shadow-xs]="activeTab === 'CF'" [class.text-indigo-600]="activeTab === 'CF'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Cash Flow
          </button>
          <button (click)="activeTab = 'COA'" [class.bg-white]="activeTab === 'COA'" [class.shadow-xs]="activeTab === 'COA'" [class.text-indigo-600]="activeTab === 'COA'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Chart of Accounts
          </button>
          <button (click)="activeTab = 'JOURNAL'" [class.bg-white]="activeTab === 'JOURNAL'" [class.shadow-xs]="activeTab === 'JOURNAL'" [class.text-indigo-600]="activeTab === 'JOURNAL'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition">
            Journal Entry
          </button>
        </div>
      </div>

      <!-- Tab 1: Trial Balance -->
      <div *ngIf="activeTab === 'TB'" class="space-y-6">
        <!-- Balance Status Banner -->
        <div class="p-4 rounded-xl border flex items-center justify-between"
             [ngClass]="trialBalance?.isBalanced ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'">
          <div class="flex items-center gap-3">
            <span class="text-xl font-bold">{{ trialBalance?.isBalanced ? '✓' : '⚠️' }}</span>
            <div>
              <span class="text-xs font-black uppercase tracking-wider block">
                {{ trialBalance?.isBalanced ? 'Trial Balance is 100% Balanced' : 'Imbalance Detected' }}
              </span>
              <span class="text-[11px] opacity-80">
                Total Debits: ₹{{ trialBalance?.totalDebit | number:'1.2-2' }} | Total Credits: ₹{{ trialBalance?.totalCredit | number:'1.2-2' }}
              </span>
            </div>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-black bg-white/80 border">
            Debits == Credits
          </span>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Account Code</th>
                  <th class="p-3">Account Name</th>
                  <th class="p-3">Category</th>
                  <th class="p-3 text-right">Debit Balance (₹)</th>
                  <th class="p-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let line of trialBalance?.lines" class="hover:bg-slate-50">
                  <td class="p-3 font-mono text-indigo-700 font-bold">{{ line.accountCode }}</td>
                  <td class="p-3 font-semibold text-slate-900">{{ line.accountName }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {{ line.accountCategory }}
                    </span>
                  </td>
                  <td class="p-3 text-right font-mono" [class.font-bold]="line.debitBalance > 0">
                    {{ line.debitBalance > 0 ? ('₹' + (line.debitBalance | number:'1.2-2')) : '—' }}
                  </td>
                  <td class="p-3 text-right font-mono" [class.font-bold]="line.creditBalance > 0">
                    {{ line.creditBalance > 0 ? ('₹' + (line.creditBalance | number:'1.2-2')) : '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 border-t-2 border-slate-300 font-black text-slate-900">
                <tr>
                  <td colspan="3" class="p-3 uppercase">Total Balancing Verification</td>
                  <td class="p-3 text-right font-mono text-sm text-emerald-700">₹{{ trialBalance?.totalDebit | number:'1.2-2' }}</td>
                  <td class="p-3 text-right font-mono text-sm text-emerald-700">₹{{ trialBalance?.totalCredit | number:'1.2-2' }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: Profit & Loss Statement -->
      <div *ngIf="activeTab === 'PL'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 uppercase block">Operating Revenue</span>
            <span class="text-2xl font-black text-slate-900 mt-1 block">₹{{ profitLoss?.operatingRevenue | number:'1.2-2' }}</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 uppercase block">Gross Profit</span>
            <span class="text-2xl font-black text-emerald-600 mt-1 block">₹{{ profitLoss?.grossProfit | number:'1.2-2' }}</span>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Gross Margin: <strong>{{ profitLoss?.grossMarginPercent | number:'1.1-1' }}%</strong></span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 uppercase block">Net Profit</span>
            <span class="text-2xl font-black text-indigo-700 mt-1 block">₹{{ profitLoss?.netProfit | number:'1.2-2' }}</span>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Net Margin: <strong>{{ profitLoss?.netMarginPercent | number:'1.1-1' }}%</strong></span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Statement of Profit & Loss</h3>
          
          <div class="space-y-2 text-xs">
            <!-- Revenue -->
            <div class="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-900">
              <span>Sales Revenue (Gross)</span>
              <span>₹{{ profitLoss?.operatingRevenue | number:'1.2-2' }}</span>
            </div>

            <!-- COGS -->
            <div class="flex justify-between py-2 border-b border-slate-100 text-rose-700">
              <span>Less: Cost of Goods Sold (COGS)</span>
              <span>(₹{{ profitLoss?.cogs | number:'1.2-2' }})</span>
            </div>

            <!-- Gross Profit -->
            <div class="flex justify-between py-2.5 bg-emerald-50 px-3 rounded-lg font-black text-emerald-900 text-sm">
              <span>GROSS PROFIT</span>
              <span>₹{{ profitLoss?.grossProfit | number:'1.2-2' }} ({{ profitLoss?.grossMarginPercent | number:'1.1-1' }}%)</span>
            </div>

            <!-- Expenses -->
            <div class="pt-3">
              <span class="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-2">Operating Overheads</span>
              <div class="space-y-1.5 pl-3 border-l-2 border-slate-200 text-slate-600">
                <div *ngFor="let exp of profitLoss?.expenseBreakdown" class="flex justify-between py-1">
                  <span>{{ exp.name }}</span>
                  <span>₹{{ exp.amount | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1.5 font-bold text-slate-800 border-t border-slate-100">
                  <span>Total Operating Expenses</span>
                  <span class="text-rose-600">(₹{{ profitLoss?.totalOperatingExpenses | number:'1.2-2' }})</span>
                </div>
              </div>
            </div>

            <!-- Net Profit -->
            <div class="flex justify-between py-3 bg-indigo-900 text-white px-4 rounded-xl font-black text-base mt-4 shadow-sm">
              <span>NET OPERATING PROFIT</span>
              <span>₹{{ profitLoss?.netProfit | number:'1.2-2' }} ({{ profitLoss?.netMarginPercent | number:'1.1-1' }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Balance Sheet -->
      <div *ngIf="activeTab === 'BS'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Assets Column -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">ASSETS</h3>
              <span class="text-xs font-bold text-emerald-600">Total: ₹{{ balanceSheet?.totalAssets | number:'1.2-2' }}</span>
            </div>

            <div class="space-y-2 text-xs">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Current Assets</span>
              <div class="space-y-1 pl-3 border-l-2 border-emerald-300">
                <div class="flex justify-between py-1">
                  <span>Cash in Hand (Drawer)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.cashInHand | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Bank Balances</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.bankBalance | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Accounts Receivable (Customer Udhaar)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.receivables | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Merchandise Inventory (at WAVG)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.inventory | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="flex justify-between py-2.5 bg-slate-100 px-3 rounded-lg font-bold text-slate-900 mt-4">
                <span>TOTAL ASSETS</span>
                <span class="font-black text-indigo-700">₹{{ balanceSheet?.totalAssets | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Liabilities & Equity Column -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">LIABILITIES & EQUITY</h3>
              <span class="text-xs font-bold text-indigo-600">Total: ₹{{ ((balanceSheet?.totalLiabilities || 0) + (balanceSheet?.totalEquity || 0)) | number:'1.2-2' }}</span>
            </div>

            <div class="space-y-2 text-xs">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Current Liabilities</span>
              <div class="space-y-1 pl-3 border-l-2 border-rose-300">
                <div class="flex justify-between py-1">
                  <span>Accounts Payable (Supplier Dues)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.payables | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>GST Taxes Payable</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.taxPayable | number:'1.2-2' }}</span>
                </div>
              </div>

              <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block pt-3">Owner's Equity</span>
              <div class="space-y-1 pl-3 border-l-2 border-indigo-300">
                <div class="flex justify-between py-1">
                  <span>Owner's Capital Introduced</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.ownerCapital | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Current Period Net Profit</span>
                  <span class="font-mono font-bold text-emerald-700">₹{{ balanceSheet?.retainedEarnings | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="flex justify-between py-2.5 bg-slate-100 px-3 rounded-lg font-bold text-slate-900 mt-4">
                <span>TOTAL LIABILITIES & EQUITY</span>
                <span class="font-black text-indigo-700">
                  ₹{{ ((balanceSheet?.totalLiabilities || 0) + (balanceSheet?.totalEquity || 0)) | number:'1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 4: Cash Flow Statement -->
      <div *ngIf="activeTab === 'CF'" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Cash Flow Statement (Direct Method)</h3>

        <div class="space-y-3 text-xs">
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 block">1. Cash Flow from Operating Activities</span>
            <div class="flex justify-between text-slate-600">
              <span>Cash received from customer sales & collections</span>
              <span class="font-mono font-bold">₹{{ cashFlow?.operatingInflow | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Cash paid to suppliers & operating expenses</span>
              <span class="font-mono font-bold text-rose-600">(₹{{ cashFlow?.operatingOutflow | number:'1.2-2' }})</span>
            </div>
            <div class="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-900">
              <span>Net Cash from Operations</span>
              <span class="font-black text-emerald-700">₹{{ cashFlow?.netOperatingCash | number:'1.2-2' }}</span>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 block">2. Cash Flow from Financing Activities</span>
            <div class="flex justify-between text-slate-600">
              <span>Capital introduced / loans received</span>
              <span class="font-mono font-bold">₹{{ cashFlow?.financingInflow | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Owner drawings / loan repayments</span>
              <span class="font-mono font-bold text-rose-600">(₹{{ cashFlow?.financingOutflow | number:'1.2-2' }})</span>
            </div>
          </div>

          <div class="flex justify-between py-3 bg-emerald-900 text-white px-4 rounded-xl font-black text-base shadow-sm">
            <span>NET CHANGE IN CASH POSITION</span>
            <span>₹{{ cashFlow?.netCashChange | number:'1.2-2' }}</span>
          </div>
        </div>
      </div>

      <!-- Tab 5: Chart of Accounts -->
      <div *ngIf="activeTab === 'COA'" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <span class="font-bold text-xs text-slate-800">Master Chart of Accounts (COA)</span>
          <span class="text-xs text-slate-500">{{ accounts.length }} Accounts Configured</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Code</th>
                <th class="p-3">Account Title</th>
                <th class="p-3">Category</th>
                <th class="p-3">Normal Balance</th>
                <th class="p-3 text-right">Current Balance (₹)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let a of accounts" class="hover:bg-slate-50">
                <td class="p-3 font-mono font-bold text-indigo-700">{{ a.code }}</td>
                <td class="p-3 font-semibold text-slate-900">{{ a.name }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-800': a.category === 'ASSET',
                          'bg-rose-50 text-rose-800': a.category === 'LIABILITY',
                          'bg-indigo-50 text-indigo-800': a.category === 'EQUITY',
                          'bg-teal-50 text-teal-800': a.category === 'REVENUE',
                          'bg-amber-50 text-amber-800': a.category === 'EXPENSE' || a.category === 'COGS'
                        }">
                    {{ a.category }}
                  </span>
                </td>
                <td class="p-3 font-mono text-[11px]">{{ a.normalBalance }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ a.currentBalance | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 6: Manual Journal Entry -->
      <div *ngIf="activeTab === 'JOURNAL'" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <h3 class="text-base font-extrabold text-slate-900">Post Manual Journal Entry</h3>
          <p class="text-xs text-slate-500 mt-1">
            Enforces strict double-entry debits == credits validation before posting. All entries are immutable.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Entry Date</label>
            <input type="date" [(ngModel)]="journalReq.entryDate"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Description / Memo</label>
            <input type="text" [(ngModel)]="journalReq.description" placeholder="e.g. Depreciation on store furniture"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>
        </div>

        <!-- Lines -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">Account</th>
                <th class="p-3">Line Memo</th>
                <th class="p-3 w-32 text-right">Debit (₹)</th>
                <th class="p-3 w-32 text-right">Credit (₹)</th>
                <th class="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let line of journalReq.lines; let i = index">
                <td class="p-2">
                  <select [(ngModel)]="line.accountId" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
                    <option *ngFor="let acc of accounts" [value]="acc.id">{{ acc.code }} — {{ acc.name }}</option>
                  </select>
                </td>
                <td class="p-2">
                  <input type="text" [(ngModel)]="line.memo" placeholder="Memo"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs">
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="line.debit" (input)="calcJournalTotals()"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-right font-bold">
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="line.credit" (input)="calcJournalTotals()"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-right font-bold">
                </td>
                <td class="p-2 text-center">
                  <button (click)="removeJournalLine(i)" class="text-rose-500 hover:text-rose-700 font-bold">✕</button>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50 font-black text-xs">
              <tr>
                <td colspan="2" class="p-3">Total</td>
                <td class="p-3 text-right font-mono text-emerald-700">₹{{ journalDebitSum | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-mono text-emerald-700">₹{{ journalCreditSum | number:'1.2-2' }}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div class="flex items-center justify-between">
          <button (click)="addJournalLine()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold">
            + Add Journal Line
          </button>

          <div class="flex items-center gap-4">
            <span class="text-xs font-bold" [ngClass]="journalDebitSum === journalCreditSum && journalDebitSum > 0 ? 'text-emerald-700' : 'text-rose-600'">
              {{ journalDebitSum === journalCreditSum && journalDebitSum > 0 ? '✓ Balanced' : '⚠️ Debits must equal Credits' }}
            </span>

            <button (click)="submitJournal()" [disabled]="journalDebitSum !== journalCreditSum || journalDebitSum === 0"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              Post Journal Entry
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AccountingComponent implements OnInit {
  activeTab: 'TB' | 'PL' | 'BS' | 'CF' | 'COA' | 'JOURNAL' = 'TB';

  trialBalance: TrialBalance | null = null;
  profitLoss: ProfitLossStatement | null = null;
  balanceSheet: BalanceSheet | null = null;
  cashFlow: CashFlowStatement | null = null;
  accounts: Account[] = [];

  journalReq: any = {
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: []
  };

  journalDebitSum = 0;
  journalCreditSum = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAll();
    this.initJournalForm();
  }

  loadAll(): void {
    this.apiService.getTrialBalance().subscribe(tb => this.trialBalance = tb);
    this.apiService.getProfitLoss().subscribe(pl => this.profitLoss = pl);
    this.apiService.getBalanceSheet().subscribe(bs => this.balanceSheet = bs);
    this.apiService.getCashFlow().subscribe(cf => this.cashFlow = cf);
    this.apiService.getChartOfAccounts().subscribe(accs => this.accounts = accs);
  }

  initJournalForm(): void {
    this.journalReq.lines = [
      { accountId: null, memo: '', debit: 0, credit: 0 },
      { accountId: null, memo: '', debit: 0, credit: 0 }
    ];
  }

  addJournalLine(): void {
    this.journalReq.lines.push({ accountId: null, memo: '', debit: 0, credit: 0 });
  }

  removeJournalLine(index: number): void {
    this.journalReq.lines.splice(index, 1);
    this.calcJournalTotals();
  }

  calcJournalTotals(): void {
    let d = 0;
    let c = 0;
    for (const line of this.journalReq.lines) {
      d += Number(line.debit) || 0;
      c += Number(line.credit) || 0;
    }
    this.journalDebitSum = d;
    this.journalCreditSum = c;
  }

  submitJournal(): void {
    this.apiService.createJournalEntry(this.journalReq).subscribe({
      next: () => {
        this.loadAll();
        this.activeTab = 'TB';
        this.initJournalForm();
        this.calcJournalTotals();
      }
    });
  }
}
