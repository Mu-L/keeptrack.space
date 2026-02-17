import { CatalogLoader } from '@app/app/data/catalog-loader';
import { ToastMsgType } from '@app/engine/core/interfaces';
import { ServiceLocator } from '@app/engine/core/service-locator';
import { errorManagerInstance } from '@app/engine/utils/errorManager';
import { KeepTrackPlugin } from '../../engine/plugins/base-plugin';
import './catalog-drop.css';

/**
 * Plugin that enables drag-and-drop loading of .tce/.tle/.txt TLE catalog files.
 * Dropping a file triggers a complete catalog reinit without page refresh.
 */
export class CatalogDropPlugin extends KeepTrackPlugin {
  readonly id = 'CatalogDropPlugin';
  dependencies_: string[] = [];

  private docDragEnterCount_ = 0;
  private dropzoneEl_: HTMLDivElement | null = null;
  private isLoading_ = false;

  addHtml(): void {
    super.addHtml();
    this.createDropzoneOverlay_();
    this.initDragAndDrop_();
  }

  private createDropzoneOverlay_(): void {
    this.dropzoneEl_ = document.createElement('div');
    this.dropzoneEl_.id = 'catalog-drop-overlay';
    this.dropzoneEl_.className = 'catalog-drop-overlay';
    this.dropzoneEl_.innerHTML =
      '<div class="catalog-drop-overlay-inner">' +
        '<div class="catalog-drop-icon">&#128752;</div>' +
        '<div class="catalog-drop-text">Drop .tce, .tle, or .txt file to load catalog</div>' +
      '</div>';
    document.body.appendChild(this.dropzoneEl_);
  }

  private showOverlay_(): void {
    this.dropzoneEl_?.classList.add('visible');
  }

  private hideOverlay_(): void {
    this.dropzoneEl_?.classList.remove('visible');
    this.docDragEnterCount_ = 0;
  }

  private initDragAndDrop_(): void {
    document.addEventListener('dragenter', (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) {
        return;
      }
      e.preventDefault();
      this.docDragEnterCount_++;
      this.showOverlay_();
    });

    document.addEventListener('dragleave', (e: DragEvent) => {
      e.preventDefault();
      this.docDragEnterCount_--;
      if (this.docDragEnterCount_ <= 0) {
        this.hideOverlay_();
      }
    });

    document.addEventListener('dragover', (e: DragEvent) => {
      if (e.dataTransfer?.types.includes('Files')) {
        e.preventDefault();
        if (e.dataTransfer) {
          e.dataTransfer.dropEffect = 'copy';
        }
      }
    });

    document.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      this.hideOverlay_();

      if (this.isLoading_) {
        return;
      }

      const files = e.dataTransfer?.files;

      if (!files || files.length === 0) {
        return;
      }

      const tceFile = Array.from(files).find(
        (f) => f.name.endsWith('.tce') || f.name.endsWith('.txt') || f.name.endsWith('.tle'),
      );

      if (!tceFile) {
        ServiceLocator.getUiManager().toast(
          'No .tce, .tle, or .txt file found in drop',
          ToastMsgType.caution,
        );

        return;
      }

      this.loadFile_(tceFile);
    });
  }

  private loadFile_(file: File): void {
    this.isLoading_ = true;

    const reader = new FileReader();

    reader.onload = async (loadEvent) => {
      const content = loadEvent.target?.result;

      if (typeof content !== 'string') {
        this.isLoading_ = false;

        return;
      }

      try {
        await CatalogLoader.reloadCatalog(content);
        ServiceLocator.getUiManager().toast(
          `Loaded catalog from ${file.name}`,
          ToastMsgType.normal,
        );
      } catch (error) {
        errorManagerInstance.error(error, 'CatalogDropPlugin');
        ServiceLocator.getUiManager().toast(
          `Failed to load ${file.name}`,
          ToastMsgType.critical,
        );
      } finally {
        this.isLoading_ = false;
      }
    };

    reader.readAsText(file);
  }
}
