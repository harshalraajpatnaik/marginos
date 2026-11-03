import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <!-- Navbar -->
      <app-navbar (toggleSidebar)="sidebarOpen = !sidebarOpen"></app-navbar>

      <!-- Main Shell -->
      <div class="flex-1 flex">
        <!-- Sidebar Navigation -->
        <app-sidebar [isOpen]="sidebarOpen" (close)="sidebarOpen = false"></app-sidebar>

        <!-- Main Content Area -->
        <main class="flex-1 lg:pl-64 min-w-0 flex flex-col transition-all">
          <div class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <router-outlet></router-outlet>
          </div>

          <!-- Footer -->
          <footer class="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
              <div>
                <strong>MarginOS</strong> — The Financial Operating System for Indian Businesses.
              </div>
              <div class="flex items-center gap-4 text-[11px]">
                <a routerLink="/pricing-calculator" class="hover:text-indigo-600">Markup vs Margin</a>
                <span>•</span>
                <a routerLink="/api-keys" class="hover:text-indigo-600">Developer APIs</a>
                <span>•</span>
                <span class="text-emerald-600 font-medium">All Calculations Strictly in INR (₹)</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  `
})
export class AppLayoutComponent {
  sidebarOpen = false;
}
