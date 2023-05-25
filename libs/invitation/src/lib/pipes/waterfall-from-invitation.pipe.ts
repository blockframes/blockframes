import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Observable } from 'rxjs';
import { Invitation, Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';

@Pipe({
  name: 'movieFromWaterfallInvitation'
})
export class MovieFromWaterfallInvitationPipe implements PipeTransform {
  constructor(private movieService: MovieService) { }
  transform(invitation: Invitation): Observable<Movie> {
    return this.movieService.valueChanges(invitation.waterfallId);
  }
}

@NgModule({
  exports: [MovieFromWaterfallInvitationPipe],
  declarations: [MovieFromWaterfallInvitationPipe],
})
export class MovieFromWaterfallInvitationPipeModule { }