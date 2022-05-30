import { Invitation, Movie, Scope, staticModel } from "@blockframes/model";
import { displayName } from "@blockframes/model";

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
  invitationOrgName: (input: string, _, invitation: Invitation) => {
    if (!invitation?.fromOrg?.denomination.public) return false;
    return invitation.fromOrg.denomination.public.toLocaleLowerCase().includes(input);
  }
}
