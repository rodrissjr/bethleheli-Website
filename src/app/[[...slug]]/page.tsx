import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupsPage, SitePage } from "@/components/site";
import { HomeReferencePage, KilimanjaroReferencePage, KilimanjaroRouteDetailPage, SafariReferencePage, TripDetailReferencePage, TripsReferencePage, ZanzibarReferencePage } from "@/components/reference-pages";
import { pageMeta, routeKeyFromSlug } from "@/lib/routes";
import { getGroupDepartures, getTripCards, getTripPageContent, getTripSeo } from "@/sanity/lib/content";
import { TermsPage } from "@/components/terms-page";

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = routeKeyFromSlug(slug);
  const dynamicTripSlug = slug?.length === 2 && slug[0] === "trips" ? slug[1] : null;
  if (!key && !dynamicTripSlug) notFound();
  const meta = key ? pageMeta[key] : pageMeta.trips;
  const cmsSeo = dynamicTripSlug ? await getTripSeo(dynamicTripSlug) : null;
  const title = cmsSeo?.title ?? meta.title;
  const description = cmsSeo?.description ?? meta.description;
  const canonical = cmsSeo?.canonicalPath ?? (dynamicTripSlug ? `/trips/${dynamicTripSlug}` : meta.path);
  const image = cmsSeo?.shareImage.src ?? meta.image;
  return {
    title: cmsSeo ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, images: [{ url: image, alt: cmsSeo?.shareImage.alt || title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    robots: key === "thankYou" ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const key = routeKeyFromSlug(slug);
  const dynamicTripSlug = slug?.length === 2 && slug[0] === "trips" ? slug[1] : null;
  if (!key && dynamicTripSlug) {
    const trip = await getTripPageContent(dynamicTripSlug);
    if (!trip) notFound();
    return <TripDetailReferencePage data={trip} />;
  }
  if (!key) notFound();
  const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY || "";
  switch (key) {
    case "home": return <HomeReferencePage trips={await getTripCards()} />;
    case "kilimanjaro": return <KilimanjaroReferencePage />;
    case "machame": return <KilimanjaroRouteDetailPage route="machame" />;
    case "lemosho": return <KilimanjaroRouteDetailPage route="lemosho" />;
    case "marangu": return <KilimanjaroRouteDetailPage route="marangu" />;
    case "rongai": return <KilimanjaroRouteDetailPage route="rongai" />;
    case "northernCircuit": return <KilimanjaroRouteDetailPage route="northern-circuit" />;
    case "umbwe": return <KilimanjaroRouteDetailPage route="umbwe" />;
    case "safari": return <SafariReferencePage />;
    case "zanzibar": return <ZanzibarReferencePage />;
    case "trips": return <TripsReferencePage trips={await getTripCards()} />;
    case "northernSerengeti": return <TripDetailReferencePage data={await getTripPageContent("northern-serengeti")} />;
    case "groups": return <GroupsPage departures={await getGroupDepartures()} web3FormsAccessKey={web3FormsAccessKey} />;
    case "terms": return <TermsPage />;
    default: return <SitePage page={key} web3FormsAccessKey={web3FormsAccessKey} />;
  }
}
