import { DistributionRightTermsModule } from '../terms/terms.module';
import { DistributionRightHoldbacksComponent } from './holdbacks.component';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

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
    DistributionRightTermsModule,
    ToLabelModule,

    // Material
    MatButtonToggleModule
  ],
  declarations: [DistributionRightHoldbacksComponent],
  exports: [DistributionRightHoldbacksComponent]
})
export class DistributionRightHoldbacksModule { }
