import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { premiereType } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'movie-form-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormReviewsComponent {
  form = this.shell.getForm('movie');
  toggleChanged: boolean;
  public premieres = Object.keys(premiereType);

  constructor(private shell: MovieFormShellComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Selections & Reviews');
  }

  onChange() {
    this.toggleChanged = true;
  }

  onClick(group: MatButtonToggleGroup, form: FormControl) {
    // We need to make sure not to set value to undefined in the form, firebase will throw an error
    const value = !this.toggleChanged || typeof group.value === 'undefined' ? ''  : group.value;
    form.setValue(value);
    this.toggleChanged = false;
  }
}
