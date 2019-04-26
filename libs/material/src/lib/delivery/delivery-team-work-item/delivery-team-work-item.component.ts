import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { update } from '@datorama/akita';
import { DeliveryService } from '../+state';

@Component({
  selector: 'delivery-team-work-item',
  templateUrl: './delivery-team-work-item.component.html',
  styleUrls: ['./delivery-team-work-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkItemComponent implements OnInit {
  @Input() stakeholder: Stakeholder;
  @Output() update = new EventEmitter();

  constructor(private service: DeliveryService) {}

  public removeStakeholder() {
    this.service.removeStakeholder(this.stakeholder.id);
  }

  public editStakeholder() {
    this.update.emit();
  }

  public getRandomColor() {
    return '#000000'.replace(/0/g, function() {
      // tslint:disable-next-line: no-bitwise
      return (~~(Math.random() * 16)).toString(16);
    });
  }

  ngOnInit() {}
}
