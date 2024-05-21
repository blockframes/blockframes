// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CarouselComponent, CarouselItemDirective } from './carousel.component';

// Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,

    // Material
    MatButtonModule,
    MatIconModule
  ],
  exports: [CarouselComponent, CarouselItemDirective],
  declarations: [CarouselComponent, CarouselItemDirective]
})
export class CarouselModule { }
