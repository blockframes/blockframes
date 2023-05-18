// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { WaterfallComponent } from './waterfall.component';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
