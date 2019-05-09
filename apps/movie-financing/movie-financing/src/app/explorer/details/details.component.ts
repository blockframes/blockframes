import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { default as CANNE_DATA }  from '../../canne-data';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent implements OnInit {
  public movie: any;

  constructor() {
    this.movie = CANNE_DATA[0]; //@todo use @input or router param to select good movie
  }

  ngOnInit() {
  }

}
