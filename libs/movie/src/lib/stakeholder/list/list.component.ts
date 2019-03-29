import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'stakeholder-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderListComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
