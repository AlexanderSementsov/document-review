import { afterNextRender, Component, effect, input, signal } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
})
export class PdfViewerComponent {
  documentUrl = input<string | null>('')

  constructor() {
    effect(() => {
      const url = this.documentUrl();
      if (!url) return;

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
        (window as any).instance = instance;
      });
    }, { allowSignalWrites: true });
  }
}
