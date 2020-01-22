import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '@blockframes/movie/movieform/main/main.form';

@Component({
  selector: '[main] movie-summary-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieSummaryMainComponent {
  @Input() main: MovieMainForm;

  public get reference() {
    return this.main.get('internalRef');
  }

  public get status() {
    return this.main.get('status');
  }

  public get workType() {
    return this.main.get('workType');
  }

  public get storeType() {
    return this.main.storeConfig.get('storeType');
  }

  public get original() {
    return this.main.title.get('original');
  }

  public get international() {
    return this.main.title.get('international');
  }
}
