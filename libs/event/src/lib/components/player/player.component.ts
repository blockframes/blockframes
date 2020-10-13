import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { MediaService } from '@blockframes/media/+state/media.service';
import { loadJWPlayerScript } from '@blockframes/utils/utils';

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
    private mediaService: MediaService,
    private functions: AngularFireFunctions,
  ) { }

  async initPlayer() {

    const { id } = this.eventQuery.getActive();

    const callDeploy = this.functions.httpsCallable('privateVideo');
    const { error, result } = await callDeploy({ eventId: id }).toPromise();

    if (!!error) {
      // if error is set, result will contain the error message
      throw new Error(result);
    } else {
      const parameters: ImageParameters = {
        auto: 'compress,format',
        fit: 'crop',
      };
      const watermarkRef = this.authQuery.user.watermark;
      if (!watermarkRef) {
        throw new Error('We cannot load video without watermark.');
      }
      const watermarkUrl = await this.mediaService.generateImgIxUrl(watermarkRef, parameters);

      const signedUrl = new URL(result.signedUrl);
      const expires = signedUrl.searchParams.get('exp');
      const timestamp = parseInt(expires, 10); // unix timestamp in seconds
      const millisecondTimestamp = timestamp * 1000; // js timestamp in milliseconds
      const refreshCountdown = millisecondTimestamp - Date.now();

      this.timeout = window.setTimeout(() => window.location.reload(), refreshCountdown);

      this.player = jwplayer('player');
      this.player.setup({
        file: result.signedUrl,
        logo: {
          file: watermarkUrl,
        }
      });
    }
  }

  async ngAfterViewInit() {
    await loadJWPlayerScript(this.document);
    this.initPlayer();
  }

  ngOnDestroy() {
    window.clearTimeout(this.timeout);
  }
}
