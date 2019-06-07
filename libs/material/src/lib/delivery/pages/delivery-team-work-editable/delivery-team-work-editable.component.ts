import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { DeliveryQuery, Delivery, DeliveryService } from '../../+state';
import { Stakeholder, MovieQuery, Movie } from '@blockframes/movie';

@Component({
  selector: 'delivery-team-work-editable',
  templateUrl: './delivery-team-work-editable.component.html',
  styleUrls: ['./delivery-team-work-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkEditableComponent implements OnInit {
  public delivery$: Observable<Delivery>;
  public movie$: Observable<Movie>;
  public stakeholderId: string;

  constructor(
    private movieQuery: MovieQuery,
    private deliveryQuery: DeliveryQuery,
    private service: DeliveryService,
  ) {}

  ngOnInit() {
    this.delivery$ = this.deliveryQuery.selectActive();
    this.movie$ = this.movieQuery.selectActive();
  }

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }

  public removeStakeholder(stakeholderId: string) {
    this.service.removeStakeholder(stakeholderId);
  }

  public openForm(stakeholder: Stakeholder) {
    this.stakeholderId = stakeholder.id;
  }

  public cancelForm() {
    delete this.stakeholderId;
  }

}
