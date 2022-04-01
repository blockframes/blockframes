import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChild, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { getGuest } from '../../pipes/guest.pipe';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { algolia } from '@env';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Invitation, InvitationStatus } from '@blockframes/shared/model';

function filterGuest(invitation: Invitation, search: string) {
  return (
    invitation.toUser?.email.toLowerCase().includes(search) ||
    invitation.toUser?.firstName.toLowerCase().includes(search) ||
    invitation.toUser?.lastName.toLowerCase().includes(search) ||
    invitation.fromUser?.email.toLowerCase().includes(search) ||
    invitation.fromUser?.firstName.toLowerCase().includes(search) ||
    invitation.fromUser?.lastName.toLowerCase().includes(search) ||
    invitation.toOrg?.denomination.full.toLowerCase().includes(search) ||
    invitation.toOrg?.denomination.public?.toLowerCase().includes(search)
  );
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
  host: {
    class: 'surface',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestListComponent implements OnInit {
  private _invitations = new BehaviorSubject<Invitation[]>([]);
  userIndex = algolia.indexNameUsers;
  searchControl = new FormControl();
  search$: Observable<Invitation[]>;
  @Input() title: string;

  @ContentChild(TemplateRef) itemTemplate: TemplateRef<unknown>;

  @Input()
  set invitations(invitations: Invitation[]) {
    if (Array.isArray(invitations)) {
      const sorted = invitations.sort((a, b) => points[a.status] - points[b.status]);
      this._invitations.next(sorted);
    }
  }
  get invitations(): Invitation[] {
    return this._invitations.getValue();
  }

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    const search$ = this.searchControl.valueChanges.pipe(debounceTime(200), distinctUntilChanged(), startWith(''));
    this.search$ = combineLatest([this._invitations, search$]).pipe(
      map(([invitations, search]) => invitations.filter(guest => filterGuest(guest, search.trim())))
    );
  }

  copy(invitations: Invitation[]) {
    return invitations.map(i => getGuest(i, 'user').email).join('\n');
  }

  trackBy(invitation: Invitation) {
    return invitation.id;
  }

  copied() {
    this.snackBar.open('Guests emails copied', 'CLOSE', { duration: 4000 });
  }
}
