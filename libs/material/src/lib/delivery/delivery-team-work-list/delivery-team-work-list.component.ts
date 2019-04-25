import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryService } from '../+state';

@Component({
  selector: 'delivery-team-work-list',
  templateUrl: './delivery-team-work-list.component.html',
  styleUrls: ['./delivery-team-work-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkListComponent implements OnInit {
  @Input() stakeholders: Stakeholder[];

  constructor(private service: DeliveryService) {}

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }

  public getRandomColor() {
    return '#000000'.replace(/0/g, function() {
      // tslint:disable-next-line: no-bitwise
      return (~~(Math.random() * 16)).toString(16);
    });
  }

  ngOnInit() {}
}
