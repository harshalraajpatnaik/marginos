import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
          Sign in to your business workspace
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          Or <a routerLink="/register" class="text-indigo-600 hover:text-indigo-500 font-semibold">create a new business account</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          
          <!-- 1-Click Demo Auto-fill Banner -->
          <div class="mb-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-indigo-950">🚀 Test MarginOS Instantly</p>
              <p class="text-[11px] text-indigo-700 mt-0.5">Loads seeded demo store with sample data</p>
            </div>
            <button (click)="fillDemoCredentials()" type="button" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition">
              Fill Demo
            </button>
          </div>

          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <span class="font-bold">⚠️</span>
            <span>{{ errorMessage }}</span>
          </div>

          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Email address</label>
              <input type="email" [(ngModel)]="email" name="email" required
                     placeholder="owner@yourstore.in"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input type="password" [(ngModel)]="password" name="password" required
                     placeholder="••••••••"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
            </div>

            <div class="flex items-center justify-between text-xs">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" class="rounded text-indigo-600 focus:ring-indigo-500">
                <span>Remember me</span>
              </label>
              <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>

            <button type="submit" [disabled]="loading"
                    class="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="loading" class="animate-spin text-base">⟳</span>
              <span>{{ loading ? 'Signing in...' : 'Sign In to Workspace' }}</span>
            </button>
          </form>

          <div class="mt-6 pt-6 border-t border-slate-100 text-center">
            <p class="text-[11px] text-slate-400">
              Demo Credentials: <br>
              <code class="text-slate-600 font-mono">harshal&#64;marginos.internal</code> / <code class="text-slate-600 font-mono">MarginOS&#64;123</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = true;
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  fillDemoCredentials(): void {
    this.email = 'harshal@marginos.internal';
    this.password = 'MarginOS@123';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials or connection error. Please try again.';
      }
    });
  }
}
