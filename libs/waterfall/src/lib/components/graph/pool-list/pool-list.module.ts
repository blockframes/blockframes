
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { WaterfallPoolListComponent, CanUpdatePoolPipe } from './pool-list.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [WaterfallPoolListComponent, CanUpdatePoolPipe],
  imports: [
    CommonModule,

    ImageModule,

    MatIconModule,
    MatButtonModule,
  ],
  exports: [WaterfallPoolListComponent],
})
export class WaterfallPoolListModule { }
