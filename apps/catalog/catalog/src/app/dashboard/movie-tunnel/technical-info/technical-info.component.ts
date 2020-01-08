import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'catalog-tunnel-technical-info',
    templateUrl: './technical-info.component.html',
    styleUrls: ['./technical-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelTechnicalInfoComponent {
    constructor(public movieForm: MovieForm) { }

    get movieSalesInfo() {
        return this.movieForm.get('salesInfo');
    }

    get movieVersionInfo() {
        return this.movieForm.get('versionInfo');
    }
}