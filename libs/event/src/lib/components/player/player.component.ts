import { Component, ChangeDetectionStrategy, AfterViewInit, Inject, ViewEncapsulation, HostBinding, OnInit } from '@angular/core';
import { EventQuery } from '../../+state/event.query';
import { AngularFireFunctions } from '@angular/fire/functions';
import { DOCUMENT } from '@angular/common';
import { AuthQuery } from '@blockframes/auth/+state';
import { MovieQuery, Movie } from '@blockframes/movie/+state';
import { OrganizationQuery, Organization } from '@blockframes/organization/+state';

declare const jwplayer: any;

@Component({
  selector: 'event-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  encapsulation: ViewEncapsulation.None, // We use `None` because we need to override the nested jwplayer css
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventPlayerComponent implements AfterViewInit, OnInit {

  private player: any;
  @HostBinding('style.background-image') background: string;
  public movie: Movie;
  public org: Organization;
  public event = this.eventQuery.getActive();
  public showSession = false;
  public showVideo = true;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private eventQuery: EventQuery,
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private functions: AngularFireFunctions,
  ) {}

  ngOnInit() {
    this.movie = this.movieQuery.getEntity(this.event.meta.titleId);
    this.org = this.orgQuery.getEntity(this.event.ownerId);
    this.background = `url(${this.movie.promotionalElements.banner.media.url})`;
  }

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
    const watermarkUrl = this.authQuery.user.watermark.urls.original;
    await this.loadScript();
  }

  playVideo() {
    this.showSession = true;
    this.showVideo = false;
    const watermarkUrl = this.authQuery.user.watermark.url;
    this.initPlayer(watermarkUrl);
    return;
  }
}
