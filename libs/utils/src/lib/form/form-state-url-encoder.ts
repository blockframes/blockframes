import { ActivatedRoute, Router } from "@angular/router"

/**
 * Decode the app url and save it as form state
 */
export function decodeUrl(
  activatedRoute: ActivatedRoute,
): Record<string, unknown> {
  const { formValue } = activatedRoute.snapshot.queryParams
  let decodedData = {}
  try {
    decodedData = JSON.parse(
      decodeURIComponent(formValue ?? '{}')
    )
  } catch (err) {
    console.warn({ err })
  }
  return decodedData
}

/**
 * Encode the form state and saves in the url
 * for possible sharing of form state as app url
 */
export function encodeUrlAndNavigate(
  router: Router, activatedRoute: ActivatedRoute, data: Record<string, unknown>
) {
  const formValue = JSON.stringify(data);
  //url musn't be longer than 2000 characters
  if (formValue.length < 1500) {
    router.navigate(
      ['.'],
      {
        queryParams: {
          formValue,
        },
        relativeTo: activatedRoute,
        replaceUrl: true,
      }
    );
  }
}
