import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center">₹</div>
            <span class="text-xl font-extrabold text-slate-900">MarginOS</span>
          </div>
          <a routerLink="/" class="text-xs font-bold text-indigo-600 hover:text-indigo-500">← Back to Home</a>
        </div>

        <h1 class="text-2xl font-black text-slate-900">Privacy Policy</h1>
        <p class="text-xs text-slate-500">Last updated: November 2026</p>

        <div class="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 class="text-sm font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            MarginOS collects user registration details (name, email, phone), store profiles (business name, business type, GSTIN, PAN), and business transactions entered manually or imported via CSV.
          </p>

          <h2 class="text-sm font-bold text-slate-900">2. Data Security & Storage</h2>
          <p>
            All user passwords are encrypted using BCrypt / Argon2id with work factor 10. Developer API keys are stored solely as one-way SHA-256 cryptographic hashes. Multi-tenant database rows are partitioned by workspace UUID to prevent unauthorized cross-tenant data leakage.
          </p>

          <h2 class="text-sm font-bold text-slate-900">3. Non-Disclosure & Third-Party Sharing</h2>
          <p>
            We do not sell, rent, or monetize your customer databases, supplier invoices, sales figures, or financial margins to third-party advertisers, credit rating agencies, or data aggregators.
          </p>

          <h2 class="text-sm font-bold text-slate-900">4. Data Export & Portability</h2>
          <p>
            Under our open data portability commitment, you can export your entire product catalog, sales invoices, operating expenses, daily cashbook records, and general ledger trial balance to CSV at any time.
          </p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
