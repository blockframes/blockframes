// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { SliderComponent } from './slider.component';
import { SlideComponent } from './slide/slide.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
   imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule
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
