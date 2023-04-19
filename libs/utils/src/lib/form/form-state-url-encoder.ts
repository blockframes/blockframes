import { ActivatedRoute, Router } from '@angular/router';
import { Territory, TerritoryGroup, territories, territoriesGroup, territoriesISOA2 } from '@blockframes/model';

/**
 * Decode the app url and save it as form state
 */
export function decodeUrl<T = any>(route: ActivatedRoute): T {
  let { formValue } = route.snapshot.queryParams;

  if (formValue.includes('"avails":')) {
    const data = JSON.parse(formValue);
    formValue = replaceContinents(data);
  }

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
  let availTerritories: Territory[] = data['avails']['territories'];
  let availContinents: string[] = [];

  if (availTerritories.length) {
    for (const continent of territoriesGroup) {
      if (continent.items.every(country => availTerritories.includes(country))) {
        availTerritories = availTerritories.filter(country => !continent.items.includes(country));
        availContinents.push(continent.label.toLowerCase());
        if (availContinents.length === territoriesGroup.length) availContinents = ['world'];
      }
    }
    data['avails']['territories'] = [...availTerritories, ...availContinents];
  }

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

function replaceContinents(data: any) {
  let availTerritories: string[] = data.avails.territories;
  if (!availTerritories.length) return;

  if (availTerritories[0] === 'world') {
    availTerritories = Object.keys(territories).filter(e => e !== 'world');
  } else {
    for (const continent of territoriesGroup) {
      if (availTerritories.includes(continent.label.toLowerCase())) {
        const replacementTerritories = territoriesGroup
          .map(group => group.label === continent.label && group.items)
          .filter(Boolean)
          .flat(2);
        availTerritories = availTerritories.filter(e => e !== continent.label.toLowerCase());
        availTerritories.push(...replacementTerritories);
      }
    }
  }

  data.avails.territories = availTerritories;
  return JSON.stringify(data);
}
