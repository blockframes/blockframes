import { ActivatedRoute, Router } from '@angular/router';
import {
  Territory,
  TerritoryGroup,
  territories,
  territoriesGroup,
  territoriesISOA2,
  TerritoryISOA2Value,
  MovieAvailsFilterSearch,
  encodedTerritory,
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

export function encodeAvailsSearchUrl(router: Router, route: ActivatedRoute, data: MovieAvailsFilterSearch) {
  const availTerritories = data.avails.territories;

  if (availTerritories.length) data.avails.territories = encodeTerritories(availTerritories as Territory[]);

  return encodeUrl(router, route, data);
}

export function decodeAvailsSearchUrl(route: ActivatedRoute) {
  const { formValue } = route.snapshot.queryParams;

  const data = JSON.parse(formValue);
  const availsFilter = data.avails;

  if (availsFilter.territories.length) data.avails.territories = decodeTerritories(availsFilter.territories);

  return data;
}

function encodeTerritories(_countries: Territory[]): encodedTerritory[] {
  let countries = _countries;
  const continents: TerritoryGroup[] = [];
  const countriesISOA2: TerritoryISOA2Value[] = [];
  for (const continent of territoriesGroup) {
    if (continent.items.every(country => countries.includes(country))) {
      continents.push(continent.label as TerritoryGroup);
      countries = countries.filter(country => !continentCountries(continent.label as TerritoryGroup).includes(country));
    }
  }
  for (const country of countries) countriesISOA2.push(territoriesISOA2[country]);

  return [...countriesISOA2, ...continents];
}

export function decodeTerritories(_territories: encodedTerritory[]): Territory[] {
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

const countryISOA2ToTerritory = (_countryISOA2: TerritoryISOA2Value) =>
  Object.keys(territoriesISOA2).find(key => territoriesISOA2[key] === _countryISOA2) as Territory;

function extractContinents(_territories: encodedTerritory[]): TerritoryGroup[] {
  const continentsList = territoriesGroup.map(group => group.label) as string[];
  const continents = _territories.filter(territory => continentsList.includes(territory));
  return continents as TerritoryGroup[];
}

function extractCountriesISOA2(_territories: encodedTerritory[]): TerritoryISOA2Value[] {
  const countriesISOA2List = Object.values(territoriesISOA2);
  const countriesISOA2 = _territories.filter(territory => countriesISOA2List.includes(territory as TerritoryISOA2Value));
  return countriesISOA2 as TerritoryISOA2Value[];
}
