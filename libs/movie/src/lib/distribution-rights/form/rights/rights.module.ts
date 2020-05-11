// Component
import { DistributionRightRightsComponent } from './rights.component';

// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Material
    MatSlideToggleModule,
    MatButtonToggleModule
  ],
  declarations: [DistributionRightRightsComponent],
  exports: [DistributionRightRightsComponent]
})
export class DistributionRightRightsModule {}
