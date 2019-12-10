import { Directive, Renderer2, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../theme';

@Directive({
  selector: 'img[picturesThemeName]'
})
export class PicturesThemeDirective {
  private sub: Subscription;

  @Input() set picturesThemeName(imageName: string) {
    this.sub = this.themeService.theme$.subscribe((theme) => {
      console.log(theme);
      this.updateSrc(imageName, theme);
    });
  }

  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef,
    private themeService: ThemeService
  ) { }

  updateSrc(imageName: string, theme: string) {
    this._renderer.setProperty(this._element.nativeElement, 'src', `assets/images/${theme}/${imageName}`)
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
