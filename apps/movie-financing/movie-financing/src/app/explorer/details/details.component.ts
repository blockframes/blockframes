import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'financing-explorer-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerDetailsComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
