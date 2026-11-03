import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { PricingCalculationResult } from '../../models/types';

@Component({
  selector: 'app-pricing-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <span>MBA Pricing Engine</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Markup vs. Margin Calculator</h1>
          <p class="text-xs text-slate-500 mt-1">
            Eliminate pricing confusion. Learn why 25% markup is only 20% margin, and set prices to guarantee real net profit.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="mode = 'FROM_MARGIN'" [class.bg-indigo-600]="mode === 'FROM_MARGIN'" [class.text-white]="mode === 'FROM_MARGIN'"
                  class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 transition">
            Target Margin %
          </button>
          <button (click)="mode = 'FROM_MARKUP'" [class.bg-indigo-600]="mode === 'FROM_MARKUP'" [class.text-white]="mode === 'FROM_MARKUP'"
                  class="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 transition">
            Target Markup %
          </button>
        </div>
      </div>

      <!-- Critical Business Education Banner -->
      <div class="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200/80">
        <div class="flex items-start gap-3">
          <span class="text-2xl">⚠️</span>
          <div class="text-xs text-amber-950 space-y-1">
            <h4 class="font-extrabold text-sm text-amber-900">The "Kirana Markup Trap" That Destroys Retail Profits:</h4>
            <p>
              If a product costs you <strong>₹100</strong> and you add <strong>25% markup</strong>, your selling price is <strong>₹125</strong>. 
              Your profit is ₹25, which is <strong>ONLY 20% margin on revenue</strong> (₹25 ÷ ₹125).
            </p>
            <p class="font-bold text-amber-900 pt-1">
              If your shop overheads (rent, electricity, salaries) are 22% of revenue, you will LOSE 2% on every single sale while wrongly assuming you made 25%!
            </p>
          </div>
        </div>
      </div>

      <!-- Main Calculator Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Input Form -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Pricing Inputs</h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Cost Price / Unit (WAVG) (₹)</label>
            <input type="number" [(ngModel)]="costPrice" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">
              {{ mode === 'FROM_MARGIN' ? 'Desired Profit Margin (% of Sales Price)' : 'Desired Markup (% over Cost)' }}
            </label>
            <div class="relative">
              <input type="number" [(ngModel)]="targetPercentage" (input)="recalculate()"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500">
              <span class="absolute right-3.5 top-2.5 font-bold text-slate-400">%</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">GST Tax Rate</label>
            <select [(ngModel)]="taxRate" (change)="recalculate()" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option [value]="0">0% (Exempt)</option>
              <option [value]="5">5% GST</option>
              <option [value]="12">12% GST</option>
              <option [value]="18">18% GST</option>
              <option [value]="28">28% GST</option>
            </select>
          </div>

          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
            <strong>Formula used:</strong> <br>
            {{ mode === 'FROM_MARGIN' ? 'Price = Cost ÷ (1 - Margin%)' : 'Price = Cost × (1 + Markup%)' }}
          </div>
        </div>

        <!-- Output Hero Card -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col justify-between space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Optimal Selling Price</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              Recommended MRP
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-xs text-slate-500 font-bold block uppercase">Pre-Tax Selling Price</span>
              <span class="text-2xl font-black text-slate-900 mt-1 block">
                ₹{{ result?.sellingPrice | number:'1.2-2' }}
              </span>
            </div>

            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span class="text-xs text-emerald-800 font-bold block uppercase">Net Profit / Unit</span>
              <span class="text-2xl font-black text-emerald-700 mt-1 block">
                ₹{{ result?.profitAmount | number:'1.2-2' }}
              </span>
            </div>

            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span class="text-xs text-indigo-900 font-bold block uppercase">Final Price (Incl. GST)</span>
              <span class="text-2xl font-black text-indigo-700 mt-1 block">
                ₹{{ result?.finalPriceWithTax | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- Comparison Gauge -->
          <div class="p-5 rounded-xl bg-slate-900 text-white space-y-3">
            <div class="flex justify-between text-xs font-bold">
              <span>Actual Gross Margin:</span>
              <span class="text-emerald-400 text-sm font-black">{{ result?.grossMarginPercent | number:'1.1-1' }}% of Revenue</span>
            </div>
            <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div class="bg-emerald-400 h-2.5 rounded-full transition-all" [style.width.%]="result?.grossMarginPercent || 20"></div>
            </div>
            <div class="flex justify-between text-xs text-slate-400">
              <span>Corresponding Markup over Cost:</span>
              <span class="text-amber-400 font-bold">{{ result?.markupPercent | number:'1.1-1' }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensitivity Pricing Matrix Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-xs text-slate-800 uppercase tracking-wider">
            Profit Sensitivity Table (Cost Basis: ₹{{ costPrice }})
          </h3>
          <span class="text-xs text-slate-400">5% to 50% Margin Scenarios</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Target Margin %</th>
                <th class="p-3">Equivalent Markup %</th>
                <th class="p-3 text-right">Selling Price</th>
                <th class="p-3 text-right">Profit / Unit</th>
                <th class="p-3 text-right">Price with {{ taxRate }}% GST</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let row of sensitivityMatrix" class="hover:bg-slate-50" [class.bg-indigo-50]="row.margin === targetPercentage">
                <td class="p-3 font-black text-indigo-700">{{ row.margin }}% Margin</td>
                <td class="p-3 font-semibold text-amber-700">{{ row.markup | number:'1.1-1' }}% Markup</td>
                <td class="p-3 text-right font-bold">₹{{ row.price | number:'1.2-2' }}</td>
                <td class="p-3 text-right text-emerald-700 font-bold">₹{{ row.profit | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ (row.price * (1 + taxRate/100)) | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PricingCalculatorComponent implements OnInit {
  costPrice = 100;
  targetPercentage = 20;
  mode: 'FROM_MARKUP' | 'FROM_MARGIN' = 'FROM_MARGIN';
  taxRate = 5;

  result: PricingCalculationResult | null = null;
  sensitivityMatrix: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.recalculate();
  }

  recalculate(): void {
    const cost = Number(this.costPrice) || 0;
    const target = Number(this.targetPercentage) || 0;

    this.apiService.calculatePricing({
      costPrice: cost,
      targetPercentage: target,
      mode: this.mode,
      taxRate: Number(this.taxRate) || 0
    }).subscribe({
      next: (res) => this.result = res
    });

    this.buildLocalMatrix();
  }

  buildLocalMatrix(): void {
    const cost = Number(this.costPrice) || 100;
    const margins = [5, 10, 15, 20, 25, 30, 35, 40, 50];
    this.sensitivityMatrix = margins.map(m => {
      const price = cost / (1 - (m / 100));
      const profit = price - cost;
      const markup = (profit / cost) * 100;
      return { margin: m, markup, price, profit };
    });
  }
}
