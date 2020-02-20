import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DealViewComponent } from './view.component';

// Module components
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { TranslateSlugModule } from '@blockframes/utils/pipes/translate-slug.module';
import { RightListModule } from '@blockframes/movie/distribution-deals/components/right-list/right-list.module';

// Guard
import { MovieContractGuard } from '@blockframes/movie/movie/guards/movie-contract.guard';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [DealViewComponent],
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    TranslateSlugModule,
    RightListModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,

    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        canActivate: [MovieContractGuard],
        canDeactivate: [MovieContractGuard],
        component: DealViewComponent
      }
    ])
  ]
})
export class DealViewModule {}
