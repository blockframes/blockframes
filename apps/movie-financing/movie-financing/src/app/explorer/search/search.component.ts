import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerSearchComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }

}
