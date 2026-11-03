import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { DashboardSummary } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">
              {{ authService.activeBusiness()?.name || 'My Business' }}
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700 border-emerald-200': currentMode === 'QUICK_START',
                    'bg-indigo-50 text-indigo-700 border-indigo-200': currentMode === 'DETAILED',
                    'bg-amber-50 text-amber-700 border-amber-200': currentMode === 'SIMULATOR'
                  }">
              {{ currentMode === 'QUICK_START' ? 'Mode A • Quick Start' : currentMode === 'DETAILED' ? 'Mode B • Detailed ERP' : 'Mode C • Simulator' }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            Real-time financial pulse • Powered by Double-Entry Ledger Engine
          </p>
        </div>

        <!-- Quick Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/cashbook" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>📖</span>
            <span>Daily Cashbook</span>
          </a>
          <a routerLink="/sales" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>🧾</span>
            <span>New Sale</span>
          </a>
          <a routerLink="/pricing-calculator" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>🎯</span>
            <span>Margin Calc</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="p-12 text-center text-slate-400">
        <div class="inline-block animate-spin text-3xl mb-2">⟳</div>
        <p class="text-sm">Calculating real-time financial metrics...</p>
      </div>

      <!-- KPI Stat Cards -->
      <div *ngIf="!loading && summary" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Cash in Hand -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cash in Hand</span>
            <span class="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 font-bold">💵</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            ₹{{ summary.cashInHand | number:'1.2-2' }}
          </div>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <span>Bank Balance:</span>
            <span class="font-bold text-slate-800">₹{{ summary.bankBalance | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Today's Sales -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Today's Sales</span>
            <span class="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold">📈</span>
          </div>
          <div class="text-2xl font-black text-indigo-600">
            ₹{{ summary.todaySales | number:'1.2-2' }}
          </div>
          <div class="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            <span>Month to Date:</span>
            <span class="font-bold text-slate-800">₹{{ summary.mtdSales | number:'1.2-2' }}</span>
          </div>
        </div>

        <!-- Profit Margins -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Profitability (MTD)</span>
            <span class="p-1.5 rounded-lg bg-amber-50 text-amber-600 font-bold">🎯</span>
          </div>
          <div class="text-2xl font-black text-emerald-600">
            ₹{{ summary.netProfit | number:'1.2-2' }}
          </div>
          <div class="mt-2 flex items-center gap-3 text-[11px]">
            <span class="text-slate-500">Gross: <strong class="text-slate-800">{{ summary.grossMarginPercent | number:'1.1-1' }}%</strong></span>
            <span class="text-slate-500">Net: <strong class="text-emerald-700">{{ summary.netMarginPercent | number:'1.1-1' }}%</strong></span>
          </div>
        </div>

        <!-- Working Capital Health -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div class="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Working Capital Cycle</span>
            <span class="p-1.5 rounded-lg bg-purple-50 text-purple-600 font-bold">🔄</span>
          </div>
          <div class="text-2xl font-black text-slate-900">
            {{ summary.cashConversionCycleDays || 34 }} Days
          </div>
          <div class="mt-2 flex items-center justify-between text-[11px]">
            <span class="text-slate-500">Cycle Health:</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Optimal
            </span>
          </div>
        </div>
      </div>

      <!-- Warning Dues & Inventory Banners -->
      <div *ngIf="summary" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Receivables vs Payables Card -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
            <span>Credit & Dues Status</span>
            <a routerLink="/customers" class="text-indigo-600 hover:text-indigo-700 text-xs lowercase">View Khata →</a>
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200/60">
              <span class="text-[11px] font-bold text-amber-800 block">Customer Udhaar (To Receive)</span>
              <span class="text-xl font-extrabold text-amber-900 mt-1 block">
                ₹{{ summary.totalReceivables | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-amber-700 mt-1 block">Tied up in customer credit</span>
            </div>

            <div class="p-4 rounded-xl bg-rose-50/60 border border-rose-200/60">
              <span class="text-[11px] font-bold text-rose-800 block">Supplier Dues (To Pay)</span>
              <span class="text-xl font-extrabold text-rose-900 mt-1 block">
                ₹{{ summary.totalPayables | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-rose-700 mt-1 block">Accounts payable to vendors</span>
            </div>
          </div>
        </div>

        <!-- Inventory Stock Valuation Card -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
            <span>Stock Valuation (WAVG)</span>
            <a routerLink="/inventory" class="text-indigo-600 hover:text-indigo-700 text-xs lowercase">Inventory Analytics →</a>
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-[11px] font-bold text-slate-600 block">Total Stock Valuation</span>
              <span class="text-xl font-extrabold text-slate-900 mt-1 block">
                ₹{{ summary.stockValuation | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-500 mt-1 block">Weighted-average cost basis</span>
            </div>

            <div class="p-4 rounded-xl" [ngClass]="summary.lowStockCount > 0 ? 'bg-amber-50/80 border border-amber-200' : 'bg-emerald-50/80 border border-emerald-200'">
              <span class="text-[11px] font-bold block" [ngClass]="summary.lowStockCount > 0 ? 'text-amber-800' : 'text-emerald-800'">
                Low Stock Alert
              </span>
              <span class="text-xl font-extrabold mt-1 block" [ngClass]="summary.lowStockCount > 0 ? 'text-amber-900' : 'text-emerald-900'">
                {{ summary.lowStockCount }} Items
              </span>
              <span class="text-[10px] mt-1 block" [ngClass]="summary.lowStockCount > 0 ? 'text-amber-700' : 'text-emerald-700'">
                {{ summary.lowStockCount > 0 ? 'Reorder needed immediately' : 'All stock levels optimal' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mode-Specific Quick Start Guide -->
      <div *ngIf="currentMode === 'QUICK_START'" class="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase mb-2 border border-emerald-400/30">
              Shopkeeper Quick Flow
            </div>
            <h3 class="text-lg font-bold">End of Day Daily Cash Reconciliation</h3>
            <p class="text-xs text-slate-300 mt-1 max-w-xl">
              Count your physical cash drawer at shop closing time, record today's cashbook entry, and send the WhatsApp daily digest to your phone or partners.
            </p>
          </div>
          <a routerLink="/cashbook" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition whitespace-nowrap">
            Open Cashbook →
          </a>
        </div>
      </div>

      <!-- Decision Tools Shortcut Grid -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h2 class="text-sm font-bold text-slate-900 mb-4">MBA Financial Decision Modules</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a routerLink="/pricing-calculator" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition group">
            <span class="text-2xl block mb-2">🎯</span>
            <h3 class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Markup vs Margin</h3>
            <p class="text-[11px] text-slate-500 mt-1">Calculate exact selling prices and prevent markup confusion.</p>
          </a>

          <a routerLink="/breakeven" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition group">
            <span class="text-2xl block mb-2">📈</span>
            <h3 class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Break-even Sales</h3>
            <p class="text-[11px] text-slate-500 mt-1">Find monthly revenue target required to cover fixed overheads.</p>
          </a>

          <a routerLink="/loan-calculator" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition group">
            <span class="text-2xl block mb-2">🏦</span>
            <h3 class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Loan & DSCR Check</h3>
            <p class="text-[11px] text-slate-500 mt-1">Check if business cash flow can safely service new loan EMI.</p>
          </a>

          <a routerLink="/scenarios" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/20 transition group">
            <span class="text-2xl block mb-2">🔮</span>
            <h3 class="text-xs font-bold text-slate-900 group-hover:text-indigo-600">Mode C Simulator</h3>
            <p class="text-[11px] text-slate-500 mt-1">Simulate expansion, new hires, or rent hikes side-by-side.</p>
          </a>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = true;

  constructor(private apiService: ApiService, public authService: AuthService) {}

  get currentMode(): string {
    return this.authService.activeBusiness()?.operatingMode || 'QUICK_START';
  }

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading = true;
    this.apiService.getDashboardSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
