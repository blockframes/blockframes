import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSliderComponent } from './slider.components';

// Blockframes
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,

        // Blockframes
        SliderModule,
        DisplayNameModule
        
    ],
    declarations: [MovieSliderComponent],
    exports: [MovieSliderComponent]
})
export class MovieSliderModule {}