import { Component, OnInit, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder, StakeholderService } from '../+state';
import { MovieQuery } from '../../movie/+state';

@Component({
  selector: 'stakeholder-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderItemComponent {
  @Input() stakeholder: Stakeholder;

  constructor(private service: StakeholderService, private movieQuery: MovieQuery,) { }

  public removeStakeholder() {
    this.service.remove(this.movieQuery.getActiveId(), this.stakeholder.id);
  }
}
