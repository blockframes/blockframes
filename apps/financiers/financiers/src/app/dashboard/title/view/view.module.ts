// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';
import { DashboardActionsShellModule } from '@blockframes/movie/dashboard/actions/actions.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OrgAccessModule } from '@blockframes/organization/pipes';
import { MatMenuModule } from '@angular/material/menu';

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
    // Material
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatMenuModule,
    // Route
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
