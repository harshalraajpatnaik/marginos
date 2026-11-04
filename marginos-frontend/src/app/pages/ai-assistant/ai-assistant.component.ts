import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AiExplanationResponse } from '../../models/types';

interface ChatMessage {
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  sources?: string[];
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>✨ Grounded Financial Intelligence</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">AI Financial Advisor</h1>
          <p class="text-xs text-slate-500 mt-1">
            Ask complex accounting and business strategy questions. All explanations are strictly grounded in your live ledger numbers.
          </p>
        </div>
      </div>

      <!-- Quick Prompt Chips -->
      <div class="flex flex-wrap items-center gap-2">
        <button *ngFor="let chip of sampleChips" (click)="askSample(chip)"
                class="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs transition">
          💡 {{ chip }}
        </button>
      </div>

      <!-- Chat Container -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[550px] overflow-hidden">
        <!-- Messages Area -->
        <div class="flex-1 p-6 overflow-y-auto space-y-4">
          <div *ngFor="let msg of messages" class="flex flex-col"
               [ngClass]="msg.sender === 'USER' ? 'items-end' : 'items-start'">
            <div class="max-w-2xl rounded-2xl p-4 text-xs leading-relaxed"
                 [ngClass]="msg.sender === 'USER' ? 'bg-indigo-600 text-white rounded-br-xs' : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'">
              <div class="font-bold mb-1 flex items-center gap-2 text-[10px] opacity-75">
                <span>{{ msg.sender === 'USER' ? 'You' : 'MarginOS Advisor' }}</span>
                <span>•</span>
                <span>{{ msg.timestamp }}</span>
              </div>
              <div class="whitespace-pre-wrap">{{ msg.text }}</div>
              
              <div *ngIf="msg.sources && msg.sources.length > 0" class="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                <strong>Grounded Ledger Sources:</strong> {{ msg.sources.join(', ') }}
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="flex items-center gap-2 text-xs text-slate-400 p-2">
            <span class="animate-spin">⟳</span>
            <span>Analyzing double-entry ledger & computing answer...</span>
          </div>
        </div>

        <!-- Input Bar -->
        <div class="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <input type="text" [(ngModel)]="currentQuery" (keyup.enter)="sendQuery()" placeholder="Ask anything about your cash, profit, margins, or inventory..."
                 class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <button (click)="sendQuery()" [disabled]="loading || !currentQuery.trim()"
                  class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition disabled:opacity-50">
            Send
          </button>
        </div>
      </div>
    </div>
  `
})
export class AiAssistantComponent {
  sampleChips = [
    'How can I become profitable? Give me an MBA turnaround plan.',
    'Why is my cash in hand lower than my net profit this month?',
    'How do I recover pending customer udhaar dues?',
    'What are my slow-moving items and how much capital is locked?',
    'Can I afford to hire a staff helper at ₹12,000/month?',
    'Can my business afford a ₹5,00,000 loan at 12% for 3 years?',
    'What is my break-even monthly and daily sales target?',
    'What price should I charge for 22% margin on ₹85 cost?'
  ];

  messages: ChatMessage[] = [
    {
      sender: 'AI',
      text: 'Namaste! I am your MarginOS Financial Advisor. I have read-only access to your active business ledger, inventory valuation, cashbook closings, and working capital cycle. How can I help you optimize your business margins today?',
      timestamp: 'Just now'
    }
  ];

  currentQuery = '';
  loading = false;

  constructor(private apiService: ApiService) {}

  askSample(chip: string): void {
    this.currentQuery = chip;
    this.sendQuery();
  }

  sendQuery(): void {
    const q = this.currentQuery.trim();
    if (!q) return;

    this.messages.push({
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.currentQuery = '';
    this.loading = true;

    this.apiService.askAiAssistant(q).subscribe({
      next: (res) => {
        this.loading = false;
        this.messages.push({
          sender: 'AI',
          text: res.explanation,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.groundedDataSources
        });
      },
      error: () => {
        this.loading = false;
        this.messages.push({
          sender: 'AI',
          text: 'I could not connect to the financial analysis service right now. Please check backend connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });
  }
}
