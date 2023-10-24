// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardWaterfallShellModule } from '@blockframes/waterfall/dashboard/shell/shell.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';


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
      path: 'charts',
      loadChildren: () => import('../charts/charts.module').then(m => m.ChartsModule),
      data: { animation: 4 }
    },
    {
      path: 'sales',
      loadChildren: () => import('../sales/sales.module').then(m => m.SalesModule),
      data: { animation: 5 }
    },
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    // Blockframes
    DashboardWaterfallShellModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatMenuModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class TitleViewModule { }
