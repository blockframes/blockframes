// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Components
import { TitleViewComponent } from './view.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

const routes = [{
  path: '',
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'details',
      pathMatch: 'full'
    },
    {
      path: 'activity',
      loadChildren: () => import('../activity/activity.module').then(m => m.TitleActivityModule)
    },
    {
      path: 'details',
      loadChildren: () => import('../details/details.module').then(m => m.TitleDetailsModule)
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
    // Material
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
