import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { Movie, Waterfall } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { joinWith } from 'ngfire';

@Component({
  selector: 'crm-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  public waterfalls$?: Observable<(Waterfall & { movie?: Movie })[]>;

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.waterfalls$ = this.waterfallService.valueChanges()
      .pipe(
        joinWith({
          movie: (waterfall) => this.movieService.valueChanges(waterfall.id),
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  goToEdit(waterfall: (Waterfall & { movie?: Movie })) {
    this.router.navigate([`/c/o/dashboard/crm/waterfall/${waterfall.id}`]);
  }

}
