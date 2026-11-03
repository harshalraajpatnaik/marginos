import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-import-export',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Data Portability</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">CSV Data Hub & Export</h1>
          <p class="text-xs text-slate-500 mt-1">
            Export structured financial data for Chartered Accountants (CA) or import product catalogs safely.
          </p>
        </div>
      </div>

      <!-- Export Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Products Export -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span class="text-2xl block mb-2">📦</span>
            <h4 class="font-bold text-xs text-slate-900">Products & Inventory</h4>
            <p class="text-[11px] text-slate-500 mt-1">Full catalog with SKU, barcodes, WAVG cost, selling price, and stock levels.</p>
          </div>
          <button (click)="exportFile('products')" class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition">
            Download CSV ↓
          </button>
        </div>

        <!-- Sales Invoices Export -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span class="text-2xl block mb-2">🧾</span>
            <h4 class="font-bold text-xs text-slate-900">Sales Invoices</h4>
            <p class="text-[11px] text-slate-500 mt-1">Itemized invoices, tax breakdown, customer khata postings, and payment modes.</p>
          </div>
          <button (click)="exportFile('sales')" class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition">
            Download CSV ↓
          </button>
        </div>

        <!-- Expenses Export -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span class="text-2xl block mb-2">💸</span>
            <h4 class="font-bold text-xs text-slate-900">Operating Expenses</h4>
            <p class="text-[11px] text-slate-500 mt-1">Categorized overheads (Rent, salaries, electricity, transport) for P&L filing.</p>
          </div>
          <button (click)="exportFile('expenses')" class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition">
            Download CSV ↓
          </button>
        </div>

        <!-- Trial Balance Export -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <span class="text-2xl block mb-2">⚖️</span>
            <h4 class="font-bold text-xs text-slate-900">Trial Balance Ledger</h4>
            <p class="text-[11px] text-slate-500 mt-1">Balanced double-entry general ledger debit-credit extract for your auditor.</p>
          </div>
          <button (click)="exportFile('trial-balance')" class="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition">
            Download CSV ↓
          </button>
        </div>
      </div>

      <!-- CSV Import Section -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 class="text-sm font-bold text-slate-900">Import Product Catalog from CSV</h3>
        <p class="text-xs text-slate-500">
          Upload products exported from Tally, Busy, or Excel. Automatically protected against CSV formula injection.
        </p>

        <div class="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-indigo-500 transition cursor-pointer">
          <input type="file" (change)="onFileSelected($event)" accept=".csv" class="hidden" #fileInput>
          <div (click)="fileInput.click()" class="space-y-2">
            <span class="text-3xl block">📁</span>
            <div class="text-xs font-bold text-indigo-600">Click to choose a CSV file or drag & drop</div>
            <div class="text-[11px] text-slate-400">Supported columns: name, sku, barcode, costPrice, sellingPrice, currentStock</div>
          </div>
        </div>

        <div *ngIf="importResult" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <strong>Import Succeeded!</strong> Successfully imported {{ importResult.importedCount }} product records.
        </div>
      </div>
    </div>
  `
})
export class ImportExportComponent {
  importResult: { importedCount: number } | null = null;

  constructor(private apiService: ApiService) {}

  exportFile(type: 'products' | 'sales' | 'expenses' | 'cashbook' | 'trial-balance'): void {
    this.apiService.exportCsv(type).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marginos_${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.apiService.importCsv('products', file).subscribe({
        next: (res) => {
          this.importResult = res;
        }
      });
    }
  }
}
