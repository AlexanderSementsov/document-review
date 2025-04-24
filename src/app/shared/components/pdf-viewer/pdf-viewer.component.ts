import { Component, OnInit } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
})
export class PdfViewerComponent implements OnInit {
  ngOnInit(): void {
    NutrientViewer.load({
      baseUrl: `${location.origin}/assets/`,
      document: `${location.origin}/assets/document-pdf.pdf`,
      container: "#nutrient-container",
    }).then(instance => {
      (window as any).instance = instance;
    });
  }
}
