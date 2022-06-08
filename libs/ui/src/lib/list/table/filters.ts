import { InvitationDetailed, Movie, Organization, Scope, staticModel } from "@blockframes/model";
import { displayName } from "@blockframes/model";

interface CrmMovie extends Movie {
  org: Organization;
  screeningCount: number;
}

export function getStaticModelFilter(scope: Scope) {
  return (input: string, value: string) => {
    if (typeof value !== 'string') return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
}

export const filters = {
  movieDirectors: (input: string, _, movie: Movie) => {
    if (!movie?.directors) return false;
    return movie.directors.map(director => displayName(director))
      .some(name => name.toLocaleLowerCase().includes(input));
  },
  movieTitle: (input: string, _, movie: Movie) => {
    if (!movie?.title?.international) return false;
    return movie.title.international.toLocaleLowerCase().includes(input);
  },
  orgName: (input: string, _, movie: CrmMovie) => {
    if (!movie?.org?.denomination?.public) return false;
    return movie.org.denomination.public.toLocaleLowerCase().includes(input);
  },
  invitationOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.fromOrg?.denomination.public) return false;
    return invitation.fromOrg.denomination.public.toLocaleLowerCase().includes(input);
  },
  invitationEventName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.event?.title) return false;
    return invitation.event.title.toLocaleLowerCase().includes(input);
  },
  invitationListOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.org?.denomination.public) return false;
    return invitation.org.denomination.public.toLocaleLowerCase().includes(input);
  },
  invitationListGuestOrgName: (input: string, _, invitation: InvitationDetailed) => {
    if (!invitation?.guestOrg?.denomination.public) return false;
    return invitation.guestOrg.denomination.public.toLocaleLowerCase().includes(input);
  },
}
