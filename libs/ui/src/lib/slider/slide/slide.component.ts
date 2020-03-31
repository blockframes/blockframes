import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { ListKeyManagerOption } from '@angular/cdk/a11y';

@Component({
  selector: 'bf-slide',
  templateUrl: './slide.component.html',
  styleUrls: ['./slide.component.scss']
})
export class SlideComponent implements OnInit, ListKeyManagerOption {
  @Input() image: SafeStyle;
  @Input() public disabled = false; // implements ListKeyManagerOption

  @ViewChild(TemplateRef) public templateRef: TemplateRef<any>;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    if (this.image) {
      this.image = this.sanitizer.bypassSecurityTrustStyle(`url("${this.image}")`);
    }
  }
}
