// Angular
import { FormControl, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

// Blockframes
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { RightholderRole, rightholderRoles } from '@blockframes/model';


@Component({
  selector: '[movieId] waterfall-title-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {

  @Input() movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });
  @Input() waterfallForm = new FormControl<RightholderRole[]>([], [Validators.required]);
  @Input() movieId = '';

  rightholderRoles = rightholderRoles;

  addDirector() {
    this.movieForm.directors.add({ firstName: '', lastName: '' });
  }

  removeDirector(index: number) {
    this.movieForm.directors.removeAt(index);
  }
}
