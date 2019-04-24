import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-team-work-item',
  templateUrl: './delivery-team-work-item.component.html',
  styleUrls: ['./delivery-team-work-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkItemComponent implements OnInit {
  @Input() stakeholder: Stakeholder;

  constructor() { }

  ngOnInit() {
  }

}
