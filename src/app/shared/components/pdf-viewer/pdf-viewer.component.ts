import { afterNextRender, Component } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
})
export class PdfViewerComponent {
  constructor() {
    afterNextRender(() => {
      NutrientViewer.load({
        baseUrl: `${location.origin}/assets/`,
        document: `${location.origin}/assets/document-pdf.pdf`,
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
    });
  }
}
