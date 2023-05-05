// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { GraphComponent } from './graph.component';

// Modules
import { GraphModule as G6GrapModule } from '../../waterfall/components/g6/graph/graph.module';

@NgModule({
  declarations: [GraphComponent],
  imports: [
    CommonModule,
    G6GrapModule,

    // Routing
    RouterModule.forChild([{ path: '', component: GraphComponent }])
  ]
})
export class GraphModule { }
