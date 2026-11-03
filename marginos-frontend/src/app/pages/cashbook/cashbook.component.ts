import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CashbookEntry } from '../../models/types';

@Component({
  selector: 'app-cashbook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header Banner -->
      <div class="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 mb-2">
              <span>⚡ Mode A — Shopkeeper Quick Start</span>
            </div>
            <h1 class="text-2xl font-black tracking-tight">Daily Cashbook & Closing</h1>
            <p class="text-xs text-slate-300 mt-1">
              3-Click daily closing, counted cash variance verification, and WhatsApp business digest.
            </p>
          </div>

          <!-- Date Selector -->
          <div class="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-xl border border-white/20">
            <span class="text-xs font-bold text-slate-200 px-2">Closing Date:</span>
            <input type="date" [(ngModel)]="selectedDate" (change)="onDateChange()"
                   class="bg-white text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-emerald-400">
          </div>
        </div>
      </div>

      <!-- Main Entry & Variance Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 2 Cols: Inflow and Outflow Inputs -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>1. Cash & Sales Inflows</span>
              <span class="text-emerald-600 font-bold text-xs">+ Money Coming In</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Opening Cash in Drawer (₹)</label>
                <input type="number" [(ngModel)]="entry.openingCash" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Today's Cash Sales (₹)</label>
                <input type="number" [(ngModel)]="entry.cashSales" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">UPI / Digital Sales (QR, GPay, Paytm) (₹)</label>
                <input type="number" [(ngModel)]="entry.digitalSales" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Credit Sales (Customer Udhaar given today) (₹)</label>
                <input type="number" [(ngModel)]="entry.creditSales" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Customer Collections (Old Udhaar received in cash) (₹)</label>
                <input type="number" [(ngModel)]="entry.customerCollections" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Owner Capital Introduced / Loan (₹)</label>
                <input type="number" [(ngModel)]="entry.ownerCapital" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500">
              </div>
            </div>

            <!-- Inflows Subtotal -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 font-medium">Total Daily Sales (Cash + Digital + Udhaar):</span>
              <span class="font-extrabold text-slate-900 text-sm">
                ₹{{ ((entry.cashSales || 0) + (entry.digitalSales || 0) + (entry.creditSales || 0)) | number:'1.2-2' }}
              </span>
            </div>
          </div>

          <!-- Outflows Box -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 class="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>2. Cash Outflows & Payments</span>
              <span class="text-rose-600 font-bold text-xs">- Money Going Out</span>
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Cash Purchases (Stock bought with drawer cash) (₹)</label>
                <input type="number" [(ngModel)]="entry.cashPurchases" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Daily Operating Expenses (Tea, snacks, helper wage, packing) (₹)</label>
                <input type="number" [(ngModel)]="entry.operatingExpenses" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Supplier Payments Made in Cash (₹)</label>
                <input type="number" [(ngModel)]="entry.supplierPayments" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500">
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1">Owner Drawings (Cash taken for personal use) (₹)</label>
                <input type="number" [(ngModel)]="entry.ownerDrawings" (input)="recalculate()"
                       class="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-xs font-bold text-slate-600 mb-1">Daily Notes / Memo</label>
              <input type="text" [(ngModel)]="entry.notes" placeholder="e.g. Festival weekend, heavy rice demand, ₹200 helper tip"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500">
            </div>
          </div>
        </div>

        <!-- Right Col: Cash Reconciliation & Closing Action -->
        <div class="space-y-6">
          
          <!-- Reconciliation Engine Card -->
          <div class="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm space-y-5">
            <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>⚖️</span>
              <span>Cash Reconciliation</span>
            </h3>

            <!-- Theoretical Cash in Drawer -->
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-xs font-bold text-slate-500 block">System Expected Cash in Drawer</span>
              <span class="text-2xl font-black text-slate-900 mt-1 block">
                ₹{{ theoreticalCash | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 mt-0.5 block">
                Formula: Opening + Cash Sales + Collections - Cash Purchases - Expenses - Payments - Drawings
              </span>
            </div>

            <!-- Physical Counted Cash Input -->
            <div class="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
              <label class="block text-xs font-bold text-indigo-950 mb-1">Physical Cash Counted in Drawer (₹)</label>
              <input type="number" [(ngModel)]="entry.countedCash" (input)="recalculate()"
                     placeholder="Count your notes & coins"
                     class="w-full px-3 py-2.5 rounded-xl border-2 border-indigo-300 bg-white text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <span class="text-[10px] text-indigo-700 mt-1 block">
                Enter actual cash present in cashbox at end of day
              </span>
            </div>

            <!-- Real-time Variance Badge -->
            <div class="p-4 rounded-xl border transition-all"
                 [ngClass]="{
                   'bg-emerald-50 border-emerald-300 text-emerald-900': variance === 0,
                   'bg-rose-50 border-rose-300 text-rose-900': variance < 0,
                   'bg-amber-50 border-amber-300 text-amber-900': variance > 0
                 }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold uppercase tracking-wider">
                  {{ variance === 0 ? '✓ Matched' : variance < 0 ? '⚠️ Cash Shortage' : 'ℹ️ Cash Surplus' }}
                </span>
                <span class="text-base font-black">
                  {{ variance >= 0 ? '+' : '' }}₹{{ variance | number:'1.2-2' }}
                </span>
              </div>
              <p class="text-[11px] leading-tight">
                {{ variance === 0 ? 'Physical cash matches system calculation perfectly!' : 
                   variance < 0 ? 'Cash drawer has less money than expected. Check for forgotten expenses or change errors.' : 
                   'Cash drawer has more money than expected. Check for unrecorded sales.' }}
              </p>
            </div>

            <!-- Save Closing Button -->
            <button (click)="saveEntry()" [disabled]="saving"
                    class="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="saving" class="animate-spin">⟳</span>
              <span>{{ saving ? 'Saving Closing...' : '✓ Post Daily Closing' }}</span>
            </button>

            <div *ngIf="saveSuccess" class="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold text-center">
              Daily closing saved successfully!
            </div>
          </div>

          <!-- WhatsApp Digest Generator Card -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span class="text-emerald-500 text-base">💬</span>
                <span>WhatsApp Closing Digest</span>
              </h3>
              <button (click)="generateWhatsAppText()" class="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                Refresh
              </button>
            </div>

            <div class="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
              {{ whatsappText || 'Save or click refresh to preview digest text...' }}
            </div>

            <div class="grid grid-cols-2 gap-2">
              <button (click)="shareViaWhatsApp()"
                      class="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition">
                <span>📱</span>
                <span>Send WhatsApp</span>
              </button>

              <button (click)="copyWhatsAppText()"
                      class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                <span>📋</span>
                <span>{{ copied ? 'Copied!' : 'Copy Text' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 7-Day History Table -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Recent Daily Closings History</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Date</th>
                <th class="p-3">Opening Cash</th>
                <th class="p-3">Cash Sales</th>
                <th class="p-3">UPI / Digital</th>
                <th class="p-3">Total Sales</th>
                <th class="p-3">Daily Expenses</th>
                <th class="p-3">Counted Cash</th>
                <th class="p-3">Variance</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let h of historyList" class="hover:bg-slate-50">
                <td class="p-3 font-bold">{{ h.entryDate }}</td>
                <td class="p-3">₹{{ h.openingCash | number:'1.2-2' }}</td>
                <td class="p-3 font-semibold text-emerald-700">₹{{ h.cashSales | number:'1.2-2' }}</td>
                <td class="p-3 text-indigo-700">₹{{ h.digitalSales | number:'1.2-2' }}</td>
                <td class="p-3 font-black text-slate-900">₹{{ h.totalSales | number:'1.2-2' }}</td>
                <td class="p-3 text-rose-600">₹{{ h.operatingExpenses | number:'1.2-2' }}</td>
                <td class="p-3 font-bold">₹{{ (h.countedCash || h.closingCash) | number:'1.2-2' }}</td>
                <td class="p-3 font-bold" [ngClass]="(h.cashVariance || 0) < 0 ? 'text-rose-600' : 'text-emerald-600'">
                  {{ (h.cashVariance || 0) >= 0 ? '+' : '' }}₹{{ (h.cashVariance || 0) | number:'1.2-2' }}
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="(h.cashVariance || 0) === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'">
                    {{ (h.cashVariance || 0) === 0 ? 'Reconciled' : 'Variance' }}
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
export class CashbookComponent implements OnInit {
  selectedDate: string = new Date().toISOString().split('T')[0];
  entry: Partial<CashbookEntry> = {
    openingCash: 5000,
    cashSales: 0,
    digitalSales: 0,
    creditSales: 0,
    cashPurchases: 0,
    operatingExpenses: 0,
    customerCollections: 0,
    supplierPayments: 0,
    ownerCapital: 0,
    ownerDrawings: 0,
    countedCash: 0,
    notes: ''
  };

  theoreticalCash = 5000;
  variance = 0;
  saving = false;
  saveSuccess = false;
  whatsappText = '';
  copied = false;
  historyList: CashbookEntry[] = [];

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadEntryForDate();
    this.loadHistory();
  }

  onDateChange(): void {
    this.loadEntryForDate();
  }

  loadEntryForDate(): void {
    this.apiService.getDailyCashbook(this.selectedDate).subscribe({
      next: (res) => {
        if (res) {
          this.entry = res;
          this.recalculate();
          this.generateWhatsAppText();
        }
      },
      error: () => {
        // Fallback defaults
        this.recalculate();
      }
    });
  }

  loadHistory(): void {
    this.apiService.getCashbookEntries().subscribe({
      next: (entries) => {
        this.historyList = entries;
      }
    });
  }

  recalculate(): void {
    const opening = Number(this.entry.openingCash) || 0;
    const cashSales = Number(this.entry.cashSales) || 0;
    const collections = Number(this.entry.customerCollections) || 0;
    const capital = Number(this.entry.ownerCapital) || 0;

    const cashPurchases = Number(this.entry.cashPurchases) || 0;
    const expenses = Number(this.entry.operatingExpenses) || 0;
    const payments = Number(this.entry.supplierPayments) || 0;
    const drawings = Number(this.entry.ownerDrawings) || 0;

    this.theoreticalCash = opening + cashSales + collections + capital - cashPurchases - expenses - payments - drawings;
    
    const counted = Number(this.entry.countedCash) || 0;
    this.variance = counted - this.theoreticalCash;
    this.entry.cashVariance = this.variance;
  }

  saveEntry(): void {
    this.saving = true;
    this.saveSuccess = false;
    this.entry.entryDate = this.selectedDate;
    this.entry.closingCash = this.entry.countedCash || this.theoreticalCash;

    this.apiService.saveCashbookEntry(this.entry).subscribe({
      next: (saved) => {
        this.saving = false;
        this.saveSuccess = true;
        this.entry = saved;
        this.generateWhatsAppText();
        this.loadHistory();
        setTimeout(() => this.saveSuccess = false, 4000);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  generateWhatsAppText(): void {
    const biz = this.authService.activeBusiness()?.name || 'MarginOS Store';
    const totalSales = (Number(this.entry.cashSales) || 0) + (Number(this.entry.digitalSales) || 0) + (Number(this.entry.creditSales) || 0);

    this.whatsappText = `📊 *DAILY CASH CLOSING — ${biz.toUpperCase()}*
📅 Date: ${this.selectedDate}
--------------------------------
💰 *Total Sales:* ₹${totalSales.toLocaleString('en-IN')}
   • Cash Sales: ₹${(Number(this.entry.cashSales) || 0).toLocaleString('en-IN')}
   • UPI / Digital: ₹${(Number(this.entry.digitalSales) || 0).toLocaleString('en-IN')}
   • Udhaar (Credit): ₹${(Number(this.entry.creditSales) || 0).toLocaleString('en-IN')}

💸 *Cash Outflows:*
   • Daily Expenses: ₹${(Number(this.entry.operatingExpenses) || 0).toLocaleString('en-IN')}
   • Cash Purchases: ₹${(Number(this.entry.cashPurchases) || 0).toLocaleString('en-IN')}
   • Supplier Payments: ₹${(Number(this.entry.supplierPayments) || 0).toLocaleString('en-IN')}

💵 *Physical Cash in Drawer:* ₹${(Number(this.entry.countedCash) || 0).toLocaleString('en-IN')}
⚖️ *Variance:* ₹${this.variance.toLocaleString('en-IN')} (${this.variance === 0 ? '✓ Matched' : this.variance < 0 ? 'Shortage' : 'Surplus'})
--------------------------------
_Generated via MarginOS Financial Engine_`;
  }

  shareViaWhatsApp(): void {
    if (!this.whatsappText) this.generateWhatsAppText();
    const url = `https://wa.me/?text=${encodeURIComponent(this.whatsappText)}`;
    window.open(url, '_blank');
  }

  copyWhatsAppText(): void {
    if (!this.whatsappText) this.generateWhatsAppText();
    navigator.clipboard.writeText(this.whatsappText);
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }
}
