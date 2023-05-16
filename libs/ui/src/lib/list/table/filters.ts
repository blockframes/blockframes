import {
  Director,
  displayName,
  Movie,
  Organization,
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
  movieTitle: (input: string, title: string | Movie) => {
    if (!title) return false;
    if (typeof title === 'string') return title.toLocaleLowerCase().includes(input);
    return title.title.international.toLocaleLowerCase().includes(input);
  },
  orgName: (input: string, org: Organization) => {
    if (!org?.name) return false;
    return org.name.toLocaleLowerCase().includes(input);
  },
  territories: getStaticModelFilter('territories'),
  orgActivity: getStaticModelFilter('orgActivity')
}
