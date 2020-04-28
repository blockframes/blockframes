import { Component, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'event-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlayerComponent implements AfterViewInit {

  private jwplayer = (window as any).jwplayer;
  private player: any;

  constructor(
    private eventQuery: EventQuery,
    private functions: AngularFireFunctions,
  ) {}

  async ngAfterViewInit() {
    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const result = await callDeploy({ eventId: id }).toPromise();

    console.log(result);

    if (!!result.error) {
      console.log('ERROR');
    } else {
      this.player = this.jwplayer('player');
      this.player.setup({file: result.result});
    }
  }
}
