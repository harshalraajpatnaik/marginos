import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, Customer, SalesInvoice, SalesInvoiceRequest, SalesInvoiceLineRequest } from '../../models/types';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Mode B • Operations</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Sales Invoicing & Counter POS</h1>
          <p class="text-xs text-slate-500 mt-1">
            Real-time margin calculator, GST billing, customer khata ledger posting, and automatic double-entry inventory deduction.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/products" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📦</span>
            <span>Product Catalog</span>
          </a>
          <a routerLink="/customers" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>👥</span>
            <span>Customer Khata</span>
          </a>
          <button (click)="openQuickModal = true" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>⚡</span>
            <span>Quick Counter Sale</span>
          </button>
          <button (click)="showNewInvoice = !showNewInvoice" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>{{ showNewInvoice ? 'Close Form' : 'New Tax Invoice' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Counter Sale Modal -->
      <div *ngIf="openQuickModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>⚡</span>
              <span>1-Click Counter Sale</span>
            </h3>
            <button (click)="openQuickModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <p class="text-xs text-slate-500">
            For rush-hour checkout without itemization. Directly updates Cash in Hand and posts to revenue ledger.
          </p>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Total Bill Amount (₹)</label>
            <input type="number" [(ngModel)]="quickAmount" placeholder="e.g. 240"
                   class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-lg font-black text-slate-900 focus:ring-2 focus:ring-emerald-500">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
            <select [(ngModel)]="quickPaymentMode" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="CASH">Cash in Drawer</option>
              <option value="UPI">UPI / QR (PhonePe / GPay)</option>
              <option value="CARD">Debit / Credit Card</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Optional Notes</label>
            <input type="text" [(ngModel)]="quickNotes" placeholder="e.g. Morning milk and biscuit rush"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div class="pt-2 flex items-center justify-end gap-2">
            <button (click)="openQuickModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="submitQuickSale()" [disabled]="quickLoading || !quickAmount"
                    class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ quickLoading ? 'Recording...' : 'Record Cash Sale' }}
            </button>
          </div>
        </div>
      </div>

      <!-- New Tax Invoice Form (Expandable) -->
      <div *ngIf="showNewInvoice" class="bg-white p-6 rounded-2xl border-2 border-indigo-200 shadow-md space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>🧾</span>
            <span>Create Sales Invoice</span>
          </h2>
          <span class="text-xs text-indigo-600 font-bold">Auto-posts Double-Entry Journal</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="block text-xs font-bold text-slate-700">Customer / Buyer</label>
              <a routerLink="/customers" class="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline">+ New Customer</a>
            </div>
            <select [(ngModel)]="invoiceReq.customerId" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
              <option [ngValue]="null">Walk-in Cash Customer</option>
              <option *ngFor="let c of customers" [value]="c.id">{{ c.name }} (Khata: ₹{{ c.balanceOutstanding | number:'1.2-2' }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Invoice Date</label>
            <input type="date" [(ngModel)]="invoiceReq.invoiceDate"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Payment Mode</label>
            <select [(ngModel)]="invoiceReq.paymentMode" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="CASH">Cash</option>
              <option value="UPI">UPI / Digital</option>
              <option value="CREDIT">Credit (Add to Customer Khata)</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
        </div>

        <!-- Line Items Table -->
        <div class="overflow-x-auto border border-slate-200 rounded-xl">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="p-3">
                  <div class="flex items-center justify-between">
                    <span>Product / Item</span>
                    <a routerLink="/products" class="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline">+ Add New SKU</a>
                  </div>
                </th>
                <th class="p-3 w-24">Qty</th>
                <th class="p-3 w-28">Unit Price (₹)</th>
                <th class="p-3 w-24">GST %</th>
                <th class="p-3 w-28 text-right">Line Total (₹)</th>
                <th class="p-3 w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of invoiceReq.lines; let i = index">
                <td class="p-2">
                  <select [(ngModel)]="item.productId" (change)="onProductSelect(item)"
                          class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
                    <option [ngValue]="null">Select product...</option>
                    <option *ngFor="let p of products" [value]="p.id">
                      {{ p.name }} (Stock: {{ p.currentStock }} {{ p.unitOfMeasure }}) — Cost: ₹{{ p.costPrice | number:'1.2-2' }}
                    </option>
                  </select>
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="item.quantity" (input)="recalculateInvoice()" min="1"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs text-center font-bold">
                </td>
                <td class="p-2">
                  <input type="number" [(ngModel)]="item.unitPrice" (input)="recalculateInvoice()"
                         class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold">
                </td>
                <td class="p-2">
                  <select [(ngModel)]="item.taxRate" (change)="recalculateInvoice()" class="w-full px-2 py-1.5 rounded-lg border border-slate-300 text-xs bg-white">
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
          <span>+ Add Product Row</span>
        </button>

        <!-- Margin Intelligence Preview Box -->
        <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div class="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">⚡ Real-time Profit Preview</div>
            <div class="text-xs text-emerald-950 mt-0.5">
              Cost of Goods: <strong>₹{{ totalEstimatedCost | number:'1.2-2' }}</strong> | Estimated Profit: <strong>₹{{ estimatedProfit | number:'1.2-2' }}</strong>
            </div>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 block">Gross Profit Margin:</span>
            <span class="text-xl font-black text-emerald-700">{{ estimatedMarginPercent | number:'1.1-1' }}%</span>
          </div>
        </div>

        <!-- Invoice Summary & Submit -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div class="text-xs text-slate-500">
            Total Items: <strong>{{ invoiceReq.lines.length }}</strong>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <span class="text-xs text-slate-500 block">Grand Total:</span>
              <span class="text-2xl font-black text-slate-900">₹{{ grandTotal | number:'1.2-2' }}</span>
            </div>

            <button (click)="submitInvoice()" [disabled]="submitting || invoiceReq.lines.length === 0"
                    class="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50">
              {{ submitting ? 'Generating...' : '✓ Finalize & Print Invoice' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Invoices List -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Recent Sales Invoices</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Invoice #</th>
                <th class="p-3">Date</th>
                <th class="p-3">Customer</th>
                <th class="p-3">Payment Mode</th>
                <th class="p-3 text-right">Taxable</th>
                <th class="p-3 text-right">GST</th>
                <th class="p-3 text-right">Grand Total</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let inv of invoices" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-indigo-700">{{ inv.invoiceNumber }}</td>
                <td class="p-3">{{ inv.invoiceDate }}</td>
                <td class="p-3 font-medium">{{ inv.customerName || 'Walk-in Cash' }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    {{ inv.paymentMode }}
                  </span>
                </td>
                <td class="p-3 text-right font-medium">₹{{ (inv.taxableAmount || inv.subtotal || (inv.totalAmount - (inv.taxAmount || 0))) | number:'1.2-2' }}</td>
                <td class="p-3 text-right">₹{{ inv.taxAmount | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ inv.totalAmount | number:'1.2-2' }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="{
                          'bg-emerald-50 text-emerald-700 border border-emerald-200': inv.paymentStatus === 'PAID',
                          'bg-amber-50 text-amber-700 border border-amber-200': inv.paymentStatus === 'PARTIAL',
                          'bg-rose-50 text-rose-700 border border-rose-200': inv.paymentStatus === 'UNPAID'
                        }">
                    {{ inv.paymentStatus }}
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
export class SalesComponent implements OnInit {
  invoices: SalesInvoice[] = [];
  products: Product[] = [];
  customers: Customer[] = [];

  showNewInvoice = false;
  openQuickModal = false;
  quickAmount: number | null = null;
  quickPaymentMode = 'CASH';
  quickNotes = '';
  quickLoading = false;

  submitting = false;

  invoiceReq: SalesInvoiceRequest = {
    customerId: null,
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMode: 'CASH',
    lines: []
  };

  grandTotal = 0;
  totalEstimatedCost = 0;
  estimatedProfit = 0;
  estimatedMarginPercent = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadProducts();
    this.loadCustomers();
    this.addLine();
  }

  loadInvoices(): void {
    this.apiService.getSalesInvoices().subscribe({
      next: (list) => {
        this.invoices = (list || []).map(inv => ({
          ...inv,
          taxableAmount: inv.taxableAmount ?? inv.subtotal ?? (inv.totalAmount - (inv.taxAmount || 0)),
          taxAmount: inv.taxAmount ?? 0
        }));
      }
    });
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (list) => this.products = list
    });
  }

  loadCustomers(): void {
    this.apiService.getCustomers().subscribe({
      next: (list) => this.customers = list
    });
  }

  addLine(): void {
    this.invoiceReq.lines.push({
      productId: null,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 5,
      lineTotal: 0
    });
  }

  removeLine(index: number): void {
    this.invoiceReq.lines.splice(index, 1);
    this.recalculateInvoice();
  }

  onProductSelect(line: SalesInvoiceLineRequest): void {
    const p = this.products.find(item => item.id === line.productId);
    if (p) {
      line.productName = p.name;
      line.unitPrice = p.sellingPrice;
      line.taxRate = p.taxRate || 5;
    }
    this.recalculateInvoice();
  }

  recalculateInvoice(): void {
    let sumTotal = 0;
    let sumCost = 0;

    for (const line of this.invoiceReq.lines) {
      const qty = Number(line.quantity) || 0;
      const price = Number(line.unitPrice) || 0;
      const taxRate = Number(line.taxRate) || 0;
      const base = qty * price;
      const tax = (base * taxRate) / 100;
      line.lineTotal = base + tax;
      sumTotal += line.lineTotal;

      const p = this.products.find(item => item.id === line.productId);
      if (p) {
        sumCost += qty * (p.costPrice || 0);
      }
    }

    this.grandTotal = sumTotal;
    this.totalEstimatedCost = sumCost;
    this.estimatedProfit = this.grandTotal - this.totalEstimatedCost;
    this.estimatedMarginPercent = this.grandTotal > 0 ? (this.estimatedProfit / this.grandTotal) * 100 : 0;
  }

  submitInvoice(): void {
    this.submitting = true;
    const cust = this.customers.find(c => c.id === this.invoiceReq.customerId);
    this.invoiceReq.customerName = cust ? cust.name : 'Walk-in Cash Customer';
    this.invoiceReq.customerPhone = cust?.phone || null;

    this.apiService.createSalesInvoice(this.invoiceReq).subscribe({
      next: (created: any) => {
        this.submitting = false;
        this.showNewInvoice = false;
        const newInv: SalesInvoice = {
          id: created?.id || 'inv-' + Date.now(),
          invoiceNumber: created?.invoiceNumber || 'INV-' + Date.now().toString().slice(-4),
          invoiceDate: this.invoiceReq.invoiceDate,
          customerName: this.invoiceReq.customerName,
          paymentMode: this.invoiceReq.paymentMode,
          taxableAmount: this.grandTotal * 0.95,
          taxAmount: this.grandTotal * 0.05,
          totalAmount: created?.totalAmount || this.grandTotal,
          paymentStatus: this.invoiceReq.paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID'
        };
        this.invoices = [newInv, ...this.invoices];
        this.loadInvoices();
        this.invoiceReq.lines = [];
        this.addLine();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  submitQuickSale(): void {
    if (!this.quickAmount) return;
    this.quickLoading = true;
    const amount = this.quickAmount;
    this.apiService.quickCounterSale({
      totalAmount: amount,
      paymentMode: this.quickPaymentMode,
      notes: this.quickNotes
    }).subscribe({
      next: (created: any) => {
        this.quickLoading = false;
        this.openQuickModal = false;
        this.quickAmount = null;
        const newInv: SalesInvoice = {
          id: created?.id || 'quick-' + Date.now(),
          invoiceNumber: created?.invoiceNumber || 'POS-' + Date.now().toString().slice(-4),
          invoiceDate: new Date().toISOString().split('T')[0],
          customerName: 'Walk-in Cash Customer',
          paymentMode: this.quickPaymentMode,
          taxableAmount: amount,
          taxAmount: 0,
          totalAmount: amount,
          paymentStatus: 'PAID'
        };
        this.invoices = [newInv, ...this.invoices];
        this.loadInvoices();
      },
      error: () => {
        this.quickLoading = false;
      }
    });
  }
}
