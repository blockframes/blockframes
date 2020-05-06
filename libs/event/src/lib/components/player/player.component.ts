import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';

declare const jwplayer: any;

@Component({
  selector: 'event-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlayerComponent implements AfterViewInit {

  private player: any;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private eventQuery: EventQuery,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
  ) {}

  async loadScript() {
    return new Promise(res => {
      const id = 'jwplayer-script';

      // check if the script tag already exists
      if (!this.document.getElementById(id)) {
        const script = this.document.createElement('script');
        script.setAttribute('id', id);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', 'https://cdn.jwplayer.com/libraries/lpkRdflk.js');
        document.head.appendChild(script);
        script.onload = () => {
          res();
        }
      } else {
        res(); // already loaded
      }
    });
  }

  async initPlayer(watermarkUrl: string) {
    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const { error, result } = await callDeploy({ eventId: id }).toPromise();

    if (!!error) {
      console.log('ERROR');
    } else {
      this.player = jwplayer('player');
      this.player.setup({
        file: result,
        logo: {
          file: watermarkUrl,
        }
      });
    }
  }

  async ngAfterViewInit() {
    const watermarkUrl = this.authQuery.user.watermark.url;
    await this.loadScript();
    this.initPlayer(watermarkUrl);
  }
}
