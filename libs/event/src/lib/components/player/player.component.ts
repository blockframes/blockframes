import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';
import { ImageParameters, generateBackgroundImageUrl } from '@blockframes/media/directives/image-reference/imgix-helpers';

type Timeout = NodeJS.Timeout;

declare const jwplayer: any;

@Component({
  selector: 'event-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None, // We use `None` because we need to override the nested jwplayer css
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlayerComponent implements AfterViewInit, OnDestroy {
  private player: any;
  private timeout: Timeout;

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
    if (!watermarkUrl) {
      console.error('We cannot load video without watermark.');
      return;
    }
    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const { error, result } = await callDeploy({ eventId: id }).toPromise();

    if (!!error) {
      console.log('ERROR');
    } else {

      const signedUrl = new URL(result);
      const expires = signedUrl.searchParams.get('exp');
      const timestamp = parseInt(expires, 10); // unix timestamp in seconds
      const millisecondTimestamp = timestamp * 1000; // js timestamp in milliseconds
      const refreshCountdown = millisecondTimestamp - Date.now();

      this.timeout = setTimeout(() => window.location.reload(), refreshCountdown);

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
    const watermarkRef = this.authQuery.user.watermark;
    const parameters: ImageParameters = {
      auto: 'compress,enhance,format',
      fit: 'crop',
    };
    const watermarkUrl = generateBackgroundImageUrl(watermarkRef, parameters);
    await this.loadScript();
    this.initPlayer(watermarkUrl);
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }
}
