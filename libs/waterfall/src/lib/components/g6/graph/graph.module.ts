import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ForModule } from '@rx-angular/template/for';
import { IfModule } from '@rx-angular/template/if';

// Antv-g6
import { G6GraphModule, G6_GRAPH_OPTIONS } from 'ng-antv-g6';
import { graphOptions } from './../utils';

// Component
import { GraphComponent } from './graph.component';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

// Blockframes
import { StateReaderModule } from '../../state-reader/state-reader.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ForModule,
    IfModule,
    G6GraphModule,
    MatButtonModule,
    MatIconModule,
    StateReaderModule
  ],
  declarations: [GraphComponent],
  exports: [GraphComponent],
  providers: [{
    provide: G6_GRAPH_OPTIONS,
    useValue: graphOptions
  }],
})
export class GraphModule { }