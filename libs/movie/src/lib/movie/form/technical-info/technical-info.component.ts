import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-technical-info',
  templateUrl: './technical-info.component.html',
  styleUrls: ['./technical-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormTechnicalInfoComponent {
  form = this.shell.getForm('movie');

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Technical Specifications')
  }

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
