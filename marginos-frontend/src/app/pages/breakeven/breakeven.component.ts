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
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Decision Support</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Break-even Sales Target Engine</h1>
          <p class="text-xs text-slate-500 mt-1">
            Calculate the exact units and monthly revenue required to cover fixed overheads before earning your first rupee of net profit.
          </p>
        </div>
      </div>

      <!-- Main Calculator -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Inputs -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Cost Structure</h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Total Monthly Fixed Costs (₹)</label>
            <input type="number" [(ngModel)]="fixedCosts" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-indigo-500">
            <span class="text-[10px] text-slate-400 mt-0.5 block">Store rent + staff wages + electricity + interest</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Average Selling Price / Unit (₹)</label>
            <input type="number" [(ngModel)]="avgPrice" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Average Variable Cost / Unit (₹)</label>
            <input type="number" [(ngModel)]="avgVariableCost" (input)="recalculate()"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold">
            <span class="text-[10px] text-slate-400 mt-0.5 block">COGS purchase cost + packaging per item</span>
          </div>
        </div>

        <!-- Output Cards -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md flex flex-col justify-between space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Required Break-even Milestones</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
              Contribution: {{ result?.contributionMarginRatio | number:'1.1-1' }}%
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-xs text-slate-500 font-bold block uppercase">Break-even Units</span>
              <span class="text-3xl font-black text-slate-900 mt-1 block">
                {{ result?.breakevenUnits | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-slate-400">Items / month</span>
            </div>

            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <span class="text-xs text-indigo-900 font-bold block uppercase">Break-even Sales Revenue</span>
              <span class="text-3xl font-black text-indigo-700 mt-1 block">
                ₹{{ result?.breakevenRevenue | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-indigo-500">Monthly sales target</span>
            </div>

            <div class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span class="text-xs text-emerald-800 font-bold block uppercase">Daily Sales Target</span>
              <span class="text-3xl font-black text-emerald-700 mt-1 block">
                ₹{{ ((result?.breakevenRevenue || 0) / 30) | number:'1.0-0' }}
              </span>
              <span class="text-[10px] text-emerald-600">Per day (30-day month)</span>
            </div>
          </div>

          <!-- Contribution Insight -->
          <div class="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
            <div class="flex justify-between">
              <span>Unit Contribution Margin:</span>
              <span class="font-bold text-emerald-400 font-mono">₹{{ result?.contributionMarginPerUnit | number:'1.2-2' }}</span>
            </div>
            <div class="flex justify-between text-slate-400 text-[11px]">
              <span>Formula:</span>
              <span>Fixed Costs (₹{{ fixedCosts }}) ÷ Unit Contribution (₹{{ result?.contributionMarginPerUnit }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BreakevenComponent implements OnInit {
  fixedCosts = 45000;
  avgPrice = 250;
  avgVariableCost = 180;
  result: BreakevenResult | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.recalculate();
  }

  recalculate(): void {
    this.apiService.calculateBreakeven({
      totalFixedCosts: Number(this.fixedCosts) || 0,
      averageSellingPrice: Number(this.avgPrice) || 0,
      averageVariableCost: Number(this.avgVariableCost) || 0
    }).subscribe({
      next: (res) => this.result = res
    });
  }
}
