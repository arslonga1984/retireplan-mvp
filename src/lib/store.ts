import { create } from 'zustand';
import type { UserInputs } from '@/types';

interface AppState {
    inputs: UserInputs;
    setInputs: (inputs: Partial<UserInputs>) => void;
    reset: () => void;
}

const defaultInputs: UserInputs = {
    currentAge: 30,
    retirementAge: 60,
    currentAssets: 0,
    monthlyContribution: 1000000,
    targetRetirementIncome: 3000000,
    targetReturn: 7,
    maxDrawdown: 25,
    strategyId: '',
    payoutType: 'perpetual',
    payoutYears: 20,
    inflationAdjusted: true,
};

export const useAppStore = create<AppState>((set) => ({
    inputs: defaultInputs,
    setInputs: (newInputs) => set((state) => ({ inputs: { ...state.inputs, ...newInputs } })),
    reset: () => set({ inputs: defaultInputs }),
}));
