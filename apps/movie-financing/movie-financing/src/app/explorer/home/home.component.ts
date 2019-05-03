import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerHomeComponent implements OnInit {
  config: any;
  fullpage_api: any;

  constructor() {
  }

  getRef(fullPageRef) {
    this.fullpage_api = fullPageRef;
  }

  ngOnInit() {
    this.config = {
      licenseKey: 'YOUR LICENSE KEY HERE',
      anchors: ['1', '2', '3'],
      menu: '#menu'
    };
  }
}
