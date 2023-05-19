// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Pages
import { WaterfallDemoComponent } from './waterfall-demo.component';

@NgModule({
  declarations: [WaterfallDemoComponent],
  imports: [
    CommonModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallDemoComponent }]),
  ],
})
export class WaterfallDemoModule { }
