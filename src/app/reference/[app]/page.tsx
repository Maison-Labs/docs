import { notFound } from "next/navigation";
import { docApps, getDocApp } from "@/lib/registry";
import { ReferenceShell } from "@/components/ReferenceShell";

export function generateStaticParams() {
  return docApps.map((a) => ({ app: a.slug }));
}

export default async function ReferencePage({ params }: { params: Promise<{ app: string }> }) {
  const { app: slug } = await params;
  const app = getDocApp(slug);
  if (!app) notFound();
  return <ReferenceShell app={app} />;
}
