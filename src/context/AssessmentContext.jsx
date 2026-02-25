import { createContext, useState, useContext } from 'react';

const AssessmentContext = createContext();

export const AssessmentProvider = ({ children }) => {
    const [data, setData] = useState({
        // Step 1: Cadastro Inicial
        personal: {
            name: '',
            cpf: '',
            rg: '',
            birthDate: '',
            civilStatus: '',
            profession: '',
            street: '',
            number: '',
            neighborhood: '',
            zipCode: '',
            complement: '',
            phone: '',

            isRepresented: 'nao', // 'sim' or 'nao'
            representativeName: '',
            priorities: {
                elderly: false,
                pwd: false,
                illness: false,
                urgency: false
            }
        },
        // Step 2: Núcleo Familiar e Renda
        family: {
            members: [], // { id, name, kinship, age, incomeSource, incomeValue }
        },
        // Computed automatically usually, but stored for reference
        totalFamilyIncome: 0,

        // Step 3: Análise Financeira
        financial: {
            expenses: {
                rent: 0,
                water: 0,
                light: 0,
                food: 0,
                health: 0,
                transport: 0
            },
            customExpenses: [], // { description, value } - despesas extras adicionadas manualmente
            deductionItems: [], // { description, value } - deduções em tópicos para o relatório
            hasInvestments: '', // 'sim' | 'nao'
            investments: [], // { description, value } - investimentos financeiros declarados
            assets: {
                realEstate: '', // 'nao', 'sim_moradia', 'sim_extra'
                vehicle: '' // 'nao', 'sim_trabalho', 'sim_luxo'
            }
        },

        // Step 4: Documentação e Análise
        demand: {
            type: '',
            object: '',
            processNumber: '',
            declarations: {
                truthfulness: false,
                hyposufficiency: false
            }
        },
        documents: {
            files: [],
            inconsistencies: [],
        },

        result: null,
    });

    const updateData = (section, values) => {
        setData((prev) => {
            const newData = {
                ...prev,
                [section]: { ...prev[section], ...values },
            };

            // Auto-calculate Total Income if family changes
            // BPC is excluded from the calculation per portaria
            if (section === 'family') {
                const total = (newData.family.members || []).reduce((acc, curr) => {
                    if (curr.benefitType === 'BPC' || curr.benefitType === 'Bolsa Família') return acc; // Desconsiderar conforme portaria
                    return acc + (parseFloat(curr.incomeValue) || 0);
                }, 0);
                newData.totalFamilyIncome = total;
            }

            return newData;
        });
    };

    return (
        <AssessmentContext.Provider value={{ data, updateData, setData }}>
            {children}
        </AssessmentContext.Provider>
    );
};

export const useAssessment = () => useContext(AssessmentContext);
