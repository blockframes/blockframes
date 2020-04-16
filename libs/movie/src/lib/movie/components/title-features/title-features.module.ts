// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';

// Component
import { MovieTitleFeaturesComponent } from './title-features.component';

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,

        // Material
        MatTooltipModule
    ],
    declarations: [MovieTitleFeaturesComponent],
    exports: [MovieTitleFeaturesComponent]
})
export class MovieTitleFeaturesModule { }