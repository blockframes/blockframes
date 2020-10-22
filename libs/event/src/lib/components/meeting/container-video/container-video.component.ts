import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Event} from "@blockframes/event/+state";

@Component({
  selector: '[event] event-meeting-container-video',
  templateUrl: './container-video.component.html',
  styleUrls: ['./container-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContainerVideoComponent {

  //Input event meeting
  @Input() event: Event;


  //Here only for the test we delete that later (with the next pr)
  participants: any = [
    {
      identity: 'iIdentityTest1',
      isDominantSpeaker: false,
      isLocalSpeaker: false,
      twilioData: null,
      festivalData: {
        firstName: 'firstName1',
        lastName: 'lastName1',
        organizationName: 'organizationName1',
        avatar: 'avatar1'
      }
    },
    {
      identity: 'iIdentityTest2',
      isDominantSpeaker: false,
      isLocalSpeaker: false,
      twilioData: null,
      festivalData: {
        firstName: 'firstName2',
        lastName: 'lastName2',
        organizationName: 'organizationName2',
        avatar: 'avatar2'
      }
    }
  ]
}
