
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const withRetry = async <T>(fn: () => Promise<T>, retries = 5, initialDelay = 3000): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error?.status || error?.code;
      const message = error?.message?.toLowerCase() || "";
      const isRateLimit = status === 429 || message.includes('429') || message.includes('quota') || message.includes('exhausted');
      
      if (isRateLimit && i < retries - 1) {
        const delay = (initialDelay * Math.pow(2, i)) + (Math.random() * 1000);
        console.warn(`Quota Hit (429). Retry ${i + 1}/${retries} in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const detectHeaders = async (headers: string[], fileType: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Map CSV headers to canonical schema for ${fileType}. Headers: ${headers.join(', ')}. Return mapping, confidence (0-100), and rationale for choice. Note: The institutional currency context is Ethiopian Birr (ETB).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mapping: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                amount: { type: Type.STRING },
                category: { type: Type.STRING },
                department: { type: Type.STRING },
                description: { type: Type.STRING },
              }
            },
            confidence: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzeVisualDocument = async (base64Image: string, mimeType: string) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType: mimeType } },
          { text: "FINANCIAL FORENSIC EXTRACTION: Primary currency is ETB. 1. Extract 'Date', 'Grand Total', and 'Tax Total'. 2. Deconstruct artifact into individual line items. 3. For each item, extract 'Description', 'Quantity', 'Subtotal', and specifically 'Tax' (VAT/Statutory). If tax is not listed per item, calculate effective rate from the total. 4. Assign 'suggestedCategory' (REVENUE, COGS, OPEX, TAX). 5. Extract payment breakdown: 'Cash', 'Bank Transfer', 'Mobile Money', 'Card'. 6. If it's a POS summary, look for 'Expected Cash' vs 'Actual Cash' to determine 'Over/Short'. Validation: Ensure sum of line item totals equals Grand Total." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING },
            grandTotal: { type: Type.NUMBER },
            taxTotal: { type: Type.NUMBER },
            suggestedMethod: { type: Type.STRING },
            isValid: { type: Type.BOOLEAN },
            validationNotes: { type: Type.STRING },
            paymentBreakdown: {
              type: Type.OBJECT,
              properties: {
                cash: { type: Type.NUMBER },
                bank: { type: Type.NUMBER },
                mobile: { type: Type.NUMBER },
                card: { type: Type.NUMBER },
                overShort: { type: Type.NUMBER }
              }
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  qty: { type: Type.NUMBER },
                  subtotal: { type: Type.NUMBER },
                  tax: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                  suggestedCategory: { type: Type.STRING }
                }
              }
            },
            confidence: { type: Type.NUMBER },
            rationale: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const synthesizeESGImpact = async (financials: any) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Synthesize ESG impact metrics based on the following institutional financial data: ${JSON.stringify(financials)}. 
      Consider infrastructure costs (carbon), travel, and logistics. Context: All currency values are in Ethiopian Birr (ETB).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            carbonTons: { type: Type.NUMBER, description: 'Estimated metric tons of CO2 based on OpEx patterns.' },
            impactScore: { type: Type.NUMBER, description: 'Overall ESG health score from 0-100.' },
            governanceRating: { type: Type.STRING, description: 'A letter grade like A-, B, etc.' },
            offsetEstimate: { type: Type.NUMBER, description: 'Projected cost in ETB to neutralize footprint.' },
            initiatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  cost: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ['carbonTons', 'impactScore', 'governanceRating', 'offsetEstimate', 'initiatives']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const analyzeReconciliation = async (posTotal: number, ledgerTotal: number, items: any[]) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a reconciliation between POS Total (Br ${posTotal}) and Ledger Total (Br ${ledgerTotal}). Context is Ethiopian Birr (ETB). Items: ${JSON.stringify(items)}. Identify tolerance levels, timing variances (card vs cash), and investigation flags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            variance: { type: Type.NUMBER },
            toleranceStatus: { type: Type.STRING },
            investigationRequired: { type: Type.BOOLEAN },
            explanation: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const performForensicAnalysis = async (records: any[]) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Auditing structural risk for period close in ETB: ${JSON.stringify(records.slice(0,5))}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const querySageLedgerAI = async (query: string, ledgerSummary: string) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Forensic financial auditor for Sage 50. Institutional context is Ethiopian Birr (ETB). CONTEXT: ${ledgerSummary} QUESTION: ${query}.`, }); return response.text; }); };
export const generateAudioBrief = async (text: string): Promise<string | undefined> => { return withRetry(async () => { const response = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: [{ parts: [{ text: `Say professionally: ${text}` }] }], config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } } }); return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; }); };
export const generateCFOBrief = async (data: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `1-paragraph CFO summary for institutional performance in ETB: ${JSON.stringify(data)}`, }); return response.text; }); };
export const analyzeRiskExposure = async (records: any[]) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Institutional risk audit for ETB ledger: ${JSON.stringify(records.slice(0,10))}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "[]"); }); };
export const generateDecisionPlaybook = async (rec: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Step-by-step implementation for ETB-based initiative: ${rec.initiative}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "[]"); }); };
export const simulateIncentives = async (params: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Simulate incentives in ETB: ${JSON.stringify(params)}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "{}"); }); };
export const analyzeRootCause = async (variance: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Root cause analysis (ETB context): ${JSON.stringify(variance)}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "{}"); }); };
export const generateScenarioForecast = async (input: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Scenario forecast in ETB: ${JSON.stringify(input)}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "[]"); }); };
export const negotiateBudgetAI = async (dept: string, amt: number, roi: number) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Negotiate budget for ${dept} in ETB: Br ${amt}, ROI ${roi}x.`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "{}"); }); };
export const evaluateInvestmentProject = async (p: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Evaluate project in ETB: ${p.name}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "{}"); }); };
export const forecastHiringROI = async (s: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `Hiring ROI for ETB salary: ${s.role}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "{}"); }); };
export const generateExecutiveSummary = async (data: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `2-paragraph summary (ETB context) for: ${JSON.stringify(data)}`, }); return response.text; }); };
export const checkFinancialCompleteness = async (data: any) => { return withRetry(async () => { const response = await ai.models.generateContent({ model: 'gemini-3-pro-preview', contents: `ETB Ledger completeness: ${JSON.stringify(data)}`, config: { responseMimeType: "application/json" } }); return JSON.parse(response.text || "[]"); }); };

export const validateDataAnomalies = async (rows: any[]) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Validate the following ETB financial rows for anomalies: ${JSON.stringify(rows)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              field: { type: Type.STRING },
              message: { type: Type.STRING },
              severity: { type: Type.STRING },
              rationale: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const generateStrategicRecommendations = async (params: any) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate strategic recommendations based on these ETB records: ${JSON.stringify(params.records)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              initiative: { type: Type.STRING },
              action: { type: Type.STRING },
              rationale: { type: Type.STRING },
              projectedImpact: { type: Type.STRING },
              confidence: { type: Type.NUMBER }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  });
};

export const performDeepLedgerAudit = async (hash: string, mutation: any) => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a deep ledger lookup for audit hash ${hash}. Context is Ethiopian Birr (ETB). Analyze mutation: ${JSON.stringify(mutation)}. Explain accounting logic.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forensicExplanation: { type: Type.STRING },
            intentDetection: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            lineagePath: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};
