import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { AuthQuery } from '@blockframes/auth';
import { Observable } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'movie-financing-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  isLogged$: Observable<boolean>;
  public hasOrgs$: Observable<boolean>;

  constructor(private auth: AuthQuery, private organizationQuery: OrganizationQuery) {}

  ngOnInit() {
    this.hasOrgs$ = this.organizationQuery.hasOrgs$;
    this.isLogged$ = this.auth.isLogged$;
  }
}

