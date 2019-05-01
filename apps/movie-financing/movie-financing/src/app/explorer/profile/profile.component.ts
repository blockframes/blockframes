import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'financing-explorer-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerProfileComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }

}
