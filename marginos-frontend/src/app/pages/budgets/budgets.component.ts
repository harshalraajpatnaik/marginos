import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Budget } from '../../models/types';

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Financial Planning & Control</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Monthly Budgets & Variance Analysis</h1>
          <p class="text-xs text-slate-500 mt-1">
            Establish monthly revenue targets and strict overhead spending ceilings to protect your net profit margin.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <select [(ngModel)]="selectedYear" (ngModelChange)="loadBudgets()" class="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white">
            <option [value]="2025">Year 2025</option>
            <option [value]="2026">Year 2026</option>
            <option [value]="2027">Year 2027</option>
          </select>
          <button (click)="showModal = true" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>Set Monthly Budget</span>
          </button>
        </div>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">Annual Revenue Target</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">
            ₹{{ totalBudgetedRevenue | number:'1.2-2' }}
          </span>
          <div class="flex items-center justify-between text-[10px] text-slate-500 mt-2">
            <span>Actual Realized: ₹{{ totalActualRevenue | number:'1.0-0' }}</span>
            <span class="font-bold text-indigo-600">{{ (totalActualRevenue / (totalBudgetedRevenue || 1) * 100) | number:'1.0-0' }}% achieved</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">Operating Overhead Ceiling</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">
            ₹{{ totalBudgetedExpenses | number:'1.2-2' }}
          </span>
          <div class="flex items-center justify-between text-[10px] text-slate-500 mt-2">
            <span>Actual Spend: ₹{{ totalActualExpenses | number:'1.0-0' }}</span>
            <span class="font-bold" [ngClass]="totalActualExpenses <= totalBudgetedExpenses ? 'text-emerald-600' : 'text-rose-600'">
              {{ totalActualExpenses <= totalBudgetedExpenses ? 'Within Budget' : 'Budget Exceeded' }}
            </span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">Net Profit Target</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">
            ₹{{ (totalBudgetedRevenue - totalBudgetedExpenses) | number:'1.2-2' }}
          </span>
          <span class="text-[10px] text-slate-400 mt-1 block">Planned operational margin cushion</span>
        </div>
      </div>

      <!-- Add Budget Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-base font-extrabold text-slate-900">Configure Monthly Budget</h3>
              <p class="text-xs text-slate-500">Set revenue and expense goals for {{ selectedYear }}</p>
            </div>
            <button (click)="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Month</label>
              <select [(ngModel)]="newBudget.monthNumber" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium">
                <option *ngFor="let m of months; let i = index" [value]="i + 1">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <input type="number" [(ngModel)]="newBudget.year" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Monthly Revenue Target (₹)</label>
            <input type="number" [(ngModel)]="newBudget.budgetedRevenue" placeholder="e.g. 350000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900">
            <span class="text-[10px] text-slate-400">Total counter sales & invoices target for this month</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Operating Overheads Budget (₹)</label>
            <input type="number" [(ngModel)]="newBudget.budgetedExpenses" placeholder="e.g. 45000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900">
            <span class="text-[10px] text-slate-400">Cap for store rent, helper wages, electricity, logistics</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Notes / Strategic Focus</label>
            <input type="text" [(ngModel)]="newBudget.notes" placeholder="e.g. Festival stock buildup or summer discount push"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button (click)="showModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="saveBudget()" [disabled]="saving || !newBudget.budgetedRevenue"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Set Budget' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Budgets List -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-900">12-Month Performance Variance Table ({{ selectedYear }})</h2>
          <span class="text-xs text-slate-500">Double-entry ledger comparison</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Month</th>
                <th class="p-3 text-right">Target Revenue</th>
                <th class="p-3 text-right">Actual Revenue</th>
                <th class="p-3 text-right">Revenue Variance</th>
                <th class="p-3 text-right">Expense Budget</th>
                <th class="p-3 text-right">Actual Expenses</th>
                <th class="p-3 text-right">Planned Profit</th>
                <th class="p-3 text-right">Actual Profit</th>
                <th class="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let b of budgets" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ b.monthName || ('Month ' + b.month) }}</td>
                <td class="p-3 text-right font-semibold">₹{{ (b.budgetedRevenue || b.budgetedAmount || 0) | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-bold text-indigo-700">₹{{ (b.actualRevenue || b.actualAmount || 0) | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-bold"
                    [ngClass]="(b.revenueVariance || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                  {{ (b.revenueVariance || 0) >= 0 ? '+' : '' }}₹{{ (b.revenueVariance || 0) | number:'1.2-2' }}
                  <span class="text-[10px] block font-normal">({{ b.revenueVariancePercent || 0 }}%)</span>
                </td>
                <td class="p-3 text-right">₹{{ (b.budgetedExpenses || 45000) | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-bold"
                    [ngClass]="(b.actualExpenses || 0) <= (b.budgetedExpenses || 45000) ? 'text-slate-800' : 'text-rose-600'">
                  ₹{{ (b.actualExpenses || 0) | number:'1.2-2' }}
                </td>
                <td class="p-3 text-right text-slate-500">₹{{ (b.budgetedProfit || 0) | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black"
                    [ngClass]="(b.actualProfit || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                  ₹{{ (b.actualProfit || 0) | number:'1.2-2' }}
                </td>
                <td class="p-3 text-center">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': (b.actualProfit || 0) > 0,
                          'bg-amber-50 text-amber-700 border border-amber-200': (b.actualRevenue || 0) === 0,
                          'bg-rose-50 text-rose-700 border border-rose-200': (b.actualProfit || 0) < 0
                        }">
                    {{ (b.actualProfit || 0) > 0 ? 'Profitable' : (b.actualRevenue || 0) === 0 ? 'Upcoming' : 'Overhead Alert' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class BudgetsComponent implements OnInit {
  budgets: Budget[] = [];
  selectedYear = 2026;
  showModal = false;
  saving = false;
  Math = Math;

  totalBudgetedRevenue = 0;
  totalActualRevenue = 0;
  totalBudgetedExpenses = 0;
  totalActualExpenses = 0;

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  newBudget: any = {
    monthNumber: new Date().getMonth() + 1,
    year: 2026,
    budgetedRevenue: 350000,
    budgetedExpenses: 45000,
    notes: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.apiService.getBudgets(this.selectedYear).subscribe(list => {
      this.budgets = list || [];
      this.calculateTotals();
    });
  }

  calculateTotals(): void {
    this.totalBudgetedRevenue = this.budgets.reduce((sum, b) => sum + (b.budgetedRevenue || b.budgetedAmount || 0), 0);
    this.totalActualRevenue = this.budgets.reduce((sum, b) => sum + (b.actualRevenue || b.actualAmount || 0), 0);
    this.totalBudgetedExpenses = this.budgets.reduce((sum, b) => sum + (b.budgetedExpenses || 45000), 0);
    this.totalActualExpenses = this.budgets.reduce((sum, b) => sum + (b.actualExpenses || 0), 0);
  }

  saveBudget(): void {
    this.saving = true;
    const req = {
      year: this.newBudget.year,
      monthNumber: this.newBudget.monthNumber,
      name: `${this.months[this.newBudget.monthNumber - 1]} ${this.newBudget.year} Budget`,
      budgetedRevenue: this.newBudget.budgetedRevenue,
      budgetedCogs: (this.newBudget.budgetedRevenue || 0) * 0.75,
      budgetedExpenses: this.newBudget.budgetedExpenses,
      notes: this.newBudget.notes
    };

    this.apiService.createBudget(req as any).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadBudgets();
      },
      error: () => this.saving = false
    });
  }
}
