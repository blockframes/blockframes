import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'sanitize' })
export class SanitizePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(src: string, type: 'url' | 'html' | 'style' | 'script' | 'ressourceUrl' = 'url') {
    switch (type) {
      case 'url': return this.sanitizer.bypassSecurityTrustUrl(src);
      case 'html': return this.sanitizer.bypassSecurityTrustHtml(src);
      case 'style': return this.sanitizer.bypassSecurityTrustStyle(src);
      case 'script': return this.sanitizer.bypassSecurityTrustScript(src);
      case 'ressourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(src);
      default: return this.sanitizer.bypassSecurityTrustUrl(src);
    }
  }
}

@NgModule({
  declarations: [SanitizePipe],
  exports: [SanitizePipe]
})
export class SanitizeModule {}