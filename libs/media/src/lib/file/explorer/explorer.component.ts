import { ChangeDetectionStrategy, Component, ViewChild, TemplateRef, Pipe, PipeTransform, Input, AfterViewInit } from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { App } from '@blockframes/utils/apps';

// File Explorer
import { getDirectories, Directory, FileDirectoryBase } from './explorer.model';

// RxJs
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryFn } from '@angular/fire/firestore';
import { Organization } from '@blockframes/organization/+state';
import { FileUploaderService, MediaService } from '@blockframes/media/+state';
import { StorageFile } from '@blockframes/media/+state/media.firestore';
import { FilePreviewComponent } from '../preview/preview.component';
import { MatDialog } from '@angular/material/dialog';

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
export class FileExplorerComponent implements AfterViewInit {
  root$: Observable<Directory>;
  path$ = new BehaviorSubject<string>('org');
  crumbs$ = this.path$.pipe(map(getCrumbs));
  templates: Record<string, TemplateRef<any>> = {};

  private _org: Organization;
  get org() { return this._org; }
  @Input() set org(value: Organization) {

    const needUpdate = !!value && (
      value.id !== this._org?.id
      || this._org?.logo.storagePath !== value.logo.storagePath
      || this._org?.documents?.notes?.length !== value.documents?.notes?.length
      );

    if (needUpdate) {
      this._org = value;
      const app: App = this.routerQuery.getData('app');
      const query: QueryFn = ref => ref
        .where('orgIds', 'array-contains', this.org.id)
        .where(`storeConfig.appAccess.${app}`, '==', true);

      this.root$ = this.movieService.valueChanges(query).pipe(
        map(titles => getDirectories(this.org, titles))
      );
    }
  }

  @ViewChild('image') image?: TemplateRef<any>;
  @ViewChild('file') file?: TemplateRef<any>;
  @ViewChild('fileList') fileList?: TemplateRef<any>;
  @ViewChild('imageList') imageList?: TemplateRef<any>;
  @ViewChild('directory') directory?: TemplateRef<any>;

  constructor(
    private movieService: MovieService,
    private mediaService: MediaService,
    private service: FileUploaderService,
    private routerQuery: RouterQuery,
    private dialog: MatDialog,
  ) {}

  ngAfterViewInit() {
    this.templates = {
      image: this.image,
      file: this.file,
      directory: this.directory,
      imageList: this.imageList,
      fileList: this.fileList
    }
  }

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

  openView(item: Partial<StorageFile>, event: Event) {
    event.stopPropagation();
    if (!!item) {
      this.dialog.open(FilePreviewComponent, { data: { ref: item }, width: '80vw', height: '80vh' });
    }
  }

  async downloadFile(item: StorageFile, event: Event) {
    event.stopPropagation();
    const url = await this.mediaService.generateImgIxUrl(item);
    window.open(url);
  }

  update() {
    console.log('Update');
    this.service.upload();
  }

}


@Pipe({ name: 'getDir' })
export class GetDirPipe implements PipeTransform {
  transform(path: string, root: Directory) {
    return getDir(root, path);
  }
}
