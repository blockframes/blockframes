import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Slide } from './slide.interface';
import { DomSanitizer } from '@angular/platform-browser';
import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { ListKeyManagerOption } from '@angular/cdk/a11y';

@Component({
  selector: 'bf-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss']
})
export class SlideComponent implements OnInit, ListKeyManagerOption, Slide {

  @Input() image: Slide['image'];

  @Input() overlayColor: Slide['overlayColor'] = '#00000040';

  @Input()
  get hideOverlay() { return this._hideOverlay }
  set hideOverlay(value) {
    this._hideOverlay = coerceBooleanProperty(value);
  }

  @Input() disabled = false; // implements ListKeyManagerOption

  private _hideOverlay: Slide['hideOverlay'];

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.image) {
      this.image = this.sanitizer.bypassSecurityTrustStyle(`url("${this.image}")`);
    }
  }
}
