import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ViewComponent } from './view.component';

// Module components
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { RightListModule } from '@blockframes/distribution-rights/components/right-list/right-list.module';
import { VersionTableModule } from '@blockframes/contract/version/components';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Guard
import { MovieContractGuard } from '@blockframes/movie/guards/movie-contract.guard';
import { CatalogContractGuard } from '../../../guards/catalog-contract.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

const routes = [
  {
    path: '',
    canActivate: [MovieContractGuard, CatalogContractGuard],
    canDeactivate: [MovieContractGuard],
    component: ViewComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('../negotiation/negotiation.module').then(m => m.NegotiationModule)
      }
    ]
  }
];

@NgModule({
  declarations: [ViewComponent],
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    RightListModule,
    VersionTableModule,
    ToLabelModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,

    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class RightViewModule { }
