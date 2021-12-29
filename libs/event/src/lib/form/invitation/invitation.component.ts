import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'event-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  host: {
    class: 'invitations surface'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent implements OnInit {

  invitations$: Observable<Invitation[]>;

  constructor(
    private invitationService: InvitationService,
    private dynTitle: DynamicTitleService,
    public shell: EventFormShellComponent,
  ) { }

  get eventId() {
    return this.shell.form.get('id').value;
  }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event invitations');
    this.invitations$ = this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', this.eventId));
  }
}
