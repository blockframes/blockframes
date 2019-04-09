import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryQuery } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'delivery-stakeholder-item',
  templateUrl: './stakeholder-item.component.html',
  styleUrls: ['./stakeholder-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderItemComponent implements OnInit {
  @Input() stakeholder: Stakeholder;
  public isStakerholderHasSigned$ : Observable<boolean>;

  constructor(
    private query: DeliveryQuery,
  ) { }

  ngOnInit() {
    console.log(this.stakeholder)
    this.isStakerholderHasSigned$ = this.query.isStakerholderHasSigned$(this.stakeholder.id);
  }


}
