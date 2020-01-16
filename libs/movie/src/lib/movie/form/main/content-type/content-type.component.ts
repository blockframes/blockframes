import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { default as staticModels } from '../../../static-model/staticModels';
import { MovieMainForm } from '../main.form';


@Component({
  selector: '[form] movie-form-content-type',
  templateUrl: './content-type.component.html',
  styleUrls: ['./content-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentTypeComponent {
  public staticModels = staticModels;
  @Input() form: MovieMainForm;

  get title() {
    return this.form.get('title');
  }
}
