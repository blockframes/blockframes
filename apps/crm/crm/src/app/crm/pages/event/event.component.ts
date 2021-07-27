import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EventService } from '@blockframes/event/+state/event.service';
import { Event, isScreening } from '@blockframes/event/+state/event.model';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'crm-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
  public eventId = '';
  public event: Event;
  public movie: Movie;
 
  constructor(
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private eventService: EventService,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
  ) {
  }

  async ngOnInit() {

    this.eventId = this.route.snapshot.paramMap.get('eventId');
    this.event = await this.eventService.getValue(this.eventId);

    if (isScreening(this.event)) {
      const titleId = this.event.meta.titleId;
      if (titleId) {
        try {
          this.movie = await this.movieService.getValue(titleId);
        } catch (err) {
          this.snackBar.open('Error while loading movie', 'close', { duration: 5000 });
        }
      } else {
        this.snackBar.open('No title id defined for this screening event..', 'close', { duration: 5000 });
      }
    }
    this.cdRef.markForCheck();
  }

}
