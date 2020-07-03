import { ImgRef, createImgRef } from '../../+state//media.firestore'
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { HostedMediaForm } from '../media/media.form';

function createImgRefControl(reference: ImgRef) {
  return {
    original: new HostedMediaForm(reference.original),
    fallback: new HostedMediaForm(reference.original),
    xs: new HostedMediaForm(reference.original),
    md: new HostedMediaForm(reference.original),
    lg: new HostedMediaForm(reference.original),
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
