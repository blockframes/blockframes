import { Component, OnInit, HostBinding } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { EventQuery } from '@blockframes/event/+state';
import { OrganizationQuery, Organization } from '@blockframes/organization/+state';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {

  @HostBinding('style.background-image') background: string;
  url: SafeResourceUrl;
  public movie: Movie;
  public org: Organization;
  public event = this.eventQuery.getActive();
  public showSession = false;
  public showVideo = true;


  constructor(
    private sanitizer: DomSanitizer,
    private movieQuery: MovieQuery,
    private eventQuery: EventQuery,
    private orgQuery: OrganizationQuery
    ) { }

  ngOnInit(): void {
    this.movie = this.movieQuery.getEntity(this.event.meta.titleId);
    this.background = `url(${this.movie.promotionalElements.banner.media.url})`;
    this.org = this.orgQuery.getEntity(this.event.ownerId);
    // this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.movie.promotionalElements.screener_link.media.url}`);
    // this.url = this.sanitizer.bypassSecurityTrustResourceUrl(' ');

    //! 2 questions here, if timeBeforeNextScreening > 24h, do we display days and hours ?
    //! second question : when do we switch between not yet page and almost page ?
  }

  playVideo() {
    this.showSession = true;
    this.showVideo = false;
    return;
  }

  timeBeforeNextScreening(date) {
    const milliseconds = Date.parse(date) - Date.now();
    const msInHours = 1000 * 60 * 60;
    const msInMins = 1000 * 60;

    const hours = Math.trunc(milliseconds / msInHours);
    const mins = Math.trunc((milliseconds - (hours*msInHours)) / msInMins);

    return `${hours}h ${mins}mins`;
  }
}
