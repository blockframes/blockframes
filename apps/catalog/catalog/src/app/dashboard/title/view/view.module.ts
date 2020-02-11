import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { TitleViewComponent } from './view.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

// Guards
import { MovieContractListGuard } from '@blockframes/contract/contract/guards/movie-contract-list.guard';
import { MovieOrganizationListGuard } from '@blockframes/movie/movie/guards/movie-organization-list.guard';
import { ContractsDealListGuard } from '@blockframes/movie/distribution-deals/guards/contracts-deal-list.guard';

const routes = [{
  path: '',
  canActivate: [MovieContractListGuard],
  canDeactivate: [MovieContractListGuard],
  component: TitleViewComponent,
  children: [
    {
      path: '',
      redirectTo: 'sales',
      pathMatch: 'full'
    },
    {
      path: 'sales',
      loadChildren: () => import('../sales/sales.module').then(m => m.TitleSalesModule)
    },
    {
      path: 'details',
      loadChildren: () => import('../details/details.module').then(m => m.TitleDetailsModule)
    },
    {
      path: 'avails',
      canActivate: [MovieOrganizationListGuard, ContractsDealListGuard],
      canDeactivate: [MovieOrganizationListGuard, ContractsDealListGuard],
      loadChildren: () => import('../avails/avails.module').then(m => m.TitleAvailsModule)
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
    // Material
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    // Routes
    RouterModule.forChild(routes)
  ]
})
export class TitleViewModule {}
