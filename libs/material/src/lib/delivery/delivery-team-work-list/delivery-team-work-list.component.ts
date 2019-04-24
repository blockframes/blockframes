import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-team-work-list',
  templateUrl: './delivery-team-work-list.component.html',
  styleUrls: ['./delivery-team-work-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkListComponent implements OnInit {
  @Input() stakeholders: Stakeholder[];

  constructor() { }

  ngOnInit() {
  }

}
