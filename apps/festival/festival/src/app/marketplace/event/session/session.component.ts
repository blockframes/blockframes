import { Component, OnInit, HostBinding } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { EventQuery } from '@blockframes/event/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
})
export class SessionComponent implements OnInit {

  @HostBinding('style.background-image') background: string;
  url: SafeResourceUrl;
  public movie: Movie;
  public orgName: string;

  constructor(
    private sanitizer: DomSanitizer,
    private movieQuery: MovieQuery,
    private eventQuery: EventQuery,
    private orgQuery: OrganizationQuery
    ) { }

  ngOnInit(): void {
    // this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/391939808');

    const event = this.eventQuery.getActive();
    this.movie = this.movieQuery.getEntity(event.meta.titleId);
    this.background = `url(${this.movie.promotionalElements.banner.media.url})`;
    this.orgName = this.orgQuery.getEntity(event.ownerId).denomination.public;
  }
}
