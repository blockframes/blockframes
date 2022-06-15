import {
  CrmMovie,
  displayName,
  InvitationDetailed,
  Movie,
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
  // #8355 - TODO: merge these three in one
  crmMovieOrgName: (input: string, _, movie: CrmMovie) => {
    if (!movie?.org?.name) return false;
    return movie.org.name.toLocaleLowerCase().includes(input);
  },
  invitationListOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.org?.name) return false;
    return invitation.org.name.toLocaleLowerCase().includes(input);
  },
  invitationListGuestOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.guestOrg?.name) return false;
    return invitation.guestOrg.name.toLocaleLowerCase().includes(input);
  },
  territories: getStaticModelFilter('territories'),
  orgActivity: getStaticModelFilter('orgActivity')
}
