// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';

const routes: Routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'waterfall',
      pathMatch: 'full'
    },
    {
      path: 'waterfall',
      loadChildren: () => import('../waterfall/waterfall.module').then(m => m.WaterfallModule),
      data: { animation: 0 }
    },
    {
      path: 'dashboards',
      loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      data: { animation: 1 }
    },
    {
      path: 'rightholders',
      loadChildren: () => import('../rightholders/rightholders.module').then(m => m.RightholdersModule),
      data: { animation: 2 }
    },
    {
      path: 'permissions',
      loadChildren: () => import('../permissions/permissions.module').then(m => m.PermissionsModule),
      data: { animation: 3 }
    },
    {
      path: 'documents',
      loadChildren: () => import('../documents/documents.module').then(m => m.DocumentsModule),
      data: { animation: 4 }
    },
    {
      path: 'contracts',
      loadChildren: () => import('../contracts/contracts.module').then(m => m.ContractsModule),
      data: { animation: 5 }
    },
    {
      path: 'sources',
      loadChildren: () => import('../sources/sources.module').then(m => m.SourcesModule),
      data: { animation: 6 }
    },
    {
      path: 'rights',
      loadChildren: () => import('../rights/rights.module').then(m => m.RightsModule),
      data: { animation: 7 }
    },
    {
      path: 'statements',
      loadChildren: () => import('../statements/statements.module').then(m => m.StatementsModule),
      data: { animation: 8 }
    },
    {
      path: 'incomes',
      loadChildren: () => import('../incomes/incomes.module').then(m => m.IncomesModule),
      data: { animation: 9 }
    },
    {
      path: 'expenses',
      loadChildren: () => import('../expenses/expenses.module').then(m => m.ExpensesModule),
      data: { animation: 10 }
    },
    {
      path: 'sales',
      loadChildren: () => import('../sales/sales.module').then(m => m.SalesModule),
      data: { animation: 11 }
    },
    {
      path: 'rightholders/:rightholderId',
      loadChildren: () => import('../rightholder/rightholder.module').then(m => m.RightholderModule)
    },
    {
      path: 'documents/:documentId',
      loadChildren: () => import('../document/document.module').then(m => m.DocumentModule)
    },
    {
      path: 'statements/:statementId',
      loadChildren: () => import('../statement/statement.module').then(m => m.StatementModule)
    },
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class WaterfallViewModule { }
