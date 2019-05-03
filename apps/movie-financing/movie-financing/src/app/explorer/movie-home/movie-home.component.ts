import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-movie-home',
  templateUrl: './movie-home.component.html',
  styleUrls: ['./movie-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerMovieHomeComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
