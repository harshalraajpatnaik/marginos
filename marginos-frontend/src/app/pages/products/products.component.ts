import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Product, Category } from '../../models/types';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <span>Product Catalog</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Products & Pricing</h1>
          <p class="text-xs text-slate-500 mt-1">
            Maintain SKU catalog, barcodes, Weighted-Average unit costs, selling prices, and margin targets.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <a routerLink="/pricing-calculator" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>🧮</span>
            <span>Markup vs Margin</span>
          </a>
          <a routerLink="/purchases" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>📦</span>
            <span>Stock Intake Bill</span>
          </a>
          <a routerLink="/sales" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1">
            <span>⚡</span>
            <span>Sales Invoicing</span>
          </a>
          <button (click)="openAddProduct()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5">
            <span>+</span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <!-- Add/Edit Product Modal -->
      <div *ngIf="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-base font-extrabold text-slate-900">
              {{ editingProduct?.id ? 'Edit Product' : 'Add New Product' }}
            </h3>
            <button (click)="showModal = false" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>

          <div *ngIf="modalError" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            ⚠️ {{ modalError }}
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Product Name</label>
              <input type="text" [(ngModel)]="formProduct.name" placeholder="e.g. Tata Salt 1kg"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
              <input type="text" [(ngModel)]="formProduct.sku" placeholder="e.g. GROC-SALT-01"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold">
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Barcode / EAN</label>
              <input type="text" [(ngModel)]="formProduct.barcode" placeholder="e.g. 8901030383321"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Unit of Measure</label>
              <select [(ngModel)]="formProduct.unitOfMeasure" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
                <option value="PCS">Pieces (Pcs)</option>
                <option value="KG">Kilogram (Kg)</option>
                <option value="GRAM">Gram (g)</option>
                <option value="LITRE">Litre (L)</option>
                <option value="PACKET">Packet (Pkt)</option>
                <option value="BOX">Box / Carton</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">GST Rate (%)</label>
              <select [(ngModel)]="formProduct.taxRate" class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white">
                <option [value]="0">0% (Exempt)</option>
                <option [value]="5">5%</option>
                <option [value]="12">12%</option>
                <option [value]="18">18%</option>
                <option [value]="28">28%</option>
              </select>
            </div>
          </div>

          <!-- Pricing & Margins -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Purchase Cost (WAVG) (₹)</label>
              <input type="number" [(ngModel)]="formProduct.costPrice" (input)="calcMargin()"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Selling Price (₹)</label>
              <input type="number" [(ngModel)]="formProduct.sellingPrice" (input)="calcMargin()"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-indigo-700 bg-white">
            </div>

            <div class="sm:col-span-2 flex items-center justify-between text-xs pt-1">
              <span class="text-slate-500">Target Profit Margin:</span>
              <span class="font-black text-emerald-700 text-sm">{{ previewMargin | number:'1.1-1' }}% Margin</span>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Initial Stock Quantity</label>
              <input type="number" [(ngModel)]="formProduct.currentStock"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Reorder Alert Level</label>
              <input type="number" [(ngModel)]="formProduct.reorderPoint"
                     class="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs">
            </div>
          </div>

          <div class="pt-3 flex justify-end gap-2">
            <button (click)="showModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button (click)="saveProduct()" [disabled]="saving || !formProduct.name"
                    class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition disabled:opacity-50">
              {{ saving ? 'Saving...' : 'Save Product' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <input type="text" [(ngModel)]="searchQuery" placeholder="Search by product name, SKU or barcode..."
               class="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs">
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th class="p-3">SKU / Barcode</th>
                <th class="p-3">Product Name</th>
                <th class="p-3 text-right">Cost Price (WAVG)</th>
                <th class="p-3 text-right">Selling Price</th>
                <th class="p-3 text-center">Gross Margin</th>
                <th class="p-3 text-right">Stock</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              <tr *ngFor="let p of filteredProducts" class="hover:bg-slate-50">
                <td class="p-3">
                  <div class="font-mono text-indigo-700 font-bold">{{ p.sku || '—' }}</div>
                  <div class="font-mono text-[10px] text-slate-400">{{ p.barcode || '' }}</div>
                </td>
                <td class="p-3 font-bold text-slate-900">{{ p.name }}</td>
                <td class="p-3 text-right">₹{{ p.costPrice | number:'1.2-2' }}</td>
                <td class="p-3 text-right font-black text-slate-900">₹{{ p.sellingPrice | number:'1.2-2' }}</td>
                <td class="p-3 text-center">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="getMarginPercent(p) >= 20 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'">
                    {{ getMarginPercent(p) | number:'1.1-1' }}%
                  </span>
                </td>
                <td class="p-3 text-right font-bold">
                  {{ p.currentStock }} {{ p.unitOfMeasure }}
                </td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="p.currentStock <= (p.reorderPoint || 5) ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'">
                    {{ p.currentStock <= (p.reorderPoint || 5) ? 'Low Stock' : 'In Stock' }}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button (click)="openEditProduct(p)" class="text-indigo-600 hover:text-indigo-800 font-bold text-xs p-1">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  searchQuery = '';

  showModal = false;
  saving = false;
  modalError = '';
  editingProduct: Product | null = null;
  previewMargin = 0;

  formProduct: Partial<Product> = {
    name: '',
    sku: '',
    barcode: '',
    unitOfMeasure: 'PCS',
    costPrice: 0,
    sellingPrice: 0,
    currentStock: 10,
    reorderPoint: 5,
    taxRate: 5
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.apiService.getProducts().subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          this.products = list;
        }
      }
    });
  }

  loadCategories(): void {
    this.apiService.getCategories().subscribe({
      next: (list) => this.categories = list
    });
  }

  get filteredProducts(): Product[] {
    if (!this.searchQuery) return this.products;
    const q = this.searchQuery.toLowerCase();
    return this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }

  getMarginPercent(p: Product): number {
    if (!p.sellingPrice || p.sellingPrice <= 0) return 0;
    const profit = p.sellingPrice - (p.costPrice || 0);
    return (profit / p.sellingPrice) * 100;
  }

  calcMargin(): void {
    const cost = Number(this.formProduct.costPrice) || 0;
    const sp = Number(this.formProduct.sellingPrice) || 0;
    if (sp > 0) {
      this.previewMargin = ((sp - cost) / sp) * 100;
    } else {
      this.previewMargin = 0;
    }
  }

  openAddProduct(): void {
    this.editingProduct = null;
    this.modalError = '';
    this.formProduct = {
      name: '',
      sku: '',
      barcode: '',
      unitOfMeasure: 'PCS',
      costPrice: 0,
      sellingPrice: 0,
      currentStock: 10,
      reorderPoint: 5,
      taxRate: 5
    };
    this.calcMargin();
    this.showModal = true;
  }

  openEditProduct(p: Product): void {
    this.editingProduct = p;
    this.modalError = '';
    this.formProduct = { ...p };
    this.calcMargin();
    this.showModal = true;
  }

  saveProduct(): void {
    this.saving = true;
    this.modalError = '';
    if (this.editingProduct && this.editingProduct.id) {
      const prodId = this.editingProduct.id;
      this.apiService.updateProduct(prodId, this.formProduct).subscribe({
        next: () => {
          this.saving = false;
          this.showModal = false;
          this.products = this.products.map(p => p.id === prodId ? { ...p, ...this.formProduct, id: prodId } as Product : p);
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to update product.';
        }
      });
    } else {
      this.apiService.createProduct(this.formProduct).subscribe({
        next: (saved: any) => {
          this.saving = false;
          this.showModal = false;
          const newP: Product = {
            id: saved?.id || 'prod-' + Date.now(),
            name: this.formProduct.name || 'New Product',
            sku: saved?.sku || this.formProduct.sku || 'SKU-' + Date.now().toString().slice(-4),
            barcode: this.formProduct.barcode || '',
            unitOfMeasure: this.formProduct.unitOfMeasure || 'PCS',
            costPrice: Number(this.formProduct.costPrice) || 0,
            sellingPrice: Number(this.formProduct.sellingPrice) || 0,
            currentStock: Number(this.formProduct.currentStock) || 0,
            reorderPoint: Number(this.formProduct.reorderPoint) || 10,
            taxRate: Number(this.formProduct.taxRate) || 0,
            active: true
          };
          this.products = [newP, ...this.products];
          this.loadProducts();
        },
        error: (err) => {
          this.saving = false;
          this.modalError = err.error?.message || 'Failed to create product. Check product name and prices.';
        }
      });
    }
  }
}
