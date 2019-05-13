import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-movie-home',
  templateUrl: './movie-home.component.html',
  styleUrls: ['./movie-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerMovieHomeComponent implements OnInit {
  @Input() movie: any;

  constructor() {
  }

  get progress() {
    // TODO: should go in the movie type
    return this.movie.principalInformations.percentage * 100;
  }

  ngOnInit() {
  }
}
