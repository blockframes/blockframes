import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MoviePromotionalElementForm } from '../promotional-elements.form';
@Component({
  selector: '[form] movie-promotional-elements-images',
  templateUrl: './promotional-elements-images.component.html',
  styleUrls: ['./promotional-elements-images.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionalElementsImagesComponent {
  @Input() form: MoviePromotionalElementForm;
  @Input() type: string;
  @Input() ratio: number;
}
