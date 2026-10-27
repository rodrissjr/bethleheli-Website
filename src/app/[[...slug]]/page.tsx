import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupsPage, SitePage } from "@/components/site";
import { HomeReferencePage, KilimanjaroReferencePage, KilimanjaroRouteDetailPage, SafariReferencePage, TripDetailReferencePage, TripsReferencePage, ZanzibarReferencePage } from "@/components/reference-pages";
import { pageMeta, routeKeyFromSlug } from "@/lib/routes";
import { getGroupDepartures, getKilimanjaroRouteTrip, getKilimanjaroRouteTrips, getTripCards, getTripPageContent, getTripSeo } from "@/sanity/lib/content";
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
    const [trip, trips] = await Promise.all([getTripPageContent(dynamicTripSlug), getTripCards()]);
    if (!trip) notFound();
    return <TripDetailReferencePage data={trip} trips={trips} slug={dynamicTripSlug} />;
  }
  if (!key) notFound();
  const web3FormsAccessKey = process.env.WEB3FORMS_ACCESS_KEY || "";
  switch (key) {
    case "home": return <HomeReferencePage trips={await getTripCards()} />;
    case "kilimanjaro": return <KilimanjaroReferencePage routeTrips={await getKilimanjaroRouteTrips()} />;
    case "machame": return <KilimanjaroRouteDetailPage route="machame" trip={await getKilimanjaroRouteTrip("machame")} />;
    case "lemosho": return <KilimanjaroRouteDetailPage route="lemosho" trip={await getKilimanjaroRouteTrip("lemosho")} />;
    case "marangu": return <KilimanjaroRouteDetailPage route="marangu" trip={await getKilimanjaroRouteTrip("marangu")} />;
    case "rongai": return <KilimanjaroRouteDetailPage route="rongai" trip={await getKilimanjaroRouteTrip("rongai")} />;
    case "northernCircuit": return <KilimanjaroRouteDetailPage route="northern-circuit" trip={await getKilimanjaroRouteTrip("northern-circuit")} />;
    case "umbwe": return <KilimanjaroRouteDetailPage route="umbwe" trip={await getKilimanjaroRouteTrip("umbwe")} />;
    case "safari": return <SafariReferencePage />;
    case "zanzibar": return <ZanzibarReferencePage />;
    case "trips": return <TripsReferencePage trips={await getTripCards()} />;
    case "northernSerengeti": return <TripDetailReferencePage data={await getTripPageContent("northern-serengeti")} trips={await getTripCards()} slug="northern-serengeti" />;
    case "groups": return <GroupsPage departures={await getGroupDepartures()} web3FormsAccessKey={web3FormsAccessKey} />;
    case "terms": return <TermsPage />;
    default: return <SitePage page={key} web3FormsAccessKey={web3FormsAccessKey} />;
  }
}
