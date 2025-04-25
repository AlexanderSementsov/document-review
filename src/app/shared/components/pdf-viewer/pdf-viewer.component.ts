import { Component, effect, input, OnDestroy  } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
})
export class PdfViewerComponent implements OnDestroy {
  documentUrl = input<string | null>('')
  private instance: any = null;

  constructor() {
    effect(() => {
      const url = this.documentUrl();
      if (!url) return;

      if (this.instance) {
        NutrientViewer.unload(this.instance);
      }

      NutrientViewer.load({
        baseUrl: `${location.origin}/assets/`,
        document: url,
        container: '#nutrient-container',
        locale: 'en',
        toolbarItems: [
          { type: 'sidebar-thumbnails' },
          { type: 'pager' },
          { type: 'pan' },
          { type: 'spacer' },
          { type: 'zoom-out' },
          { type: 'zoom-in' },
          { type: 'zoom-mode' },
          { type: 'print' },
          { type: 'search' },
          { type: 'export-pdf' }
        ]
      }).then(instance => {
        this.instance = instance;
        (window as any).instance = instance;
      });
    }, { allowSignalWrites: true });
  }

  ngOnDestroy(): void {
    if (this.instance) {
      NutrientViewer.unload(this.instance);
      this.instance = null;
    } else {
      NutrientViewer.unload('#nutrient-container');
    }
  }
}
