// Simulated API with delays
export function delay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockApiCall<T>(data: T, delayMs: number = 800): Promise<T> {
  await delay(delayMs);
  return data;
}

export async function simulateOCR(): Promise<{
  invoiceNumber: string;
  supplier: string;
  date: string;
  amount: number;
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
}> {
  await delay(2500);
  return {
    invoiceNumber: "INV-2024-00123",
    supplier: "Tech Supplies Inc.",
    date: "2024-01-15",
    amount: 1245.50,
    items: [
      { description: "USB-C Docking Station", quantity: 2, unitPrice: 189.99, total: 379.98 },
      { description: "Wireless Keyboard", quantity: 5, unitPrice: 79.50, total: 397.50 },
      { description: "Monitor Stand", quantity: 3, unitPrice: 54.99, total: 164.97 },
      { description: "Cable Management Kit", quantity: 10, unitPrice: 12.50, total: 125.00 },
      { description: "Laptop Sleeve 15\"", quantity: 5, unitPrice: 35.61, total: 178.05 },
    ],
  };
}

export async function simulateReconciliation(): Promise<{ matched: number; discrepancies: number }> {
  await delay(2000);
  return { matched: 38, discrepancies: 4 };
}
