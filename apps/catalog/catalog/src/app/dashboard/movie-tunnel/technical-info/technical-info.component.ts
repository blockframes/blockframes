import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
    selector: 'catalog-tunnel-technical-info',
    templateUrl: './technical-info.component.html',
    styleUrls: ['./technical-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelTechnicalInfoComponent {
    form = this.tunnel.form;

    constructor(private tunnel: MovieTunnelComponent, private dynTitle: DynamicTitleService) {
        this.dynTitle.setPageTitle('Technial information', 'Title information')
    }

    // get movieSalesInfo() {
    //     return this.form.get('salesInfo');
    // }

    // get movieVersionInfo() {
    //     return this.form.get('versionInfo').get('languages');
    // }

    // get movieOriginalLanguages() {
    //     return this.form.get('main').get('originalLanguages');
    // }
}
