import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
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
          Reset your password
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          Enter your registered email and we'll send a secure password reset link.
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div class="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-4">
          <div *ngIf="submitted" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
            <strong>Password Reset Email Sent!</strong> If an account exists for <strong>{{ email }}</strong>, you will receive password reset instructions within 2 minutes. Check your inbox and Mailpit mock server on port 8026.
          </div>

          <form *ngIf="!submitted" (ngSubmit)="onSubmit()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Registered Email Address</label>
              <input type="email" [(ngModel)]="email" name="email" required placeholder="owner@store.in"
                     class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            </div>

            <button type="submit" [disabled]="loading || !email"
                    class="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition disabled:opacity-50">
              {{ loading ? 'Sending link...' : 'Send Reset Link' }}
            </button>
          </form>

          <div class="pt-4 border-t border-slate-100 text-center text-xs">
            <a routerLink="/login" class="font-bold text-indigo-600 hover:text-indigo-500">
              ← Return to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  submitted = false;

  onSubmit(): void {
    if (!this.email) return;
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.submitted = true;
    }, 600);
  }
}
