import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation, OnDestroy, Input } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';
import { ImageParameters } from '@blockframes/media/directives/image-reference/imgix-helpers';
import { MediaService } from '@blockframes/media/+state/media.service';
import { loadJWPlayerScript } from '@blockframes/utils/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

declare const jwplayer: Function;

@Component({
  // ! Warning if you change the selector, be sure to also change it in the .scss
  selector: '[ref] media-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None, // We use `None` because we need to override the nested jwplayer css
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaPlayerComponent implements AfterViewInit, OnDestroy {
  private player: any;
  private timeout: number;

  @Input() ref: string;
  @Input() eventId: string;

  public loading$ = new BehaviorSubject(true);

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authQuery: AuthQuery,
    private mediaService: MediaService,
    private functions: AngularFireFunctions,
    private snackBar: MatSnackBar,
  ) { }

  async initPlayer() {
    try {
      const callDeploy = this.functions.httpsCallable('privateVideo');
      const { error, result } = await callDeploy({ ref: this.ref, eventId: this.eventId }).toPromise();

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
    } catch(error) {
      this.loading$.next(false);
      this.snackBar.open(error, 'close', { duration: 8000 });
    }
  }

  async ngAfterViewInit() {
    await loadJWPlayerScript(this.document);
    this.initPlayer();
  }

  ngOnDestroy() {
    window.clearTimeout(this.timeout);
  }

  refresh() {
    window.location.reload();
  }
}
