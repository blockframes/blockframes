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

    get soundFormat() {
        return this.form.get('soundFormat');
    }

    get quality() {
        return this.form.get('formatQuality');
    }

    get color() {
        return this.form.get('color');
    }

    get format() {
        return this.form.get('format');
    }
}
