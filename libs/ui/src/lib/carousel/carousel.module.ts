// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { CarouselComponent, CarouselItemDirective } from './carousel.component';

// Blockframes
import { MatLayoutModule } from '../layout/layout.module';

// Material
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    ScrollingModule,
    MatLayoutModule,
    
    // Material
    MatButtonModule,
    MatIconModule
  ],
  exports: [CarouselComponent, CarouselItemDirective],
  declarations: [CarouselComponent, CarouselItemDirective]
})
export class CarouselModule { }
