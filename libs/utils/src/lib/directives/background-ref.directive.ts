import { Directive, ElementRef, Input } from '@angular/core';
import { ImgRef } from '@blockframes/utils/image-uploader';

@Directive({
    selector: '[backgroundRef]'
})
export class BackgroundRefDirective {
    @Input('backgroundRef')
    set ref(value: ImgRef) {
        // https://netbasal.com/angular-2-security-the-domsanitizer-service-2202c83bd90
        this.el.nativeElement.style.backgroundColor = `url(${value.url})`;
    };
    constructor(private el: ElementRef) { }
}