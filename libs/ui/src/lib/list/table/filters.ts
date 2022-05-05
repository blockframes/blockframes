import { Movie, Scope, staticModel } from "@blockframes/model";
import { displayName } from "@blockframes/utils/utils";

export function getStaticModelFilter(scope: Scope) {
  return (input: string, value: any) => {
    if (typeof value !== 'string') return false;
    const label = staticModel[scope][value];
    return label.toLowerCase().includes(input);
  };
}

export const filters = {
  movieDirectors: (input: string, _: undefined, movie: Movie) => movie.directors.map(director => displayName(director)).some(director => director.toLocaleLowerCase().includes(input)),
  movieTitle: (input: string, _: undefined, movie: Movie) => movie?.title?.international.toLocaleLowerCase().includes(input)
}