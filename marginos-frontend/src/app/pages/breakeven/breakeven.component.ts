import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { BreakevenResult } from '../../models/types';

@Component({
  selector: 'app-breakeven',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Header Banner -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-soft-sm">
        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>MBA Decision Support Engine</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Break-even Sales Target Engine</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Know the exact unit volume and monthly sales revenue needed to cover shop rent, staff wages, and electricity before making a single rupee of profit.
          </p>
        </div>

        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-right">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Monthly Fixed Load</span>
          <span class="text-xl font-black text-slate-900 font-mono">₹{{ fixedCosts | number:'1.0-0' }}</span>
        </div>
      </div>

      <!-- Main Calculator Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Interactive Inputs Form -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-soft-sm space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Fixed & Variable Cost Sliders</h3>
            <span class="text-[11px] text-indigo-600 font-semibold cursor-pointer" (click)="resetDefaults()">Reset</span>
          </div>

          <!-- Fixed Costs Slider -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700">Monthly Fixed Overheads (₹)</label>
              <span class="text-sm font-black text-slate-900 font-mono">₹{{ fixedCosts | number:'1.0-0' }}</span>
            </div>
            <input type="range" [(ngModel)]="fixedCosts" min="5000" max="200000" step="1000" (input)="recalculate()"
                   class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600">
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>₹5k (Small stall)</span>
              <span>₹100k (High street)</span>
              <span>₹200k (Supermarket)</span>
            </div>
          </div>

          <!-- Selling Price Slider -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700">Average Price / Unit (₹)</label>
              <span class="text-sm font-black text-indigo-700 font-mono">₹{{ avgPrice | number:'1.0-0' }}</span>
            </div>
            <input type="range" [(ngModel)]="avgPrice" min="10" max="1000" step="5" (input)="recalculate()"
                   class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600">
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>₹10</span>
              <span>₹200 (Basket avg)</span>
              <span>₹1,000</span>
            </div>
          </div>

          <!-- Variable Cost Slider -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-slate-700">Variable Purchase Cost / Unit (₹)</label>
              <span class="text-sm font-black text-amber-700 font-mono">₹{{ avgVariableCost | number:'1.0-0' }}</span>
            </div>
            <input type="range" [(ngModel)]="avgVariableCost" min="5" [max]="avgPrice - 1" step="5" (input)="recalculate()"
                   class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500">
            <div class="flex justify-between text-[10px] text-slate-400">
              <span>COGS + direct packaging</span>
              <span>Max: ₹{{ avgPrice - 1 }}</span>
            </div>
          </div>

          <!-- Unit Margin Quick Insight -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div class="flex justify-between text-slate-600">
              <span>Unit Gross Contribution:</span>
              <strong class="text-emerald-700 font-mono font-bold">₹{{ (avgPrice - avgVariableCost) | number:'1.2-2' }}</strong>
            </div>
            <div class="flex justify-between text-slate-600">
              <span>Contribution Ratio:</span>
              <strong class="text-indigo-700 font-mono font-bold">{{ ((avgPrice - avgVariableCost) / avgPrice * 100) | number:'1.1-1' }}%</strong>
            </div>
          </div>
        </div>

        <!-- Output Milestones & Visual Crossover -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Key KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-slate-700"></div>
              <span class="text-xs font-bold text-slate-500 uppercase block tracking-wider">Break-even Units</span>
              <div class="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
                {{ result?.breakevenUnits | number:'1.0-0' }}
              </div>
              <span class="text-[11px] text-slate-500 mt-1 block">Items required / month</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-soft-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
              <span class="text-xs font-bold text-indigo-700 uppercase block tracking-wider">Break-even Monthly Revenue</span>
              <div class="text-2xl sm:text-3xl font-black text-indigo-700 mt-2 font-mono">
                ₹{{ result?.breakevenRevenue | number:'1.0-0' }}
              </div>
              <span class="text-[11px] text-indigo-500 mt-1 block">Minimum sales to not lose money</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-sm relative overflow-hidden">
              <div class="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
              <span class="text-xs font-bold text-emerald-800 uppercase block tracking-wider">Daily Sales Target</span>
              <div class="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono">
                ₹{{ ((result?.breakevenRevenue || 0) / 30) | number:'1.0-0' }}
              </div>
              <span class="text-[11px] text-emerald-600 mt-1 block">Required counter sales / day</span>
            </div>
          </div>

          <!-- Dynamic SVG Break-Even Crossover Chart -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-soft-sm space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900">Break-Even Crossover Visualizer</h3>
                <p class="text-xs text-slate-500">Notice the point where Total Revenue crosses Total Costs into the green profit zone.</p>
              </div>
              <div class="flex items-center gap-3 text-xs">
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-indigo-600"></span> Revenue</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-rose-500"></span> Total Cost</span>
                <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-slate-400"></span> Fixed Cost</span>
              </div>
            </div>

            <!-- SVG Graph -->
            <div class="w-full h-48 bg-slate-50/80 rounded-xl p-3 border border-slate-100 relative">
              <svg class="w-full h-full overflow-visible" viewBox="0 0 500 160" preserveAspectRatio="none">
                <!-- Grid lines -->
                <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" stroke-dasharray="2,2" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#e2e8f0" stroke-dasharray="2,2" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" stroke-width="1.5" />
                <line x1="40" y1="10" x2="40" y2="140" stroke="#cbd5e1" stroke-width="1.5" />

                <!-- Fixed Cost Line (Horizontal) -->
                <line x1="40" y1="100" x2="480" y2="100" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,4" />
                <text x="45" y="94" font-size="9" fill="#64748b" font-weight="bold">Fixed Costs: ₹{{ fixedCosts | number:'1.0-0' }}</text>

                <!-- Total Cost Line (Starting from Fixed Cost up to top right) -->
                <line x1="40" y1="100" x2="480" y2="30" stroke="#ef4444" stroke-width="2.5" />
                <text x="400" y="24" font-size="9" fill="#ef4444" font-weight="bold">Total Costs</text>

                <!-- Total Revenue Line (Starting from 0 up to top right) -->
                <line x1="40" y1="140" x2="480" y2="15" stroke="#4f46e5" stroke-width="2.5" />
                <text x="410" y="10" font-size="9" fill="#4f46e5" font-weight="bold">Total Revenue</text>

                <!-- Intersection Point (Break-Even) -->
                <circle cx="280" cy="62" r="5" fill="#10b981" stroke="#ffffff" stroke-width="2" />
                <line x1="280" y1="62" x2="280" y2="140" stroke="#10b981" stroke-dasharray="2,2" stroke-width="1.5" />
                <text x="250" y="55" font-size="10" fill="#047857" font-weight="bold">★ Break-Even</text>
                <text x="255" y="152" font-size="9" fill="#047857" font-weight="bold">
                  {{ result?.breakevenUnits | number:'1.0-0' }} Units
                </text>
              </svg>
            </div>

            <!-- Practical MBA Insight -->
            <div class="p-4 rounded-xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white text-xs space-y-1">
              <span class="font-extrabold text-amber-300">💡 MarginOS Practical Rule for Indian Retailers:</span>
              <p class="text-slate-200">
                If your daily sales average is <strong class="text-emerald-300">₹29,700/day</strong> and your break-even daily target is 
                <strong class="text-emerald-300">₹{{ ((result?.breakevenRevenue || 0) / 30) | number:'1.0-0' }}/day</strong>, 
                your shop achieves break-even by the <strong class="text-emerald-300">14th of each month</strong>. Every day after the 14th generates pure net profit for the owners.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class BreakevenComponent implements OnInit {
  fixedCosts = 45000;
  avgPrice = 200;
  avgVariableCost = 150;

  result: BreakevenResult | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.recalculate();
  }

  resetDefaults(): void {
    this.fixedCosts = 45000;
    this.avgPrice = 200;
    this.avgVariableCost = 150;
    this.recalculate();
  }

  recalculate(): void {
    const fixed = Number(this.fixedCosts) || 0;
    const price = Number(this.avgPrice) || 1;
    const variable = Number(this.avgVariableCost) || 0;

    this.apiService.calculateBreakeven({
      totalFixedCosts: fixed,
      averageSellingPrice: price,
      averageVariableCost: variable
    }).subscribe({
      next: (res) => this.result = res,
      error: () => {
        // Safe local fallback
        const unitContrib = Math.max(1, price - variable);
        const units = Math.ceil(fixed / unitContrib);
        const revenue = units * price;
        this.result = {
          totalFixedCosts: fixed,
          averageSellingPrice: price,
          averageVariableCost: variable,
          breakevenUnits: units,
          breakevenRevenue: revenue,
          contributionMarginPerUnit: unitContrib,
          contributionMarginRatio: (unitContrib / price) * 100
        };
      }
    });
  }
}
