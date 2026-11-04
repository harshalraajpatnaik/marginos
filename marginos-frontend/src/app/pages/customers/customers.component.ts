import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Customer, KhataSummary, AgingBucket } from '../../models/types';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Customer Khata</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Customer Khata & Receivables</h1>
          <p class="text-xs text-slate-500 mt-1">
            Track customer udhaar, receivables aging buckets (0-90+ days), and send 1-click WhatsApp payment reminders.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/sales" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>🧾</span>
            <span>New Sales Invoice</span>
          </a>
          <button (click)="showAddModal = true" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      <!-- Aging Buckets Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">0 - 30 Days (Current)</span>
          <span class="text-2xl font-black text-emerald-600 mt-1 block">₹{{ agingMap['0-30'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Normal credit cycle</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">31 - 60 Days</span>
          <span class="text-2xl font-black text-amber-600 mt-1 block">₹{{ agingMap['31-60'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Send first reminder</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">61 - 90 Days</span>
          <span class="text-2xl font-black text-orange-600 mt-1 block">₹{{ agingMap['61-90'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Follow up urgently</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">90+ Days (High Risk)</span>
          <span class="text-2xl font-black text-rose-600 mt-1 block">₹{{ agingMap['90+'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-rose-700 mt-0.5 block">Bad debt risk; halt credit</span>
        </div>
      </div>

      <!-- Add Customer Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Add New Customer</h3>
            <button (click)="showAddModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
            <input type="text" [(ngModel)]="newCust.name" placeholder="e.g. Ramesh Patel"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number (for WhatsApp)</label>
            <input type="tel" [(ngModel)]="newCust.phone" placeholder="+91 9876543210"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
              <input type="number" [(ngModel)]="newCust.creditLimit" placeholder="10000"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Credit Period (Days)</label>
              <input type="number" [(ngModel)]="newCust.creditPeriodDays" placeholder="30"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button (click)="showAddModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="saveCustomer()" [disabled]="saving || !newCust.name"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Add Customer' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Customers Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Customer Name</th>
                <th class="p-3">Phone</th>
                <th class="p-3 text-right">Credit Limit</th>
                <th class="p-3 text-right">Outstanding Udhaar</th>
                <th class="p-3">Credit Health</th>
                <th class="p-3 text-center">WhatsApp Reminder</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let c of customers" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ c.name }}</td>
                <td class="p-3 text-slate-500 font-mono">{{ c.phone || '—' }}</td>
                <td class="p-3 text-right font-semibold">₹{{ (c.creditLimit || 0) | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black" [ngClass]="c.balanceOutstanding > 0 ? 'text-amber-700' : 'text-slate-700'">
                  ₹{{ c.balanceOutstanding | number:'1.2-2' }}
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="c.balanceOutstanding > (c.creditLimit || 10000) ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                    {{ c.balanceOutstanding > (c.creditLimit || 10000) ? 'Limit Exceeded' : 'Within Limit' }}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button *ngIf="c.balanceOutstanding > 0" (click)="sendWhatsAppReminder(c)"
                          class="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition inline-flex items-center gap-1">
                    <span>💬</span>
                    <span>Remind (₹{{ c.balanceOutstanding | number:'1.0-0' }})</span>
                  </button>
                  <span *ngIf="c.balanceOutstanding <= 0" class="text-slate-400 text-[11px]">No dues</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  agingBuckets: AgingBucket[] = [];
  agingMap: { [key: string]: number } = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

  showAddModal = false;
  saving = false;
  newCust: Partial<Customer> = {
    name: '',
    phone: '',
    creditLimit: 10000,
    creditPeriodDays: 30
  };

  constructor(private apiService: ApiService, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadAging();
  }

  loadCustomers(): void {
    this.apiService.getCustomers().subscribe(list => this.customers = list);
  }

  loadAging(): void {
    this.apiService.getReceivablesAging().subscribe(buckets => {
      this.agingBuckets = buckets;
      for (const b of buckets) {
        if (this.agingMap[b.bucketName] !== undefined) {
          this.agingMap[b.bucketName] = b.totalAmount;
        }
      }
    });
  }

  saveCustomer(): void {
    this.saving = true;
    this.apiService.createCustomer(this.newCust).subscribe({
      next: (created: any) => {
        this.saving = false;
        this.showAddModal = false;
        const c: Customer = {
          id: created?.id || 'cust-' + Date.now(),
          name: this.newCust.name || 'New Customer',
          phone: this.newCust.phone || '',
          creditLimit: Number(this.newCust.creditLimit) || 10000,
          creditPeriodDays: Number(this.newCust.creditPeriodDays) || 30,
          balanceOutstanding: created?.currentBalance ?? created?.balanceOutstanding ?? 0
        };
        this.customers = [c, ...this.customers];
        this.loadCustomers();
        this.newCust = { name: '', phone: '', creditLimit: 10000, creditPeriodDays: 30 };
      },
      error: () => this.saving = false
    });
  }

  sendWhatsAppReminder(c: Customer): void {
    const biz = this.authService.activeBusiness()?.name || 'our store';
    const msg = `Namaste ${c.name} ji,\n\nThis is a gentle payment reminder from *${biz}*. Your current pending balance is *₹${c.balanceOutstanding.toLocaleString('en-IN')}*.\n\nKindly clear this at your earliest convenience. Thank you!`;
    const phoneClean = c.phone ? c.phone.replace(/[^0-9]/g, '') : '';
    const url = phoneClean ? `https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}
