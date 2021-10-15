import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';

interface BreadCrumbItem {
  path: string,
  label: string,
}

type BreadCrumbConfig = Record<string, BreadCrumbItem>;

@Component({
  selector: 'crm-bread-crumb',
  templateUrl: './bread-crumb.component.html',
  styleUrls: ['./bread-crumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadCrumbComponent {

  config: BreadCrumbConfig = {
    'dev-area': {
      path: 'dev-area',
      label: 'Deveveloppers Area'
    },
    movie: {
      path: 'movies',
      label: 'Movies'
    },
    movies: {
      path: 'movies',
      label: 'Movies'
    },
    event: {
      path: 'events',
      label: 'Events'
    },
    events: {
      path: 'events',
      label: 'Events'
    },
    invitations: {
      path: 'invitations',
      label: 'Invitations'
    },
    mails: {
      path: 'mails',
      label: 'Emails'
    },
    organization: {
      path: 'organizations',
      label: 'Organizations'
    },
    organizations: {
      path: 'organizations',
      label: 'Organizations'
    },
    user: {
      path: 'users',
      label: 'Users'
    },
    users: {
      path: 'users',
      label: 'Users'
    }
  }

  public breadcrumb$ = this.route.url.pipe(
    map(url => url.map(u => this.config[u.path] || { path: '', label: '' }))
  );

  constructor(private route: ActivatedRoute) { }

}
