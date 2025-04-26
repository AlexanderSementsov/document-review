import { Component, effect, input, OnDestroy } from '@angular/core';
import NutrientViewer from '@nutrient-sdk/viewer';

@Component({
  selector: 'pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
  standalone: true,
})
export class PdfViewerComponent implements OnDestroy {
  documentUrl = input<string | null>('');
  private instance: any = null;
  private nutrientContainerId = 'nutrient-container';

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
        container: `#${this.nutrientContainerId}`,
        locale: 'en',
        toolbarItems: [
          {type: 'sidebar-thumbnails'},
          {type: 'pager'},
          {type: 'pan'},
          {type: 'spacer'},
          {type: 'zoom-out'},
          {type: 'zoom-in'},
          {type: 'zoom-mode'},
          {type: 'print'},
          {type: 'search'},
          {type: 'export-pdf'},
          {
            type: 'custom',
            id: 'fullscreen-button',
            title: 'Fullscreen',
            icon: this.getFullscreenIcon(),
            onPress: () => this.toggleFullscreen()
          }
        ]
      }).then(instance => {
        this.instance = instance;
        (window as any).instance = instance;
      });
    }, {allowSignalWrites: true});

    document.addEventListener('fullscreenchange', this.onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange);
  }

  toggleFullscreen() {
    const container = document.getElementById(this.nutrientContainerId);
    if (!container) return;

    if (!this.isFullscreen()) {
      this.requestFullscreen(container);
    } else {
      this.exitFullscreen();
    }
  }

  isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement
    );
  }

  requestFullscreen(element: HTMLElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
  }

  getFullscreenIcon(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
        <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z"/>
      </svg>
    `;
  }

  onFullscreenChange = () => {
    const container = document.getElementById(this.nutrientContainerId);
    if (!container) return;
  };

  ngOnDestroy(): void {
    if (this.instance) {
      NutrientViewer.unload(this.instance);
      this.instance = null;
    } else {
      NutrientViewer.unload(`#${this.nutrientContainerId}`);
    }

    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange);
  }
}
