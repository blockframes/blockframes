import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { MovieSlideComponent, MovieSlideActions, MovieSlideCTA } from './slide.component';

// Blockframes
import { MovieTitleFeaturesModule } from '../title-features/title-features.module';
import { TruncateStringModule } from '@blockframes/utils/pipes/truncate-string.pipe';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        // Blockframes
        MovieTitleFeaturesModule,
        TruncateStringModule
    ],
    declarations: [MovieSlideComponent, MovieSlideActions, MovieSlideCTA],
    exports: [MovieSlideComponent, MovieSlideActions, MovieSlideCTA]
})
export class MovieSlideModule { }
