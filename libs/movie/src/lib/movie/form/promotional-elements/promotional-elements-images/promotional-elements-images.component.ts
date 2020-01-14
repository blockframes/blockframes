import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { PromotionalElement } from '../../../+state/movie.firestore';
import { PromotionalElementTypesSlug } from '@blockframes/movie/moviestatic-model/types';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
import { FormArray, FormControl } from '@angular/forms';
import { createImgRef, ImgRef } from '@blockframes/utils/image-uploader';
// import { PROMOTIONAL_ELEMENT_TYPES } from '../../../static-model/staticModels';

@Component({
  selector: '[form] movie-promotional-elements-images',
  templateUrl: './promotional-elements-images.component.html',
  styleUrls: ['./promotional-elements-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalElementsImagesComponent {
  @Input() form: FormList<PromotionalElement>
  @Input() type: string;
  localForm = new MoviePromotionalElementForm();
  displayCropper: boolean;

  // get controls() {
  //   console.log(this.form.controls)
  //   const bannerForm = this.form.controls.filter(c => c.value.type === 'banner');
  //   // console.log(bannerForm)
  //   if (bannerForm.length) {
  //     this.displayCropper = false;
  //     // display the value
  //     console.log('display value', bannerForm)
  //   } else {
  //     console.log('display cropper', bannerForm)
  //     this.displayCropper = true;
  //     // display the cropper
  //     // Once you've got a value in the cropper
  //     // Push the value inside the formList

  //     // this.form.push(new FormControl());
  //     this.form.push(new MoviePromotionalElementForm({ label: 'Banner', type: 'banner', media: createImgRef()}));

  //   }
  //   return this.form.controls.filter(control => control.value.type === 'banner')
  // }


  add(media: ImgRef) {
    const control = new MoviePromotionalElementForm({ label: '', type: this.type, media: media });
    this.form.push(control);
  }
}
