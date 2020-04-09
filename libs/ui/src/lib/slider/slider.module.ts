// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { SliderComponent } from './slider.component';
import { SlideComponent } from './slide/slide.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

// Modules
import { ImageReferenceModule } from '../media';


@NgModule({
   imports: [
      CommonModule,
      ImageReferenceModule,
      MatButtonModule,
      MatIconModule,
      MatRippleModule
   ],
   declarations: [
      SliderComponent,
      SlideComponent
   ],
   exports: [
      SliderComponent,
      SlideComponent
   ]
})
export class SliderModule { }
