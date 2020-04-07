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
import { BackgroundRefModule } from '@blockframes/utils/directives/background-ref.module';

@NgModule({
   imports: [
      CommonModule,
      BackgroundRefModule,
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
