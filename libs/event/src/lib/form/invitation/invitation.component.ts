import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EventFormShellComponent } from '../shell/shell.component';
import { where } from 'firebase/firestore';
import { Invitation } from '@blockframes/model';

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
    const query = [where('type', '==', 'attendEvent'), where('eventId', '==', this.eventId)]
    this.invitations$ = this.invitationService.valueChanges(query);
  }
}
