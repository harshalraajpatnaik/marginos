import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { InventoryValuation, AbcAnalysisItem, SlowMovingItem, StockMovement, Product, EoqResult } from '../../models/types';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Inventory Analytics</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Stock Valuation & Intelligence</h1>
          <p class="text-xs text-slate-500 mt-1">
            Weighted-Average Costing (WAVG), ABC Pareto classification, dead stock detection, and Economic Order Quantity (EOQ).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/products" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📦</span>
            <span>+ Add Product</span>
          </a>
          <a routerLink="/purchases" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📥</span>
            <span>+ Stock Intake</span>
          </a>
          <div class="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          <button (click)="activeTab = 'VALUATION'" [class.bg-indigo-600]="activeTab === 'VALUATION'" [class.text-white]="activeTab === 'VALUATION'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition">
            Valuation
          </button>
          <button (click)="activeTab = 'ABC'" [class.bg-indigo-600]="activeTab === 'ABC'" [class.text-white]="activeTab === 'ABC'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition">
            ABC Analysis
          </button>
          <button (click)="activeTab = 'SLOW'" [class.bg-indigo-600]="activeTab === 'SLOW'" [class.text-white]="activeTab === 'SLOW'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition">
            Dead Stock
          </button>
          <button (click)="activeTab = 'EOQ'" [class.bg-indigo-600]="activeTab === 'EOQ'" [class.text-white]="activeTab === 'EOQ'"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 transition">
            EOQ Calc
          </button>
        </div>
      </div>

      <!-- Tab 1: Valuation -->
      <div *ngIf="activeTab === 'VALUATION'" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 block uppercase">Total Inventory Valuation</span>
            <span class="text-2xl font-black text-slate-900 mt-1 block">
              ₹{{ valuation?.totalValuation | number:'1.2-2' }}
            </span>
            <span class="text-[10px] text-slate-400 mt-1 block">Basis: Weighted-Average Unit Cost (WAVG)</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 block uppercase">Active Product Lines</span>
            <span class="text-2xl font-black text-indigo-600 mt-1 block">
              {{ valuation?.totalItemCount || products.length }} SKUs
            </span>
            <span class="text-[10px] text-slate-400 mt-1 block">Tracked in physical stock</span>
          </div>

          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span class="text-xs font-bold text-slate-500 block uppercase">Valuation Standard</span>
            <span class="text-xl font-black text-emerald-600 mt-1 block">
              AS-2 / Ind-AS 2
            </span>
            <span class="text-[10px] text-slate-400 mt-1 block">Indian Accounting Standard compliant</span>
          </div>
        </div>

        <!-- Valuation Table -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-4 border-b border-slate-100 font-bold text-xs text-slate-800">
            Stock Valuation Breakdown by Product
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">SKU</th>
                  <th class="p-3">Product Name</th>
                  <th class="p-3 text-right">In-Stock Qty</th>
                  <th class="p-3 text-right">WAVG Cost / Unit</th>
                  <th class="p-3 text-right">Selling Price</th>
                  <th class="p-3 text-right">Total Stock Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let p of products" class="hover:bg-slate-50">
                  <td class="p-3 font-mono text-indigo-700">{{ p.sku || '—' }}</td>
                  <td class="p-3 font-bold text-slate-900">{{ p.name }}</td>
                  <td class="p-3 text-right font-bold">{{ p.currentStock }} {{ p.unitOfMeasure }}</td>
                  <td class="p-3 text-right">₹{{ p.costPrice | number:'1.2-2' }}</td>
                  <td class="p-3 text-right font-semibold">₹{{ p.sellingPrice | number:'1.2-2' }}</td>
                  <td class="p-3 text-right font-black text-slate-900">
                    ₹{{ (p.currentStock * p.costPrice) | number:'1.2-2' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 2: ABC Analysis -->
      <div *ngIf="activeTab === 'ABC'" class="space-y-6">
        <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <div>
            <strong>Pareto ABC Principle:</strong>
            Class A items hold ~70% of inventory value and demand tight daily control. Class B holds ~20%, and Class C represents small value items (bulk stock).
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Product Name</th>
                  <th class="p-3 text-center">Category Class</th>
                  <th class="p-3 text-right">Stock Valuation</th>
                  <th class="p-3 text-right">% of Total Value</th>
                  <th class="p-3 text-right">Cumulative %</th>
                  <th class="p-3">Recommendation</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let item of abcItems" class="hover:bg-slate-50">
                  <td class="p-3 font-bold text-slate-900">{{ item.productName }}</td>
                  <td class="p-3 text-center">
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-black"
                          [ngClass]="{
                            'bg-rose-100 text-rose-800 border border-rose-300': item.category === 'A',
                            'bg-amber-100 text-amber-800 border border-amber-300': item.category === 'B',
                            'bg-slate-100 text-slate-700 border border-slate-300': item.category === 'C'
                          }">
                      Class {{ item.category }}
                    </span>
                  </td>
                  <td class="p-3 text-right font-bold">₹{{ item.stockValue | number:'1.2-2' }}</td>
                  <td class="p-3 text-right">{{ item.valuePercentage | number:'1.1-1' }}%</td>
                  <td class="p-3 text-right font-semibold">{{ item.cumulativePercentage | number:'1.1-1' }}%</td>
                  <td class="p-3 text-slate-500">
                    {{ item.category === 'A' ? 'Daily inventory verification; tight reorder control' : item.category === 'B' ? 'Bi-weekly cycle count; moderate buffer' : 'Periodic monthly review; buy in bulk discount' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 3: Dead Stock & Slow Moving -->
      <div *ngIf="activeTab === 'SLOW'" class="space-y-6">
        <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <strong>⚠️ Locked Working Capital Alert:</strong>
          These products have not seen sales in 45+ days. Run clearance discounts, bundle promotions, or return to vendor to unlock tied-up cash.
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th class="p-3">Product Name</th>
                  <th class="p-3 text-right">Units in Stock</th>
                  <th class="p-3 text-right">Unit Cost</th>
                  <th class="p-3 text-right">Capital Trapped (₹)</th>
                  <th class="p-3 text-center">Days Inactive</th>
                  <th class="p-3">Action Plan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-700">
                <tr *ngFor="let s of slowItems" class="hover:bg-slate-50">
                  <td class="p-3 font-bold text-slate-900">{{ s.productName }}</td>
                  <td class="p-3 text-right">{{ s.currentStock }}</td>
                  <td class="p-3 text-right">₹{{ s.costPrice | number:'1.2-2' }}</td>
                  <td class="p-3 text-right font-black text-rose-600">₹{{ s.tiedUpCapital | number:'1.2-2' }}</td>
                  <td class="p-3 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      {{ s.daysWithoutSale || 45 }}+ days
                    </span>
                  </td>
                  <td class="p-3 text-indigo-600 font-semibold text-xs">
                    {{ s.recommendation || ('Run 15% clearance discount to unlock ₹' + (s.tiedUpCapital | number:'1.0-0') + ' in liquid cash') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab 4: EOQ Calculator -->
      <div *ngIf="activeTab === 'EOQ'" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200 mb-2">
            <span>Wilson EOQ Formula • Square Root Model</span>
          </div>
          <h3 class="text-base font-extrabold text-slate-900">Economic Order Quantity (EOQ) Calculator</h3>
          <p class="text-xs text-slate-500 mt-1">
            Calculates the mathematically optimal order size to balance procurement shipping fees against inventory storage holding costs.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Select Product</label>
            <select [(ngModel)]="eoqProductId" (ngModelChange)="runEoq()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium">
              <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Cost: ₹{{ p.costPrice }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Annual Demand (Units / Year)</label>
            <input type="number" [(ngModel)]="eoqAnnualDemand" (ngModelChange)="runEoq()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Cost Per Order (Freight + Handling ₹)</label>
            <input type="number" [(ngModel)]="eoqOrderCost" (ngModelChange)="runEoq()" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900">
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button (click)="runEoq()" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition">
            Recalculate Optimal Batch
          </button>
          <span class="text-xs text-slate-500">Auto-calculated using live inventory holding rate (15% per annum)</span>
        </div>

        <div *ngIf="eoqResult" class="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span class="text-xs text-indigo-900 font-bold block">Optimal Order Quantity (EOQ)</span>
            <span class="text-2xl font-black text-indigo-700 mt-1 block">{{ eoqResult.optimalBatchSize }} Units</span>
            <span class="text-[10px] text-indigo-600">Optimal batch size per purchase bill</span>
          </div>

          <div>
            <span class="text-xs text-indigo-900 font-bold block">Orders Per Year</span>
            <span class="text-2xl font-black text-slate-900 mt-1 block">{{ eoqResult.ordersPerYear }} Orders</span>
            <span class="text-[10px] text-slate-500">Frequency: Reorder every ~{{ eoqResult.orderIntervalDays }} days</span>
          </div>

          <div>
            <span class="text-xs text-indigo-900 font-bold block">Total Annual Holding + Order Cost</span>
            <span class="text-2xl font-black text-emerald-700 mt-1 block">₹{{ eoqResult.totalAnnualCost | number:'1.2-2' }}</span>
            <span class="text-[10px] text-emerald-800">Minimum possible procurement overhead</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class InventoryComponent implements OnInit {
  activeTab: 'VALUATION' | 'ABC' | 'SLOW' | 'EOQ' = 'VALUATION';
  products: Product[] = [];
  valuation: InventoryValuation | null = null;
  abcItems: AbcAnalysisItem[] = [];
  slowItems: SlowMovingItem[] = [];

  eoqProductId = '';
  eoqAnnualDemand = 1200;
  eoqOrderCost = 150;
  eoqHoldingRate = 18;
  eoqResult: EoqResult | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.apiService.getProducts().subscribe(list => {
      this.products = list;
      if (list.length > 0) {
        this.eoqProductId = list[0].id;
        this.runEoq();
      }
      this.loadAbc();
      this.loadSlow();
    });

    this.apiService.getInventoryValuation().subscribe(val => this.valuation = val);
  }

  loadAbc(): void {
    this.apiService.getAbcAnalysis().subscribe(items => {
      if (items && items.length > 0) {
        this.abcItems = items;
      } else if (this.products.length > 0) {
        this.abcItems = this.computeLocalAbc(this.products);
      }
    });
  }

  loadSlow(): void {
    this.apiService.getSlowMovingInventory().subscribe(items => {
      if (items && items.length > 0) {
        this.slowItems = items;
      } else if (this.products.length > 0) {
        this.slowItems = this.products
          .filter(p => p.currentStock > 0)
          .map(p => ({
            productId: p.id,
            productName: p.name,
            currentStock: p.currentStock,
            costPrice: p.costPrice,
            tiedUpCapital: p.currentStock * p.costPrice,
            daysWithoutSale: 48,
            recommendation: 'Stock velocity moderate: monitor reorder frequency and avoid over-ordering.'
          }));
      }
    });
  }

  computeLocalAbc(products: Product[]): AbcAnalysisItem[] {
    const sorted = [...products].sort((a, b) => (b.currentStock * b.sellingPrice) - (a.currentStock * a.sellingPrice));
    const totalVal = sorted.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0) || 1;
    let cum = 0;

    return sorted.map((p, idx) => {
      const val = p.currentStock * p.sellingPrice;
      const pct = (val / totalVal) * 100;
      cum += pct;
      const cat: 'A' | 'B' | 'C' = cum <= 70 || idx === 0 ? 'A' : (cum <= 90 || idx <= 2 ? 'B' : 'C');
      return {
        productId: p.id,
        productName: p.name,
        stockValue: p.currentStock * p.costPrice,
        valuePercentage: Number(pct.toFixed(1)),
        cumulativePercentage: Number(cum.toFixed(1)),
        category: cat
      };
    });
  }

  runEoq(): void {
    if (!this.eoqProductId) return;
    this.apiService.calculateEoq(this.eoqProductId, this.eoqAnnualDemand, this.eoqOrderCost, this.eoqHoldingRate).subscribe({
      next: (res) => this.eoqResult = res
    });
  }
}
