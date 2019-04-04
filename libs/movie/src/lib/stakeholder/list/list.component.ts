import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { StakeholderService } from '../+state/stakeholder.service';
import { Observable } from 'rxjs';
import { Stakeholder } from '../+state/stakeholder.model';


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
