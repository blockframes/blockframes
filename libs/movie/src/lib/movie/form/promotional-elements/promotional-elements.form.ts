import { MoviePromotionalElements, createMoviePromotionalElements } from '../../+state';
import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { MediaFormList } from '@blockframes/media/form/media-list.form';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

// ------------------------------
//   Every Promotional Elements
// ------------------------------

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotionalElements(promotionalElements);

  const stillPhotoControls: Record<string, HostedMediaForm> = {};
  for (const key in entity.still_photo) {
    stillPhotoControls[key] = new HostedMediaForm(entity.still_photo[key]);
  }


  return {
    // Images
    still_photo: new MediaFormList<Record<string, HostedMediaForm>>(stillPhotoControls),

    // Hosted Media
    presentation_deck: new FormControl(entity.presentation_deck),
    scenario: new FormControl(entity.scenario),

    // External Media
    promo_reel_link: new FormControl(entity.promo_reel_link),
    screener_link: new FormControl(entity.screener_link),
    trailer_link: new FormControl(entity.trailer_link),
    teaser_link: new FormControl(entity.teaser_link),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>


export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }
}
