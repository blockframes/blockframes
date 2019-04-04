import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Stakeholder, StakeholderService } from '../+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'stakeholder-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StakeholderListComponent implements OnInit {
  public stakeholders$: Observable<Stakeholder[]>;

  constructor(
    private service: StakeholderService,
  ) { }

  ngOnInit() {
    this.stakeholders$ = this.service.stakeholdersByActiveMovie$;
  }
}
