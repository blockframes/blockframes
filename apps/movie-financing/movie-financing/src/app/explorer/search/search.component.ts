import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CANNE_DATA } from '../../canne-data';

// TODO: define this type completely and move it to a regular lib / model definition.
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
  public movies: FinancingMovie[] = CANNE_DATA;

  constructor() {
  }

  ngOnInit() {
  }

}
