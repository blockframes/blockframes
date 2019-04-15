import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryQuery } from '../+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'delivery-stakeholder-item',
  templateUrl: './stakeholder-item.component.html',
  styleUrls: ['./stakeholder-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderItemComponent implements OnInit {
  @Input() set stakeholder(sh: Stakeholder) {
    this._stakeholder.next(sh);
  }
  private _stakeholder = new BehaviorSubject<Stakeholder>(null);
  public stakeholder$ = this._stakeholder.asObservable();
  public hasStakeholderSigned$ : Observable<boolean>;

  constructor(private query: DeliveryQuery) {}

  ngOnInit() {
    this.hasStakeholderSigned$ = this.stakeholder$.pipe(
      switchMap(({ id }) => this.query.hasStakeholderSigned$(id))
    );
  }

}
