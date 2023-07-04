import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

import { Movie, Waterfall } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { joinWith } from 'ngfire';

interface CrmWaterfall extends Waterfall {
  movie?: Movie
}

@Component({
  selector: 'crm-waterfalls',
  templateUrl: './waterfalls.component.html',
  styleUrls: ['./waterfalls.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallsComponent implements OnInit {
  public waterfalls$?: Observable<CrmWaterfall[]>;

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

  goToEdit(waterfall: CrmWaterfall) {
    this.router.navigate([`/c/o/dashboard/crm/waterfall/${waterfall.id}`]);
  }

}
