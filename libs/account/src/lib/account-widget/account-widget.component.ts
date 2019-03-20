import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'account-widget',
  templateUrl: './account-widget.component.html',
  styleUrls: ['./account-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountWidgetComponent implements OnInit, OnDestroy {


  constructor() {
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }
}
