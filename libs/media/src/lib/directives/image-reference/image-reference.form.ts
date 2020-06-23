import { ImgRef, createImgRef } from '../../+state//media.firestore'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormControl, FormGroup } from '@angular/forms';

function createImgRefControl(reference: ImgRef) {
  return {
    original: new FormGroup({
      ref: new FormControl(reference.original.ref),
      url: new FormControl(reference.original.url),
    }),
    fallback: new FormGroup({
      ref: new FormControl(reference.fallback.ref),
      url: new FormControl(reference.fallback.url),
    }),
    xs: new FormGroup({
      ref: new FormControl(reference.xs.ref),
      url: new FormControl(reference.xs.url),
    }),
    md: new FormGroup({
      ref: new FormControl(reference.md.ref),
      url: new FormControl(reference.md.url),
    }),
    lg: new FormGroup({
      ref: new FormControl(reference.lg.ref),
      url: new FormControl(reference.lg.url),
    }),
  }
}

export type ImgRefControl = ReturnType<typeof createImgRefControl>;

export class ImgRefForm extends FormEntity<ImgRefControl> {
  constructor(reference: Partial<ImgRef> = {}) {
    const imgRef = createImgRef(reference);
    const control = createImgRefControl(imgRef);
    super(control);
  }

  get original() { return this.get('original') }
  get fallback() { return this.get('fallback') }
  get xs() { return this.get('xs') }
  get md() { return this.get('md') }
  get lg() { return this.get('lg') }
}
