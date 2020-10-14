// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.pipe';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';

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
      path: 'campaign',
      loadChildren: () => import('@blockframes/campaign/dashboard/dashboard.module').then(m => m.DashboardModule),
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
    ImageReferenceModule,
    ToLabelModule,
    TranslateSlugModule,
    DurationModule,
    DashboardTitleShellModule,
    DisplayNameModule,
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
