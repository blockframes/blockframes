import { MoviePromotionalElements, createMoviePromotionalElements, createPromotionalImage, createPromotionalHostedMedia, createPromotionalExternalMedia } from '../../+state';
import { FormControl, FormGroup } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { ImgRefForm } from '@blockframes/media/directives/image-reference/image-reference.form'
import { PromotionalImage, PromotionalHostedMedia, PromotionalExternalMedia } from '@blockframes/movie/+state/movie.firestore';
import { ExternalMediaForm, HostedMediaForm } from '@blockframes/media/directives/media/media.form';
import { FormEntityList } from '@blockframes/utils/form';

// ------------------------------
//   Promotional External Media
// ------------------------------

function createPromotionalExternalMediaControl(promotionalExternalMedia?: Partial<PromotionalExternalMedia>) {
  const { label, media } = createPromotionalExternalMedia(promotionalExternalMedia);
  return {
    label: new FormControl(label),
    media: new ExternalMediaForm(media),
  }
}

export type PromotionalExternalMediaControl = ReturnType<typeof createPromotionalExternalMediaControl>;

export class MoviePromotionalExternalMediaForm extends FormEntity<PromotionalExternalMediaControl> {
  constructor(promotionalExternalMedia?: Partial<PromotionalExternalMedia>) {
    super(createPromotionalExternalMediaControl(promotionalExternalMedia));
  }
}

// ------------------------------
//   Promotional Hosted Media
// ------------------------------

function createPromotionalHostedMediaControl(promotionalHostedMedia?: Partial<PromotionalHostedMedia>) {
  const { label, media } = createPromotionalHostedMedia(promotionalHostedMedia);
  return {
    label: new FormControl(label),
    media: new HostedMediaForm(media),
  }
}
export type PromotionalHostedMediaControl = ReturnType<typeof createPromotionalHostedMediaControl>;

export class MoviePromotionalHostedMediaForm extends FormEntity<PromotionalHostedMediaControl> {
  constructor(promotionalHostedMedia?: Partial<PromotionalHostedMedia>) {
    super(createPromotionalHostedMediaControl(promotionalHostedMedia));
  }
}

// ------------------------------
//       Promotional Image
// ------------------------------

function createPromotionalImageControl(promotionalImage?: Partial<PromotionalImage>) {
  const { label, size, ratio, media } = createPromotionalImage(promotionalImage);
  return {
    label: new FormControl(label),
    size: new FormControl(size),
    ratio: new FormControl(ratio),
    media: new ImgRefForm(media),
  }
}
export type PromotionalImageControl = ReturnType<typeof createPromotionalImageControl>;

export class MoviePromotionalImageForm extends FormEntity<PromotionalImageControl> {
  constructor(promotionalImage?: Partial<PromotionalImage>) {
    super(createPromotionalImageControl(promotionalImage));
  }
}

// ------------------------------
//   Every Promotional Elements
// ------------------------------

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotionalElements(promotionalElements);

  const stillPhotoControls: Record<string, MoviePromotionalImageForm> = {};
  for (const key in entity.still_photo) {
    stillPhotoControls[key] = new MoviePromotionalImageForm(entity.still_photo[key]);
  }


  return {
    // Images
    still_photo: new FormEntityList<Record<string, MoviePromotionalImageForm>>(stillPhotoControls),

    // Hosted Media
    presentation_deck: new MoviePromotionalHostedMediaForm(entity.presentation_deck),
    scenario: new MoviePromotionalHostedMediaForm(entity.scenario),

    // External Media
    promo_reel_link: new MoviePromotionalExternalMediaForm(entity.promo_reel_link),
    screener_link: new MoviePromotionalExternalMediaForm(entity.screener_link),
    trailer_link: new MoviePromotionalExternalMediaForm(entity.trailer_link),
    teaser_link: new MoviePromotionalExternalMediaForm(entity.teaser_link),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>


export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }
}
