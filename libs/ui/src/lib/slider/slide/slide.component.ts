import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Slide } from './slide.interface';
import { Component, Input, ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { ListKeyManagerOption } from '@angular/cdk/a11y';

@Component({
  selector: 'bf-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent implements ListKeyManagerOption, Slide {

  @Input() image: Slide['image'];

  @Input() overlayColor: Slide['overlayColor'] = '#00000080';

  @Input()
  get hideOverlay() { return this._hideOverlay }
  set hideOverlay(value) {
    this._hideOverlay = coerceBooleanProperty(value);
  }

  // Implements ListKeyManagerOption otherwise it will throw an Error
  @Input() disabled = false;

  private _hideOverlay: Slide['hideOverlay'];

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
}
