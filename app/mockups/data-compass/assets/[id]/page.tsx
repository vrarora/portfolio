import AssetDetailClient from "./AssetDetailClient";

const ASSET_IDS = [
  "hr_admin",
  "addressify",
  "acquirze_finance",
  "syntegrate_marketing",
  "datarize_engineering",
  "addressify_product",
  "addressify_hr",
  "addressify_tech",
];

export function generateStaticParams() {
  return ASSET_IDS.map(id => ({ id }));
}

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AssetDetailClient id={id} />;
}
