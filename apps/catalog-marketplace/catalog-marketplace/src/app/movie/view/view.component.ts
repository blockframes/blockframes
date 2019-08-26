import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FireQuery } from '@blockframes/utils';
import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { of, Observable } from 'rxjs';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MovieViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public endRights;

  constructor(
    private fireQuery: FireQuery,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.getMovie();
  }

  private async getMovie() {
    const movieId = this.activatedRoute.snapshot.params['movieId'];
    this.movie$ = of(await this.fireQuery.snapshot<Movie>(`movies/${movieId}`));
    this.movie$.subscribe(data => this.endRights = (data.salesAgentDeal.rightsEnd.to as any).toDate());
  }

  public goToCreateDistribution(movieId: string) {
    this.router.navigateByUrl(`layout/o/catalog/${movieId}/create`);
  }

  get internationalPremiere() {
    let name, year;
    this.movie$.subscribe(data => {
      name = data.salesInfo.internationalPremiere.name;
      year = data.salesInfo.internationalPremiere.year;
    });
    return name !== '' ? `${name}, ${year}` : null;
  }

  get color() {
    let color;
    this.movie$.subscribe(data => (color = data.salesInfo.color));
    return color === 'c' ? 'color' : 'black & white';
  }

  get europeanQualification() {
    let europeanQualification;
    this.movie$.subscribe(data => (europeanQualification = data.salesInfo.europeanQualification));
    return europeanQualification ? 'Yes' : 'No';
  }
}
