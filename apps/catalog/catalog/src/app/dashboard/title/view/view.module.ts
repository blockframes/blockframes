// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';
import { DashboardActionsShellModule } from '@blockframes/movie/dashboard/actions/actions.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

// Blockframes
import { OrgAccessModule } from '@blockframes/organization/pipes';

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
      data: { animation: 1 }
    },
    {
      path: 'artistic',
      loadChildren: () => import('@blockframes/movie/dashboard/artistic/artistic.module').then(m => m.MovieViewArtisticModule),
      data: { animation: 2 }
    },
    {
      path: 'production',
      loadChildren: () => import('@blockframes/movie/dashboard/production/production.module').then(m => m.MovieViewProductionModule),
      data: { animation: 3 }
    },
    {
      path: 'additional',
      loadChildren: () => import('@blockframes/movie/dashboard/additional/additional.module').then(m => m.MovieViewAdditionalModule),
      data: { animation: 4 }
    },
    {
      path: 'delivery',
      loadChildren: () => import('@blockframes/movie/dashboard/delivery/delivery.module').then(m => m.MovieViewDeliveryModule),
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
    OrgAccessModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
