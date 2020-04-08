import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable } from 'rxjs';
import { Event } from '@blockframes/event/+state/event.model';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@blockframes/user/+state/user.service';
import { OrganizationService } from '@blockframes/organization/organization/+state';

@Component({
  selector: 'admin-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
  public eventId = '';
  public event$: Observable<Event>;
  private event: Event;
  public movie: Movie;
  public moviePrivateConfig: any;
  public eventScreeningUrl: string;
  public eventOwner: string;

  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private eventService: EventService,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private orgService: OrganizationService,
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe(async params => {
      this.eventId = params.eventId;
      this.event$ = this.eventService.syncDoc({ id: this.eventId }).pipe(map(e => {
        this.event = e;
        this.setEventOwner();
        if (this.event.type === 'screening') {
          const titleId = this.event.meta.titleId;
          this.movieService.getValue(titleId as string)
            .then(t => {
              this.movie = t;
              return t;
            })
            .then(movie => this.movieService.getMoviePrivateConfig(movie.id))
            .then(config => {
              if (config !== false) {
                this.moviePrivateConfig = config;
              }
              this.cdRef.markForCheck();
            });
          // @TODO (#2460)  Waiting for a decision on screening flow before uncomment
          /*this.eventService.getEventUrl(this.eventId).then(url => {
            this.eventScreeningUrl = url;
            this.cdRef.markForCheck();
          })*/
        }
        return e;
      }));
    });
  }

  // @TODO (#2460)  Waiting for a decision on screening flow before uncomment
  /*public async setEventUrl() {
    await this.eventService.setEventUrl(this.eventId);
    const eventUrl = await this.eventService.getEventUrl(this.eventId);
    this.snackBar.open(`Information updated: ${eventUrl}`, 'close', { duration: 5000 });
  }*/

  public getMovieTunnelPath(movieId: string) {
    return `/c/o/dashboard/tunnel/movie/${movieId}`;
  }

  public getMovieAdminPath(movieId: string) {
    return `/c/o/admin/panel/movie/${movieId}`;
  }

  public getCalendarPath() {
    return `/c/o/dashboard/event`;
  }

  public async setEventOwner() {
    if (this.event.type === 'screening') { // should be an OrgId if type is screening
      const org = await this.orgService.getValue(this.event.ownerId);
      this.eventOwner = `Organization ${org.denomination.full} ( ${org.id} )`;
    } else {
      const user = await this.userService.getUser(this.event.ownerId);
      this.eventOwner = `User ${user.firstName} ${user.lastName} ( ${user.uid} )`;
    }
  }

}
