import { DomSanitizer } from '@angular/platform-browser';
import { Directive, ElementRef, Input } from '@angular/core';
import { ImgRef } from '@blockframes/utils/image-uploader';

@Directive({
    selector: '[backgroundRef]'
})
export class BackgroundRefDirective {
    @Input('backgroundRef')
    set ref(value: ImgRef) {
        this.el.nativeElement.style.backgroundImage = this.sanitizer.bypassSecurityTrustStyle(`url("${value.url}")`);
    };
    constructor(private el: ElementRef, private sanitizer: DomSanitizer) { }
}