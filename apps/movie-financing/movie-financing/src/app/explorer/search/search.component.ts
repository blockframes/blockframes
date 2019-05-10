import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

export interface FinancingMovie {
  title: string;
  minTokensRequired: number;
}

@Component({
  selector: 'financing-explorer-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerSearchComponent implements OnInit {

  public movies: FinancingMovie[];

  constructor() {
  }

  ngOnInit() {
    this.movies = [
      {title: 'Interstellar', minTokensRequired: 0.01},
      {title: 'Harry Potter', minTokensRequired: 0.02},
      {title: 'The Lord of the Rings: The Fellowship of the Ring', minTokensRequired: 0.2},
      {title: 'Rubber', minTokensRequired: 0.1},
    ];
  }

}
