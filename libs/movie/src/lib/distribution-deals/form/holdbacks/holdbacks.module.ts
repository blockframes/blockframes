import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';
import { DistributionDealHoldbacksComponent } from './holdbacks.component';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Modules
    DistributionDealTermsModule,

    // Material
    MatButtonToggleModule
  ],
  declarations: [DistributionDealHoldbacksComponent],
  exports: [DistributionDealHoldbacksComponent]
})
export class DistributionDealHoldbacksModule { }
