import { territoriesGroup } from "@blockframes/model";

export const europeanCountries = territoriesGroup
  .map(group => group.label === 'Europe' && group.items)
  .filter(Boolean)
  .flat(2);