// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { SliderComponent } from './slider.component';
import { SlideComponent } from './slide/slide.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';


@NgModule({
   imports: [
      CommonModule,
      FlexLayoutModule,
      ImageModule,
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
