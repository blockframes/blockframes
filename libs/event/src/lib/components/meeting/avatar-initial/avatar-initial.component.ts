import {Component, Input, OnInit} from '@angular/core';
import {IParticipantMeeting} from "@blockframes/event/components/meeting/+state/meeting.interface";

@Component({
  selector: '[participant] event-meeting-avatar-initial',
  templateUrl: './avatar-initial.component.html',
  styleUrls: ['./avatar-initial.component.css']
})
export class AvatarInitialComponent implements OnInit {

  @Input() participant: IParticipantMeeting

  constructor() { }

  ngOnInit(): void {
  }

}
