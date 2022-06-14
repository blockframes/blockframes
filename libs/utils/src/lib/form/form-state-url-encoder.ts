import { ActivatedRoute, Router } from "@angular/router"



/**
 * Decode the app url and save it as form state
 */
export function decodeUrl<T=any>(route: ActivatedRoute): T {
  const { formValue } = route.snapshot.queryParams;
  try {
    const fromUrl = decodeURIComponent(formValue ?? '{}');
    return JSON.parse(fromUrl);
  } catch (err) {
    console.warn(err);
  }
}

/**
 * Get the date of the decoded url and set it 
 */
export function decodeDate(date: string | Date): Date {
  if (!date || date === 'now') return new Date();
  // Add more date magic string later ('nextYear', 'lastYear', ...)
  return new Date(date);
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
