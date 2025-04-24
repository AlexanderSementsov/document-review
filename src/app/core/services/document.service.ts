import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BACKEND_URL } from '../../shared/tokens/backend-url.token';
import { Observable } from 'rxjs';
import { DocumentResDto } from '../../shared/interfaces/document/document-res.dto';
import { DocumentsResDto } from '../../shared/interfaces/document/documents-res.dto';
import { UploadDocumentDto } from '../../shared/interfaces/document/upload-document.dto';
import { DocumentStatus } from '../../shared/enums/document-status.enum';
import { PaginationParams } from '../../shared/types/pagination-params';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private baseUrl = inject(BACKEND_URL);

  getDocuments(params: PaginationParams): Observable<DocumentsResDto> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<DocumentsResDto>(`${this.baseUrl}/document`, {params: httpParams});
  }

  getDocumentById(id: string): Observable<DocumentResDto> {
    return this.http.get<DocumentResDto>(`${this.baseUrl}/document/${id}`);
  }

  uploadDocument(payload: UploadDocumentDto): Observable<DocumentResDto> {
    return this.http.post<DocumentResDto>(`${this.baseUrl}/document`, payload);
  }

  updateDocumentName(id: string, name: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/document/${id}`, { name });
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/document/${id}`);
  }

  // User
  sendDocumentToReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/document/${id}/send-to-review`, {});
  }

  revokeDocumentReview(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/document/${id}/revoke-review`, {});
  }

  // Reviewer
  changeDocumentStatus(id: string, status: DocumentStatus): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/document/${id}/change-status`, {status});
  }
}
