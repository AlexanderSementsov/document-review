export enum DocumentStatus {
  DRAFT = 'DRAFT',
  REVOKE = 'REVOKE',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export type ReviewerDocumentStatus = DocumentStatus.UNDER_REVIEW | DocumentStatus.APPROVED | DocumentStatus.DECLINED;
