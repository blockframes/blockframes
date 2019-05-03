import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'financing-explorer-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinancingExplorerNavbarComponent implements OnInit {
  constructor() {
  }

  ngOnInit() {
  }
}
