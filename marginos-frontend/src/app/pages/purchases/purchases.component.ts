import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, Supplier, PurchaseInvoice } from '../../models/types';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Mode B • Operations</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Purchases & Supplier Bills</h1>
          <p class="text-xs text-slate-500 mt-1">
            Record incoming stock, input tax credit, and auto-recalculate Weighted-Average Costing (WAVG).
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/products" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📦</span>
            <span>Product Catalog</span>
          </a>
          <a routerLink="/suppliers" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>🏭</span>
            <span>Suppliers</span>
          </a>
          <button (click)="showNewBill = !showNewBill" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>{{ showNewBill ? 'Close Form' : 'Record Purchase Bill' }}</span>
          </button>
        </div>
      </div>

      <!-- New Purchase Bill Form -->
      <div *ngIf="showNewBill" class="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>📦</span>
            <span>Record Supplier Purchase Bill</span>
          </h2>
          <span class="text-xs text-emerald-600 font-bold">Auto-updates Inventory WAVG Cost</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700">Supplier / Vendor</label>
              <a routerLink="/suppliers" class="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline">+ New Supplier</a>
            </div>
            <select [(ngModel)]="billReq.supplierId" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option *ngFor="let s of suppliers" [value]="s.id">{{ s.name }} (Outstanding: ₹{{ s.balancePayable | number:'1.2-2' }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Supplier Bill #</label>
            <input type="text" [(ngModel)]="billReq.billNumber" placeholder="e.g. INV-9842"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Bill Date</label>
            <input type="date" [(ngModel)]="billReq.billDate"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>
        </div>

        <!-- Lines -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">
                  <div class="flex items-center justify-between">
                    <span>Product / Stock Item</span>
                    <a routerLink="/products" class="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline">+ New SKU</a>
                  </div>
                </th>
                <th class="p-3 w-28">Quantity</th>
                <th class="p-3 w-32">Purchase Cost / Unit (₹)</th>
                <th class="p-3 w-28">GST %</th>
                <th class="p-3 w-32 text-right">Line Total (₹)</th>
                <th class="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of billReq.lines; let i = index">
                <td class="p-2">
                  <select [(ngModel)]="item.productId" (change)="onProductSelect(item)"
                          class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
                    <option [ngValue]="null">Select product...</option>
                    <option *ngFor="let p of products" [value]="p.id">
                      {{ p.name }} (Current WAVG: ₹{{ p.costPrice | number:'1.2-2' }})
                    </option>
                  </select>
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="item.quantity" (input)="recalculateBill()" min="1"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center font-bold">
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="item.unitPrice" (input)="recalculateBill()"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold">
                </td>
                <td class="p-2">
                  <select [(ngModel)]="item.taxRate" (change)="recalculateBill()" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
                    <option [value]="0">0%</option>
                    <option [value]="5">5%</option>
                    <option [value]="12">12%</option>
                    <option [value]="18">18%</option>
                    <option [value]="28">28%</option>
                  </select>
                </td>
                <td class="p-2 text-right font-black text-slate-900">
                  ₹{{ item.lineTotal | number:'1.2-2' }}
                </td>
                <td class="p-2 text-center">
                  <button (click)="removeLine(i)" class="text-rose-500 hover:text-rose-700 font-bold p-1">✕</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button (click)="addLine()" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
          <span>+ Add Stock Row</span>
        </button>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div class="text-xs text-slate-500">
            Payment Mode:
            <select [(ngModel)]="billReq.paymentMode" class="ml-2 px-2 py-1 rounded-lg border border-slate-300 text-xs bg-white font-bold">
              <option value="CREDIT">Supplier Credit (Payable)</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash Drawer</option>
            </select>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-xs text-slate-500 block">Total Payable:</span>
              <span class="text-2xl font-black text-slate-900">₹{{ grandTotal | number:'1.2-2' }}</span>
            </div>

            <button (click)="submitBill()" [disabled]="submitting || billReq.lines.length === 0"
                    class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50">
              {{ submitting ? 'Posting...' : '✓ Post Purchase Bill' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Purchases History -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Recorded Purchase Bills</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Bill #</th>
                <th class="p-3">Date</th>
                <th class="p-3">Supplier</th>
                <th class="p-3">Payment Terms</th>
                <th class="p-3 text-right">Taxable Amount</th>
                <th class="p-3 text-right">GST Input Credit</th>
                <th class="p-3 text-right">Total Amount</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let p of purchases" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-indigo-700">{{ p.billNumber || p.invoiceNumber }}</td>
                <td class="p-3">{{ p.billDate || p.invoiceDate }}</td>
                <td class="p-3 font-medium">{{ p.supplierName }}</td>
                <td class="p-3">{{ p.paymentMode }}</td>
                <td class="p-3 text-right">₹{{ p.taxableAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right text-emerald-700">₹{{ p.taxAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ p.totalAmount | number:'1.2-2' }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {{ p.paymentStatus || 'POSTED' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PurchasesComponent implements OnInit {
  purchases: PurchaseInvoice[] = [];
  products: Product[] = [];
  suppliers: Supplier[] = [];

  showNewBill = false;
  submitting = false;

  billReq: any = {
    supplierId: null,
    billNumber: '',
    billDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CREDIT',
    lines: []
  };

  grandTotal = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadPurchases();
    this.loadProducts();
    this.loadSuppliers();
    this.addLine();
  }

  loadPurchases(): void {
    this.apiService.getPurchaseInvoices().subscribe({
      next: (list) => this.purchases = list
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (list) => this.products = list
    });
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe({
      next: (list) => {
        this.suppliers = list;
        if (list.length > 0) this.billReq.supplierId = list[0].id;
      }
    });
  }

  addLine(): void {
    this.billReq.lines.push({
      productId: null,
      quantity: 10,
      unitPrice: 0,
      taxRate: 5,
      lineTotal: 0
    });
  }

  removeLine(index: number): void {
    this.billReq.lines.splice(index, 1);
    this.recalculateBill();
  }

  onProductSelect(line: any): void {
    const p = this.products.find(item => item.id === line.productId);
    if (p) {
      line.productName = p.name;
      line.unitPrice = p.costPrice || 0;
      line.unitCost = p.costPrice || 0;
      line.taxRate = p.taxRate || 5;
    }
    this.recalculateBill();
  }

  recalculateBill(): void {
    let sum = 0;
    for (const line of this.billReq.lines) {
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      const taxRate = Number(line.taxRate) || 0;
      const base = qty * price;
      const tax = (base * taxRate) / 100;
      line.lineTotal = base + tax;
      sum += line.lineTotal;
    }
    this.grandTotal = sum;
  }

  submitBill(): void {
    this.submitting = true;
    const supp = this.suppliers.find(s => s.id === this.billReq.supplierId);
    this.billReq.supplierName = supp ? supp.name : 'Primary Supplier';
    if (!this.billReq.billNumber || !this.billReq.billNumber.trim()) {
      this.billReq.billNumber = `BILL-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    this.apiService.createPurchaseInvoice(this.billReq).subscribe({
      next: (created: any) => {
        this.submitting = false;
        this.showNewBill = false;
        const newBill: PurchaseInvoice = {
          id: created?.id || 'bill-' + Date.now(),
          billNumber: this.billReq.billNumber,
          billDate: this.billReq.billDate,
          supplierName: this.billReq.supplierName,
          paymentMode: this.billReq.paymentMode,
          taxableAmount: this.grandTotal * 0.95,
          taxAmount: this.grandTotal * 0.05,
          totalAmount: created?.totalAmount || this.grandTotal,
          paymentStatus: this.billReq.paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID'
        };
        this.purchases = [newBill, ...this.purchases];
        this.loadPurchases();
        this.billReq.lines = [];
        this.addLine();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
