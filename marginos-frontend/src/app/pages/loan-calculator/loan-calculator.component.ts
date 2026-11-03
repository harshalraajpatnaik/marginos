import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { LoanAmortizationSchedule, DscrAnalysis } from '../../models/types';

@Component({
  selector: 'app-loan-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Financing & Borrowing</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Business Loan EMI & DSCR Affordability</h1>
          <p class="text-xs text-slate-500 mt-1">
            Standard banking EMI amortization schedule paired with Debt Service Coverage Ratio (DSCR) affordability verification.
          </p>
        </div>
      </div>

      <!-- Main Calculator Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Inputs -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Loan Details</h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Loan Principal Amount (₹)</label>
            <input type="number" [(ngModel)]="principal" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Annual Interest Rate (%)</label>
            <div class="relative">
              <input type="number" [(ngModel)]="annualRate" (input)="recalculate()" step="0.25"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500">
              <span class="absolute right-3.5 top-2.5 font-bold text-slate-400">% p.a.</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tenure (Months)</label>
            <input type="number" [(ngModel)]="tenureMonths" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500">
            <span class="text-[10px] text-slate-400 mt-0.5 block">{{ (tenureMonths / 12) | number:'1.1-1' }} Years</span>
          </div>

          <div class="pt-2 border-t border-slate-100">
            <label class="block text-xs font-bold text-slate-700 mb-1">Monthly Business Net Profit (₹)</label>
            <input type="number" [(ngModel)]="monthlyProfit" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500">
            <span class="text-[10px] text-slate-400 mt-0.5 block">Used for DSCR Debt Affordability Check</span>
          </div>
        </div>

        <!-- Output Hero Card -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col justify-between space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Loan Payment Breakdown</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              Reducing Balance Method
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span class="text-xs text-indigo-900 font-bold block uppercase">Monthly EMI</span>
              <span class="text-3xl font-black text-indigo-700 mt-1 block">
                ₹{{ schedule?.monthlyEmi | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-indigo-500">Per month</span>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-xs text-slate-500 font-bold block uppercase">Total Interest</span>
              <span class="text-3xl font-black text-slate-900 mt-1 block">
                ₹{{ schedule?.totalInterest | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-slate-400">Total borrowing cost</span>
            </div>

            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-xs text-slate-500 font-bold block uppercase">Total Repayment</span>
              <span class="text-3xl font-black text-slate-900 mt-1 block">
                ₹{{ schedule?.totalAmount | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-slate-400">Principal + Interest</span>
            </div>
          </div>

          <!-- DSCR Affordability Indicator Card -->
          <div class="p-5 rounded-2xl border"
               [ngClass]="{
                 'bg-emerald-50 border-emerald-300 text-emerald-950': (dscrResult?.dscrRatio || 0) >= 1.5,
                 'bg-amber-50 border-amber-300 text-amber-950': (dscrResult?.dscrRatio || 0) >= 1.0 && (dscrResult?.dscrRatio || 0) < 1.5,
                 'bg-rose-50 border-rose-300 text-rose-950': (dscrResult?.dscrRatio || 0) < 1.0
               }">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">
                  {{ (dscrResult?.dscrRatio || 0) >= 1.5 ? '🛡️' : (dscrResult?.dscrRatio || 0) >= 1.0 ? '⚠️' : '🚨' }}
                </span>
                <span class="text-sm font-black uppercase tracking-wider">
                  {{ dscrResult?.verdict || 'SAFE & AFFORDABLE' }}
                </span>
              </div>
              <span class="text-lg font-black font-mono">
                DSCR: {{ dscrResult?.dscrRatio | number:'1.2-2' }}x
              </span>
            </div>
            <p class="text-xs leading-relaxed">
              {{ dscrResult?.explanation || 'Your monthly profit of ₹' + monthlyProfit + ' comfortably covers the ₹' + (schedule?.monthlyEmi | number:'1.0-0') + ' EMI with safety margin.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Month by Month Amortization Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-xs text-slate-800 uppercase tracking-wider">Monthly Amortization Schedule</h3>
          <span class="text-xs text-slate-400">First 12 Months Preview</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Month #</th>
                <th class="p-3 text-right">EMI Payment</th>
                <th class="p-3 text-right">Principal Component</th>
                <th class="p-3 text-right">Interest Component</th>
                <th class="p-3 text-right">Remaining Principal Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let row of (schedule?.entries || []).slice(0, 12)" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-indigo-700">Month {{ row.monthNumber }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ row.emiAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right text-emerald-700 font-bold">₹{{ row.principalPaid | number:'1.2-2' }}</td>
                <td class="p-3 text-right text-amber-700">₹{{ row.interestPaid | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-mono font-bold">₹{{ row.remainingBalance | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class LoanCalculatorComponent implements OnInit {
  principal = 500000;
  annualRate = 12.5;
  tenureMonths = 36;
  monthlyProfit = 42000;

  schedule: LoanAmortizationSchedule | null = null;
  dscrResult: DscrAnalysis | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.recalculate();
  }

  recalculate(): void {
    const p = Number(this.principal) || 0;
    const r = Number(this.annualRate) || 0;
    const t = Number(this.tenureMonths) || 12;
    const profit = Number(this.monthlyProfit) || 0;

    this.apiService.calculateLoanSchedule({
      principal: p,
      annualInterestRate: r,
      tenureMonths: t
    }).subscribe({
      next: (res) => this.schedule = res
    });

    this.apiService.checkLoanAffordability({
      principal: p,
      annualInterestRate: r,
      tenureMonths: t,
      monthlyOperatingProfit: profit
    }).subscribe({
      next: (res) => this.dscrResult = res
    });
  }
}
