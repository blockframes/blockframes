import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';
import { ImageParameters, getImgIxResourceUrl } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { PublicUser } from '@blockframes/user/types';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserQuery } from '@blockframes/user/+state';

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
  private timeout: number;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private eventQuery: EventQuery,
    private authQuery: AuthQuery,
    private userQuery: UserQuery,
    private db: AngularFirestore,
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

  async initPlayer() {

    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const { error, result } = await callDeploy({ eventId: id }).toPromise();

    if (!!error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    } else {

      const userData = this.userQuery.getEntity(this.authQuery.userId);
      const parameters: ImageParameters = {
        auto: 'compress,format',
        fit: 'crop',
      };
      const watermarkUrl = getImgIxResourceUrl(userData.watermark, parameters);
      if (!watermarkUrl) {
        throw new Error('We cannot load video without watermark.');
      }

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
    await this.loadScript();
    this.initPlayer();
  }

  ngOnDestroy() {
    clearTimeout(this.timeout);
  }
}
