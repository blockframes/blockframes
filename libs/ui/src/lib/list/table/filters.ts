import {
  CrmMovie,
  displayName,
  InvitationDetailed,
  Movie,
  Organization,
  Person,
  Scope,
  staticModel
} from '@blockframes/model';

export function getStaticModelFilter(scope: Scope) {
  return (input: string, value: string) => {
    if (typeof value !== 'string') return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
}

export const filters = {
  displayName: (input: string, user: Person) => {
    const name = displayName(user).toLowerCase();
    return name.includes(input);
  },
  movieDirectors: (input: string, movie: Movie) => {
    if (!movie?.directors) return false;
    return movie.directors.map(director => displayName(director))
      .some(name => name.toLocaleLowerCase().includes(input));
  },
  movieTitle: (input: string, movie: Movie) => {
    if (!movie?.title?.international) return false;
    return movie.title.international.toLocaleLowerCase().includes(input);
  },
  orgName: (input: string, org: Organization) => {
    if (!org?.name) return false;
    return org.name.toLocaleLowerCase().includes(input);
  },
  territories: getStaticModelFilter('territories'),
  orgActivity: getStaticModelFilter('orgActivity')
}
