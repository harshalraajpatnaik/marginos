import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      <!-- Navbar -->
      <nav class="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-200">
              ₹
            </div>
            <div>
              <span class="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-900 bg-clip-text text-transparent">MarginOS</span>
              <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Financial OS for India</span>
            </div>
          </div>

          <div class="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#problem" class="hover:text-indigo-600 transition">The Problem</a>
            <a href="#modes" class="hover:text-indigo-600 transition">Operating Modes</a>
            <a href="#tools" class="hover:text-indigo-600 transition">MBA Tools</a>
            <a href="#comparison" class="hover:text-indigo-600 transition">Comparison</a>
            <a href="#pricing" class="hover:text-indigo-600 transition">Pricing</a>
          </div>

          <div class="flex items-center gap-3">
            <a routerLink="/login" class="text-sm font-bold text-slate-700 hover:text-indigo-600 px-4 py-2 transition">
              Sign In
            </a>
            <a routerLink="/login" class="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition">
              Explore Demo →
            </a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <section class="relative pt-16 pb-24 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 text-indigo-800 text-xs font-bold tracking-wide uppercase mb-6 border border-indigo-200">
            <span>🚀 Built for Kiranas, Retailers & Indian SMEs</span>
          </div>

          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 max-w-4xl mx-auto leading-tight">
            Stop Guessing Your Profit. <br>
            <span class="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 bg-clip-text text-transparent">Know Your Real Margin.</span>
          </h1>

          <p class="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The first financial operating system combining <strong>double-entry accounting</strong>, <strong>instant shopkeeper daily cashbook</strong>, and <strong>MBA-grade business decision tools</strong>. Designed for Indian business realities.
          </p>

          <!-- CTAs -->
          <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a routerLink="/login" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-2">
              <span>Launch Demo Workspace</span>
              <span>→</span>
            </a>
            <a routerLink="/register" class="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition">
              Create Free Account
            </a>
          </div>

          <!-- Feature Badges -->
          <div class="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div class="flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span> No Bank Integration Required
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span> 3-Click Daily Cash Closing
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span> 1-Click WhatsApp Summary
            </div>
            <div class="flex items-center gap-2">
              <span class="text-emerald-500 font-bold">✓</span> Strict Double-Entry Engine
            </div>
          </div>
        </div>
      </section>

      <!-- 3 Operating Modes Section -->
      <section id="modes" class="py-20 bg-slate-50 border-y border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Adaptive Architecture</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              Three Operating Modes for Every Stage of Business
            </h2>
            <p class="mt-4 text-slate-600">
              Start in 30 seconds with simple daily totals. Transition smoothly to full ERP when ready. Never feel forced into complex accounting upfront.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Mode A -->
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div class="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl mb-6">
                ⚡
              </div>
              <div class="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                Mode A — Quick Start
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">Shopkeeper Cashbook</h3>
              <p class="text-sm text-slate-600 mb-4">
                Designed for busy store owners. Record daily cash, digital sales, and expenses in under 60 seconds without SKU or customer setup.
              </p>
              <ul class="text-xs space-y-2.5 text-slate-600">
                <li class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Theoretical vs Counted Cash Variance
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> 1-Click WhatsApp Daily Closing digest
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-emerald-500 font-bold">✓</span> Customer Udhaar balance tracking
                </li>
              </ul>
            </div>

            <!-- Mode B -->
            <div class="bg-white p-8 rounded-2xl border-2 border-indigo-600 shadow-lg relative">
              <div class="absolute -top-3.5 right-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-extrabold uppercase rounded-full tracking-wider">
                Most Popular
              </div>
              <div class="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl mb-6">
                📊
              </div>
              <div class="inline-block px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                Mode B — Detailed ERP
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">Structured Accounting</h3>
              <p class="text-sm text-slate-600 mb-4">
                Full inventory management, weighted-average costing, GST sales invoices, purchase bills, and double-entry general ledger.
              </p>
              <ul class="text-xs space-y-2.5 text-slate-600">
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span> Weighted-Average Costing (WAVG)
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span> Real-time P&L, Balance Sheet, Trial Balance
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-indigo-600 font-bold">✓</span> Receivables & Payables Aging analysis
                </li>
              </ul>
            </div>

            <!-- Mode C -->
            <div class="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div class="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl mb-6">
                🔮
              </div>
              <div class="inline-block px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                Mode C — Simulator
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-2">MBA Business Simulator</h3>
              <p class="text-sm text-slate-600 mb-4">
                Test expansion ideas before spending a rupee. What happens if you open branch #2, hire staff, or take a bank loan?
              </p>
              <ul class="text-xs space-y-2.5 text-slate-600">
                <li class="flex items-center gap-2">
                  <span class="text-amber-500 font-bold">✓</span> Side-by-side Scenario Modeling
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-amber-500 font-bold">✓</span> DSCR Loan Affordability Calculator
                </li>
                <li class="flex items-center gap-2">
                  <span class="text-amber-500 font-bold">✓</span> Break-even & Runway simulation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- MBA Decision Engine Tools -->
      <section id="tools" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Built-in Intelligence</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              MBA Decision Tools Built for Everyday Business
            </h2>
            <p class="mt-4 text-slate-600">
              Most accounting apps just record history. MarginOS actively guides your pricing, inventory purchases, and borrowing decisions.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-3xl mb-3">🎯</div>
              <h4 class="font-bold text-slate-900 mb-1">Markup vs Margin</h4>
              <p class="text-xs text-slate-600">
                Never confuse 25% markup with 25% margin. Calculate exact selling prices for true targeted profitability.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-3xl mb-3">📈</div>
              <h4 class="font-bold text-slate-900 mb-1">Break-even Engine</h4>
              <p class="text-xs text-slate-600">
                Know the exact units and rupee sales needed to cover monthly fixed costs and achieve your target profit.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-3xl mb-3">🔄</div>
              <h4 class="font-bold text-slate-900 mb-1">Cash Conversion Cycle</h4>
              <p class="text-xs text-slate-600">
                Track DIO, DSO, and DPO. Discover exactly how many days your cash stays locked inside inventory and customer udhaar.
              </p>
            </div>

            <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-3xl mb-3">🏦</div>
              <h4 class="font-bold text-slate-900 mb-1">DSCR Loan Check</h4>
              <p class="text-xs text-slate-600">
                Calculate your Debt Service Coverage Ratio from real operating profits to verify if your business can safely afford a loan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Competitor Comparison Table -->
      <section id="comparison" class="py-20 bg-slate-50 border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="text-xs font-bold uppercase tracking-wider text-indigo-600">Honest Evaluation</span>
            <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-950 mt-2">
              How MarginOS Compares
            </h2>
            <p class="mt-4 text-slate-600">
              See why Indian businesses are adopting MarginOS over traditional tools.
            </p>
          </div>

          <div class="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
            <table class="w-full text-left text-sm">
              <thead class="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-700">
                <tr>
                  <th class="p-4">Capability</th>
                  <th class="p-4 bg-indigo-50 text-indigo-900 font-extrabold">MarginOS</th>
                  <th class="p-4">TallyPrime</th>
                  <th class="p-4">Vyapar / myBillBook</th>
                  <th class="p-4">Khatabook</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 text-slate-600 text-xs">
                <tr>
                  <td class="p-4 font-semibold text-slate-900">3-Click Daily Cashbook Mode</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ Native Mode A</td>
                  <td class="p-4 text-rose-500">✗ Complex Vouchers</td>
                  <td class="p-4 text-slate-500">Partial</td>
                  <td class="p-4 text-emerald-600">✓ Simple Khata</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold text-slate-900">Strict Double-Entry Balanced Engine</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ Debits == Credits</td>
                  <td class="p-4 text-emerald-600">✓ Full Engine</td>
                  <td class="p-4 text-amber-500">Single-entry based</td>
                  <td class="p-4 text-rose-500">✗ No Ledger</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold text-slate-900">Markup vs Margin Calculator</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ Integrated</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold text-slate-900">Mode C Business Simulator (What-if)</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ Built-in</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                  <td class="p-4 text-rose-500">✗ Not Available</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold text-slate-900">WhatsApp Daily Closing Share</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ 1-Click Digest</td>
                  <td class="p-4 text-rose-500">✗ Add-on needed</td>
                  <td class="p-4 text-emerald-600">✓ Invoices only</td>
                  <td class="p-4 text-emerald-600">✓ Reminders only</td>
                </tr>
                <tr>
                  <td class="p-4 font-semibold text-slate-900">Developer REST API & API Keys</td>
                  <td class="p-4 bg-indigo-50/50 text-emerald-600 font-bold">✓ OpenAPI & mk_live</td>
                  <td class="p-4 text-amber-500">XML / ODBC</td>
                  <td class="p-4 text-rose-500">✗ Limited</td>
                  <td class="p-4 text-rose-500">✗ Closed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="py-20 bg-slate-950 text-white text-center">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 class="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Take Control of Your Business Today.
          </h2>
          <p class="text-slate-400 text-lg mb-8">
            Experience MarginOS with our pre-loaded demo store — Gupta Kirana & General Store.
          </p>
          <a routerLink="/login" class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold text-base shadow-lg transition">
            <span>Explore Demo Now</span>
            <span>→</span>
          </a>
        </div>
      </section>
    </div>
  `
})
export class LandingComponent {}
