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
    if (!movie?.org?.denomination?.public) return false;
    return movie.org.denomination.public.toLocaleLowerCase().includes(input);
  },
  invitationListOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.org?.denomination.public) return false;
    return invitation.org.denomination.public.toLocaleLowerCase().includes(input);
  },
  invitationListGuestOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.guestOrg?.denomination.public) return false;
    return invitation.guestOrg.denomination.public.toLocaleLowerCase().includes(input);
  },
  territories: getStaticModelFilter('territories'),
  orgActivity: getStaticModelFilter('orgActivity')
}
