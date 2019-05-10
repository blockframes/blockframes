import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-financing-details',
  templateUrl: './financing-details.component.html',
  styleUrls: ['./financing-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerFinancingDetailsComponent implements OnInit {
  @Input() movie: any;

  constructor() {
  }

  ngOnInit() {
  }

}
