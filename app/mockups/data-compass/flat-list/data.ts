/**
 * Demo rows for the flat-list mockup. Every column and sampled file across the
 * estate becomes one row, which is the direction the tree view replaced.
 * Seeded, so the same page always shows the same rows.
 */

export type Sensitivity = "High" | "Medium" | "Low";
export type NodeKind = "Column" | "File";

export type FlatRow = {
  id: string;
  name: string;
  kind: NodeKind;
  path: string;
  sensitivity: Sensitivity;
  pii: string[];
  scanned: string;
};

type Asset = { name: string; domain: string; subdomain: string; structured: boolean };

const ASSETS: Asset[] = [
  { name: "savings_accounts_master", domain: "casa", subdomain: "savings", structured: true },
  { name: "savings_kyc_snapshot", domain: "casa", subdomain: "savings", structured: false },
  { name: "current_accounts_master", domain: "casa", subdomain: "current", structured: true },
  { name: "current_txn_history", domain: "casa", subdomain: "current", structured: true },
  { name: "fixed_deposits_ledger", domain: "casa", subdomain: "deposits", structured: true },
  { name: "nri_remittance_log", domain: "casa", subdomain: "salary-nri", structured: true },
  { name: "credit_card_master", domain: "cards", subdomain: "credit", structured: true },
  { name: "credit_card_txns", domain: "cards", subdomain: "credit", structured: true },
  { name: "debit_card_disputes", domain: "cards", subdomain: "debit", structured: false },
  { name: "home_loan_applications", domain: "lending", subdomain: "retail", structured: true },
  { name: "loan_kyc_documents", domain: "lending", subdomain: "retail", structured: false },
  { name: "msme_credit_files", domain: "lending", subdomain: "msme", structured: false },
  { name: "branch_cctv_index", domain: "operations", subdomain: "branches", structured: false },
  { name: "employee_payroll", domain: "hr", subdomain: "payroll", structured: true },
];

const PII_COLUMNS: Record<string, string[]> = {
  Aadhaar: ["aadhaar_encrypted", "aadhaar_last4"],
  PAN: ["pan_number_enc", "pan_verified_at"],
  "Bank Account": ["account_number_enc", "ifsc_code"],
  "Credit Card": ["card_number_masked", "card_holder"],
  Name: ["first_name", "full_name"],
  Phone: ["phone_number", "alt_phone"],
  Email: ["email_address"],
  Address: ["address_line1", "pincode"],
  DOB: ["date_of_birth"],
  Passport: ["passport_no_enc"],
};

const FILES = [
  "kyc_batch_{n}.pdf",
  "statements_{n}.csv",
  "customer_upload_{n}.jpg",
  "onboarding_form_{n}.png",
  "applications_{n}.parquet",
  "dispute_notes_{n}.docx",
];

const SCHEMAS = ["public", "core", "archive"];
const TABLES = ["customers", "accounts", "kyc_records", "transactions", "beneficiaries", "applications"];
const SCANNED = ["2 hours ago", "Yesterday", "3 days ago", "Last week"];
const PII_TYPES = Object.keys(PII_COLUMNS);

/** Mulberry32. Small, fast and deterministic. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rand: () => number, list: readonly T[]) => list[Math.floor(rand() * list.length)];

function makeRow(index: number): FlatRow {
  const rand = seeded(index + 7);
  const asset = pick(rand, ASSETS);
  const primary = pick(rand, PII_TYPES);
  const extra = rand() > 0.6 ? [pick(rand, PII_TYPES)].filter((p) => p !== primary) : [];
  const pii = [primary, ...extra];
  const high = ["Aadhaar", "PAN", "Bank Account", "Credit Card", "Passport"];
  const sensitivity: Sensitivity = pii.some((p) => high.includes(p)) ? "High" : rand() > 0.5 ? "Medium" : "Low";
  const base = `${asset.domain} / ${asset.subdomain} / ${asset.name}`;

  if (asset.structured) {
    const schema = pick(rand, SCHEMAS);
    const table = pick(rand, TABLES);
    return {
      id: `r${index}`,
      name: pick(rand, PII_COLUMNS[primary]),
      kind: "Column",
      path: `${base} / ${schema} / ${table}`,
      sensitivity,
      pii,
      scanned: pick(rand, SCANNED),
    };
  }

  const n = String(Math.floor(rand() * 9000) + 1000);
  return {
    id: `r${index}`,
    name: pick(rand, FILES).replace("{n}", n),
    kind: "File",
    path: `${base} / ${pick(rand, ["uploads", "exports", "2024", "archive"])}`,
    sensitivity,
    pii,
    scanned: pick(rand, SCANNED),
  };
}

/** Enough rows for pagination to feel endless without building 48k objects. */
export const ROWS: FlatRow[] = Array.from({ length: 2400 }, (_, i) => makeRow(i));

/** The estate the mockup claims to hold, scaled by how much of ROWS survives a filter. */
export const ESTATE_TOTAL = 48212;

export const FACETS = {
  sensitivity: ["High", "Medium", "Low"] as Sensitivity[],
  kind: ["Column", "File"] as NodeKind[],
  pii: PII_TYPES,
};
