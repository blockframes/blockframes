import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-form-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormReviewscComponent {
  form = this.shell.form;

  public prizesColumns = {
    name: 'Name',
    prize: 'Award/Selection',
    year: 'Year',
    premiere: 'Premiere',
  }

  public reviewsColumns = {
    criticName: "Film Critic's Name",
    journalName: 'Journal Name',
    criticQuote: 'Quote',
    revueLink: 'Revue Link',
  }

  public premieres = staticModels['PREMIERE_TYPE'];

  constructor(private shell: MovieFormShellComponent) {}

  get prizes() {
    return this.form.get('prizes');
  }

  get reviews() {
    return this.form.get('review');
  }

}
