import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventEditComponent } from '@blockframes/event/layout/edit/edit.component';

@Component({
  selector: 'event-invitation-details',
  templateUrl: './invitation-details.component.html',
  styleUrls: ['./invitation-details.component.scss'],
  animations: [slideUpList('h2, mat-card')], // @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationDetailsComponent implements OnInit {

  invitations$: Observable<Invitation[]>;

  constructor(
    private invitationService: InvitationService,
    private dynTitle: DynamicTitleService,
    private shell: EventEditComponent,
  ) { }

  get eventId() {
    return this.shell.form.get('id').value;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event invitations');
    this.invitations$ = this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', this.eventId));
  }
}
