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
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.movie.promotionalElements.screener_link.media.url}`);
  }

  playVideo() {
    return console.log('ah ah ah ');
  }

  timeBeforeNextScreening() {
    return 'ah ah ah !!!';
  }
}
