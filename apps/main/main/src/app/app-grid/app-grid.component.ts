import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface AppDetails {
  name: string;
  logoSrc: string;
  href: string;
  id: string;
}

interface AppDetailsWithStatus extends AppDetails {
  status: string; // TODO: type
}

// TODO: extract App types

const APPS_DETAILS: AppDetails[] = [
  {
    name: 'Media Financiers',
    logoSrc: 'http://graphouille.g.r.pic.centerblog.net/6c2aaddd.png',
    href: '/movie-financing',
    id: 'media_financiers'
  },
  {
    name: 'Stories and More',
    logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/8cc2960d.png',
    href: '/stories-and-more',
    id: 'stories'
  },
  {
    name: 'Media Delivering',
    logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/22f09c18.png',
    href: '/delivery',
    id: 'media_delivering'
  },
  {
    name: 'Bigger Boat',
    logoSrc: 'https://www.stickpng.com/assets/images/580b57fbd9996e24bc43bb8e.png',
    href: '/bigger-boat',
    id: 'media_financiers'
  }
];

@Component({
  selector: 'app-grid',
  templateUrl: './app-grid.component.html',
  styleUrls: ['./app-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DappGridComponent implements OnInit {
  private apps$: Observable<AppDetailsWithStatus[]>;
  private orgId: string;

  constructor(private organizationQuery: OrganizationQuery, private db: FireQuery) {}

  ngOnInit() {
    this.apps$ = this.organizationQuery.orgId$.pipe(
      tap(orgId => (this.orgId = orgId)),
      map(orgId => this.db.collection('app-requests').doc(orgId)),
      switchMap(docRef => docRef.valueChanges()),
      tap(console.log),
      filter(doc => !!doc),
      map(appRequest =>
        APPS_DETAILS.map(app => ({
          ...app,
          status: (appRequest[app.id] as string) || 'none' // TODO: type
        }))
      )
    );
  }

  // TODO: type
  public async requestAccess(appId: string) {
    const docRef = this.db.collection('app-requests').doc(this.orgId).ref;

    return this.db.firestore.runTransaction(async tx => {
      const doc = await tx.get(docRef);

      if (!doc.exists) {
        return tx.set(docRef, { [appId]: 'requested' });
      } else {
        return tx.update(docRef, { [appId]: 'requested' });
      }
    });
  }
}
