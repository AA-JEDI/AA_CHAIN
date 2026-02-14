import { create } from 'zustand';
import { Agreement, Amendment } from '@/types';
import { mockAgreements, mockAmendments } from '@/mock/agreements';

interface AgreementState {
    agreements: Agreement[];
    amendments: Record<string, Amendment[]>; // agreementId -> amendments
    selectedAgreement: Agreement | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    setAgreements: (agreements: Agreement[]) => void;
    addAgreement: (agreement: Agreement) => void;
    updateAgreement: (agreement: Agreement) => void;
    selectAgreement: (agreement: Agreement | null) => void;
    setAmendments: (agreementId: string, amendments: Amendment[]) => void;
    addAmendment: (amendment: Amendment) => void;
    updateAmendment: (amendment: Amendment) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useAgreementStore = create<AgreementState>((set) => ({
    agreements: mockAgreements,
    amendments: {
        agreement_001: mockAmendments.filter((a) => a.agreementId === 'agreement_001'),
        agreement_005: mockAmendments.filter((a) => a.agreementId === 'agreement_005'),
    },
    selectedAgreement: null,
    isLoading: false,
    error: null,

    setAgreements: (agreements) => set({ agreements }),

    addAgreement: (agreement) =>
        set((state) => ({
            agreements: [agreement, ...state.agreements],
        })),

    updateAgreement: (agreement) =>
        set((state) => ({
            agreements: state.agreements.map((a) =>
                a.id === agreement.id ? agreement : a
            ),
            selectedAgreement:
                state.selectedAgreement?.id === agreement.id
                    ? agreement
                    : state.selectedAgreement,
        })),

    selectAgreement: (agreement) => set({ selectedAgreement: agreement }),

    setAmendments: (agreementId, amendments) =>
        set((state) => ({
            amendments: {
                ...state.amendments,
                [agreementId]: amendments,
            },
        })),

    addAmendment: (amendment) =>
        set((state) => ({
            amendments: {
                ...state.amendments,
                [amendment.agreementId]: [
                    amendment,
                    ...(state.amendments[amendment.agreementId] || []),
                ],
            },
        })),

    updateAmendment: (amendment) =>
        set((state) => ({
            amendments: {
                ...state.amendments,
                [amendment.agreementId]: (
                    state.amendments[amendment.agreementId] || []
                ).map((a) => (a.id === amendment.id ? amendment : a)),
            },
        })),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),
}));
