import type { Screening } from '@blockframes/event/+state/event.firestore';
import type { Movie } from '@blockframes/movie/+state/movie.model';
import type { Organization } from '@blockframes/organization/+state/organization.model';
import type { User } from '@blockframes/user/+state/user.model';

interface TestScreeningFixture {
  event: string;
  movie: Partial<Movie>;
  by: Partial<User>;
  org: Partial<Organization>;
  invitees: Partial<User>[];
  private: boolean;
}

export default [
  {
    event: 'TKOTL Private Screening',
    by: {
      uid: '2OJUZoWtTVcew27YDZa8FQQdg5q2',
    },
    movie: {
      id: '02L9gsoY4WTdGbxpOKha',
      title: {
        international: 'The Killing Of Two Lovers',
      },
    },
    org: {
      id: 'sLchj1Ib4Cxhwr0ZBW4m',
    },
    invitees: [
      {
        uid: 'MDnN2GlVUeadIVJbzTToQQNAMWZ2',
      },
      {
        uid: 'mVUZ097xoAeubsPiQlqrzgUF8y83',
      },
    ],
    private: true,
  },
  {
    event: 'Hunted Screening',
    by: {
      uid: '2OJUZoWtTVcew27YDZa8FQQdg5q2',
    },
    movie: {
      id: 'KUFRFI3VQ5HLOdymnEX5',
      title: {
        international: 'Hunted',
      },
    },
    org: {
      id: 'sLchj1Ib4Cxhwr0ZBW4m',
    },
    invitees: [
      {
        uid: 'MDnN2GlVUeadIVJbzTToQQNAMWZ2',
      }
    ],
    private: true,
  },
] as Partial<Screening & TestScreeningFixture>[];
