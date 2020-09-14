import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Pipe({
  name: 'getPath'
})
export class GetPathPipe implements PipeTransform {
  constructor(private route: ActivatedRoute) {}

  transform(path: string) {
    const { movieId } = this.route.snapshot.params;
    return `/c/o/dashboard/tunnel/movie/${movieId}/${path}`;
  }
}

@NgModule({
  declarations: [GetPathPipe],
  imports: [CommonModule],
  exports: [GetPathPipe]
})
export class GetPathModule { }
