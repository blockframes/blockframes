// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { GraphModule } from '../../../waterfall/components/g6/graph/graph.module';

// Pages
import { WaterfallComponent } from './waterfall.component';

@NgModule({
  declarations: [WaterfallComponent],
  imports: [
    CommonModule,
    GraphModule,

    // Material

    // Routing
    RouterModule.forChild([{ path: '', component: WaterfallComponent }]),
  ],
})
export class WaterfallModule { }
