import { Slide } from './slide.interface';
import { Component, Input, ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { ListKeyManagerOption } from '@angular/cdk/a11y';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'bf-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideComponent implements ListKeyManagerOption, Slide {

  @Input() image: Slide['image'];
  @Input() asset = 'empty_slider.png';

  @Input()
  get overlayColor(): Slide['overlayColor'] { return this._overlayColor }
  set overlayColor(value: string) {
    this._overlayColor = this._overlayPreset[value]
  }

  @Input() @boolean hideOverlay: Slide['hideOverlay'] = false;

  // Implements ListKeyManagerOption otherwise it will throw an Error
  @Input() disabled = false;

  @ViewChild(TemplateRef) templateRef: TemplateRef<unknown>;

  private _overlayColor: Slide['overlayColor'];

  private _overlayPreset = {
    gradient: "linear-gradient(to right, black, transparent)",
    heavy: '#00000080',
    medium: '#00000050'
  }
}
