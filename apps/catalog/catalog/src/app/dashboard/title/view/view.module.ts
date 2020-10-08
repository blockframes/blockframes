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
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';

// Components
import { TitleViewComponent } from './view.component';
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/shell/shell.module';

// Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    }
  ]
}];

@NgModule({
  declarations: [TitleViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    TranslateSlugModule,
    DurationModule,
    ToLabelModule,
    DashboardTitleShellModule,
    DisplayNameModule,
    // Material
    MatProgressSpinnerModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule {}
