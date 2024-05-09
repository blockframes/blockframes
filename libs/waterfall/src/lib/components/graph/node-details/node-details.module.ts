
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WaterfallGraphNodeDetailsComponent } from './node-details.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [WaterfallGraphNodeDetailsComponent],
  imports: [
    CommonModule,

    MatTabsModule
  ],
  exports: [WaterfallGraphNodeDetailsComponent],
})
export class WaterfallGraphNodeDetailsModule { }
