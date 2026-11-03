import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { OperatingMode } from '../../models/types';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 mb-2">
            <span>Workspace Setup</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Business Profile & Operating Mode</h1>
          <p class="text-xs text-slate-500 mt-1">
            Configure store details, GST taxation, multi-user permissions, and active operating mode.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Operating Mode Card -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Operating Mode</h3>
          <p class="text-xs text-slate-500">
            You can switch operating modes anytime without losing historical financial entries.
          </p>

          <div class="space-y-2">
            <button (click)="selectMode('QUICK_START')"
                    class="w-full p-3 rounded-xl border text-left transition flex items-start gap-3"
                    [ngClass]="activeBiz?.operatingMode === 'QUICK_START' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:bg-slate-50'">
              <span class="text-xl">⚡</span>
              <div>
                <span class="font-extrabold text-xs text-slate-900 block">Mode A — Quick Start</span>
                <span class="text-[11px] text-slate-500">Fast 3-click cashbook, daily cash closing, WhatsApp digest</span>
              </div>
            </button>

            <button (click)="selectMode('DETAILED')"
                    class="w-full p-3 rounded-xl border text-left transition flex items-start gap-3"
                    [ngClass]="activeBiz?.operatingMode === 'DETAILED' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:bg-slate-50'">
              <span class="text-xl">📊</span>
              <div>
                <span class="font-extrabold text-xs text-slate-900 block">Mode B — Detailed ERP</span>
                <span class="text-[11px] text-slate-500">Invoices, bills, WAVG inventory, customer khata & general ledger</span>
              </div>
            </button>

            <button (click)="selectMode('SIMULATOR')"
                    class="w-full p-3 rounded-xl border text-left transition flex items-start gap-3"
                    [ngClass]="activeBiz?.operatingMode === 'SIMULATOR' ? 'border-amber-500 bg-amber-50/50' : 'border-slate-200 hover:bg-slate-50'">
              <span class="text-xl">🔮</span>
              <div>
                <span class="font-extrabold text-xs text-slate-900 block">Mode C — Simulator</span>
                <span class="text-[11px] text-slate-500">What-if scenario modeling, loan DSCR, expansion testing</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Business Details Form -->
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">Store Details & Tax Registration</h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Business Legal Name</label>
              <input type="text" [(ngModel)]="bizName" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Trade / Display Name</label>
              <input type="text" [(ngModel)]="tradeName" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">GSTIN Number</label>
              <input type="text" [(ngModel)]="gstin" placeholder="29ABCDE1234F1Z5"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">PAN Number</label>
              <input type="text" [(ngModel)]="pan" placeholder="ABCDE1234F"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono uppercase">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Store Phone</label>
              <input type="tel" [(ngModel)]="phone" placeholder="+91 9876543210"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Store Email</label>
              <input type="email" [(ngModel)]="email" placeholder="store@marginos.internal"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Shop Address & City</label>
            <input type="text" [(ngModel)]="address" placeholder="e.g. Shop #14, Main Market, Bengaluru, Karnataka"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
          </div>

          <div class="pt-2 flex justify-end">
            <button class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition">
              Save Store Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  bizName = '';
  tradeName = '';
  gstin = '';
  pan = '';
  phone = '';
  email = '';
  address = '';

  constructor(public authService: AuthService) {
    const b = this.authService.activeBusiness();
    if (b) {
      this.bizName = b.name;
      this.tradeName = b.tradeName || '';
      this.gstin = b.gstin || '';
      this.pan = b.pan || '';
      this.phone = b.phone || '';
      this.email = b.email || '';
      this.address = b.address || '';
    }
  }

  get activeBiz() {
    return this.authService.activeBusiness();
  }

  selectMode(mode: string): void {
    this.authService.updateOperatingMode(mode).subscribe();
  }
}
