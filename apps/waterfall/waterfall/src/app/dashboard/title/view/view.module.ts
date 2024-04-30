// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TitleViewComponent } from './view.component';

// Blockframes
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';


const routes: Routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full'
    },
    {
      path: 'dashboard',
      loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      data: { animation: 0 }
    },
    {
      path: 'statements',
      loadChildren: () => import('../statements/statements.module').then(m => m.StatementsModule),
      data: { animation: 1 }
    },
    {
      path: 'documents',
      loadChildren: () => import('../documents/documents.module').then(m => m.DocumentsModule),
      data: { animation: 2 }
    },
    {
      path: 'waterfall',
      loadChildren: () => import('../waterfall/waterfall.module').then(m => m.WaterfallModule),
      data: { animation: 3 }
    },
    {
      path: 'amortization',
      loadChildren: () => import('../amortization/amortization.module').then(m => m.AmortizationModule),
      data: { animation: 4 }
    },
    {
      path: 'right-holders',
      loadChildren: () => import('../right-holders/right-holders.module').then(m => m.RightHoldersModule),
      data: { animation: 5 }
    },
    {
      path: 'sales',
      loadChildren: () => import('../sales/sales.module').then(m => m.SalesModule),
      data: { animation: 6 }
    },
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Material

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class TitleViewModule { }
