import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSliderComponent, MovieSliderActions, MovieSliderCTA } from './slider.component';

// Blockframes
import { SliderModule } from '@blockframes/ui/slider/slider.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { MovieTitleFeaturesModule } from '../title-features/title-features.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,

        // Blockframes
        SliderModule,
        MovieTitleFeaturesModule,
        DisplayNameModule,
        MaxLengthModule
    ],
    declarations: [MovieSliderComponent, MovieSliderActions, MovieSliderCTA],
    exports: [MovieSliderComponent, MovieSliderActions, MovieSliderCTA]
})
export class MovieSliderModule { }