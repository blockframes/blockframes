import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { ThemeService } from './theme.service';

@Pipe({name: 'asset'})
export class AssetPipe implements PipeTransform {
  constructor(private theme: ThemeService) {}

  transform(asset: string, type: 'images' | 'logo' = 'images'): string {
    return `assets/${type}/${this.theme.theme}/${asset}`;
  }
}