import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';

@Component({
  selector: 'admin-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationsComponent implements OnInit {

  invitations$: Observable<Invitation[]>
  
  constructor(private invitationService: InvitationService) { }

  async ngOnInit() {
    this.invitations$ = this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent'));
  }

}
