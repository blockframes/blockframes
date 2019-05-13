import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CANNE_DATA } from '../../canne-data';

// TODO: define this type completely and move it to a regular lib / model definition.
export interface FinancingMovie {
  id: string;
  title: string;
  minTokensRequired: number;
  logline: string;
  principalInformations: any; // TBD, we'll probably flatten the model in firestore
  artistic: any; // TBD, we'll probably flatten...
  finance: any; // TBD
  waterfall: any; // TBD
  sales: any; // TBD
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
