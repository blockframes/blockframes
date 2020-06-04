import { Injectable } from '@angular/core';
import { AdminStore } from './admin.store';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(
    protected store: AdminStore,
  ) { }

  public loadAnalyticsData() {

    /**
     * SELECT count(*) as page_view, user_id, MAX(event_date)  as last_connexion
      FROM `blockframes-staging.analytics_194475853.events_*`, UNNEST(event_params) AS params
      WHERE event_name = 'pageView'
      AND user_id is not null
      GROUP BY user_id
      ORDER BY last_connexion DESC
      LIMIT 1000
     */
    const mockedData = [
      { pageView: 47, userId: 'p1Bh5Ff4RLfWP1ERLm321DVhKeB2', lastConnexion: 20200603 },
      { pageView: 10027, userId: '3JoqXILLCFeRJ6verk9BerbVaim1', lastConnexion: 20200603 },
      { pageView: 1705, userId: '2OJUZoWtTVcew27YDZa8FQQdg5q2', lastConnexion: 20200603 },
      { pageView: 5958, userId: 'TgyaLGPUcFci1VocrznwGjmgKEr2', lastConnexion: 20200602 },
      { pageView: 86, userId: 'LnmvzK6igoVfciSV3Na5HiqTU7F2', lastConnexion: 20200602 },
      { pageView: 8, userId: 'buuufGPWeEh2E97Sf2b44uL9td12', lastConnexion: 20200601 },
      { pageView: 234, userId: '4ItBR8CN68YDwYRdJH9RFSd9ctl2', lastConnexion: 20200601 },
      { pageView: 9, userId: 'lcoXpsxNs9RXewszAgYPYGFfwfP2', lastConnexion: 20200601 },
    ];

    this.store.update({
      analytics: {
        connectedUsers: mockedData
      }
    });
  }
}
