import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Meeting, MeetingAttendee } from '@blockframes/model';
import { EventService } from '@blockframes/event/+state/event.service';

@Component({
  selector: 'event-doorbell',
  templateUrl: './doorbell.component.html',
  styleUrls: ['./doorbell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoorbellBottomSheetComponent {

  constructor(
    private bottomSheetRef: MatBottomSheetRef<DoorbellBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: { eventId: string, requests: MeetingAttendee[] },
    private eventService: EventService
  ) {}

  async confirm(accepted: boolean, uid: string) {
    const event = await this.eventService.getValue(this.data.eventId);
    const attendees = (event.meta as Meeting).attendees;
    attendees[uid].status = accepted ? 'accepted' : 'denied';
    this.eventService.update(this.data.eventId, { meta: event.meta });
    this.data.requests = this.data.requests.filter(requestor => requestor.uid !== uid);

    if (this.data.requests.length === 0) {
      this.bottomSheetRef.dismiss({ accepted, uid })
    }
  }
}