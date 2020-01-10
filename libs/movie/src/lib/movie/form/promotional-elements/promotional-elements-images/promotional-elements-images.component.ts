import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { PromotionalElement } from '../../../+state/movie.firestore';
import { PromotionalElementTypesSlug } from '@blockframes/movie/moviestatic-model/types';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
import { FormArray } from '@angular/forms';
// import { PROMOTIONAL_ELEMENT_TYPES } from '../../../static-model/staticModels';

@Component({
  selector: '[type][form] movie-promotional-elements-images',
  templateUrl: './promotional-elements-images.component.html',
  styleUrls: ['./promotional-elements-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalElementsImagesComponent {
  @Input() form: FormList<PromotionalElement>
  // @Input() form: FormArray;
  @Input() type: PromotionalElementTypesSlug;

  get controls() {
    console.log(this.form.controls)
    // console.log(this.form.get('promotionalElements').value[0].type)
    // console.log(Object.keys(this.form.controls).forEach(e => {console.log(e)}))
    // console.log(this.form.controls.forEach((e)=> console.log(e)))
    return this.form.controls.filter(control => control.value.type === this.type)
  }

  add() {
    // this.form.push(new MoviePromotionalElementForm({ type: this.type ))
  }
}
