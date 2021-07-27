import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSlideComponent, MovieSlideActions, MovieSlideCTA } from './slide.component';

// Blockframes
import { MovieTitleFeaturesModule } from '../title-features/title-features.module';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        // Blockframes
        MovieTitleFeaturesModule
    ],
    declarations: [MovieSlideComponent, MovieSlideActions, MovieSlideCTA],
    exports: [MovieSlideComponent, MovieSlideActions, MovieSlideCTA]
})
export class MovieSlideModule { }
