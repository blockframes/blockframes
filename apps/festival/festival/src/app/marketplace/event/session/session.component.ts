import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService, Event } from '@blockframes/event/+state';
import { pluck, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Screening } from '@blockframes/event/+state/event.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';


@Component({
  selector: 'festival-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SessionComponent implements OnInit {

  public event$: Observable<Event>;
  public showSession = true;
  public mediaContainerSize: string;
  public visioContainerSize: string;
  public screeningFileRef: string;

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
        }
      }),
    );
  }
}
