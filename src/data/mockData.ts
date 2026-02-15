export interface Invoice {
  id: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "pending" | "matched" | "discrepancy" | "resolved";
  category: string;
  items: InvoiceItem[];
  notes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DigitalRecord {
  id: string;
  invoiceNumber: string;
  supplier: string;
  amount: number;
  date: string;
  sourceSystem: "ERP" | "Accounting" | "Excel" | "Manual";
  status: "unmatched" | "matched" | "discrepancy";
  poNumber?: string;
}

export interface Discrepancy {
  id: string;
  invoiceId: string;
  digitalRecordId: string;
  type: "amount" | "date" | "supplier" | "items" | "duplicate";
  severity: "low" | "medium" | "high" | "critical";
  invoiceValue: string;
  digitalValue: string;
  field: string;
  resolved: boolean;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface Activity {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  type: "upload" | "match" | "resolve" | "alert" | "import";
}

const suppliers = [
  "Tech Supplies Inc.", "Office Pro Solutions", "Global Parts Ltd.", "DataLink Corp.",
  "Prime Electronics", "CloudServe Inc.", "NetFlow Systems", "Apex Manufacturing",
  "Sterling Logistics", "Quantum Dynamics", "BlueChip Hardware", "Pinnacle Software",
  "Vertex Industrial", "Nova Supplies Co.", "TrueNorth Trading"
];

const categories = ["Office Supplies", "IT Equipment", "Software Licenses", "Consulting", "Hardware", "Maintenance", "Logistics", "Raw Materials"];

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0];
}

function generateItems(count: number): InvoiceItem[] {
  const itemNames = [
    "Laptop Stand", "USB-C Hub", "Monitor Cable", "Keyboard", "Mouse Pad",
    "Ethernet Cable", "Webcam", "Headset", "Power Strip", "Desk Lamp",
    "Storage Drive", "RAM Module", "Printer Toner", "Paper Ream", "Desk Organizer"
  ];
  const items: InvoiceItem[] = [];
  for (let i = 0; i < count; i++) {
    const qty = Math.floor(Math.random() * 10) + 1;
    const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
    items.push({
      description: itemNames[Math.floor(Math.random() * itemNames.length)],
      quantity: qty,
      unitPrice: price,
      total: Math.round(qty * price * 100) / 100,
    });
  }
  return items;
}

const statuses: Invoice["status"][] = ["pending", "matched", "discrepancy", "resolved"];

export function generateInvoices(count: number): Invoice[] {
  const invoices: Invoice[] = [];
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const items = generateItems(Math.floor(Math.random() * 4) + 2);
    const amount = Math.round(items.reduce((s, it) => s + it.total, 0) * 100) / 100;
    invoices.push({
      id: `inv-${String(i + 1).padStart(4, "0")}`,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(5, "0")}`,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      amount,
      date: randomDate("2024-01-01", "2024-12-31"),
      dueDate: randomDate("2024-02-01", "2025-03-31"),
      status,
      category: categories[Math.floor(Math.random() * categories.length)],
      items,
      ...(status === "resolved" ? {
        resolvedAt: randomDate("2024-06-01", "2024-12-31"),
        resolvedBy: "Admin User",
        resolutionNote: "Verified with supplier and corrected in system.",
      } : {}),
    });
  }
  return invoices;
}

export function generateDigitalRecords(count: number): DigitalRecord[] {
  const systems: DigitalRecord["sourceSystem"][] = ["ERP", "Accounting", "Excel", "Manual"];
  const records: DigitalRecord[] = [];
  for (let i = 0; i < count; i++) {
    const status: DigitalRecord["status"] = ["unmatched", "matched", "discrepancy"][Math.floor(Math.random() * 3)] as DigitalRecord["status"];
    records.push({
      id: `dr-${String(i + 1).padStart(4, "0")}`,
      invoiceNumber: `INV-2024-${String(Math.floor(Math.random() * 60) + 1).padStart(5, "0")}`,
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      amount: Math.round((Math.random() * 5000 + 100) * 100) / 100,
      date: randomDate("2024-01-01", "2024-12-31"),
      sourceSystem: systems[Math.floor(Math.random() * systems.length)],
      status,
      poNumber: `PO-${Math.floor(Math.random() * 9000) + 1000}`,
    });
  }
  return records;
}

export function generateDiscrepancies(): Discrepancy[] {
  const types: Discrepancy["type"][] = ["amount", "date", "supplier", "items", "duplicate"];
  const severities: Discrepancy["severity"][] = ["low", "medium", "high", "critical"];
  const discrepancies: Discrepancy[] = [];
  for (let i = 0; i < 25; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const resolved = i < 10;
    discrepancies.push({
      id: `disc-${String(i + 1).padStart(4, "0")}`,
      invoiceId: `inv-${String(Math.floor(Math.random() * 50) + 1).padStart(4, "0")}`,
      digitalRecordId: `dr-${String(Math.floor(Math.random() * 40) + 1).padStart(4, "0")}`,
      type,
      severity: severities[Math.floor(Math.random() * severities.length)],
      invoiceValue: type === "amount" ? `$${(Math.random() * 5000 + 100).toFixed(2)}` : type === "date" ? "2024-03-15" : "Tech Supplies Inc.",
      digitalValue: type === "amount" ? `$${(Math.random() * 5000 + 100).toFixed(2)}` : type === "date" ? "2024-03-16" : "Tech Supplies, Inc.",
      field: type === "amount" ? "Total Amount" : type === "date" ? "Invoice Date" : "Supplier Name",
      resolved,
      ...(resolved ? {
        resolvedAt: randomDate("2024-06-01", "2024-12-31"),
        resolutionNote: "Reviewed and corrected. Digital record updated.",
      } : {}),
    });
  }
  return discrepancies;
}

export function generateActivities(): Activity[] {
  const activities: Activity[] = [
    { id: "a1", action: "Invoice Uploaded", description: "INV-2024-00047 uploaded and processed via OCR", timestamp: "2024-12-10T14:32:00", user: "Sarah Chen", type: "upload" },
    { id: "a2", action: "Auto-Match Found", description: "INV-2024-00045 matched with PO-4521", timestamp: "2024-12-10T14:28:00", user: "System", type: "match" },
    { id: "a3", action: "Discrepancy Resolved", description: "Amount mismatch on INV-2024-00038 resolved", timestamp: "2024-12-10T13:55:00", user: "James Park", type: "resolve" },
    { id: "a4", action: "High Discrepancy Alert", description: "$2,340 amount mismatch detected on INV-2024-00042", timestamp: "2024-12-10T13:20:00", user: "System", type: "alert" },
    { id: "a5", action: "Records Imported", description: "156 digital records imported from ERP", timestamp: "2024-12-10T12:00:00", user: "Admin", type: "import" },
    { id: "a6", action: "Invoice Uploaded", description: "INV-2024-00046 uploaded by supplier portal", timestamp: "2024-12-10T11:45:00", user: "Mike Johnson", type: "upload" },
    { id: "a7", action: "Discrepancy Resolved", description: "Date mismatch on INV-2024-00035 corrected", timestamp: "2024-12-10T11:10:00", user: "Sarah Chen", type: "resolve" },
    { id: "a8", action: "Auto-Match Found", description: "INV-2024-00044 matched with digital record DR-0089", timestamp: "2024-12-10T10:30:00", user: "System", type: "match" },
  ];
  return activities;
}

// Seeded data
export const invoices = generateInvoices(55);
export const digitalRecords = generateDigitalRecords(40);
export const discrepancies = generateDiscrepancies();
export const activities = generateActivities();

export const dashboardStats = {
  totalInvoices: 1247,
  pendingReconciliation: 42,
  matchedInvoices: 1150,
  discrepancyAmount: 12450.75,
  successRate: 92.3,
};

export const monthlyData = [
  { month: "Jul", reconciled: 145, discrepancies: 12 },
  { month: "Aug", reconciled: 168, discrepancies: 18 },
  { month: "Sep", reconciled: 152, discrepancies: 9 },
  { month: "Oct", reconciled: 178, discrepancies: 15 },
  { month: "Nov", reconciled: 192, discrepancies: 11 },
  { month: "Dec", reconciled: 201, discrepancies: 8 },
];

export const severityData = [
  { name: "Low", value: 8, fill: "hsl(var(--chart-1))" },
  { name: "Medium", value: 6, fill: "hsl(var(--chart-3))" },
  { name: "High", value: 4, fill: "hsl(var(--chart-4))" },
  { name: "Critical", value: 2, fill: "hsl(var(--chart-5))" },
];
