import {
  CrmMovie,
  Director,
  displayName,
  InvitationDetailed,
  Person,
  Scope,
  staticModel
} from '@blockframes/model';

function getStaticModelFilter(scope: Scope) {
  return (input: string, value: string) => {
    if (typeof value !== 'string' || !value) return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
}

export const filters = {
  displayName: (input: string, user: Person) => {
    const name = displayName(user).toLowerCase();
    return name.includes(input);
  },
  movieDirectors: (input: string, directors: Director[]) => {
    if (!directors?.length) return false;
    return directors.map(director => displayName(director))
      .some(name => name.toLocaleLowerCase().includes(input));
  },
  movieTitle: (input: string, title: string) => {
    if (!title) return false;
    return title.toLocaleLowerCase().includes(input);
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
