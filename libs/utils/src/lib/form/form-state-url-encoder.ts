import { ActivatedRoute, Router } from '@angular/router';
import {
  Territory,
  TerritoryGroup,
  territories,
  territoriesGroup,
  territoriesISOA2,
  TerritoryISOA2Value,
  MovieAvailsSearch,
  MovieSearch,
  AvailsFilter,
} from '@blockframes/model';

/**
 * Decode the app url and save it as form state
 */
export function decodeUrl<T = any>(route: ActivatedRoute): T {
  const { formValue } = route.snapshot.queryParams;

  try {
    const fromUrl = decodeURIComponent(formValue ?? '{}');
    return JSON.parse(fromUrl);
  } catch (err) {
    console.warn(err);
  }
}

/**
 * Encode the form state and saves in the url
 * for possible sharing of form state as app url
 */
export function encodeUrl<T>(router: Router, route: ActivatedRoute, data: T) {
  const formValue = JSON.stringify(data);
  //url musn't be longer than 2000 characters
  if (formValue.length < 1500) {
    router.navigate(['.'], {
      queryParams: { formValue },
      relativeTo: route,
      replaceUrl: true,
    });
  }
}

type EncodedTerritory = Territory | TerritoryISOA2Value | TerritoryGroup;
interface MovieAvailsSearchWithEncodedTerritories {
  search?: Omit<MovieSearch, 'originCountries'> & { originCountries: EncodedTerritory[] };
  avails?: Omit<AvailsFilter, 'territories'> & { territories: EncodedTerritory[] };
}

export function encodeAvailsSearchUrl(router: Router, route: ActivatedRoute, data: MovieAvailsSearch) {
  const search: MovieAvailsSearchWithEncodedTerritories = {
    search: { ...data.search, originCountries: encodeTerritories(data.search?.originCountries) },
  };
  if (data.avails) search.avails = { ...data.avails, territories: encodeTerritories(data.avails?.territories) };
  return encodeUrl<MovieAvailsSearchWithEncodedTerritories>(router, route, search);
}

export function decodeAvailsSearchUrl(route: ActivatedRoute) {
  const data = decodeUrl<MovieAvailsSearchWithEncodedTerritories>(route);
  const search: MovieAvailsSearch = {
    search: { ...data.search, originCountries: decodeTerritories(data.search?.originCountries) },
    avails: { ...data.avails, territories: decodeTerritories(data.avails?.territories) }
  };
  return search;
}

function encodeTerritories(_countries: Territory[] = []): EncodedTerritory[] {
  let countries = _countries;
  const continents: TerritoryGroup[] = [];
  const countriesISOA2: TerritoryISOA2Value[] = [];
  for (const continent of territoriesGroup) {
    if (continent.items.every(country => countries.includes(country))) {
      continents.push(continent.label as TerritoryGroup);
      countries = countries.filter(country => !continentCountries(continent.label as TerritoryGroup).includes(country));
    }
  }
  for (const country of countries) {
    if (territoriesISOA2[country]) {
      countriesISOA2.push(territoriesISOA2[country]);
      countries = countries.filter(c => c !== country);
    }
  }

  return [...countriesISOA2, ...countries, ...continents];
}

function decodeTerritories(_territories: EncodedTerritory[] = []): Territory[] {
  const continents = extractContinents(_territories);
  const countriesISOA2 = extractCountriesISOA2(_territories);
  const countries = _territories.filter(territory => Object.keys(territories).includes(territory));
  for (const continent of continents) countries.push(...continentCountries(continent));
  for (const country of countriesISOA2) countries.push(countryISOA2ToTerritory(country));

  return countries as Territory[];
}

const continentCountries = (continent: TerritoryGroup): Territory[] =>
  territoriesGroup
    .map(group => group.label === continent && group.items)
    .filter(Boolean)
    .flat(2);

const countryISOA2ToTerritory = (countryISOA2: TerritoryISOA2Value) =>
  Object.keys(territoriesISOA2).find(key => territoriesISOA2[key] === countryISOA2) as Territory;

function extractContinents(territories: EncodedTerritory[]) {
  const continentsList = territoriesGroup.map(group => group.label) as string[];
  const continents = territories.filter(territory => continentsList.includes(territory));
  return continents as TerritoryGroup[];
}

function extractCountriesISOA2(territories: EncodedTerritory[]) {
  const countriesISOA2List = Object.values(territoriesISOA2);
  const countriesISOA2 = territories.filter(territory => countriesISOA2List.includes(territory as TerritoryISOA2Value));
  return countriesISOA2 as TerritoryISOA2Value[];
}
