import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Stakeholder, StakeholderService } from '../+state';

@Component({
  selector: 'stakeholder-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderViewComponent implements OnInit {
  public stakeholders$: Observable<Stakeholder[]>;

  constructor(private service: StakeholderService) { }

  ngOnInit() {
    this.stakeholders$ = this.service.subscribeOnStakeholdersByActiveMovie$();
  }
}
