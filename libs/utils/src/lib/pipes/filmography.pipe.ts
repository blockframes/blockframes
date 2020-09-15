import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filmography'
})
export class FilmographyPipe implements PipeTransform {
  transform(value: Filmography[]): any {
    
  }
}

@NgModule({
  imports: [],
  exports: [FilmographyPipe],
  declarations: [FilmographyPipe],
  providers: [],
})
export class FilmographyPipeModule { }
