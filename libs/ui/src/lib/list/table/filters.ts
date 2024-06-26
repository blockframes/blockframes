import {
  Director,
  displayName,
  Organization,
  Person,
  Scope,
  staticModel,
  WaterfallRightholder
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
  orgName: (input: string, org: Organization | WaterfallRightholder) => {
    if (!org?.name) return false;
    return org.name.toLocaleLowerCase().includes(input);
  },
  territories: getStaticModelFilter('territories'),
  orgActivity: getStaticModelFilter('orgActivity')
}
