// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';

const routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'main',
      pathMatch: 'full'
    },
    {
      path: 'main',
      loadChildren: () => import('@blockframes/movie/dashboard/main/main.module').then(m => m.MovieViewMainModule),
      data: { animation: 0 }
    },
    {
      path: 'artistic',
      loadChildren: () => import('@blockframes/movie/dashboard/artistic/artistic.module').then(m => m.MovieViewArtisticModule),
      data: { animation: 1 }
    },
    {
      path: 'production',
      loadChildren: () => import('@blockframes/movie/dashboard/production/production.module').then(m => m.MovieViewProductionModule),
      data: { animation: 2 }
    },
    {
      path: 'financial-details',
      loadChildren: () => import('../financial-details/financial-details.module').then(m => m.MovieViewFinancialDetailModule),
      data: { animation: 3 }
    },
    {
      path: 'financing',
      loadChildren: () => import('@blockframes/campaign/dashboard/financing/financing.module').then(m => m.FinancingModule),
      data: { animation: 3 }
    },
    {
      path: 'campaign',
      loadChildren: () => import('@blockframes/campaign/dashboard/investment/investment.module').then(m => m.InvestmentModule),
      data: { animation: 4 }
    }
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Blockframes
    DashboardTitleShellModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDividerModule,
    // Route
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
