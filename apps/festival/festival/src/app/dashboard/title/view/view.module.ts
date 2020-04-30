// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { DurationModule } from '@blockframes/utils/pipes/duration.pipe';

// Components
import { TitleViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// Guards
import { MovieContractListGuard } from '@blockframes/contract/contract/guards/movie-contract-list.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';

const routes = [{
  path: '',
  canActivate: [MovieContractListGuard],
  canDeactivate: [MovieContractListGuard],
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'details',
      pathMatch: 'full'
    },
    {
      path: 'activity',
      canActivate: [OrganizationContractListGuard],
      canDeactivate: [OrganizationContractListGuard],
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
    TranslateSlugModule,
    DurationModule,
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule { }
