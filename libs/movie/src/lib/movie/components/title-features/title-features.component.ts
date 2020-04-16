import { Component, Input } from '@angular/core';

interface TitleFeature {
    view: string,
    tooltip: string
}

function createTitleFeatureView(features: Array<string | string[]>): TitleFeature[] {
    return features.map(feature => {
        /* If array, show the first value and the tooltip gets the string version of it */
        if (Array.isArray(feature)) {
            return { view: feature[0], tooltip: feature.join(', ') }
        }
        return { view: feature, tooltip: '' }
    })
}

@Component({
    selector: '[titleFeatures] movie-title-features',
    templateUrl: './title-features.component.html',
    styleUrls: ['./title-features.component.scss']
})
export class MovieTitleFeaturesComponent {
    public features: TitleFeature[];
    @Input() set titleFeatures(features: Array<string | string[]>) {
        this.features = createTitleFeatureView(features);
    };
}