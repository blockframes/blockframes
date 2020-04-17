import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChild, OnInit } from '@angular/core';
import { Invitation, InvitationStatus } from '@blockframes/invitation/+state';
import { FormControl } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

function filterGuest(invitation: Invitation, search: string) {
  return invitation.toEmail?.includes(search)
    || invitation.toUser?.email.toLowerCase().includes(search)
    || invitation.toUser?.firstName.toLowerCase().includes(search)
    || invitation.toUser?.lastName.toLowerCase().includes(search)
    || invitation.toOrg?.denomination.full.toLowerCase().includes(search)
    || invitation.toOrg?.denomination.public?.toLowerCase().includes(search)
}

const points: Record<InvitationStatus, number> = {
  accepted: 0,
  declined: 1,
  pending: 2,
};

@Component({
  selector: 'invitation-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestListComponent implements OnInit {
  private _invitations = new BehaviorSubject<Invitation[]>([]);
  searchControl = new FormControl();
  search$: Observable<Invitation[]>;
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;
  @Input() set invitations(invitations: Invitation[]) {
    if (Array.isArray(invitations)) {
      const sorted = invitations.sort((a, b) => points[a.status] - points[b.status]);
      this._invitations.next(sorted);
    }
  }

  ngOnInit() {
    const search$ = this.searchControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      startWith('')
    );
    this.search$ = combineLatest([this._invitations, search$]).pipe(
      map(([invitations, search]) => invitations.filter(guest => filterGuest(guest, search.trim())))
    );
  }

  trackBy(invitation: Invitation) {
    return invitation.id;
  }

}
