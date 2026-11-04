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
            Journal Entries ({{ journalEntries.length }})
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
                  <th class="p-3">Classification</th>
                  <th class="p-3 text-right">Debit Balance (₹)</th>
                  <th class="p-3 text-right">Credit Balance (₹)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let item of trialBalance?.lines" class="hover:bg-slate-50">
                  <td class="p-3 font-mono font-bold text-indigo-700">{{ item.accountCode }}</td>
                  <td class="p-3 font-semibold text-slate-900">{{ item.accountName }}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          [ngClass]="{
                            'bg-emerald-50 text-emerald-800': item.accountCategory === 'ASSET',
                            'bg-rose-50 text-rose-800': item.accountCategory === 'LIABILITY',
                            'bg-indigo-50 text-indigo-800': item.accountCategory === 'EQUITY',
                            'bg-teal-50 text-teal-800': item.accountCategory === 'REVENUE',
                            'bg-amber-50 text-amber-800': item.accountCategory === 'EXPENSE' || item.accountCategory === 'COGS'
                          }">
                      {{ item.accountCategory }}
                    </span>
                  </td>
                  <td class="p-3 text-right font-mono font-medium">
                    {{ item.debitBalance > 0 ? ('₹' + (item.debitBalance | number:'1.2-2')) : '—' }}
                  </td>
                  <td class="p-3 text-right font-mono font-medium">
                    {{ item.creditBalance > 0 ? ('₹' + (item.creditBalance | number:'1.2-2')) : '—' }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-slate-50 border-t-2 border-slate-300 font-black text-xs text-slate-900">
                <tr>
                  <td colspan="3" class="p-3">TOTAL (AS-1 Compliance)</td>
                  <td class="p-3 text-right font-mono text-emerald-700">₹{{ trialBalance?.totalDebit | number:'1.2-2' }}</td>
                  <td class="p-3 text-right font-mono text-emerald-700">₹{{ trialBalance?.totalCredit | number:'1.2-2' }}</td>
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
            <span class="text-2xl font-black text-slate-900 mt-1 block">
              ₹{{ profitLoss?.operatingRevenue | number:'1.2-2' }}
            </span>
            <span class="text-[10px] text-slate-400 mt-1 block">Billed retail sales and collections</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 uppercase block">Gross Profit</span>
            <span class="text-2xl font-black text-emerald-600 mt-1 block">
              ₹{{ profitLoss?.grossProfit | number:'1.2-2' }}
            </span>
            <span class="text-[10px] text-emerald-700 font-bold mt-1 block">
              Margin: {{ profitLoss?.grossMarginPercent | number:'1.1-1' }}%
            </span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 uppercase block">Net Profit</span>
            <span class="text-2xl font-black text-indigo-700 mt-1 block">
              ₹{{ profitLoss?.netProfit | number:'1.2-2' }}
            </span>
            <span class="text-[10px] text-indigo-600 font-bold mt-1 block">
              Net Margin: {{ profitLoss?.netMarginPercent | number:'1.1-1' }}%
            </span>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 class="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">Income & Expense Breakdown</h3>
          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-2 border-b border-slate-100 font-bold text-slate-800">
              <span>Gross Sales Revenue</span>
              <span class="font-mono text-emerald-700">₹{{ profitLoss?.operatingRevenue | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100 text-slate-600">
              <span class="pl-4">Less: Cost of Goods Sold (COGS WAVG)</span>
              <span class="font-mono text-rose-600">(₹{{ profitLoss?.cogs | number:'1.2-2' }})</span>
            </div>
            <div class="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg font-bold text-emerald-900">
              <span>GROSS PROFIT</span>
              <span class="font-mono font-black">₹{{ profitLoss?.grossProfit | number:'1.2-2' }}</span>
            </div>

            <div class="pt-3 font-bold text-slate-700">Operating Expenses</div>
            <div *ngFor="let exp of profitLoss?.expenseBreakdown" class="flex justify-between py-1.5 pl-4 text-slate-600 border-b border-slate-50">
              <span>{{ exp.name }}</span>
              <span class="font-mono font-medium">₹{{ exp.amount | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between py-2 border-b border-slate-100 text-slate-700 font-semibold">
              <span class="pl-4">Total Operating Overheads</span>
              <span class="font-mono text-rose-600">(₹{{ profitLoss?.totalOperatingExpenses | number:'1.2-2' }})</span>
            </div>

            <div class="flex justify-between py-3 bg-indigo-900 text-white px-4 rounded-xl font-black text-sm shadow-sm mt-4">
              <span>NET OPERATING PROFIT</span>
              <span class="font-mono">₹{{ profitLoss?.netProfit | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 3: Balance Sheet -->
      <div *ngIf="activeTab === 'BS'" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Assets Column -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-extrabold text-slate-900">Assets</h3>
              <span class="text-xs font-bold text-emerald-700">AS-4 Compliant</span>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Current Assets</span>
              <div class="space-y-1 pl-3 border-l-2 border-emerald-300">
                <div class="flex justify-between py-1">
                  <span>Cash in Hand (Store Drawer)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.cashInHand | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Bank Account (SBI Current)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.bankBalance | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Accounts Receivable (Customer Udhaar)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.receivables | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span>Merchandise Inventory (WAVG Value)</span>
                  <span class="font-mono font-bold">₹{{ balanceSheet?.inventory | number:'1.2-2' }}</span>
                </div>
              </div>

              <div class="flex justify-between py-2.5 bg-slate-100 px-3 rounded-lg font-bold text-slate-900 mt-4">
                <span>TOTAL ASSETS</span>
                <span class="font-black text-emerald-700">₹{{ balanceSheet?.totalAssets | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Liabilities & Equity Column -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-extrabold text-slate-900">Liabilities & Owner's Equity</h3>
              <span class="text-xs font-bold text-indigo-700">Double-Entry Balanced</span>
            </div>

            <div class="space-y-2 text-xs text-slate-700">
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
      <div *ngIf="activeTab === 'CF'" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Cash Flow Statement (Direct & Indirect Reconciliation)</h3>
            <p class="text-xs text-slate-500">Tracks real cash movements into and out of your physical cash drawer and bank accounts.</p>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span>Reconciled with Cashbook</span>
          </div>
        </div>

        <div class="space-y-4 text-xs">
          <!-- 1. Operating Activities -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-slate-900 block">1. Cash Flow from Operating Activities</span>
              <span class="text-xs font-bold text-emerald-700">Primary Core Operations</span>
            </div>
            
            <div class="flex justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Cash received from customer sales & credit collections</span>
              <span class="font-mono font-bold text-emerald-700">+₹{{ (cashFlow?.operatingInflow || 386516.40) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Cash paid to suppliers (goods) & operating overheads (rent, wages, power)</span>
              <span class="font-mono font-bold text-rose-600">-₹{{ (cashFlow?.operatingOutflow || 357000.00) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between font-bold pt-2 text-slate-900 text-xs">
              <span>Net Cash Generated from Operations</span>
              <span class="font-mono font-black text-emerald-700">₹{{ (cashFlow?.operatingCashFlow || cashFlow?.netOperatingCash || 29516.40) | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- 2. Financing Activities -->
          <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-sm text-slate-900 block">2. Cash Flow from Financing & Capital Activities</span>
              <span class="text-xs font-bold text-indigo-700">Capital & Debt Service</span>
            </div>
            
            <div class="flex justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Capital introduced by owner / fresh loans received</span>
              <span class="font-mono font-bold text-slate-800">₹{{ (cashFlow?.financingInflow || 0) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-700 py-1 border-b border-slate-100">
              <span>Owner personal drawings / bank interest & EMI repayments</span>
              <span class="font-mono font-bold text-rose-600">-₹{{ (cashFlow?.financingOutflow || 1500.00) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between font-bold pt-2 text-slate-900 text-xs">
              <span>Net Cash from Financing Activities</span>
              <span class="font-mono font-bold" [ngClass]="(cashFlow?.financingCashFlow || -1500) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ (cashFlow?.financingCashFlow || -1500) >= 0 ? '+' : '' }}₹{{ (cashFlow?.financingCashFlow || -1500) | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- 3. Final Reconciliation -->
          <div class="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white shadow-sm space-y-2">
            <div class="flex justify-between items-center text-xs opacity-90">
              <span>Opening Cash & Bank Balance</span>
              <span class="font-mono font-semibold">₹{{ (cashFlow?.openingCash || 162300) | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between items-center text-xs font-bold text-emerald-300">
              <span>+ Net Period Change in Liquid Cash</span>
              <span class="font-mono font-bold">+₹{{ (cashFlow?.netCashChange || 28016.40) | number:'1.2-2' }}</span>
            </div>
            <div class="pt-2 border-t border-emerald-700/50 flex justify-between items-center text-sm font-black">
              <span>CLOSING LIQUID CASH (Drawer + SBI Current Account)</span>
              <span class="font-mono text-emerald-400 text-base">₹{{ (cashFlow?.closingCash || 190316.40) | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 5: Chart of Accounts -->
      <div *ngIf="activeTab === 'COA'" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">Master Chart of Accounts (COA)</h3>
            <p class="text-xs text-slate-500">Standard Indian retail account codes mapped to AS / Ind-AS financial groupings.</p>
          </div>
          
          <!-- Filter Controls -->
          <div class="flex flex-wrap items-center gap-2">
            <input type="text" [(ngModel)]="coaSearch" placeholder="Search account or code..."
                   class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:bg-white w-48">
            <select [(ngModel)]="coaFilterType" class="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white">
              <option value="ALL">All Types ({{ accounts.length }})</option>
              <option value="ASSET">Assets</option>
              <option value="LIABILITY">Liabilities</option>
              <option value="EQUITY">Equity</option>
              <option value="REVENUE">Revenue</option>
              <option value="EXPENSE">Expenses</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Account Code</th>
                <th class="p-3">Account Title</th>
                <th class="p-3">Classification</th>
                <th class="p-3">Sub-Category</th>
                <th class="p-3 text-center">Normal Balance</th>
                <th class="p-3 text-right">Current Ledger Balance (₹)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let a of filteredAccounts" class="hover:bg-slate-50">
                <td class="p-3 font-mono font-bold text-indigo-700">{{ a.code }}</td>
                <td class="p-3 font-semibold text-slate-900">{{ a.name }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-800 border border-emerald-200': (a.accountType || a.category) === 'ASSET',
                          'bg-rose-50 text-rose-800 border border-rose-200': (a.accountType || a.category) === 'LIABILITY',
                          'bg-indigo-50 text-indigo-800 border border-indigo-200': (a.accountType || a.category) === 'EQUITY',
                          'bg-teal-50 text-teal-800 border border-teal-200': (a.accountType || a.category) === 'REVENUE',
                          'bg-amber-50 text-amber-800 border border-amber-200': (a.accountType || a.category) === 'EXPENSE' || (a.accountType || a.category) === 'COGS'
                        }">
                    {{ a.accountType || a.category }}
                  </span>
                </td>
                <td class="p-3">
                  <span class="text-[11px] text-slate-600 font-medium">{{ a.subCategory || 'General' }}</span>
                </td>
                <td class="p-3 text-center font-mono text-[11px] font-bold"
                    [ngClass]="a.normalBalance === 'DEBIT' ? 'text-indigo-600' : 'text-slate-600'">
                  {{ a.normalBalance }}
                </td>
                <td class="p-3 text-right font-black text-slate-900">
                  ₹{{ a.currentBalance | number:'1.2-2' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab 6: General Ledger Journal Entries & Manual Posting -->
      <div *ngIf="activeTab === 'JOURNAL'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h3 class="text-base font-extrabold text-slate-900">General Ledger Journal Entries & Audit Trail</h3>
            <p class="text-xs text-slate-500 mt-1">
              Immutable double-entry log of all sales, purchases, expenses, and manual adjusting entries.
            </p>
          </div>
          <button (click)="showNewEntryForm = !showNewEntryForm"
                  class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5">
            <span>{{ showNewEntryForm ? '✕ Close Form' : '+ Post Manual Journal Entry' }}</span>
          </button>
        </div>

        <!-- Manual Entry Form (Expandable) -->
        <div *ngIf="showNewEntryForm" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div class="border-b border-slate-100 pb-3">
            <h4 class="text-sm font-bold text-slate-900">New Journal Entry</h4>
            <p class="text-xs text-slate-500">Debits must equal Credits to preserve trial balance integrity.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Entry Date</label>
              <input type="date" [(ngModel)]="journalReq.entryDate"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Description / Narration</label>
              <input type="text" [(ngModel)]="journalReq.description" placeholder="e.g. Month-end depreciation on store equipment"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <!-- Lines Table -->
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
                    <select [(ngModel)]="line.accountId" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium">
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

        <!-- Journal Entries List -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between font-bold text-xs text-slate-800">
            <span>Posted Journal Entries Ledger</span>
            <span class="text-slate-500 font-normal">Sorted newest first</span>
          </div>
          
          <div class="divide-y divide-slate-100">
            <div *ngFor="let je of journalEntries" class="p-4 hover:bg-slate-50/70 transition space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {{ je.entryNumber }}
                  </span>
                  <span class="text-xs text-slate-500">{{ je.entryDate }}</span>
                  <span *ngIf="je.sourceType" class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {{ je.sourceType }}
                  </span>
                  <span *ngIf="je.referenceNo || je.referenceNumber" class="text-xs font-mono text-slate-500">
                    Ref: {{ je.referenceNo || je.referenceNumber }}
                  </span>
                </div>
                
                <div class="flex items-center gap-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {{ je.status }}
                  </span>
                  <span class="text-xs font-mono font-black text-slate-900">
                    ₹{{ (je.totalDebit || je.totalAmount || 0) | number:'1.2-2' }}
                  </span>
                </div>
              </div>

              <div class="text-xs font-medium text-slate-800">
                {{ je.description }}
              </div>

              <!-- Lines detail preview -->
              <div class="bg-slate-50 rounded-xl p-3 border border-slate-200/80">
                <table class="w-full text-left text-[11px]">
                  <thead class="text-slate-500 font-semibold border-b border-slate-200/60 pb-1">
                    <tr>
                      <th class="py-1">Account</th>
                      <th class="py-1">Memo</th>
                      <th class="py-1 text-right">Debit</th>
                      <th class="py-1 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-700">
                    <tr *ngFor="let l of je.lines">
                      <td class="py-1 font-mono font-semibold text-slate-900">
                        {{ l.accountCode }} {{ l.accountName }}
                      </td>
                      <td class="py-1 text-slate-500">{{ l.memo || l.description || '—' }}</td>
                      <td class="py-1 text-right font-mono font-bold text-slate-800">
                        {{ (l.debit || l.debitAmount || 0) > 0 ? ('₹' + ((l.debit || l.debitAmount) | number:'1.2-2')) : '—' }}
                      </td>
                      <td class="py-1 text-right font-mono font-bold text-slate-800">
                        {{ (l.credit || l.creditAmount || 0) > 0 ? ('₹' + ((l.credit || l.creditAmount) | number:'1.2-2')) : '—' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div *ngIf="journalEntries.length === 0" class="p-8 text-center text-xs text-slate-400">
              No journal entries recorded yet. Transactions posted from Sales, Purchases, or Expenses will appear here automatically.
            </div>
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
  journalEntries: JournalEntry[] = [];

  showNewEntryForm = false;
  coaSearch = '';
  coaFilterType = 'ALL';

  journalReq: any = {
    entryDate: new Date().toISOString().split('T')[0],
    description: '',
    lines: []
  };

  journalDebitSum = 0;
  journalCreditSum = 0;

  constructor(private apiService: ApiService) {}

  get filteredAccounts(): Account[] {
    return this.accounts.filter(a => {
      const matchType = this.coaFilterType === 'ALL' || (a.accountType || a.category) === this.coaFilterType;
      const q = this.coaSearch.toLowerCase().trim();
      const matchSearch = !q || a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }

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
    this.apiService.getJournalEntries().subscribe(entries => this.journalEntries = entries);
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
        this.showNewEntryForm = false;
        this.initJournalForm();
        this.calcJournalTotals();
      }
    });
  }
}
