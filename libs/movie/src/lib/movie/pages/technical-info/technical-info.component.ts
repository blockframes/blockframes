import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
    selector: 'movie-form-technical-info',
    templateUrl: './technical-info.component.html',
    styleUrls: ['./technical-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormTechnicalInfoComponent {
    form = this.shell.form;

    constructor(private shell: MovieFormShellComponent) { }

    get movieSalesInfo() {
        return this.form.get('salesInfo');
    }

    get movieVersionInfo() {
        return this.form.get('versionInfo').get('languages');
    }

    get movieOriginalLanguages() {
        return this.form.get('main').get('originalLanguages');
    }
}
