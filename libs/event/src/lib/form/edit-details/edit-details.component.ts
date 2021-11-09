import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { EventForm } from '../event.form';
import { appName, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { InvitationService } from '@blockframes/invitation/+state';
import { Intercom } from 'ng-intercom';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: '[form] event-details-edit',
  templateUrl: 'edit-details.component.html',
  styleUrls: ['./edit-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDetailsComponent implements OnInit, OnDestroy {
  @Input() form: EventForm;
  @Input() @boolean displayPrivacySettings = false;
  @ViewChild('noAccessibilityChange', { static: true }) noAccessibilityChange: TemplateRef<any>;
  private dialogSub: Subscription;
  appName: string = appName[getCurrentApp(this.routerQuery)];
  currentAccessibilityValue: string;

  constructor(
    private routerQuery: RouterQuery,
    private invitationService: InvitationService,
    private dialog: MatDialog,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.currentAccessibilityValue = this.form.value.accessibility;
  }

  ngOnDestroy() {
    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
  }

  async radioButtonChanged(e) {
    if (this.currentAccessibilityValue !== 'private' && e.value === 'private') {
      const invitations = await this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', this.form.value.id));

      if (invitations.length) {
        this.form.patchValue({ accessibility: this.currentAccessibilityValue });

        const dialogRef = this.dialog.open(this.noAccessibilityChange, {
          width: '80%'
        });
        this.dialogSub = dialogRef.afterClosed().subscribe(contactTeam => {
          if (contactTeam) {
            this.intercom.show();
          }
        });
        return;
      }
    }
    this.currentAccessibilityValue = e.value;
  }
}