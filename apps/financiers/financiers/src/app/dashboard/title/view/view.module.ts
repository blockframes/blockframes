// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
// Blockframes
import { DashboardActionsShellModule } from '@blockframes/movie/dashboard/actions/actions.module';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';
import { OrgAccessModule } from '@blockframes/organization/pipes';
import { UpdateFundingStatusModalModule } from '../update-funding-status-modal/update-funding-status-modal.module';
// Components
import { TitleViewComponent } from './view.component';

const routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'activity',
      pathMatch: 'full'
    },
    {
      path: 'activity',
      loadChildren: () => import('../activity/activity.module').then(m => m.TitleActivityModule),
      data: { animation: 0 }
    },
    {
      path: 'main',
      loadChildren: () => import('@blockframes/movie/dashboard/main/main.module').then(m => m.MovieViewMainModule),
      data: { animation: 0 }
    },
    {
      path: 'production',
      loadChildren: () => import('@blockframes/movie/dashboard/production/production.module').then(m => m.MovieViewProductionModule),
      data: { animation: 1 }
    },
    {
      path: 'artistic',
      loadChildren: () => import('@blockframes/movie/dashboard/artistic/artistic.module').then(m => m.MovieViewArtisticModule),
      data: { animation: 2 }
    },
    {
      path: 'additional',
      loadChildren: () => import('@blockframes/movie/dashboard/additional/additional.module').then(m => m.MovieViewAdditionalModule),
      data: { animation: 3 }
    },
    {
      path: 'financing',
      loadChildren: () => import('@blockframes/campaign/dashboard/financing/financing.module').then(m => m.FinancingModule),
      data: { animation: 4 }
    },
    {
      path: 'campaign',
      loadChildren: () => import('@blockframes/campaign/dashboard/investment/investment.module').then(m => m.InvestmentModule),
      data: { animation: 5 }
    }
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Blockframes
    DashboardTitleShellModule,
    DashboardActionsShellModule,
    OrgAccessModule,
    UpdateFundingStatusModalModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatMenuModule,
    // Route
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
