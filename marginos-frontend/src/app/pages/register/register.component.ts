import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BusinessType, OperatingMode } from '../../models/types';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <a routerLink="/" class="inline-flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-md">
            ₹
          </div>
          <span class="text-2xl font-black text-slate-900 tracking-tight">MarginOS</span>
        </a>
        <h2 class="mt-4 text-2xl font-extrabold text-slate-900">
          Create your business workspace
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          Already registered? <a routerLink="/login" class="text-indigo-600 hover:text-indigo-500 font-semibold">Sign in here</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          <div *ngIf="errorMessage" class="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <span class="font-bold">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- User Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                <input type="text" [(ngModel)]="fullName" name="fullName" required placeholder="e.g. Ramesh Kumar"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input type="tel" [(ngModel)]="phone" name="phone" placeholder="+91 9876543210"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" [(ngModel)]="email" name="email" required placeholder="owner@store.in"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Password (min 8 chars)</label>
                <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••"
                       class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              </div>
            </div>

            <!-- Business Info -->
            <div class="pt-2 border-t border-slate-100">
              <label class="block text-xs font-bold text-slate-700 mb-1">Business / Shop Name</label>
              <input type="text" [(ngModel)]="businessName" name="businessName" required placeholder="e.g. Balaji Supermarket & Dry Fruits"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Business Type</label>
                <select [(ngModel)]="businessType" name="businessType"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="RETAIL_KIRANA">Kirana / Grocery Retail</option>
                  <option value="ELECTRICAL">Electrical & Electronics</option>
                  <option value="HARDWARE">Hardware & Sanitaryware</option>
                  <option value="APPAREL">Apparel & Garments</option>
                  <option value="DISTRIBUTOR">FMCG / Wholesale Distributor</option>
                  <option value="SERVICE">Service Business / Repairs</option>
                  <option value="OTHER">Other Small Enterprise</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Initial Operating Mode</label>
                <select [(ngModel)]="operatingMode" name="operatingMode"
                        class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="QUICK_START">Mode A: Quick Start (Daily Cashbook)</option>
                  <option value="DETAILED">Mode B: Detailed ERP (Inventory + Invoices)</option>
                  <option value="SIMULATOR">Mode C: Business Simulator</option>
                </select>
              </div>
            </div>

            <button type="submit" [disabled]="loading"
                    class="w-full mt-4 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="loading" class="animate-spin">⟳</span>
              <span>{{ loading ? 'Creating Workspace...' : 'Launch MarginOS Workspace' }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  phone = '';
  businessName = '';
  businessType: BusinessType = 'RETAIL_KIRANA';
  operatingMode: OperatingMode = 'QUICK_START';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password || !this.businessName) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      phone: this.phone,
      businessName: this.businessName,
      businessType: this.businessType,
      operatingMode: this.operatingMode
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
