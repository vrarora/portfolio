"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Buildings,
  ChartBar,
  Columns,
  Compass,
  Database,
  Folder,
  Gear,
  HardDrives,
  PencilSimple,
  Stack,
  Table,
  Tag,
} from "@phosphor-icons/react";
import {
  DcMainCard,
  DcSidebar,
  DcTopNav,
  DcFilterBar,
  DcDataTable,
  type BreadcrumbItem,
  type CardTab,
  type NavItem,
  type TableColumn,
  type TableRow,
  type TreeItem,
} from "@/components/data-compass/library";
import "./styles.css";
import "./hover-tokens.css";

type NodeType =
  | "organization"
  | "domain"
  | "subdomain"
  | "asset"
  | "database"
  | "schema"
  | "table"
  | "column";

type NodeRecord = {
  id: string;
  label: string;
  type: NodeType;
  parentId?: string;
  children: string[];
  icon: ReactNode;
  breadcrumbLabel?: string;
  metrics: Record<string, string>;
  details: Array<{ label: string; value: ReactNode }>;
};

const sidebarItems: NavItem[] = [
  { label: "Explore", icon: <Compass size={16} />, active: true },
  { label: "Dashboard", icon: <ChartBar size={16} /> },
  { label: "Assets", icon: <Folder size={16} />, href: "/mockups/data-compass/assets" },
  { label: "Business Process", icon: <Gear size={16} /> },
  { label: "Domains", icon: <Database size={16} /> },
  { label: "Tag Categories", icon: <Tag size={16} /> },
];

const cardTabs: CardTab[] = [
  { label: "Overview", active: true },
  { label: "Details" },
  { label: "Permissions" },
  { label: "Policies" },
];

const DATA_SOURCE_ICONS: Record<string, string> = {
  Postgres: "https://thesvg.org/icons/postgresql/default.svg",
  ClickHouse: "https://thesvg.org/icons/clickhouse/default.svg",
  S3: "https://thesvg.org/icons/aws-amazon-simple-storage-service/default.svg",
  GCS: "https://thesvg.org/icons/google-cloud-storage/default.svg",
};

const nodes: Record<string, NodeRecord> = {
  org_main: {
    id: "org_main",
    label: "My Organization",
    type: "organization",
    children: ["domain_idfy", "domain_fraud", "domain_lending", "domain_kyc", "domain_onboarding", "domain_identity", "domain_aadhaar", "domain_pan", "domain_bank", "domain_credit", "domain_telecom", "domain_income", "domain_vehicle", "domain_gst", "domain_corporate", "domain_api_logs", "domain_events", "domain_reports", "domain_compliance", "domain_audit", "domain_ml"],
    icon: <Buildings size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "10 Dec 2022",
      totalDomains: "3",
      totalAssets: "128",
      dataSources: "Postgres, ClickHouse, S3, GCS",
    },
    details: [
      { label: "Node Type", value: "Organization" },
      { label: "Total Domains", value: "3" },
      { label: "Total Assets", value: "128" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 18", "GCS 11", "ClickHouse 7", "S3 9"]) },
      { label: "Created On", value: "10 Dec 2022, 12:04 PM" },
    ],
  },
  domain_idfy: {
    id: "domain_idfy",
    label: "IDfy",
    type: "domain",
    parentId: "org_main",
    children: ["subdomain_default", "subdomain_decisioning", "subdomain_fraud_ops", "subdomain_kyc", "subdomain_onboarding", "subdomain_identity", "subdomain_aadhaar_ops", "subdomain_pan_ops", "subdomain_bank_ops", "subdomain_credit_ops", "subdomain_telecom", "subdomain_income", "subdomain_vehicle", "subdomain_gst", "subdomain_corporate", "subdomain_api_logs", "subdomain_events", "subdomain_reports", "subdomain_compliance", "subdomain_audit", "subdomain_ml"],
    icon: <Buildings size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "10 Dec 2022",
      totalSubdomains: "3",
      totalAssets: "74",
      dataSources: "Postgres, GCS, Endpoint",
    },
    details: [
      { label: "Node Type", value: "Domain" },
      { label: "Sensitivity", value: riskBadge("High") },
      { label: "Added On", value: "10 Dec 2022, 12:04 PM" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 14", "GCS 8", "ClickHouse 4"], 2) },
      { label: "Owners", value: "Data Platform, Trust Ops" },
    ],
  },
  domain_kyc: { id: "domain_kyc", label: "KYC", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "15 Jan 2023", totalSubdomains: "4", totalAssets: "42", dataSources: "Postgres, S3" }, details: [] },
  domain_onboarding: { id: "domain_onboarding", label: "Onboarding", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "20 Jan 2023", totalSubdomains: "3", totalAssets: "28", dataSources: "MySQL, Postgres" }, details: [] },
  domain_identity: { id: "domain_identity", label: "Identity Verification", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "25 Jan 2023", totalSubdomains: "5", totalAssets: "61", dataSources: "Postgres, ClickHouse" }, details: [] },
  domain_aadhaar: { id: "domain_aadhaar", label: "Aadhaar Services", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "01 Feb 2023", totalSubdomains: "2", totalAssets: "19", dataSources: "Postgres" }, details: [] },
  domain_pan: { id: "domain_pan", label: "PAN Verification", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "05 Feb 2023", totalSubdomains: "2", totalAssets: "14", dataSources: "Postgres, S3" }, details: [] },
  domain_bank: { id: "domain_bank", label: "Bank Account", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "10 Feb 2023", totalSubdomains: "3", totalAssets: "22", dataSources: "Postgres, GCS" }, details: [] },
  domain_credit: { id: "domain_credit", label: "Credit Bureau", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "14 Feb 2023", totalSubdomains: "2", totalAssets: "17", dataSources: "Postgres, ClickHouse" }, details: [] },
  domain_telecom: { id: "domain_telecom", label: "Telecom", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "18 Feb 2023", totalSubdomains: "2", totalAssets: "11", dataSources: "MySQL, S3" }, details: [] },
  domain_income: { id: "domain_income", label: "Income Verification", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "22 Feb 2023", totalSubdomains: "3", totalAssets: "25", dataSources: "Postgres, BigQuery" }, details: [] },
  domain_vehicle: { id: "domain_vehicle", label: "Vehicle RC", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "01 Mar 2023", totalSubdomains: "2", totalAssets: "9", dataSources: "Postgres" }, details: [] },
  domain_gst: { id: "domain_gst", label: "GST Verification", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "05 Mar 2023", totalSubdomains: "2", totalAssets: "12", dataSources: "Postgres, S3" }, details: [] },
  domain_corporate: { id: "domain_corporate", label: "Corporate KYB", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "10 Mar 2023", totalSubdomains: "4", totalAssets: "33", dataSources: "Postgres, GCS" }, details: [] },
  domain_api_logs: { id: "domain_api_logs", label: "API Logs", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Low", createdOn: "15 Mar 2023", totalSubdomains: "1", totalAssets: "7", dataSources: "ClickHouse" }, details: [] },
  domain_events: { id: "domain_events", label: "Event Stream", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Low", createdOn: "20 Mar 2023", totalSubdomains: "2", totalAssets: "8", dataSources: "Kafka, S3" }, details: [] },
  domain_reports: { id: "domain_reports", label: "Reports", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "25 Mar 2023", totalSubdomains: "2", totalAssets: "16", dataSources: "BigQuery, Postgres" }, details: [] },
  domain_compliance: { id: "domain_compliance", label: "Compliance", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "High", createdOn: "01 Apr 2023", totalSubdomains: "3", totalAssets: "20", dataSources: "Postgres, S3" }, details: [] },
  domain_audit: { id: "domain_audit", label: "Audit Trail", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "05 Apr 2023", totalSubdomains: "1", totalAssets: "6", dataSources: "Postgres" }, details: [] },
  domain_ml: { id: "domain_ml", label: "ML Platform", type: "domain", parentId: "org_main", children: [], icon: <Buildings size={16} />, metrics: { sensitivity: "Medium", createdOn: "10 Apr 2023", totalSubdomains: "3", totalAssets: "18", dataSources: "S3, ClickHouse, GCS" }, details: [] },
  domain_fraud: {
    id: "domain_fraud",
    label: "Fraud Intelligence",
    type: "domain",
    parentId: "org_main",
    children: [],
    icon: <Buildings size={16} />,
    metrics: {
      sensitivity: "Medium",
      createdOn: "11 Jan 2023",
      totalSubdomains: "2",
      totalAssets: "31",
      dataSources: "Snowflake, Postgres",
    },
    details: [
      { label: "Node Type", value: "Domain" },
      { label: "Sensitivity", value: riskBadge("Medium") },
      { label: "Added On", value: "11 Jan 2023, 09:30 AM" },
      { label: "Data Sources", value: dataSourceGroup(["Snowflake 9", "Postgres 5"]) },
      { label: "Owners", value: "Risk Platform" },
    ],
  },
  domain_lending: {
    id: "domain_lending",
    label: "Lending Intelligence",
    type: "domain",
    parentId: "org_main",
    children: [],
    icon: <Buildings size={16} />,
    metrics: {
      sensitivity: "Low",
      createdOn: "22 Jun 2023",
      totalSubdomains: "2",
      totalAssets: "23",
      dataSources: "BigQuery, Athena",
    },
    details: [
      { label: "Node Type", value: "Domain" },
      { label: "Sensitivity", value: riskBadge("Low") },
      { label: "Added On", value: "22 Jun 2023, 02:15 PM" },
      { label: "Data Sources", value: dataSourceGroup(["BigQuery 4", "Athena 3"]) },
      { label: "Owners", value: "Lending Analytics" },
    ],
  },
  subdomain_default: {
    id: "subdomain_default",
    label: "default",
    type: "subdomain",
    parentId: "domain_idfy",
    children: ["asset_addressify", "asset_kyc360", "asset_watchtower", "asset_verification", "asset_consent", "asset_audit_logs", "asset_ml_models", "asset_api_gateway", "asset_events", "asset_notifications", "asset_reports", "asset_compliance", "asset_data_lake", "asset_cache", "asset_search", "asset_config", "asset_metrics", "asset_alerts", "asset_billing", "asset_sessions", "asset_webhooks"],
    icon: <Stack size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "19 Jan 2026",
      totalAssets: "36",
      dataSources: "Postgres, GCS, MongoDB",
    },
    details: [
      { label: "Node Type", value: "Subdomain" },
      { label: "Total Assets", value: "36" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 109", "GCS 59", "MongoDB 17", "S3 51"]) },
      { label: "Created On", value: "19 Jan 2026, 04:42 PM IST" },
      { label: "Sensitivity", value: riskBadge("High") },
    ],
  },
  subdomain_kyc: { id: "subdomain_kyc", label: "kyc-core", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "16 Jan 2023", totalAssets: "12", dataSources: "Postgres, S3" }, details: [] },
  subdomain_onboarding: { id: "subdomain_onboarding", label: "onboarding", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "21 Jan 2023", totalAssets: "8", dataSources: "MySQL" }, details: [] },
  subdomain_identity: { id: "subdomain_identity", label: "identity-core", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "26 Jan 2023", totalAssets: "15", dataSources: "Postgres" }, details: [] },
  subdomain_aadhaar_ops: { id: "subdomain_aadhaar_ops", label: "aadhaar-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "02 Feb 2023", totalAssets: "6", dataSources: "Postgres, GCS" }, details: [] },
  subdomain_pan_ops: { id: "subdomain_pan_ops", label: "pan-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "06 Feb 2023", totalAssets: "5", dataSources: "Postgres" }, details: [] },
  subdomain_bank_ops: { id: "subdomain_bank_ops", label: "bank-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "11 Feb 2023", totalAssets: "7", dataSources: "Postgres, S3" }, details: [] },
  subdomain_credit_ops: { id: "subdomain_credit_ops", label: "credit-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "15 Feb 2023", totalAssets: "5", dataSources: "Postgres" }, details: [] },
  subdomain_telecom: { id: "subdomain_telecom", label: "telecom-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "19 Feb 2023", totalAssets: "4", dataSources: "MySQL" }, details: [] },
  subdomain_income: { id: "subdomain_income", label: "income-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "23 Feb 2023", totalAssets: "8", dataSources: "Postgres, BigQuery" }, details: [] },
  subdomain_vehicle: { id: "subdomain_vehicle", label: "vehicle-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "02 Mar 2023", totalAssets: "3", dataSources: "Postgres" }, details: [] },
  subdomain_gst: { id: "subdomain_gst", label: "gst-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "06 Mar 2023", totalAssets: "4", dataSources: "Postgres" }, details: [] },
  subdomain_corporate: { id: "subdomain_corporate", label: "corporate-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "11 Mar 2023", totalAssets: "9", dataSources: "Postgres, GCS" }, details: [] },
  subdomain_api_logs: { id: "subdomain_api_logs", label: "api-logs", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Low", createdOn: "16 Mar 2023", totalAssets: "2", dataSources: "ClickHouse" }, details: [] },
  subdomain_events: { id: "subdomain_events", label: "events", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Low", createdOn: "21 Mar 2023", totalAssets: "3", dataSources: "Kafka" }, details: [] },
  subdomain_reports: { id: "subdomain_reports", label: "reports", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "26 Mar 2023", totalAssets: "5", dataSources: "BigQuery" }, details: [] },
  subdomain_compliance: { id: "subdomain_compliance", label: "compliance", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "High", createdOn: "01 Apr 2023", totalAssets: "6", dataSources: "Postgres, S3" }, details: [] },
  subdomain_audit: { id: "subdomain_audit", label: "audit", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "06 Apr 2023", totalAssets: "2", dataSources: "Postgres" }, details: [] },
  subdomain_ml: { id: "subdomain_ml", label: "ml-ops", type: "subdomain", parentId: "domain_idfy", children: [], icon: <Stack size={16} />, metrics: { sensitivity: "Medium", createdOn: "11 Apr 2023", totalAssets: "5", dataSources: "S3, GCS" }, details: [] },
  subdomain_decisioning: {
    id: "subdomain_decisioning",
    label: "decisioning",
    type: "subdomain",
    parentId: "domain_idfy",
    children: [],
    icon: <Stack size={16} />,
    metrics: {
      sensitivity: "Medium",
      createdOn: "08 Feb 2026",
      totalAssets: "18",
      dataSources: "ClickHouse, Postgres",
    },
    details: [
      { label: "Node Type", value: "Subdomain" },
      { label: "Total Assets", value: "18" },
      { label: "Data Sources", value: dataSourceGroup(["ClickHouse 22", "Postgres 8"]) },
      { label: "Created On", value: "08 Feb 2026, 09:20 AM IST" },
      { label: "Sensitivity", value: riskBadge("Medium") },
    ],
  },
  subdomain_fraud_ops: {
    id: "subdomain_fraud_ops",
    label: "fraud-ops",
    type: "subdomain",
    parentId: "domain_idfy",
    children: [],
    icon: <Stack size={16} />,
    metrics: {
      sensitivity: "Low",
      createdOn: "17 Feb 2026",
      totalAssets: "20",
      dataSources: "MySQL, S3",
    },
    details: [
      { label: "Node Type", value: "Subdomain" },
      { label: "Total Assets", value: "20" },
      { label: "Data Sources", value: dataSourceGroup(["MySQL 15", "S3 7"]) },
      { label: "Created On", value: "17 Feb 2026, 11:10 AM IST" },
      { label: "Sensitivity", value: riskBadge("Low") },
    ],
  },
  asset_addressify: {
    id: "asset_addressify",
    label: "addressify",
    type: "asset",
    parentId: "subdomain_default",
    children: ["database_prod", "database_stage", "database_backup"],
    icon: <HardDrives size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "10 Dec 2022",
      assetType: "Postgres",
      totalChildren: "3",
    },
    details: [
      { label: "Node Type", value: "Asset" },
      { label: "Asset Type", value: "Postgres" },
      { label: "Total Children", value: "3" },
      { label: "Added On", value: "10 Dec 2022, 12:04 PM" },
      { label: "Owners", value: "Address Verification Team" },
    ],
  },
  asset_verification: { id: "asset_verification", label: "verification-core", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "High", createdOn: "12 Dec 2022", assetType: "Postgres", totalChildren: "2" }, details: [] },
  asset_consent: { id: "asset_consent", label: "consent-store", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "High", createdOn: "13 Dec 2022", assetType: "Postgres", totalChildren: "1" }, details: [] },
  asset_audit_logs: { id: "asset_audit_logs", label: "audit-logs", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Medium", createdOn: "14 Dec 2022", assetType: "ClickHouse", totalChildren: "1" }, details: [] },
  asset_ml_models: { id: "asset_ml_models", label: "ml-models", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "16 Dec 2022", assetType: "S3", totalChildren: "1" }, details: [] },
  asset_api_gateway: { id: "asset_api_gateway", label: "api-gateway", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Medium", createdOn: "17 Dec 2022", assetType: "Postgres", totalChildren: "1" }, details: [] },
  asset_events: { id: "asset_events", label: "event-stream", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "18 Dec 2022", assetType: "Kafka", totalChildren: "1" }, details: [] },
  asset_notifications: { id: "asset_notifications", label: "notifications", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "19 Dec 2022", assetType: "MySQL", totalChildren: "1" }, details: [] },
  asset_reports: { id: "asset_reports", label: "reports-db", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Medium", createdOn: "20 Dec 2022", assetType: "BigQuery", totalChildren: "1" }, details: [] },
  asset_compliance: { id: "asset_compliance", label: "compliance-store", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "High", createdOn: "21 Dec 2022", assetType: "Postgres", totalChildren: "2" }, details: [] },
  asset_data_lake: { id: "asset_data_lake", label: "data-lake", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Medium", createdOn: "22 Dec 2022", assetType: "S3", totalChildren: "1" }, details: [] },
  asset_cache: { id: "asset_cache", label: "redis-cache", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "None", createdOn: "23 Dec 2022", assetType: "Redis", totalChildren: "1" }, details: [] },
  asset_search: { id: "asset_search", label: "search-index", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "24 Dec 2022", assetType: "Elasticsearch", totalChildren: "1" }, details: [] },
  asset_config: { id: "asset_config", label: "config-store", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "None", createdOn: "26 Dec 2022", assetType: "Postgres", totalChildren: "1" }, details: [] },
  asset_metrics: { id: "asset_metrics", label: "metrics-db", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "27 Dec 2022", assetType: "ClickHouse", totalChildren: "1" }, details: [] },
  asset_alerts: { id: "asset_alerts", label: "alerts-store", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "28 Dec 2022", assetType: "Postgres", totalChildren: "1" }, details: [] },
  asset_billing: { id: "asset_billing", label: "billing-db", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "High", createdOn: "29 Dec 2022", assetType: "Postgres", totalChildren: "2" }, details: [] },
  asset_sessions: { id: "asset_sessions", label: "session-store", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Medium", createdOn: "30 Dec 2022", assetType: "Redis", totalChildren: "1" }, details: [] },
  asset_webhooks: { id: "asset_webhooks", label: "webhook-events", type: "asset", parentId: "subdomain_default", children: [], icon: <HardDrives size={16} />, metrics: { sensitivity: "Low", createdOn: "31 Dec 2022", assetType: "Postgres", totalChildren: "1" }, details: [] },
  asset_kyc360: {
    id: "asset_kyc360",
    label: "kyc360",
    type: "asset",
    parentId: "subdomain_default",
    children: [],
    icon: <HardDrives size={16} />,
    metrics: {
      sensitivity: "Medium",
      createdOn: "11 Dec 2022",
      assetType: "Snowflake",
      totalChildren: "2",
    },
    details: [
      { label: "Node Type", value: "Asset" },
      { label: "Asset Type", value: "Snowflake" },
      { label: "Total Children", value: "2" },
      { label: "Added On", value: "11 Dec 2022, 04:20 PM" },
      { label: "Owners", value: "KYC Operations" },
    ],
  },
  asset_watchtower: {
    id: "asset_watchtower",
    label: "watchtower",
    type: "asset",
    parentId: "subdomain_default",
    children: [],
    icon: <HardDrives size={16} />,
    metrics: {
      sensitivity: "Low",
      createdOn: "15 Dec 2022",
      assetType: "BigQuery",
      totalChildren: "1",
    },
    details: [
      { label: "Node Type", value: "Asset" },
      { label: "Asset Type", value: "BigQuery" },
      { label: "Total Children", value: "1" },
      { label: "Added On", value: "15 Dec 2022, 08:15 PM" },
      { label: "Owners", value: "BI Platform" },
    ],
  },
  database_prod: {
    id: "database_prod",
    label: "addressify-dc-prod",
    type: "database",
    parentId: "asset_addressify",
    children: ["schema_public"],
    icon: <Database size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "17 Jul 2025",
      totalSchemas: "1",
      status: "Completed",
    },
    details: [
      { label: "Node Type", value: "Database" },
      { label: "Total Schemas", value: "1" },
      { label: "Added On", value: "17 Jul 2025" },
      { label: "Owners", value: "Name 1, Name 2, Name 3" },
      { label: "Sensitivity", value: riskBadge("High") },
    ],
  },
  database_stage: {
    id: "database_stage",
    label: "addressify-stg-01",
    type: "database",
    parentId: "asset_addressify",
    children: [],
    icon: <Database size={16} />,
    metrics: {
      sensitivity: "Medium",
      createdOn: "22 Jul 2025",
      totalSchemas: "2",
      status: "In Progress",
    },
    details: [
      { label: "Node Type", value: "Database" },
      { label: "Total Schemas", value: "2" },
      { label: "Added On", value: "22 Jul 2025" },
      { label: "Owners", value: "Staging Platform" },
      { label: "Sensitivity", value: riskBadge("Medium") },
    ],
  },
  database_backup: {
    id: "database_backup",
    label: "addressify-backup",
    type: "database",
    parentId: "asset_addressify",
    children: [],
    icon: <Database size={16} />,
    metrics: {
      sensitivity: "Low",
      createdOn: "01 Aug 2025",
      totalSchemas: "1",
      status: "Pending",
    },
    details: [
      { label: "Node Type", value: "Database" },
      { label: "Total Schemas", value: "1" },
      { label: "Added On", value: "01 Aug 2025" },
      { label: "Owners", value: "Archive Ops" },
      { label: "Sensitivity", value: riskBadge("Low") },
    ],
  },
  schema_public: {
    id: "schema_public",
    label: "public",
    type: "schema",
    parentId: "database_prod",
    children: ["table_aadhaar_checks", "table_answers", "table_metadata"],
    icon: <Stack size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "17 Jul 2025",
      totalTables: "50",
      status: "Completed",
    },
    details: [
      { label: "Node Type", value: "Schema" },
      { label: "Total Tables", value: "50" },
      { label: "Created On", value: "17 Jul 2025" },
      { label: "Sensitivity", value: riskBadge("High") },
      { label: "Primary Tags", value: "PII, Core Identity" },
    ],
  },
  table_aadhaar_checks: {
    id: "table_aadhaar_checks",
    label: "aadhaar_checks",
    type: "table",
    parentId: "schema_public",
    children: ["column_id", "column_created_at", "column_updated_at", "column_aadhaar_id", "column_checks_type", "column_status", "column_request_id", "column_vendor_id", "column_user_id", "column_consent_given", "column_consent_ts", "column_name_match", "column_dob_match", "column_address_match", "column_photo_match", "column_gender", "column_request_payload", "column_response_payload", "column_response_code", "column_response_msg", "column_error_code", "column_retry_count", "column_ip_address", "column_device_id", "column_session_id", "column_correlation_id", "column_tenant_id", "column_idfy_req_id", "column_source", "column_processed_at"],
    icon: <Table size={16} />,
    metrics: {
      sensitivity: "Medium",
      createdOn: "17 Jul 2025",
      totalColumns: "30",
      status: "Completed",
    },
    details: [
      { label: "State", value: "Active" },
      { label: "Owner", value: "System user" },
      { label: "Type", value: "Managed" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 14"]) },
      { label: "Popularity", value: "—" },
    ],
  },
  table_answers: {
    id: "table_answers",
    label: "answers",
    type: "table",
    parentId: "schema_public",
    children: [],
    icon: <Table size={16} />,
    metrics: {
      sensitivity: "High",
      createdOn: "18 Jul 2025",
      totalColumns: "12",
      status: "In Progress",
    },
    details: [
      { label: "State", value: "Active" },
      { label: "Owner", value: "System user" },
      { label: "Type", value: "Managed" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 14"]) },
      { label: "Popularity", value: "—" },
    ],
  },
  table_metadata: {
    id: "table_metadata",
    label: "ar_internal_metadata",
    type: "table",
    parentId: "schema_public",
    children: [],
    icon: <Table size={16} />,
    metrics: {
      sensitivity: "Low",
      createdOn: "20 Jul 2025",
      totalColumns: "4",
      status: "Pending",
    },
    details: [
      { label: "State", value: "Active" },
      { label: "Owner", value: "System user" },
      { label: "Type", value: "Managed" },
      { label: "Data Sources", value: dataSourceGroup(["Postgres 14"]) },
      { label: "Popularity", value: "—" },
    ],
  },
  column_id: {
    id: "column_id",
    label: "id",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: {
      sensitivity: "None",
      createdOn: "17 Jul 2025",
      dataType: "Numeric",
      scanStatus: "Failed",
    },
    details: [
      { label: "Node Type", value: "Column" },
      { label: "Data Type", value: "Numeric" },
      { label: "Scan Status", value: statusBadge("Failed") },
      { label: "Sensitivity", value: riskBadge("None") },
      { label: "PII Found", value: "None" },
    ],
  },
  column_created_at: {
    id: "column_created_at",
    label: "created_at",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: {
      sensitivity: "None",
      createdOn: "17 Jul 2025",
      dataType: "Int",
      scanStatus: "Pending",
    },
    details: [
      { label: "Node Type", value: "Column" },
      { label: "Data Type", value: "Int" },
      { label: "Scan Status", value: statusBadge("Pending") },
      { label: "Sensitivity", value: riskBadge("None") },
      { label: "PII Found", value: "None" },
    ],
  },
  column_updated_at: {
    id: "column_updated_at",
    label: "updated_at",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: {
      sensitivity: "Non-Sensitive",
      createdOn: "17 Jul 2025",
      dataType: "Text",
      scanStatus: "Completed",
    },
    details: [
      { label: "Node Type", value: "Column" },
      { label: "Data Type", value: "Text" },
      { label: "Scan Status", value: statusBadge("Completed") },
      { label: "Sensitivity", value: riskBadge("Non-Sensitive") },
      { label: "PII Found", value: piiGroup([{ label: "IP Address", sensitivity: "high" }]) },
    ],
  },
  column_aadhaar_id: {
    id: "column_aadhaar_id",
    label: "aadhaar_id",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: {
      sensitivity: "Non-Sensitive",
      createdOn: "17 Jul 2025",
      dataType: "Bigint",
      scanStatus: "Completed",
    },
    details: [
      { label: "Node Type", value: "Column" },
      { label: "Data Type", value: "Bigint" },
      { label: "Scan Status", value: statusBadge("Completed") },
      { label: "Sensitivity", value: riskBadge("Non-Sensitive") },
      { label: "PII Found", value: piiGroup([{ label: "Address", sensitivity: "high" }, { label: "PhoneNumber", sensitivity: "high" }, { label: "EmailId", sensitivity: "medium" }]) },
    ],
  },
  column_checks_type: {
    id: "column_checks_type",
    label: "checks_type",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: {
      sensitivity: "Non-Sensitive",
      createdOn: "17 Jul 2025",
      dataType: "Jsonb",
      scanStatus: "Completed",
    },
    details: [
      { label: "Node Type", value: "Column" },
      { label: "Data Type", value: "Jsonb" },
      { label: "Scan Status", value: statusBadge("Completed") },
      { label: "Sensitivity", value: riskBadge("Non-Sensitive") },
      { label: "PII Found", value: "None" },
    ],
  },
  column_status: {
    id: "column_status",
    label: "status",
    type: "column",
    parentId: "table_aadhaar_checks",
    children: [],
    icon: <Columns size={16} />,
    metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Serial", scanStatus: "In Progress" },
    details: [{ label: "Node Type", value: "Column" }, { label: "Data Type", value: "Serial" }, { label: "Scan Status", value: statusBadge("In Progress") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }],
  },
  column_request_id: { id: "column_request_id", label: "request_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "UUID", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "UUID" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_vendor_id: { id: "column_vendor_id", label: "vendor_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Int", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Int" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_user_id: { id: "column_user_id", label: "user_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Bigint", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Bigint" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: "None" }] },
  column_consent_given: { id: "column_consent_given", label: "consent_given", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Boolean", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Boolean" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_consent_ts: { id: "column_consent_ts", label: "consent_timestamp", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Timestamp", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Timestamp" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_name_match: { id: "column_name_match", label: "name_match_score", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Float", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Float" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_dob_match: { id: "column_dob_match", label: "dob_match", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Boolean", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Boolean" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: "None" }] },
  column_address_match: { id: "column_address_match", label: "address_match", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Boolean", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Boolean" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: piiGroup([{ label: "Address", sensitivity: "medium" }]) }] },
  column_photo_match: { id: "column_photo_match", label: "photo_match", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Boolean", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Boolean" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: "None" }] },
  column_gender: { id: "column_gender", label: "gender", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: piiGroup([{ label: "Gender", sensitivity: "low" }]) }] },
  column_request_payload: { id: "column_request_payload", label: "request_payload", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "High", createdOn: "17 Jul 2025", dataType: "Jsonb", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Jsonb" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("High") }, { label: "PII Found", value: piiGroup([{ label: "Aadhaar", sensitivity: "high" }, { label: "Name", sensitivity: "high" }]) }] },
  column_response_payload: { id: "column_response_payload", label: "response_payload", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "High", createdOn: "17 Jul 2025", dataType: "Jsonb", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Jsonb" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("High") }, { label: "PII Found", value: "None" }] },
  column_response_code: { id: "column_response_code", label: "response_code", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_response_msg: { id: "column_response_msg", label: "response_message", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Text", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Text" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_error_code: { id: "column_error_code", label: "error_code", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Pending" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Pending") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_retry_count: { id: "column_retry_count", label: "retry_count", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Int", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Int" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_ip_address: { id: "column_ip_address", label: "ip_address", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "Non-Sensitive", createdOn: "17 Jul 2025", dataType: "Inet", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Inet" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("Non-Sensitive") }, { label: "PII Found", value: piiGroup([{ label: "IP Address", sensitivity: "medium" }]) }] },
  column_device_id: { id: "column_device_id", label: "device_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_session_id: { id: "column_session_id", label: "session_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "UUID", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "UUID" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_correlation_id: { id: "column_correlation_id", label: "correlation_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "UUID", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "UUID" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_tenant_id: { id: "column_tenant_id", label: "tenant_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Int", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Int" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_idfy_req_id: { id: "column_idfy_req_id", label: "idfy_request_id", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_source: { id: "column_source", label: "source", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Varchar", scanStatus: "Completed" }, details: [{ label: "Data Type", value: "Varchar" }, { label: "Scan Status", value: statusBadge("Completed") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
  column_processed_at: { id: "column_processed_at", label: "processed_at", type: "column", parentId: "table_aadhaar_checks", children: [], icon: <Columns size={16} />, metrics: { sensitivity: "None", createdOn: "17 Jul 2025", dataType: "Timestamp", scanStatus: "Pending" }, details: [{ label: "Data Type", value: "Timestamp" }, { label: "Scan Status", value: statusBadge("Pending") }, { label: "Sensitivity", value: riskBadge("None") }, { label: "PII Found", value: "None" }] },
};

const levelColumns: Record<NodeType, TableColumn[]> = {
  organization: [
    { key: "name", label: "Domains", className: "dc-col-primary" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "sources", label: "Data Sources", className: "dc-col-sources" },
    { key: "createdOn", label: "Onboarded On", className: "dc-col-date" },
  ],
  domain: [
    { key: "name", label: "Subdomains", className: "dc-col-primary" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "sources", label: "Data Sources", className: "dc-col-sources" },
    { key: "createdOn", label: "Created On", className: "dc-col-date" },
  ],
  subdomain: [
    { key: "name", label: "Asset Name", className: "dc-col-primary" },
    { key: "type", label: "Type", className: "dc-col-type" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "createdOn", label: "Onboarded On", className: "dc-col-date" },
  ],
  asset: [
    { key: "name", label: "Name", className: "dc-col-primary" },
    { key: "type", label: "Type", className: "dc-col-type" },
    { key: "status", label: "Status", className: "dc-col-status" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "process", label: "Business Process", className: "dc-col-process" },
    { key: "pii", label: "PII Found", className: "dc-col-pii" },
  ],
  database: [
    { key: "name", label: "Name", className: "dc-col-primary" },
    { key: "type", label: "Type", className: "dc-col-type" },
    { key: "status", label: "Status", className: "dc-col-status" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "pii", label: "PII Found", className: "dc-col-pii" },
  ],
  schema: [
    { key: "name", label: "Name", className: "dc-col-primary" },
    { key: "type", label: "Type", className: "dc-col-type" },
    { key: "status", label: "Status", className: "dc-col-status" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "pii", label: "PII Found", className: "dc-col-pii" },
  ],
  table: [
    { key: "name", label: "Name", className: "dc-col-primary" },
    { key: "type", label: "Type", className: "dc-col-type" },
    { key: "status", label: "Scan Status", className: "dc-col-status" },
    { key: "risk", label: "Sensitivity", className: "dc-col-risk" },
    { key: "pii", label: "PII Found", className: "dc-col-pii" },
  ],
  column: [
    { key: "property", label: "Property", className: "dc-col-primary" },
    { key: "value", label: "Value", className: "dc-col-value" },
  ],
};

const defaultNodeId = "org_main";

export default function DataCompassMockupPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(defaultNodeId);
  const [selectedRowId, setSelectedRowId] = useState<string | undefined>();

  useEffect(() => {
    setSelectedRowId(undefined);
  }, [selectedNodeId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dc-table-row") && !target.closest(".dc-pii-flyout")) {
        setSelectedRowId(undefined);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedNode = nodes[selectedNodeId];
  const displayedNode = selectedRowId ? nodes[selectedRowId] : selectedNode;
  const navItems = useMemo(() => buildTreeItems(nodes, selectedNodeId), [selectedNodeId]);
  const breadcrumbs = buildBreadcrumbs(selectedNodeId);
  const tableColumns = levelColumns[selectedNode.type];
  const tableRows = buildRows(selectedNodeId, setSelectedNodeId, setSelectedRowId);
  const filterPlaceholder = buildFilterPlaceholder(selectedNodeId, selectedNode.type);
  const rightInfoPanel = (
    <div className="dc-info-panel">
      <div className="dc-info-panel-card">
        {/* About section — all details in one kv-block */}
        <div className="dc-info-section">
          <h3 className="dc-info-title">About this {displayedNode.type}</h3>
          <div className="dc-info-kv-block">
            {displayedNode.details.map((item) => {
              const isOwner = item.label === "Owners" || item.label === "Owner";
              return (
                <div className="dc-info-kv-row" key={item.label}>
                  <span className="dc-info-kv-label">{item.label}</span>
                  <span className={`dc-info-kv-value${isOwner ? " dc-info-kv-owner" : ""}`}>
                    <span>{item.value}</span>
                    {isOwner && (
                      <button className="dc-info-edit-btn" aria-label="Edit owner">
                        <PencilSimple size={14} />
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags section */}
        <div className="dc-info-section dc-info-section-bordered">
          <h3 className="dc-info-title">Tags</h3>
          <div className="dc-info-tags">
            <button className="dc-info-add-tag">Add tags</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="dc-page">
      <DcTopNav isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="dc-layout">
        <DcSidebar items={sidebarItems} isOpen={isSidebarOpen} />
        <div className="dc-content-area">
          <DcMainCard
            title={selectedNode.label}
            navItems={navItems}
            rightPanel={rightInfoPanel}
            tabs={cardTabs}
            breadcrumbs={breadcrumbs}
            onSelectNavItem={setSelectedNodeId}
            onSelectBreadcrumb={setSelectedNodeId}
          >
            <DcFilterBar
              placeholder={filterPlaceholder}
            />
            <DcDataTable
              columns={tableColumns}
              rows={tableRows}
              selectedRowId={selectedRowId}
              emptyState={
                selectedNode.type === "column" ? (
                  <div className="dc-terminal-state">
                    <Columns size={18} />
                    <span>Column view is the last node in this hierarchy.</span>
                  </div>
                ) : (
                  `No ${childLabel(selectedNode.type).toLowerCase()} found for this ${selectedNode.type}.`
                )
              }
            />
          </DcMainCard>
        </div>
      </div>
    </main>
  );
}

function buildTreeItems(allNodes: Record<string, NodeRecord>, selectedNodeId: string): TreeItem[] {
  const items: TreeItem[] = [];

  const visit = (nodeId: string, indent = 0) => {
    const node = allNodes[nodeId];
    items.push({
      id: node.id,
      label: node.label,
      icon: node.icon,
      active: node.id === selectedNodeId,
      indent,
      hasChevron: node.type !== "asset" && node.children.length > 0,
    });

    // Tree only goes to asset level — don't recurse into databases/schemas/tables/columns
    if (node.type === "asset") return;
    node.children.forEach((childId) => visit(childId, indent + 1));
  };

  visit("org_main");
  return items;
}

function buildBreadcrumbs(nodeId: string): BreadcrumbItem[] {
  const trail: BreadcrumbItem[] = [];
  let current: NodeRecord | undefined = nodes[nodeId];

  while (current) {
    trail.unshift({
      id: current.id,
      label: current.breadcrumbLabel ?? current.label,
    });
    current = current.parentId ? nodes[current.parentId] : undefined;
  }

  return trail;
}

function buildRows(nodeId: string, onNavigate: (id: string) => void, onSelectRow: (id: string) => void): TableRow[] {
  const node = nodes[nodeId];

  if (node.type === "column") {
    return Object.entries(node.metrics).map(([key, value]) => ({
      id: key,
      cells: {
        property: prettyLabel(key),
        value: renderMetricValue(key, value),
      },
    }));
  }

  return node.children.map((childId) => buildChildRow(nodes[childId], node.type, onNavigate, onSelectRow));
}

function buildChildRow(node: NodeRecord, parentType: NodeType, onNavigate: (id: string) => void, onSelectRow: (id: string) => void): TableRow {
  const isTerminal = node.type === "column";
  const cells: Record<string, ReactNode> = {
    name: primaryCell(node.label, node.icon, isTerminal ? undefined : () => onNavigate(node.id)),
    childCount: node.metrics.totalSubdomains ?? node.metrics.totalSchemas ?? "0",
    assetCount: node.metrics.totalAssets ?? node.metrics.totalTables ?? node.metrics.totalColumns ?? "0",
    risk: riskBadge(node.metrics.sensitivity ?? "None"),
    sources: sourceCell(node.metrics.dataSources ?? "Postgres"),
    createdOn: node.metrics.createdOn,
    type: node.metrics.assetType ?? mapNodeTypeLabel(node.type),
    status: statusBadge(node.metrics.status ?? node.metrics.scanStatus ?? "Completed"),
    process: node.type === "database" ? "Core Storage" : node.type === "asset" ? "Identity Verification" : "Profile Enrichment",
    pii: piiGroup(piiForNode(node.type)),
    property: "",
    value: "",
  };

  if (parentType === "subdomain") {
    cells.type = node.metrics.assetType ?? mapNodeTypeLabel(node.type);
  }

  if (parentType === "table") {
    cells.type = node.metrics.dataType ?? "Text";
    cells.status = statusBadge(node.metrics.scanStatus ?? "Completed");
    cells.pii = piiGroup(piiForColumn(node.id));
  }

  return {
    id: node.id,
    onClick: () => onSelectRow(node.id),
    cells,
  };
}

function buildFilterPlaceholder(nodeId: string, type: NodeType): string {
  if (nodeId === "schema_public") {
    return "Filter tables";
  }

  return `Filter ${type === "column" ? "properties" : childLabel(type).toLowerCase()}`;
}

function mapNodeTypeLabel(type: NodeType) {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function childLabel(type: NodeType) {
  switch (type) {
    case "organization":
      return "Domains";
    case "domain":
      return "Subdomains";
    case "subdomain":
      return "Assets";
    case "asset":
      return "Databases";
    case "database":
      return "Schemas";
    case "schema":
      return "Tables";
    case "table":
      return "Columns";
    case "column":
      return "Properties";
  }
}

function prettyLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
}

function renderMetricValue(key: string, value: string) {
  if (key === "scanStatus") {
    return statusBadge(value);
  }
  if (key === "sensitivity") {
    return riskBadge(value);
  }
  return value;
}

function primaryCell(label: string, icon: ReactNode, onNavigate?: () => void) {
  return (
    <div className="dc-table-name-cell">
      <span className="dc-node-icon">{icon}</span>
      {onNavigate ? (
        <span className="dc-table-link" onClick={(e) => { e.stopPropagation(); onNavigate(); }}>
          {label}
        </span>
      ) : (
        <span>{label}</span>
      )}
    </div>
  );
}

function riskBadge(level: string) {
  return <span className={`dc-pill dc-pill-risk-${slug(level)}`}>{level}</span>;
}

function statusBadge(status: string) {
  return <span className={`dc-pill dc-pill-status-${slug(status)}`}>{status}</span>;
}

function sourceCell(value: string) {
  return dataSourceGroup(value.split(", ").slice(0, 4));
}

function DataSourceGroup({ items, limit }: { items: string[]; limit?: number }) {
  const [showFlyout, setShowFlyout] = useState(false);
  const visible = limit ? items.slice(0, limit) : items;
  const overflow = limit ? items.length - limit : 0;
  const hiddenItems = limit ? items.slice(limit) : [];

  return (
    <div className="dc-chip-group dc-data-sources-group">
      {visible.map((item) => {
        const baseName = item.replace(/\s+\d+$/, "");
        const iconUrl = DATA_SOURCE_ICONS[baseName];
        return (
          <span key={item} className="dc-chip dc-chip-source">
            {iconUrl && <img src={iconUrl} alt="" className="dc-chip-icon" />}
            {item}
          </span>
        );
      })}
      {overflow > 0 && (
        <div className="dc-sources-more-trigger" style={{ position: "relative" }}>
          <span className="dc-chip dc-chip-muted" onClick={() => setShowFlyout(!showFlyout)}>
            +{overflow}
          </span>
          {showFlyout && (
            <div className="dc-sources-flyout">
              <div className="dc-chip-group">
                {hiddenItems.map((item) => {
                  const baseName = item.replace(/\s+\d+$/, "");
                  const iconUrl = DATA_SOURCE_ICONS[baseName];
                  return (
                    <span key={item} className="dc-chip dc-chip-source">
                      {iconUrl && <img src={iconUrl} alt="" className="dc-chip-icon" />}
                      {item}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function dataSourceGroup(items: string[], limit?: number) {
  return <DataSourceGroup items={items} limit={limit} />;
}

interface PiiItem {
  label: string;
  sensitivity: "high" | "medium" | "low";
}

function PiiChipGroup({ items: rawItems }: { items: (string | PiiItem)[] }) {
  const [showFlyout, setShowFlyout] = useState(false);
  const [flyoutRect, setFlyoutRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showFlyout) return;
    const close = () => setShowFlyout(false);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dc-pii-flyout") && !target.closest(".dc-pii-more-trigger")) {
        close();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", close, true);
    };
  }, [showFlyout]);

  const items = rawItems.map((item) =>
    typeof item === "string" ? { label: item, sensitivity: "medium" as const } : item
  );

  if (!items.length) {
    return <span className="dc-muted">None</span>;
  }

  const limit = 1;
  const visible = items.slice(0, limit);
  const hidden = items.slice(limit);
  const hasOverflow = hidden.length > 0;

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const td = triggerRef.current?.closest("td");
    if (td) {
      const rect = td.getBoundingClientRect();
      setFlyoutRect({ top: rect.top, left: rect.left, width: rect.width });
    }
    setShowFlyout((v) => !v);
  };

  return (
    <div className="dc-pii-chips-container">
      <div className="dc-chip-group dc-pii-chip-group-inline">
        {visible.map((item) => (
          <span
            key={item.label}
            className={`dc-chip dc-chip-pii-${item.sensitivity}`}
          >
            {item.label}
          </span>
        ))}
        {hasOverflow && (
          <div className="dc-pii-more-trigger" ref={triggerRef}>
            <span
              className="dc-chip dc-chip-muted"
              onClick={handleTriggerClick}
            >
              +{hidden.length}
            </span>
          </div>
        )}
      </div>
      {showFlyout && flyoutRect && createPortal(
        <div
          className="dc-pii-flyout"
          style={{ top: flyoutRect.top, left: flyoutRect.left, width: flyoutRect.width }}
        >
          <div className="dc-chip-group dc-pii-chip-group-full">
            {items.map((item) => (
              <span
                key={item.label}
                className={`dc-chip dc-chip-pii-${item.sensitivity}`}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function piiGroup(items: (string | PiiItem)[]) {
  return <PiiChipGroup items={items} />;
}

function piiForNode(type: NodeType) {
  switch (type) {
    case "database":
      return ["Medical ID", "Tax ID", "Biometric"];
    case "schema":
      return ["IndAadhaar", "Name", "Address"];
    case "asset":
      return ["Name", "Address", "Phone"];
    default:
      return [];
  }
}

function piiForColumn(nodeId: string) {
  if (nodeId === "column_updated_at") {
    return ["IP Address"];
  }
  if (nodeId === "column_aadhaar_id") {
    return ["Address", "PhoneNumber", "EmailId"];
  }
  return [];
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
