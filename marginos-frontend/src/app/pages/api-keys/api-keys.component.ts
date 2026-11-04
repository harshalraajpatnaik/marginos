import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { ApiKeyInfo, ApiKeyCreateResult } from '../../models/types';

@Component({
  selector: 'app-api-keys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-xs font-bold border border-slate-700 mb-2">
            <span>Developer Platform</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Workspace API Keys & Integrations</h1>
          <p class="text-xs text-slate-500 mt-1">
            Connect your custom POS machine, WooCommerce, Shopify, or mobile app directly to MarginOS via versioned REST APIs.
          </p>
        </div>

        <button (click)="showCreateModal = true" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
          <span>+</span>
          <span>Generate API Key</span>
        </button>
      </div>

      <!-- Raw Key Created Alert Modal -->
      <div *ngIf="createdKeyResult" class="p-6 rounded-2xl bg-indigo-900 text-white shadow-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🔑</span>
            <h3 class="text-base font-extrabold">API Key Generated Successfully</h3>
          </div>
          <button (click)="createdKeyResult = null" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="p-4 rounded-xl bg-slate-950 border border-indigo-400/30 flex items-center justify-between gap-4">
          <code class="font-mono text-xs text-emerald-400 select-all break-all">{{ createdKeyResult.rawApiKey }}</code>
          <button (click)="copyRawKey(createdKeyResult.rawApiKey)"
                  class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold whitespace-nowrap shadow-xs">
            {{ copied ? 'Copied!' : 'Copy Key' }}
          </button>
        </div>

        <p class="text-xs text-amber-300 font-semibold">
          ⚠️ Copy this key now! For cryptographic security, only its SHA-256 hash is stored in our database. It will never be displayed again.
        </p>
      </div>

      <!-- Create Key Modal -->
      <div *ngIf="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">Create Scoped API Key</h3>
            <button (click)="showCreateModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Key Name / Identifier</label>
            <input type="text" [(ngModel)]="keyName" placeholder="e.g. Counter POS Terminal #1"
                   class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Permission Role</label>
            <select [(ngModel)]="keyRole" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold">
              <option value="ADMIN">ADMIN — Full read and write access</option>
              <option value="STAFF">STAFF — Sales and billing access</option>
              <option value="VIEWER">VIEWER — Read-only analytics</option>
            </select>
          </div>

          <div class="pt-2 flex justify-end gap-2">
            <button (click)="showCreateModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="submitCreateKey()" [disabled]="creating || !keyName"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ creating ? 'Generating...' : 'Generate Key' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Active Keys Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-xs text-slate-800 uppercase tracking-wider">Active Workspace API Keys</h3>
          <span class="text-xs text-slate-400">{{ keysList.length }} Keys</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">Key Name</th>
                <th class="p-3">Masked Token</th>
                <th class="p-3">Role</th>
                <th class="p-3">Status</th>
                <th class="p-3">Created</th>
                <th class="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let k of keysList" class="hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-900">{{ k.name }}</td>
                <td class="p-3 font-mono text-indigo-700">{{ k.maskedToken }}</td>
                <td class="p-3 font-semibold">{{ k.role }}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="k.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'">
                    {{ k.active ? 'Active' : 'Revoked' }}
                  </span>
                </td>
                <td class="p-3 text-slate-500">{{ k.createdAt | date:'mediumDate' }}</td>
                <td class="p-3 text-center">
                  <button *ngIf="k.active" (click)="revokeKey(k.id)" class="text-rose-600 hover:text-rose-800 font-bold text-xs">
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Developer Integration Code Example -->
      <div class="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span>💻</span>
            <span>cURL Integration Quickstart</span>
          </h3>
          <span class="text-[11px] text-slate-400">Header: X-API-Key</span>
        </div>

        <pre class="bg-slate-950 p-4 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
# 1. Fetch live cash position
curl -X GET "http://localhost:8080/api/v1/dashboard/summary" &#92;
     -H "X-API-Key: mk_live_YOUR_API_KEY_HERE"

# 2. Submit sales transaction from POS
curl -X POST "http://localhost:8080/api/v1/sales/quick-counter-sale" &#92;
     -H "X-API-Key: mk_live_YOUR_API_KEY_HERE" &#92;
     -H "Content-Type: application/json" &#92;
     -d '{{"{"}}"totalAmount": 450.00, "paymentMode": "UPI", "notes": "POS Counter 1"{{"}"}}'</pre>
      </div>
    </div>
  `
})
export class ApiKeysComponent implements OnInit {
  keysList: ApiKeyInfo[] = [];
  showCreateModal = false;
  creating = false;
  keyName = '';
  keyRole = 'ADMIN';

  createdKeyResult: ApiKeyCreateResult | null = null;
  copied = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadKeys();
  }

  loadKeys(): void {
    this.apiService.getApiKeys().subscribe(list => this.keysList = list);
  }

  submitCreateKey(): void {
    this.creating = true;
    this.apiService.createApiKey(this.keyName, this.keyRole).subscribe({
      next: (res) => {
        this.creating = false;
        this.showCreateModal = false;
        this.createdKeyResult = res;
        const newK: ApiKeyInfo = {
          id: res.id,
          name: res.name,
          maskedToken: res.maskedToken,
          role: res.role,
          active: true,
          createdAt: new Date().toISOString()
        };
        this.keysList = [newK, ...this.keysList];
        this.keyName = '';
        this.loadKeys();
      },
      error: () => this.creating = false
    });
  }

  revokeKey(id: string): void {
    if (!confirm('Are you sure you want to revoke this API key? External systems using it will be blocked immediately.')) return;
    this.apiService.revokeApiKey(id).subscribe({
      next: () => this.loadKeys()
    });
  }

  copyRawKey(key: string): void {
    navigator.clipboard.writeText(key);
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }
}
