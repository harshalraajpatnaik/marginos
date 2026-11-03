import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface NavItem {
  title: string;
  path: string;
  icon: string;
  badge?: string;
  modes?: string[]; // Quick start, detailed, simulator
}

interface NavSection {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Mobile Backdrop -->
    <div *ngIf="isOpen" (click)="close.emit()" class="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs"></div>

    <!-- Sidebar Aside -->
    <aside class="fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0"
           [class.-translate-x-full]="!isOpen"
           [class.translate-x-0]="isOpen">
      
      <!-- Brand Header -->
      <div class="h-16 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-950">
        <a routerLink="/dashboard" (click)="close.emit()" class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
            ₹
          </div>
          <div>
            <div class="font-extrabold text-white text-base tracking-tight">MarginOS</div>
            <div class="text-[10px] text-slate-400 font-medium">Financial Operating System</div>
          </div>
        </a>
        <button (click)="close.emit()" class="lg:hidden text-slate-400 hover:text-white p-1">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Active Mode Quick Pill -->
      <div class="px-4 py-3 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full"
                [ngClass]="{
                  'bg-emerald-400 animate-ping': currentMode === 'QUICK_START',
                  'bg-indigo-400': currentMode === 'DETAILED',
                  'bg-amber-400': currentMode === 'SIMULATOR'
                }"></span>
          <span class="text-[11px] font-semibold text-slate-200">
            {{ currentMode === 'QUICK_START' ? 'Mode A: Quick Start' : currentMode === 'DETAILED' ? 'Mode B: Detailed ERP' : 'Mode C: Simulator' }}
          </span>
        </div>
      </div>

      <!-- Navigation Links (Scrollable) -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        <div *ngFor="let section of sections">
          <h3 class="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {{ section.title }}
          </h3>
          <div class="space-y-0.5">
            <a *ngFor="let item of section.items"
               [routerLink]="item.path"
               routerLinkActive="bg-indigo-600 text-white font-semibold"
               (click)="close.emit()"
               class="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition group">
              <div class="flex items-center gap-2.5">
                <span class="text-sm opacity-80 group-hover:opacity-100">{{ item.icon }}</span>
                <span>{{ item.title }}</span>
              </div>
              <span *ngIf="item.badge" class="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {{ item.badge }}
              </span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Bottom User Card / Help -->
      <div class="p-4 border-t border-slate-800 bg-slate-950/60">
        <div class="flex items-center gap-2 text-xs text-slate-400">
          <span class="text-emerald-400 font-bold">●</span>
          <span>PostgreSQL Double-Entry Engine</span>
        </div>
        <div class="text-[10px] text-slate-400 mt-1">₹ INR • Indian Accounting Standard</div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  constructor(public authService: AuthService) {}

  get currentMode(): string {
    return this.authService.activeBusiness()?.operatingMode || 'QUICK_START';
  }

  sections: NavSection[] = [
    {
      title: 'Executive',
      items: [
        { title: 'Dashboard', path: '/dashboard', icon: '⚡' }
      ]
    },
    {
      title: 'Shopkeeper Quick Start',
      items: [
        { title: 'Daily Cashbook & Closing', path: '/cashbook', icon: '📖', badge: 'Mode A' }
      ]
    },
    {
      title: 'Detailed Operations',
      items: [
        { title: 'Sales & POS Billing', path: '/sales', icon: '🧾' },
        { title: 'Purchases & Bills', path: '/purchases', icon: '📦' },
        { title: 'Operating Expenses', path: '/expenses', icon: '💸' },
        { title: 'Products & Pricing', path: '/products', icon: '🏷️' },
        { title: 'Inventory & Valuation', path: '/inventory', icon: '📊', badge: 'WAVG' },
        { title: 'Customer Khata', path: '/customers', icon: '👥' },
        { title: 'Supplier Payables', path: '/suppliers', icon: '🏭' }
      ]
    },
    {
      title: 'Financial Statements',
      items: [
        { title: 'General Ledger & P&L', path: '/accounting', icon: '⚖️', badge: 'Double-Entry' }
      ]
    },
    {
      title: 'MBA Decision Engine',
      items: [
        { title: 'Pricing & Margin Calc', path: '/pricing-calculator', icon: '🎯' },
        { title: 'Break-even Analysis', path: '/breakeven', icon: '📈' },
        { title: 'Working Capital & CCC', path: '/working-capital', icon: '🔄' },
        { title: 'Loan EMI & DSCR', path: '/loan-calculator', icon: '🏦' },
        { title: 'Mode C Scenario Sim', path: '/scenarios', icon: '🔮', badge: 'Mode C' },
        { title: 'Monthly Budgets', path: '/budgets', icon: '📅' }
      ]
    },
    {
      title: 'Platform & Data',
      items: [
        { title: 'AI Financial Advisor', path: '/ai-assistant', icon: '✨' },
        { title: 'Developer API Keys', path: '/api-keys', icon: '🔑' },
        { title: 'CSV Import & Export', path: '/import-export', icon: '📁' },
        { title: 'Workspace Settings', path: '/settings', icon: '⚙️' }
      ]
    }
  ];
}
