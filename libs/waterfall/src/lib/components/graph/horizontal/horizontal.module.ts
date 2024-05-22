
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallGraphHorizontalComponent } from './horizontal.component';

// Blockframes
import { WaterfallGraphRightModule } from '../right/right.module';
import { WaterfallGraphVerticalModule } from '../vertical/vertical.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ WaterfallGraphHorizontalComponent ],
  imports: [
    CommonModule,

    WaterfallGraphRightModule,
    WaterfallGraphVerticalModule,

    MatButtonModule,
  ],
  exports: [ WaterfallGraphHorizontalComponent ],
})
export class WaterfallGraphHorizontalModule {}
