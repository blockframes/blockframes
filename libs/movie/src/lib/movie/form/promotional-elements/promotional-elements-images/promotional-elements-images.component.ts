import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { PromotionalElement } from '../../../+state/movie.firestore';
import { PromotionalElementTypesSlug } from '@blockframes/movie/moviestatic-model/types';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
import { FormArray } from '@angular/forms';
// import { PROMOTIONAL_ELEMENT_TYPES } from '../../../static-model/staticModels';

@Component({
  selector: '[form] movie-promotional-elements-images',
  templateUrl: './promotional-elements-images.component.html',
  styleUrls: ['./promotional-elements-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalElementsImagesComponent {
  @Input() form: FormList<PromotionalElement>

  get controls() {
    console.log(this.form.controls)
    const bannerForm = this.form.controls.filter(c => c.value.type === 'banner');
    // console.log(bannerForm)
    if (bannerForm.length) {
      // display the value
    } else {
      // display the cropper
      // Once you've got a value in the cropper
      // Push the value inside the formList
      this.form.push(new MoviePromotionalElementForm({ type: 'banner' }))

    }
    return this.form.controls.filter(control => control.value.type === 'banner')
  }


  add() {
    // this.form.push(new MoviePromotionalElementForm({ type: this.type ))
  }
}
