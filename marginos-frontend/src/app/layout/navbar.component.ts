import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Business } from '../models/types';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div class="px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <!-- Left: Mobile Toggle & Brand -->
        <div class="flex items-center gap-3">
          <button (click)="toggleSidebar.emit()" class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <a routerLink="/dashboard" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-100">
              ₹
            </div>
            <div>
              <span class="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">MarginOS</span>
              <span class="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">v1.0 Pro</span>
            </div>
          </a>
        </div>

        <!-- Center: Active Business Selector & Operating Mode -->
        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Business Switcher -->
          <div class="relative" *ngIf="authService.userBusinesses().length > 0">
            <div class="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer transition"
                 (click)="showBizMenu = !showBizMenu">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div class="text-left">
                <p class="text-xs font-bold text-slate-900 leading-none truncate max-w-[140px] sm:max-w-[200px]">
                  {{ authService.activeBusiness()?.name || 'Select Business' }}
                </p>
                <p class="text-[10px] text-slate-500 font-medium">
                  {{ authService.activeBusiness()?.businessType || 'Retail' }}
                </p>
              </div>
              <svg class="w-4 h-4 text-slate-400 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            <!-- Dropdown -->
            <div *ngIf="showBizMenu" class="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div class="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Workspaces</div>
              <button *ngFor="let b of authService.userBusinesses()"
                      (click)="selectBusiness(b)"
                      class="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between"
                      [class.bg-indigo-50]="b.id === authService.activeBusiness()?.id">
                <div>
                  <div class="font-semibold text-slate-800">{{ b.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ b.businessType }} • {{ b.role }}</div>
                </div>
                <span *ngIf="b.id === authService.activeBusiness()?.id" class="text-indigo-600 font-bold text-xs">✓</span>
              </button>
            </div>
          </div>

          <!-- Operating Mode Badge -->
          <div class="relative" *ngIf="authService.activeBusiness() as biz">
            <button (click)="showModeMenu = !showModeMenu" 
                    class="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition border"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700 border-emerald-200': biz.operatingMode === 'QUICK_START',
                      'bg-indigo-50 text-indigo-700 border-indigo-200': biz.operatingMode === 'DETAILED',
                      'bg-amber-50 text-amber-700 border-amber-200': biz.operatingMode === 'SIMULATOR'
                    }">
              <span>
                {{ biz.operatingMode === 'QUICK_START' ? '⚡ Quick Start' : biz.operatingMode === 'DETAILED' ? '📊 Detailed ERP' : '🔮 Simulator' }}
              </span>
              <svg class="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Mode Selector Dropdown -->
            <div *ngIf="showModeMenu" class="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 text-xs">
              <div class="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">Switch Operating Mode</div>
              <button (click)="changeMode('QUICK_START')" class="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex flex-col">
                <span class="font-bold text-slate-800">⚡ Mode A — Quick Start</span>
                <span class="text-[10px] text-slate-500">Fast 3-click cashbook & daily closing</span>
              </button>
              <button (click)="changeMode('DETAILED')" class="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex flex-col mt-1">
                <span class="font-bold text-slate-800">📊 Mode B — Detailed ERP</span>
                <span class="text-[10px] text-slate-500">Full inventory, invoices, and accounting</span>
              </button>
              <button (click)="changeMode('SIMULATOR')" class="w-full text-left p-2 rounded-lg hover:bg-slate-50 flex flex-col mt-1">
                <span class="font-bold text-slate-800">🔮 Mode C — Simulator</span>
                <span class="text-[10px] text-slate-500">What-if scenarios & expansion planning</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: AI Advisor Shortcut, User & Logout -->
        <div class="flex items-center gap-3">
          <a routerLink="/ai-assistant" class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition">
            <span class="text-base leading-none">✨</span>
            <span>AI Advisor</span>
          </a>

          <div class="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div class="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
              {{ authService.currentUser()?.fullName?.charAt(0) || 'U' }}
            </div>
            <div class="hidden sm:block text-left text-xs">
              <div class="font-bold text-slate-800 leading-tight">{{ authService.currentUser()?.fullName || 'User' }}</div>
              <div class="text-[10px] text-slate-500 truncate max-w-[110px]">{{ authService.currentUser()?.email }}</div>
            </div>
            <button (click)="authService.logout()" title="Logout" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  showBizMenu = false;
  showModeMenu = false;

  constructor(public authService: AuthService) {}

  selectBusiness(b: Business): void {
    this.authService.setActiveBusiness(b);
    this.showBizMenu = false;
  }

  changeMode(mode: string): void {
    this.authService.updateOperatingMode(mode).subscribe({
      next: () => {
        this.showModeMenu = false;
      }
    });
  }
}
