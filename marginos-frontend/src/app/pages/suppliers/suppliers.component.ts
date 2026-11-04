import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Supplier, AgingBucket } from '../../models/types';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Accounts Payable</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Suppliers & Vendor Payables</h1>
          <p class="text-xs text-slate-500 mt-1">
            Manage vendor dues, supplier credit periods, upcoming payments, and maintain healthy trade relationships.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/purchases" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📦</span>
            <span>Record Supplier Bill</span>
          </a>
          <button (click)="showAddModal = true" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      <!-- Aging Buckets Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">0 - 30 Days (Upcoming)</span>
          <span class="text-2xl font-black text-slate-900 mt-1 block">₹{{ agingMap['0-30'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Standard payment window</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">31 - 60 Days</span>
          <span class="text-2xl font-black text-amber-600 mt-1 block">₹{{ agingMap['31-60'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Plan cash outflow</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">61 - 90 Days</span>
          <span class="text-2xl font-black text-orange-600 mt-1 block">₹{{ agingMap['61-90'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-slate-400 mt-0.5 block">Vendor follow-up likely</span>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span class="text-xs font-bold text-slate-500 block uppercase">90+ Days (Overdue)</span>
          <span class="text-2xl font-black text-rose-600 mt-1 block">₹{{ agingMap['90+'] | number:'1.2-2' }}</span>
          <span class="text-[10px] text-rose-700 mt-0.5 block">Clear to protect credit terms</span>
        </div>
      </div>

      <!-- Add Supplier Modal -->
      <div *ngIf="showAddModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Add New Supplier</h3>
            <button (click)="showAddModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Company / Supplier Name</label>
            <input type="text" [(ngModel)]="newSupp.name" placeholder="e.g. Metro Cash & Carry"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">GSTIN</label>
              <input type="text" [(ngModel)]="newSupp.gstin" placeholder="29ABCDE1234F1Z5"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Credit Days</label>
              <input type="number" [(ngModel)]="newSupp.creditPeriodDays" placeholder="30"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input type="tel" [(ngModel)]="newSupp.phone" placeholder="+91 9876543210"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button (click)="showAddModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="saveSupplier()" [disabled]="saving || !newSupp.name"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Add Supplier' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Suppliers Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Supplier Name</th>
                <th class="p-3">GSTIN</th>
                <th class="p-3">Phone</th>
                <th class="p-3 text-right">Payment Terms</th>
                <th class="p-3 text-right">Balance Payable</th>
                <th class="p-3">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let s of suppliers" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ s.name }}</td>
                <td class="p-3 font-mono text-slate-600">{{ s.gstin || 'Unregistered' }}</td>
                <td class="p-3 text-slate-500 font-mono">{{ s.phone || '—' }}</td>
                <td class="p-3 text-right font-semibold">{{ s.creditPeriodDays || 30 }} Days</td>
                <td class="p-3 text-right font-black" [ngClass]="s.balancePayable > 0 ? 'text-rose-600' : 'text-slate-700'">
                  ₹{{ s.balancePayable | number:'1.2-2' }}
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="s.balancePayable > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                    {{ s.balancePayable > 0 ? 'Payment Due' : 'All Settled' }}
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
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[] = [];
  agingBuckets: AgingBucket[] = [];
  agingMap: { [key: string]: number } = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };

  showAddModal = false;
  saving = false;
  newSupp: Partial<Supplier> = {
    name: '',
    phone: '',
    gstin: '',
    creditPeriodDays: 30
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadAging();
  }

  loadSuppliers(): void {
    this.apiService.getSuppliers().subscribe(list => this.suppliers = list);
  }

  loadAging(): void {
    this.apiService.getPayablesAging().subscribe(buckets => {
      this.agingBuckets = buckets;
      for (const b of buckets) {
        if (this.agingMap[b.bucketName] !== undefined) {
          this.agingMap[b.bucketName] = b.totalAmount;
        }
      }
    });
  }

  saveSupplier(): void {
    this.saving = true;
    this.apiService.createSupplier(this.newSupp).subscribe({
      next: (created: any) => {
        this.saving = false;
        this.showAddModal = false;
        const s: Supplier = {
          id: created?.id || 'supp-' + Date.now(),
          name: this.newSupp.name || 'New Supplier',
          phone: this.newSupp.phone || '',
          gstin: this.newSupp.gstin || '',
          creditPeriodDays: Number(this.newSupp.creditPeriodDays) || 30,
          balancePayable: created?.currentBalance ?? created?.balancePayable ?? 0
        };
        this.suppliers = [s, ...this.suppliers];
        this.loadSuppliers();
        this.newSupp = { name: '', phone: '', gstin: '', creditPeriodDays: 30 };
      },
      error: () => this.saving = false
    });
  }
}
