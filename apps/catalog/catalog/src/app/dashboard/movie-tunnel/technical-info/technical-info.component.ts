import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
    selector: 'catalog-tunnel-technical-info',
    templateUrl: './technical-info.component.html',
    styleUrls: ['./technical-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelTechnicalInfoComponent {
    form = this.tunnel.form;

    constructor(private tunnel: MovieTunnelComponent) { }

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