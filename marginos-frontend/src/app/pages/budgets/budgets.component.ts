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
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Financial Planning</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Budgets vs. Actual Variance</h1>
          <p class="text-xs text-slate-500 mt-1">
            Set monthly revenue and operating expenditure budgets to prevent overhead creep.
          </p>
        </div>

        <button (click)="showModal = true" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
          <span>+</span>
          <span>Set New Budget</span>
        </button>
      </div>

      <!-- Add Budget Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Set Monthly Budget</h3>
            <button (click)="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Budget Category</label>
            <select [(ngModel)]="newBudget.category" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="REVENUE">Sales Revenue Target</option>
              <option value="RENT">Store Rent</option>
              <option value="SALARIES">Staff Wages</option>
              <option value="ELECTRICITY">Electricity & Power</option>
              <option value="TRANSPORT">Freight & Logistics</option>
              <option value="MARKETING">Marketing & Ads</option>
              <option value="PACKAGING">Packaging Materials</option>
              <option value="MISC">Misc Overheads</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Month (1 - 12)</label>
              <input type="number" [(ngModel)]="newBudget.month" min="1" max="12" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Year</label>
              <input type="number" [(ngModel)]="newBudget.year" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Budgeted Target (₹)</label>
            <input type="number" [(ngModel)]="newBudget.budgetedAmount" placeholder="e.g. 50000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900">
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button (click)="showModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="saveBudget()" [disabled]="saving || !newBudget.budgetedAmount"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Set Budget' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Budgets List -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Category</th>
                <th class="p-3">Period</th>
                <th class="p-3 text-right">Budget Target</th>
                <th class="p-3 text-right">Actual Spend</th>
                <th class="p-3 text-right">Variance</th>
                <th class="p-3">Utilization Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let b of budgets" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ b.category }}</td>
                <td class="p-3 text-slate-500">Month {{ b.month }}, {{ b.year }}</td>
                <td class="p-3 text-right font-semibold">₹{{ b.budgetedAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-bold text-slate-900">₹{{ b.actualAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black"
                    [ngClass]="(b.budgetedAmount - b.actualAmount) >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                  ₹{{ (b.budgetedAmount - b.actualAmount) | number:'1.2-2' }}
                </td>
                <td class="p-3">
                  <div class="flex items-center gap-2">
                    <div class="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden max-w-[100px]">
                      <div class="h-2 rounded-full"
                           [ngClass]="(b.actualAmount / b.budgetedAmount) > 1 ? 'bg-rose-500' : 'bg-emerald-500'"
                           [style.width.%]="Math.min(100, (b.actualAmount / (b.budgetedAmount || 1)) * 100)"></div>
                    </div>
                    <span class="text-[10px] font-bold">{{ ((b.actualAmount / (b.budgetedAmount || 1)) * 100) | number:'1.0-0' }}%</span>
                  </div>
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
  showModal = false;
  saving = false;
  Math = Math;

  newBudget: any = {
    category: 'RENT',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    budgetedAmount: null
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBudgets();
  }

  loadBudgets(): void {
    this.apiService.getBudgets().subscribe(list => this.budgets = list);
  }

  saveBudget(): void {
    this.saving = true;
    this.apiService.createBudget(this.newBudget).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.loadBudgets();
      },
      error: () => this.saving = false
    });
  }
}
