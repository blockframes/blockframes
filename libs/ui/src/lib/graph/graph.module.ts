
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraphContainerComponent } from './graph.component';

// Angular
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    GraphContainerComponent
  ],
  imports: [
    CommonModule,

    // Material
    MatIconModule,
    MatButtonModule,
  ],
  exports: [
    GraphContainerComponent,
  ],
})
export class BlockframesGraphModule {}