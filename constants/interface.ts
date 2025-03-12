export interface ICreate {
    type: 'autocomplete' | 'select' | 'multiselect' | 'text' | 'date';
    field: string;
    value: string;
}

export interface IContractorPage {
    id: number;
    contractorCode: string;
    contractorSelectionPlanId: number;
    contractorSelectionPlanCode: string;
    contractorName: string;
    contractorPrice: number;
    status: number;
    createdAt: string;
    createdBy: number;
    createdByName: string;
    createdByGroupName: string;
    listDocumentByPid: IDocumentByPid[];
}

export interface IDocumentByPid {
    id: number;
    contractorPlanId: number;
    status: number;
    contractorId: number;
    code: string;
    evaluationPlanSelectionReportDate: string;
    proposalDate: string;
    approvalDecisionPlanSelection?: string;
    expertGroupDecisionDate?: string;
    approvalDecisionPlanSelectionApprovalDate?: string;
    reportCreationDate?: string;
    deliveryTime?: string;
    bidSubmissionEndTime?: string;
    paymentConditions?: string;
    proposalApprovalHsmtDate?: string;
    contractType?: string;
    contractExecutionTime?: string;
    isDel: 'Y' | 'N';
    createdBy: number;
    createdAt: string;
    updatedBy: number;
    updatedAt: string;
}