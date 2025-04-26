import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmService } from '../../../../core/services/confirm.service';
import { DocumentGridComponent } from './document-grid.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DocumentService } from '../../../../core/services/document.service';
import { SortDocumentsEnum } from '../../../../shared/enums/sort-documents.enum';

describe('DocumentGridComponent', () => {
  let component: DocumentGridComponent;
  let fixture: ComponentFixture<DocumentGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DocumentGridComponent,
        RouterTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        provideHttpClientTesting(),
        {
          provide: DocumentService,
          useValue: {
            getDocuments: jest.fn(),
            deleteDocument: jest.fn(),
          },
        },
        {
          provide: ConfirmService,
          useValue: {
            confirm: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should update sort field when toggling sort', () => {
    component.query.set({ page: 1, size: 10, sort: null, status: null });

    component.toggleSort('name');

    expect(component.query().sort).toBe(SortDocumentsEnum.NAME_ASC);
  });
});
