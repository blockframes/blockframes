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
import { DashboardTitleShellModule } from '@blockframes/movie/dashboard/components/view/shell/shell.module';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.module';

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
      path: 'activity',
      loadChildren: () => import('../activity/activity.module').then(m => m.TitleActivityModule)
    },
    {
      path: 'main',
      loadChildren: () => import('@blockframes/movie/dashboard/components/view/main/main.module').then(m => m.MovieViewMainModule)
    },
    {
      path: 'artistic',
      loadChildren: () => import('@blockframes/movie/dashboard/components/view/artistic/artistic.module').then(m => m.MovieViewArtisticModule)
    },
    {
      path: 'production',
      loadChildren: () => import('@blockframes/movie/dashboard/components/view/production/production.module').then(m => m.MovieViewProductionModule)
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
