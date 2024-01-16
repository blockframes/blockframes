
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { WaterfallPoolListComponent } from './pool-list.component';


@NgModule({
  declarations: [ WaterfallPoolListComponent ],
  imports: [
    CommonModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [ WaterfallPoolListComponent ],
})
export class WaterfallPoolListModule {}
