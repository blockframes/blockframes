import { Directive, Renderer2, ElementRef, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from '../theme';

@Directive({
  selector: 'img[picturesThemeName]'
})
export class PicturesThemeDirective {
  private sub: Subscription;
  private themeService: ThemeService;

  @Input() set picturesThemeName(imageName: string) {
    const theme = localStorage.getItem('theme');
    this.updateSrc(imageName, theme);
  }

  // @Input() set picturesThemeName(imageName: string) {
  //   this.sub = this.themeService.theme$.subscribe((theme) => {
  //     this.updateSrc(imageName, theme);
  //   });
  // }


  constructor(
    private _renderer: Renderer2,
    private _element: ElementRef
  ) { }

  updateSrc(imageName: string, theme: string) {
    this._renderer.setProperty(this._element.nativeElement, 'src', `assets/images/${theme}/${imageName}`)
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
