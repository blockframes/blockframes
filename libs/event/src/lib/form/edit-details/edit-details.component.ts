import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { EventForm } from '../event.form';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { InvitationService } from '@blockframes/invitation/+state';
import { Intercom } from 'ng-intercom';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { EventService } from '@blockframes/event/+state';
import { AccessibilityTypes } from '@blockframes/utils/static-model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: '[form] event-details-edit',
  templateUrl: 'edit-details.component.html',
  styleUrls: ['./edit-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  @Input() form: EventForm;
  @Input() @boolean showPrivacy = false;
  @ViewChild('noAccessibilityChange') noAccessibilityChange: TemplateRef<any>;
  private sub: Subscription;
  appName: string = appName[getCurrentApp(this.route)];
  private previouslySavedAccessibility: AccessibilityTypes;

  constructor(
    private route: ActivatedRoute,
    private invitationService: InvitationService,
    private eventService: EventService,
    private dialog: MatDialog,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    if (this.showPrivacy) {
      this.sub = this.eventService.valueChanges(this.form.value.id).subscribe(e => {
        this.previouslySavedAccessibility = e.accessibility;
      });
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  async accessibilityChanged(e) {
    if (this.previouslySavedAccessibility !== 'private' && e.value === 'private') {
      const invitations = await this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', this.form.value.id));

      if (invitations.length) {
        this.form.patchValue({ accessibility: this.previouslySavedAccessibility });

        const dialogRef = this.dialog.open(this.noAccessibilityChange, {
          width: '80%',
          minWidth: '50vw',
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe(contactTeam => {
          if (contactTeam) {
            this.intercom.show();
          }
        });
        return;
      }
    }
  }
}