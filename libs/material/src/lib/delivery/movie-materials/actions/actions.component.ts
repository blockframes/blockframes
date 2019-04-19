import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'material-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
