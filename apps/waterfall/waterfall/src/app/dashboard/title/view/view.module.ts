// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';
import { DashboardActionsShellModule } from '@blockframes/movie/dashboard/actions/actions.module';

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
      loadChildren: () => import('../financing-plan/financing-plan.module').then(m => m.FinancingPlanModule),
      data: { animation: 2 }
    },
    {
      path: 'waterfall',
      loadChildren: () => import('../waterfall/waterfall.module').then(m => m.WaterfallModule),
      data: { animation: 3 }
    },
    {
      path: 'avails',
      loadChildren: () => import('../avails/avails.module').then(m => m.AvailsModule),
      data: { animation: 4 }
    },
    {
      path: 'charts',
      loadChildren: () => import('../charts/charts.module').then(m => m.ChartsModule),
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
    DashboardTitleShellModule,
    DashboardActionsShellModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatMenuModule,

    // Routes
    RouterModule.forChild(routes),
  ],
})
export class TitleViewModule { }
