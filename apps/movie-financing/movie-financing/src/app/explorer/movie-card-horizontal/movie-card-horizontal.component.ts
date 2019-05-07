import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'financing-movie-card-horizontal',
  templateUrl: './movie-card-horizontal.component.html',
  styleUrls: ['./movie-card-horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingMovieCardHorizontalComponent implements OnInit {
  @Input() swapVisual: boolean;

  constructor() {
  }

  ngOnInit() {
  }

}
