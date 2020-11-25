import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from '@blockframes/event/+state';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Meeting, Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit, OnDestroy {

  public event$: Observable<Event>;
  public showSession = true;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

  private event: Event;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,
    private movieService: MovieService
  ) { }

  ngOnInit(): void {
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
      tap(async event => {
        this.event = event;
        if (event.isOwner) {
          this.mediaContainerSize = '40%';
          this.visioContainerSize = '60%';
        } else {
          this.mediaContainerSize = '60%';
          this.visioContainerSize = '40%';
        }

        if (event.type === 'screening') {
          if (!!(event.meta as Screening).titleId) {
            const movie = await this.movieService.getValue(event.meta.titleId as string)
            this.screeningFileRef = movie.promotional.videos?.screener?.ref ?? '';
          }
        } else if (event.type === 'meeting') {
          if (event.isOwner) {
            (event.meta as Meeting).ownerIsPresent = true;
            await this.service.update(event.id, { meta: event.meta });
          }
        }
      }),
    );
  }

  ngOnDestroy() {
    this.ownerLeaves();
  }

  @HostListener('window:beforeunload')
  ownerLeaves() {
    if (this.event.isOwner && this.event.type === 'meeting') {
      (this.event.meta as Meeting).ownerIsPresent = false;
      this.service.update(this.event.id, { meta: this.event.meta });
    }
  }
}
