import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'catalog-tunnel-technical-info',
    templateUrl: './technical-info.component.html',
    styleUrls: ['./technical-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelTechnicalInfoComponent {
    constructor(public form: MovieForm) { }

    get movieSalesInfo() {
        return this.form.get('salesInfo');
    }

    get movieVersionInfo() {
        return this.form.get('versionInfo');
    }

    get movieOriginalLanguages() {
        return this.form.get('main').get('originalLanguages');
    }
}