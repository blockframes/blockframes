import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventForm } from '../../form/event.form';
import { EventService } from '../../+state/event.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp , applicationUrl} from '@blockframes/utils/apps';

const tabs = {
  screening: [
    { path: 'screening', label: 'Screening' },
    { path: 'invitations', label: 'Invitations' },
    { path: 'attendance', label: 'Attendance' }, //  @TODO #5895 que si event terminé (ou en cours),
  ],
  meeting: [
    { path: 'meeting', label: 'Meeting' },
    { path: 'invitations', label: 'Invitations' },
    { path: 'files', label: 'Files' },
    { path: 'attendance', label: 'Attendance' }, // @TODO #5895 que si event terminé (ou en cours), plus lite que pr screening
  ],
}
@Component({
  selector: 'event-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default  // required for changes on "pristine" for the save button
})
export class EventEditComponent implements OnInit {
  tabs = tabs;
  @Input() form = new EventForm();
  @Input() invitations: Invitation[] = [];
  internalLink: string;
  link: string;

  constructor(
    private service: EventService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private routerQuery: RouterQuery,
  ) { }

  //@TODO #5895 move into shell dir
  ngOnInit() {
    const type = this.form.value.type === 'meeting' ? 'lobby' : 'session';
    this.internalLink = `/c/o/marketplace/event/${this.form.value.id}/${type}`;
    const app = getCurrentApp(this.routerQuery);
    const url = applicationUrl[app];
    this.link = `${url}${this.internalLink}`;
  }

  save() {
    if (this.form.valid && this.form.dirty) {
      const value = this.form.value;
      if (this.form.value.allDay) {
        value.start.setHours(0, 0, 0);
        value.end.setHours(23, 59, 59);
      }
      this.service.update(value);
      this.form.markAsPristine();
    }
  }

  async remove() {
    this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Are you sure you want to delete this event ?',
        question: 'All of the invitations and requests associated to it will be deleted.',
        confirm: 'Delete',
        onConfirm: () => {
          this.service.remove(this.form.value.id);
          this.router.navigate(['../..'], { relativeTo: this.route })
        },
      },
      autoFocus: false,
    })
  }
}
