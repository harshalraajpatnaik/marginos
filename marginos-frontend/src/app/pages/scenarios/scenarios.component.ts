import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Scenario } from '../../models/types';

@Component({
  selector: 'app-scenarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <span>🔮 Mode C — Business Simulator</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">What-If Scenario Simulation</h1>
          <p class="text-xs text-slate-500 mt-1">
            Test business expansions, new hiring, rent hikes, or recessions in sandbox mode before spending a single rupee.
          </p>
        </div>

        <button (click)="saveCurrentScenario()" [disabled]="saving"
                class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 disabled:opacity-50">
          <span>💾</span>
          <span>{{ saving ? 'Saving...' : 'Save Scenario' }}</span>
        </button>
      </div>

      <!-- Disclaimers Banner -->
      <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
        <span class="font-bold text-base">ℹ️</span>
        <span>
          <strong>Hypothetical Model Disclaimer:</strong> Mode C simulations do not alter your live accounting ledger. All projected numbers are mathematical what-if models based on your current baseline financial trajectory.
        </span>
      </div>

      <!-- Simulator Controls & Side-by-Side View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Controls Column -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Scenario Parameters</h3>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Scenario Name</label>
            <input type="text" [(ngModel)]="scenarioName" placeholder="e.g. Open 2nd Branch in Koramangala"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <!-- Revenue Change Slider -->
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-slate-700">Projected Sales Change:</span>
              <span [ngClass]="revenueChangePercent >= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ revenueChangePercent >= 0 ? '+' : '' }}{{ revenueChangePercent }}%
              </span>
            </div>
            <input type="range" [(ngModel)]="revenueChangePercent" (input)="simulate()" min="-50" max="150" step="5"
                   class="w-full accent-indigo-600">
          </div>

          <!-- COGS Change Slider -->
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-slate-700">Supplier Cost (COGS) Change:</span>
              <span [ngClass]="cogsChangePercent <= 0 ? 'text-emerald-700' : 'text-rose-600'">
                {{ cogsChangePercent >= 0 ? '+' : '' }}{{ cogsChangePercent }}%
              </span>
            </div>
            <input type="range" [(ngModel)]="cogsChangePercent" (input)="simulate()" min="-25" max="30" step="1"
                   class="w-full accent-indigo-600">
          </div>

          <!-- Extra Fixed Costs -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Extra Monthly Fixed Costs (Rent + Salaries) (₹)</label>
            <input type="number" [(ngModel)]="extraFixedCosts" (input)="simulate()" placeholder="e.g. 35000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold">
          </div>

          <!-- Capital Expenditure -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">One-time Capital Expenditure (CapEx) (₹)</label>
            <input type="number" [(ngModel)]="capex" (input)="simulate()" placeholder="e.g. 200000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold">
            <span class="text-[10px] text-slate-400 mt-0.5 block">Store renovation, machinery, deposits</span>
          </div>

          <!-- Loan EMI Addition -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Additional Monthly Loan EMI (₹)</label>
            <input type="number" [(ngModel)]="loanEmi" (input)="simulate()" placeholder="e.g. 12000"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold">
          </div>
        </div>

        <!-- Side-by-Side Comparison Matrix -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Baseline vs. Simulation Impact</h3>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800">
              Monthly Projections
            </span>
          </div>

          <!-- Side-by-Side Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <!-- Current Baseline Column -->
            <div class="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-200 pb-2">
                <span class="font-extrabold text-xs text-slate-700 uppercase">Current Baseline</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">Live Data</span>
              </div>

              <div class="space-y-3 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-500">Monthly Revenue:</span>
                  <span class="font-black text-slate-900">₹{{ baselineRevenue | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Gross Profit:</span>
                  <span class="font-bold text-emerald-700">₹{{ baselineGrossProfit | number:'1.0-0' }} ({{ baselineMargin | number:'1.1-1' }}%)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-500">Fixed Overheads:</span>
                  <span class="font-bold text-rose-600">₹{{ baselineFixedCosts | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-slate-200 font-extrabold">
                  <span>Net Operating Profit:</span>
                  <span class="text-sm text-indigo-700">₹{{ baselineNetProfit | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between text-slate-500 text-[11px]">
                  <span>Break-even Target:</span>
                  <span>₹{{ baselineBreakeven | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>

            <!-- Simulated Model Column -->
            <div class="p-5 rounded-2xl bg-gradient-to-b from-indigo-50/70 to-purple-50/50 border-2 border-indigo-300 space-y-4">
              <div class="flex items-center justify-between border-b border-indigo-200 pb-2">
                <span class="font-extrabold text-xs text-indigo-950 uppercase">{{ scenarioName || 'Simulated Model' }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-bold">Projected</span>
              </div>

              <div class="space-y-3 text-xs">
                <div class="flex justify-between">
                  <span class="text-slate-600">Projected Revenue:</span>
                  <span class="font-black text-indigo-950">₹{{ simRevenue | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Projected Gross Profit:</span>
                  <span class="font-bold text-emerald-800">₹{{ simGrossProfit | number:'1.0-0' }} ({{ simMargin | number:'1.1-1' }}%)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">Total Fixed Overheads:</span>
                  <span class="font-bold text-rose-700">₹{{ simFixedCosts | number:'1.0-0' }}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-indigo-200 font-black">
                  <span>Simulated Net Profit:</span>
                  <span class="text-base" [ngClass]="simNetProfit >= baselineNetProfit ? 'text-emerald-700' : 'text-rose-600'">
                    ₹{{ simNetProfit | number:'1.0-0' }}
                  </span>
                </div>
                <div class="flex justify-between text-slate-600 text-[11px]">
                  <span>New Break-even Target:</span>
                  <span class="font-bold">₹{{ simBreakeven | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Verdict -->
          <div class="p-4 rounded-xl border flex items-center justify-between"
               [ngClass]="simNetProfit > baselineNetProfit ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ simNetProfit > baselineNetProfit ? '🚀' : '⚠️' }}</span>
              <div>
                <span class="font-black text-xs uppercase block">
                  {{ simNetProfit > baselineNetProfit ? 'Viable Business Expansion' : 'Warning: Projected Profit Decreases' }}
                </span>
                <span class="text-[11px]">
                  {{ simNetProfit > baselineNetProfit ? 
                     'Projected net profit increases by ₹' + ((simNetProfit - baselineNetProfit) | number:'1.0-0') + '/month.' : 
                     'Additional overheads of ₹' + extraFixedCosts + ' exceed the projected revenue gains. Risk of margin compression.' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Saved Scenarios List -->
      <div *ngIf="savedScenarios.length > 0" class="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 class="text-sm font-bold text-slate-900">Saved Simulation Scenarios</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let sc of savedScenarios" class="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition">
            <h4 class="font-bold text-xs text-slate-900">{{ sc.name }}</h4>
            <div class="mt-2 text-[11px] text-slate-500 space-y-1">
              <div>Sales Change: <strong>{{ sc.revenueChangePercent }}%</strong></div>
              <div>Extra Fixed: <strong>₹{{ sc.extraFixedCosts | number:'1.0-0' }}</strong></div>
              <div>CapEx: <strong>₹{{ sc.capex | number:'1.0-0' }}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScenariosComponent implements OnInit {
  scenarioName = 'Open 2nd Branch in Koramangala';
  revenueChangePercent = 35;
  cogsChangePercent = 0;
  extraFixedCosts = 40000;
  capex = 150000;
  loanEmi = 8500;

  baselineRevenue = 280000;
  baselineGrossProfit = 78400;
  baselineMargin = 28;
  baselineFixedCosts = 45000;
  baselineNetProfit = 33400;
  baselineBreakeven = 160714;

  simRevenue = 0;
  simGrossProfit = 0;
  simMargin = 0;
  simFixedCosts = 0;
  simNetProfit = 0;
  simBreakeven = 0;

  saving = false;
  savedScenarios: Scenario[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.simulate();
    this.loadSavedScenarios();
  }

  simulate(): void {
    const revMultiplier = 1 + (Number(this.revenueChangePercent) / 100);
    this.simRevenue = this.baselineRevenue * revMultiplier;

    const baseCogs = this.baselineRevenue - this.baselineGrossProfit;
    const cogsMultiplier = 1 + (Number(this.cogsChangePercent) / 100);
    const simCogs = baseCogs * revMultiplier * cogsMultiplier;

    this.simGrossProfit = this.simRevenue - simCogs;
    this.simMargin = this.simRevenue > 0 ? (this.simGrossProfit / this.simRevenue) * 100 : 0;

    this.simFixedCosts = this.baselineFixedCosts + (Number(this.extraFixedCosts) || 0) + (Number(this.loanEmi) || 0);
    this.simNetProfit = this.simGrossProfit - this.simFixedCosts;

    const marginRatio = this.simMargin / 100;
    this.simBreakeven = marginRatio > 0 ? this.simFixedCosts / marginRatio : 0;
  }

  loadSavedScenarios(): void {
    this.apiService.getScenarios().subscribe(list => this.savedScenarios = list);
  }

  saveCurrentScenario(): void {
    this.saving = true;
    this.apiService.createScenario({
      name: this.scenarioName,
      revenueChangePercent: this.revenueChangePercent,
      cogsChangePercent: this.cogsChangePercent,
      extraFixedCosts: this.extraFixedCosts,
      capex: this.capex,
      loanEmi: this.loanEmi,
      projectedNetProfit: this.simNetProfit
    }).subscribe({
      next: () => {
        this.saving = false;
        this.loadSavedScenarios();
      },
      error: () => this.saving = false
    });
  }
}
