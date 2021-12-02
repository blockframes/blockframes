import { ActivatedRoute, Router } from "@angular/router"

function dateReviver(key: string, value: string | number | boolean) {

  /**
   * The internet doesn't have a waterproof way to check if a string is a date
   * This method doesn't work for string + number like 'Movie 1'
   * https://stackoverflow.com/questions/7445328/check-if-a-string-is-a-date-value/30870755#30870755
   * 
   * To minimize side effects; only revive date for fields which support date value
   */
  const dateKeys = ['from', 'to'];
  if (dateKeys.includes(key) && typeof value === 'string') {
    // This could be an Invalid date
    const date = new Date(value);
    // check if the getTime is NaN. If not, it's a valid date.
    if (!isNaN(date.getTime())) return date;
  }
  return value;
}

/**
 * Decode the app url and save it as form state
 */
export function decodeUrl<T=any>(route: ActivatedRoute): T {
  const { formValue } = route.snapshot.queryParams;
  try {
    const fromUrl = decodeURIComponent(formValue ?? '{}');
    return JSON.parse(fromUrl, dateReviver); // see comment about reviver
  } catch (err) {
    console.warn(err);
  }
}

/**
 * Encode the form state and saves in the url
 * for possible sharing of form state as app url
 */
export function encodeUrl<T>(
  router: Router, route: ActivatedRoute, data: T
) {
  const formValue = JSON.stringify(data);
  //url musn't be longer than 2000 characters
  if (formValue.length < 1500) {
    router.navigate(['.'], {
      queryParams: { formValue, },
      relativeTo: route,
      replaceUrl: true,
    });
  }
}
