import { ChangeDetectionStrategy, Component, ViewChild, TemplateRef, Pipe, PipeTransform, Input, AfterViewInit, OnInit } from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';

// File Explorer
import { getDirectories, Directory, FileDirectoryBase } from './explorer.model';

// RxJs
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AngularFirestore, QueryFn } from '@angular/fire/firestore';
import { Organization } from '@blockframes/organization/+state';
import { FileUploaderService, MediaService } from '@blockframes/media/+state';
import { createStorageFile, StorageFile } from '@blockframes/media/+state/media.firestore';
import { getFileMetadata } from '@blockframes/media/+state/static-files';

function getDir(root: Directory, path: string) {
  return path.split('/').reduce((parent, segment) => parent?.children[segment] ?? parent, root);
}

/**
 * Create crumbs path based on the current path
 * "titles/:id/poster" -> ["tiles", "titles/:id", "titles/:id/poster"]
 */
export function getCrumbs(path: string) {
  const crumbs = [];
  path.split('/').filter(v => !!v).forEach((segment, i) => {
    const previous = crumbs[i - 1] ? `${crumbs[i - 1]}/` : '';
    crumbs.push(`${previous}${segment}`);
  });
  return crumbs;
}



@Component({
  selector: 'file-explorer',
  templateUrl: 'explorer.component.html',
  styleUrls: ['./explorer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileExplorerComponent implements OnInit, AfterViewInit {
  root$: Observable<Directory>;
  path$ = new BehaviorSubject<string>('org');
  crumbs$ = this.path$.pipe(map(getCrumbs));
  templates: Record<string, TemplateRef<unknown>> = {};

  org$ = new BehaviorSubject<Organization>(undefined);
  @Input()
  set org(org: Organization) {
    this.org$.next(org);
  }
  get org() {
    return this.org$.getValue();
  }


  @ViewChild('image') image?: TemplateRef<unknown>;
  @ViewChild('file') file?: TemplateRef<unknown>;
  @ViewChild('fileList') fileList?: TemplateRef<unknown>;
  @ViewChild('imageList') imageList?: TemplateRef<unknown>;
  @ViewChild('directory') directory?: TemplateRef<unknown>;

  constructor(
    private db: AngularFirestore,
    private movieService: MovieService,
    private mediaService: MediaService,
    private service: FileUploaderService,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    const app: App = this.routerQuery.getData('app');
    const query: QueryFn = ref => ref
      .where('orgIds', 'array-contains', this.org.id)
      .where(`app.${app}.access`, '==', true);


    const titles$ = this.movieService.valueChanges(query).pipe(
      map(titles => titles.sort((movieA, movieB) => movieA.title.international < movieB.title.international ? -1 : 1)),
    );

    this.root$ = combineLatest([
      this.org$.asObservable(),
      titles$
    ]).pipe(
      map(([org, titles]) => getDirectories(org, titles)),
    );
  }

  ngAfterViewInit() {
    this.templates = {
      image: this.image,
      file: this.file,
      directory: this.directory,
      imageList: this.imageList,
      fileList: this.fileList
    }
  }

  keepOrder = () => 0;

  setPath(path: string) {
    this.path$.next(path);
  }

  next(next: string) {
    this.path$.next(`${this.path$.getValue()}/${next}`);
  }

  previous(crumbs: string) {
    this.path$.next(crumbs[crumbs.length - 2]);
  }

  getMeta(dir: FileDirectoryBase, index: number) {
    return [ ...dir.meta, index ];
  }

  async downloadFile(item: StorageFile, event: Event) {
    event.stopPropagation();
    const url = await this.mediaService.generateImgIxUrl(item);
    window.open(url);
  }

  update() {
    this.service.upload();
  }

  change($event: 'removed' | 'added', meta) {
    if ($event === 'removed') {
      const metadata = getFileMetadata(meta[0], meta[1], meta[2])
      const emptyStorageFile = {}
      emptyStorageFile[metadata.field] = createStorageFile({
        collection: null,
        docId: null,
        field: null,
        privacy: null,
        storagePath: null
      })
      this.db.doc(`${metadata.collection}/${metadata.docId}`).update(emptyStorageFile)
    }
  }
}


@Pipe({ name: 'getDir' })
export class GetDirPipe implements PipeTransform {
  transform(path: string, root: Directory) {
    return getDir(root, path);
  }
}
