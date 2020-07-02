import { Pipe, NgModule } from "@angular/core";
import { Movie } from "../+state";
import { Organization } from "@blockframes/organization/+state";

@Pipe({
    name: 'fromOrg',
})
export class MovieFromOrgPipe {
    transform(movies: Movie[], org: Organization) {
        return movies.filter(movie => org.movieIds.includes(movie.id));
    }
}

@NgModule({
    declarations: [MovieFromOrgPipe],
    exports: [MovieFromOrgPipe]
})
export class MovieFromOrgModule {}
  