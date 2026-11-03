import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';
import { LandingComponent } from './pages/landing/landing.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CashbookComponent } from './pages/cashbook/cashbook.component';
import { SalesComponent } from './pages/sales/sales.component';
import { PurchasesComponent } from './pages/purchases/purchases.component';
import { ExpensesComponent } from './pages/expenses/expenses.component';
import { ProductsComponent } from './pages/products/products.component';
import { InventoryComponent } from './pages/inventory/inventory.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { SuppliersComponent } from './pages/suppliers/suppliers.component';
import { AccountingComponent } from './pages/accounting/accounting.component';
import { PricingCalculatorComponent } from './pages/pricing-calculator/pricing-calculator.component';
import { BreakevenComponent } from './pages/breakeven/breakeven.component';
import { WorkingCapitalComponent } from './pages/working-capital/working-capital.component';
import { LoanCalculatorComponent } from './pages/loan-calculator/loan-calculator.component';
import { ScenariosComponent } from './pages/scenarios/scenarios.component';
import { BudgetsComponent } from './pages/budgets/budgets.component';
import { AiAssistantComponent } from './pages/ai-assistant/ai-assistant.component';
import { ApiKeysComponent } from './pages/api-keys/api-keys.component';
import { ImportExportComponent } from './pages/import-export/import-export.component';
import { SettingsComponent } from './pages/settings/settings.component';

export const routes: Routes = [
  // Public Pages
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Authenticated App Shell
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'cashbook', component: CashbookComponent },
      { path: 'sales', component: SalesComponent },
      { path: 'purchases', component: PurchasesComponent },
      { path: 'expenses', component: ExpensesComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'inventory', component: InventoryComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'suppliers', component: SuppliersComponent },
      { path: 'accounting', component: AccountingComponent },
      { path: 'pricing-calculator', component: PricingCalculatorComponent },
      { path: 'breakeven', component: BreakevenComponent },
      { path: 'working-capital', component: WorkingCapitalComponent },
      { path: 'loan-calculator', component: LoanCalculatorComponent },
      { path: 'scenarios', component: ScenariosComponent },
      { path: 'budgets', component: BudgetsComponent },
      { path: 'ai-assistant', component: AiAssistantComponent },
      { path: 'api-keys', component: ApiKeysComponent },
      { path: 'import-export', component: ImportExportComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
