import { Directive, Renderer2, ElementRef, Input } from '@angular/core';

@Directive({
  selector: 'img[picturesThemePath]'
})
export class PicturesThemePathDirective {

  @Input() set picturesThemePath(imageName: string) {
    const theme = localStorage.getItem('theme');
    this.updateSrc(imageName, theme);
  }

  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef
  ) { }

  updateSrc(imageName: string, theme: string) {
    this._renderer.setProperty(this._element.nativeElement, 'src', `assets/images/${theme}/${imageName}`)
  }
}
