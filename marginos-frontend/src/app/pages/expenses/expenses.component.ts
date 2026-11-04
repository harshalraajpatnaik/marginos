import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Expense } from '../../models/types';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 mb-2">
            <span>Operating Overheads</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Operating Expenses</h1>
          <p class="text-xs text-slate-500 mt-1">
            Track fixed overheads and variable operating costs. Directly impacts Break-even sales targets.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/breakeven" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>⚖️</span>
            <span>Break-even Target</span>
          </a>
          <a routerLink="/accounting" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📊</span>
            <span>General Ledger</span>
          </a>
          <button (click)="showNewExpense = !showNewExpense" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>{{ showNewExpense ? 'Close Form' : 'Record Expense' }}</span>
          </button>
        </div>
      </div>

      <!-- New Expense Form -->
      <div *ngIf="showNewExpense" class="bg-white p-6 rounded-2xl border-2 border-rose-200 shadow-md space-y-4">
        <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span>💸</span>
          <span>Record New Operating Expense</span>
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Expense Category</label>
            <select [(ngModel)]="expenseReq.category" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="RENT">Store / Warehouse Rent</option>
              <option value="ELECTRICITY">Electricity & Power</option>
              <option value="SALARIES">Staff Wages & Salaries</option>
              <option value="TRANSPORT">Logistics & Freight</option>
              <option value="PACKAGING">Packaging & Consumables</option>
              <option value="MAINTENANCE">Maintenance & Repairs</option>
              <option value="MARKETING">Marketing & Advertising</option>
              <option value="REFRESHMENTS">Tea, Coffee & Daily Snacks</option>
              <option value="MISC">Miscellaneous Overheads</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Amount (₹)</label>
            <input type="number" [(ngModel)]="expenseReq.amount" placeholder="e.g. 1500"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select [(ngModel)]="expenseReq.paymentMode" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="CASH">Cash Drawer</option>
              <option value="UPI">UPI / QR (PhonePe / GPay)</option>
              <option value="BANK_TRANSFER">Bank NEFT / IMPS</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Date</label>
            <input type="date" [(ngModel)]="expenseReq.expenseDate"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Payee / Vendor Name</label>
            <input type="text" [(ngModel)]="expenseReq.payeeName" placeholder="e.g. Landlord Verma / Bescom"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Description / Notes</label>
          <input type="text" [(ngModel)]="expenseReq.description" placeholder="e.g. Monthly shop rent for November"
                 class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
        </div>

        <div class="pt-2 flex justify-end">
          <button (click)="submitExpense()" [disabled]="submitting || !expenseReq.amount"
                  class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
            {{ submitting ? 'Recording...' : '✓ Record Expense & Post Ledger' }}
          </button>
        </div>
      </div>

      <!-- Expenses List -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Expense Records</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Date</th>
                <th class="p-3">Category</th>
                <th class="p-3">Payee / Vendor</th>
                <th class="p-3">Payment Mode</th>
                <th class="p-3">Description</th>
                <th class="p-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let e of expenses" class="hover:bg-slate-50">
                <td class="p-3 font-semibold">{{ e.expenseDate }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800">
                    {{ e.category }}
                  </span>
                </td>
                <td class="p-3 font-medium">{{ e.payeeName || '—' }}</td>
                <td class="p-3">{{ e.paymentMode }}</td>
                <td class="p-3 text-slate-500">{{ e.description || '—' }}</td>
                <td class="p-3 text-right font-black text-rose-600">₹{{ e.amount | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  showNewExpense = false;
  submitting = false;

  expenseReq: any = {
    category: 'RENT',
    amount: null,
    paymentMode: 'CASH',
    expenseDate: new Date().toISOString().split('T')[0],
    payeeName: '',
    description: ''
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {
    this.apiService.getExpenses().subscribe({
      next: (list) => this.expenses = list
    });
  }

  submitExpense(): void {
    this.submitting = true;
    this.apiService.createExpense(this.expenseReq).subscribe({
      next: () => {
        this.submitting = false;
        this.showNewExpense = false;
        this.loadExpenses();
        this.expenseReq.amount = null;
        this.expenseReq.description = '';
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
