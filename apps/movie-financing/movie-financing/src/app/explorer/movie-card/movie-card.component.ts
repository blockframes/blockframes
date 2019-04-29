import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'financing-movie-card',
  templateUrl: './movie-card.component.html',
  styleUrls: ['./movie-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingMovieCardComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
