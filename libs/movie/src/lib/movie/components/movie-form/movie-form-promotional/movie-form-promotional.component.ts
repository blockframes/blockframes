import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieForm } from '../movie.form';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { UrlControl, StringControl } from '@blockframes/utils';

@Component({
  selector: 'movie-form-promotional',
  templateUrl: './movie-form-promotional.component.html',
  styleUrls: ['./movie-form-promotional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormPromotionalComponent {

  public formGroup = new FormGroup({
    label: new StringControl(''),
    url: new UrlControl('')
  })

  constructor(public form: MovieForm) {
   }

   public submit() {
     console.log(this.formGroup);
   }
}
