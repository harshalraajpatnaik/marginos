import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { WorkingCapitalMetrics } from '../../models/types';

@Component({
  selector: 'app-working-capital',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-2">
            <span>Cash Flow Health</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Working Capital & Cash Conversion Cycle</h1>
          <p class="text-xs text-slate-500 mt-1">
            Discover exactly how many days your cash stays trapped in stock and customer credit before returning to your bank.
          </p>
        </div>

        <span class="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border"
              [ngClass]="{
                'bg-emerald-50 text-emerald-800 border-emerald-300': metrics?.healthStatus === 'EXCELLENT' || metrics?.healthStatus === 'GOOD',
                'bg-amber-50 text-amber-800 border-amber-300': metrics?.healthStatus === 'MODERATE',
                'bg-rose-50 text-rose-800 border-rose-300': metrics?.healthStatus === 'POOR' || metrics?.healthStatus === 'CRITICAL'
              }">
          Health: {{ metrics?.healthStatus || 'HEALTHY' }}
        </span>
      </div>

      <!-- Main CCC Gauge -->
      <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-2xl shadow-lg space-y-6">
        <div class="text-center max-w-xl mx-auto">
          <span class="text-xs font-bold uppercase tracking-wider text-indigo-300">Net Cash Conversion Cycle (CCC)</span>
          <div class="text-5xl font-black text-emerald-400 mt-2">
            {{ metrics?.cashConversionCycleDays || 34 }} Days
          </div>
          <p class="text-xs text-slate-300 mt-2">
            It takes on average {{ metrics?.cashConversionCycleDays || 34 }} days from paying your suppliers for inventory until cash is collected from sales.
          </p>
        </div>

        <!-- 3 Pillars Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div class="bg-slate-800/80 p-4 rounded-xl text-center border border-slate-700">
            <span class="text-[11px] font-bold text-slate-400 block uppercase">+ Days Inventory (DIO)</span>
            <span class="text-2xl font-black text-amber-400 mt-1 block">{{ metrics?.daysInventoryOutstanding || 42 }} Days</span>
            <span class="text-[10px] text-slate-400 mt-1 block">Time stock sits on shelves</span>
          </div>

          <div class="bg-slate-800/80 p-4 rounded-xl text-center border border-slate-700">
            <span class="text-[11px] font-bold text-slate-400 block uppercase">+ Days Sales (DSO)</span>
            <span class="text-2xl font-black text-orange-400 mt-1 block">{{ metrics?.daysSalesOutstanding || 18 }} Days</span>
            <span class="text-[10px] text-slate-400 mt-1 block">Time taken to collect Udhaar</span>
          </div>

          <div class="bg-slate-800/80 p-4 rounded-xl text-center border border-slate-700">
            <span class="text-[11px] font-bold text-slate-400 block uppercase">- Days Payable (DPO)</span>
            <span class="text-2xl font-black text-emerald-400 mt-1 block">{{ metrics?.daysPayableOutstanding || 26 }} Days</span>
            <span class="text-[10px] text-slate-400 mt-1 block">Credit grace from suppliers</span>
          </div>
        </div>
      </div>

      <!-- Rupee Capital Trapped Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 uppercase block">Capital in Inventory</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">₹{{ metrics?.inventoryValue | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-1 block">Valued at weighted-average cost</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 uppercase block">Capital in Customer Udhaar</span>
          <span class="text-2xl font-black text-amber-700 mt-1 block">₹{{ metrics?.receivablesValue | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-1 block">Uncollected credit sales</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 uppercase block">Net Working Capital Gap</span>
          <span class="text-2xl font-black text-indigo-700 mt-1 block">₹{{ metrics?.netWorkingCapital | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-1 block">Cash required to fund daily operations</span>
        </div>
      </div>
    </div>
  `
})
export class WorkingCapitalComponent implements OnInit {
  metrics: WorkingCapitalMetrics | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getWorkingCapitalMetrics().subscribe(m => this.metrics = m);
  }
}
