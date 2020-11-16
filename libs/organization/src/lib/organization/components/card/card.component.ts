import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { fromOrg, MovieService } from '@blockframes/movie/+state';
import { Organization } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'org-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCardComponent implements OnInit {

  @Input() org: Organization;

  public orgMovieCount$: Observable<number>

  constructor(private movieService: MovieService) { }

  ngOnInit() {
    this.orgMovieCount$ = this.movieService.valueChanges(fromOrg(this.org.id)).pipe(map(movies => movies.length));
  }
}
