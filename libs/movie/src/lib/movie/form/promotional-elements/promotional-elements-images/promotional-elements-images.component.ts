import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { PromotionalElement } from '../../../+state/movie.firestore';
import { PromotionalElementTypesSlug } from '@blockframes/movie/moviestatic-model/types';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
import { FormArray, FormControl } from '@angular/forms';
import { createImgRef, ImgRef } from '@blockframes/utils/image-uploader';
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

  add(media: ImgRef) {
    const control = new MoviePromotionalElementForm({ label: '', type: this.type, media: media });
    this.form.push(control);
  }
}
