import { DistributionRightTermsModule } from '../terms/terms.module';
import { DistributionRightHoldbacksComponent } from './holdbacks.component';

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

    // Material
    MatButtonToggleModule
  ],
  declarations: [DistributionRightHoldbacksComponent],
  exports: [DistributionRightHoldbacksComponent]
})
export class DistributionRightHoldbacksModule { }
