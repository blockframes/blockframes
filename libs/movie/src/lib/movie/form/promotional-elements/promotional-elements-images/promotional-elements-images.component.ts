import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { PromotionalElement } from '../../../+state/movie.firestore';
import { PromotionalElementTypesSlug } from '@blockframes/movie/moviestatic-model/types';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { createImgRef, ImgRef } from '@blockframes/utils/image-uploader';
import { MoviePromotionalElementsControl, MoviePromotionalElementsForm, PromotionalElementControl } from '../promotional-elements.form';
@Component({
  selector: '[form] movie-promotional-elements-images',
  templateUrl: './promotional-elements-images.component.html',
  styleUrls: ['./promotional-elements-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalElementsImagesComponent {
  @Input() form: FormList<PromotionalElement>
  // @Input() form: MoviePromotionalElementsControl['banner'];
  // @Input() form: FormGroup;
  // @Input() form: PromotionalElementControl['media'];
  localForm = new MoviePromotionalElementForm();
  @Input() type: string;
  @Input() ratio: string;
  @Input() width: string;
  // form: MoviePromotionalElementsForm;

  // banner: MoviePromotionalElementsControl['banner'];
  // poster: MoviePromotionalElementsControl['poster'];
  // stillPhoto: MoviePromotionalElementsControl['still_photo'];

  // get banner() {
  //   return this.form.banner;
  // }
  add(media: ImgRef) {
    const control = new MoviePromotionalElementForm({ label: '', media: media });
    this.form.push(control);
  }
}
