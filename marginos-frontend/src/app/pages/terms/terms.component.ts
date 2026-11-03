import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
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

        <h1 class="text-2xl font-black text-slate-900">Terms of Service</h1>
        <p class="text-xs text-slate-500">Last updated: November 2026</p>

        <div class="space-y-4 text-xs text-slate-700 leading-relaxed">
          <h2 class="text-sm font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MarginOS, you agree to be bound by these Terms of Service. MarginOS provides financial bookkeeping, inventory tracking, MBA decision frameworks, and accounting tools for Indian small businesses.
          </p>

          <h2 class="text-sm font-bold text-slate-900">2. Financial & Tax Disclaimers</h2>
          <p>
            MarginOS is a decision-support and operating bookkeeping platform. While MarginOS calculates double-entry ledgers compliant with Indian Accounting Standards (AS-1, AS-2), it does not constitute formal statutory auditing or Chartered Accountant advice. Users remain responsible for validating tax filings and GST returns with qualified tax professionals.
          </p>

          <h2 class="text-sm font-bold text-slate-900">3. Mode C Simulator Projections</h2>
          <p>
            All financial projections generated under Mode C (Business Simulator) are hypothetical mathematical simulations based on user assumptions and live baseline data. MarginOS does not guarantee business profitability or commercial loan approval from financial institutions.
          </p>

          <h2 class="text-sm font-bold text-slate-900">4. Data Ownership & Security</h2>
          <p>
            You retain 100% ownership of your business data, customer ledgers, supplier transactions, and financial records. MarginOS enforces tenant-level database isolation and cryptographic API key storage.
          </p>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}
