"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { HomeFooter } from "@/components/home-footer";
import { whatsappHref } from "@/lib/whatsapp";
import type { CmsImage, CmsKilimanjaroRouteTrip, CmsTripCard, CmsTripPageData } from "@/sanity/content-types";
import {
  Accordion,
  ArrowIcon,
  CtaBanner,
  Footer,
  faqAnswers,
  faqCategories,
  Header,
  Photo,
  PrimaryLink,
  RatingStars,
  Testimonials,
  TripadvisorLogo,
} from "@/components/site";

type Card = { title: string; copy: string; note?: string; image: string; href?: string; price?: string };
type AccommodationTier = "Luxury" | "Mid-range" | "Budget";
type TripStayOption = { property: string; tier: AccommodationTier; image: string; alt: string; slides?: TripStayOption[] };
type StayOption = { name: string; text: string; property: string; tier: AccommodationTier; photo: string; slides: TripStayOption[] };
const image = (name: string) => `/images/${name}`;
const contentImage = (source: string) => source.startsWith("http://") || source.startsWith("https://") || source.startsWith("/") ? source : image(source);
const galleryStay = (property: string, tier: AccommodationTier, source: string): TripStayOption => ({ property, tier, image: `accommodations/gallery/${source}`, alt: `${property} ${tier.toLowerCase()} accommodation` });

const safariStayChoices: StayOption[] = [
  { name: "Classic safari camp", text: "A warm tented camp with an immersive bush setting and an easygoing safari atmosphere.", property: "Karibu River Camp", tier: "Mid-range", photo: "accommodations/karibu-river-camp.jpg", slides: [
    galleryStay("Karibu River Camp", "Mid-range", "mainland/Midrange/karibu_camps/01_karibu_river_camp_serengeti.jpg"), galleryStay("Karibu River Camp", "Mid-range", "mainland/Midrange/karibu_camps/02_karibu_river_camp_serengeti.jpg"),
    galleryStay("Lake Masek Tented Lodge", "Mid-range", "mainland/Midrange/lake_masek_tented_lodge/01_lake_masek_tented_lodge.jpg"), galleryStay("Lake Masek Tented Lodge", "Mid-range", "mainland/Midrange/lake_masek_tented_lodge/02_lake_masek_tented_lodge.jpg"),
    galleryStay("Mara Mara Tented Camp", "Luxury", "mainland/Luxury/mara_mara_tented_camp/01_mara_mara_tented_lodge.jpg"), galleryStay("Mara Mara Tented Camp", "Luxury", "mainland/Luxury/mara_mara_tented_camp/02_mara_mara_tented_lodge.jpg"),
  ] },
  { name: "Tented suite", text: "A spacious canvas suite combining close-to-nature character with refined interiors and service.", property: "Legendary Serengeti", tier: "Luxury", photo: "accommodations/legendary-serengeti.webp", slides: [
    galleryStay("Legendary Serengeti", "Luxury", "mainland/Luxury/legendary_serengeti/01_legendary_serengeti_mobile_camp_legendary_expeditions.webp"), galleryStay("Legendary Serengeti", "Luxury", "mainland/Luxury/legendary_serengeti/02_legendary_serengeti_mobile_camp_legendary_expeditions.webp"),
    galleryStay("Nimali Serengeti", "Luxury", "mainland/Luxury/nimali_serengeti_tarangire/01_nimali_serengeti_and_nimali_tarangire.jpg"), galleryStay("Nimali Tarangire", "Luxury", "mainland/Luxury/nimali_serengeti_tarangire/02_nimali_serengeti_and_nimali_tarangire.webp"),
    galleryStay("Siringit Serengeti", "Luxury", "mainland/Luxury/siringit_serengeti/01_siringit_serengeti_camp_siringit_migration_camp.jpg"), galleryStay("Siringit Migration Camp", "Luxury", "mainland/Luxury/siringit_serengeti/02_siringit_serengeti_camp_siringit_migration_camp.jpg"),
  ] },
  { name: "Forest lodge", text: "A polished lodge surrounded by the forested highlands near Ngorongoro.", property: "Neptune Ngorongoro Luxury Lodge", tier: "Luxury", photo: "accommodations/neptune-ngorongoro.webp", slides: [
    galleryStay("Neptune Ngorongoro", "Luxury", "mainland/Luxury/neptune_ngorongoro/01_neptune_ngorongoro_luxury_lodge.webp"), galleryStay("Neptune Ngorongoro", "Luxury", "mainland/Luxury/neptune_ngorongoro/02_neptune_ngorongoro_luxury_lodge.jpg"),
    galleryStay("Wellworth Collection", "Mid-range", "mainland/Luxury/wellworth_properties/01_wellworth_collection_serengeti_and_lake_manyara_properties.jpg"), galleryStay("Wellworth Collection", "Mid-range", "mainland/Luxury/wellworth_properties/02_wellworth_collection_serengeti_and_lake_manyara_properties.jpg"),
    galleryStay("Nomad Tanzania", "Luxury", "mainland/Luxury/nomad_tanzania/01_nomad_serengeti_nomad_tanzania.jpg"), galleryStay("Nomad Tanzania", "Luxury", "mainland/Luxury/nomad_tanzania/02_nomad_serengeti_nomad_tanzania.jpg"),
  ] },
  { name: "Arusha garden lodge", text: "A comfortable green base for resting before or after the safari circuit.", property: "Arumeru River Lodge", tier: "Mid-range", photo: "accommodations/arumeru-river-lodge.jpg", slides: [
    galleryStay("Mount Meru Hotel", "Budget", "mainland/Midrange/mount_meru_hotel/01_mount_meru_hotel_arusha.jpg"), galleryStay("Mount Meru Hotel", "Budget", "mainland/Midrange/mount_meru_hotel/02_mount_meru_hotel_arusha.jpg"),
    galleryStay("Arumeru River Lodge", "Mid-range", "mainland/Midrange/arumeru_river_lodge/01_arumeru_river_lodge.jpg"), galleryStay("Arumeru River Lodge", "Mid-range", "mainland/Midrange/arumeru_river_lodge/02_arumeru_river_lodge.jpg"),
    galleryStay("Arusha Coffee Lodge", "Luxury", "mainland/Luxury/arusha_coffee_lodge/01_arusha_coffee_lodge.jpg"), galleryStay("Arusha Coffee Lodge", "Luxury", "mainland/Luxury/arusha_coffee_lodge/02_arusha_coffee_lodge.jpg"),
    galleryStay("Gran Meliá Arusha", "Luxury", "mainland/Luxury/gran_meli_arusha/01_gran_meli_arusha.jpg"), galleryStay("Gran Meliá Arusha", "Luxury", "mainland/Luxury/gran_meli_arusha/02_gran_meli_arusha.jpg"),
  ] },
];

const zanzibarStayChoices: StayOption[] = [
  { name: "Resort stay", text: "A relaxed coastal resort with broad facilities and an easy base for exploring the island.", property: "TUI BLUE Bahari Zanzibar", tier: "Mid-range", photo: "accommodations/tui-blue-bahari-zanzibar.jpg", slides: [
    galleryStay("TUI BLUE Bahari Zanzibar", "Mid-range", "zanzibar/Midrange/tui_blue/01_tui_blue_bahari_zanzibar.jpg"), galleryStay("TUI BLUE Bahari Zanzibar", "Mid-range", "zanzibar/Midrange/tui_blue/02_tui_blue_bahari_zanzibar.jpg"),
    galleryStay("Royal Zanzibar Beach Resort", "Mid-range", "zanzibar/Midrange/royal_zanzibar/01_royal_zanzibar_beach_resort.jpg"), galleryStay("Royal Zanzibar Beach Resort", "Mid-range", "zanzibar/Midrange/royal_zanzibar/02_royal_zanzibar_beach_resort.jpg"),
    galleryStay("Zanzi Resort", "Luxury", "zanzibar/Luxury/zanzi_resort/01_zanzi_resort_zanzibar.jpg"), galleryStay("Zanzi Resort", "Luxury", "zanzibar/Luxury/zanzi_resort/02_zanzi_resort_zanzibar.jpg"),
  ] },
  { name: "Beachfront villa", text: "A private villa setting with generous space and direct access to the coast.", property: "Zanzibar White Sand Luxury Villas & Spa", tier: "Luxury", photo: "accommodations/zanzibar-white-sand-villas.jpg", slides: [
    galleryStay("White Sand Luxury Villas & Spa", "Luxury", "zanzibar/Luxury/white_sand_luxury_villas_spa/01_zanzibar_white_sand_luxury_villas_spa.jpg"), galleryStay("White Sand Luxury Villas & Spa", "Luxury", "zanzibar/Luxury/white_sand_luxury_villas_spa/02_zanzibar_white_sand_luxury_villas_spa.jpg"),
    galleryStay("SafiraBlu Resort & Villas", "Mid-range", "zanzibar/Luxury/safariblue_luxury_villa/01_safirablu_luxury_resort_villas.jpg"), galleryStay("SafiraBlu Resort & Villas", "Mid-range", "zanzibar/Luxury/safariblue_luxury_villa/02_safirablu_luxury_resort_villas.jpg"),
    galleryStay("Ycona Luxury Resort", "Luxury", "zanzibar/Luxury/ycona_luxury_resort/01_ycona_luxury_resort.jpg"), galleryStay("Ycona Luxury Resort", "Luxury", "zanzibar/Luxury/ycona_luxury_resort/02_ycona_luxury_resort.jpg"),
  ] },
  { name: "Private suite", text: "A secluded, intimate stay designed around quiet service and time by the ocean.", property: "The Palms Zanzibar", tier: "Luxury", photo: "accommodations/the-palms-zanzibar.jpg", slides: [
    galleryStay("The Palms Zanzibar", "Luxury", "zanzibar/Luxury/the_palms_zanzibar/01_the_palms_zanzibar.jpg"), galleryStay("The Palms Zanzibar", "Luxury", "zanzibar/Luxury/the_palms_zanzibar/02_the_palms_zanzibar.jpg"),
    galleryStay("The Residence Zanzibar", "Luxury", "zanzibar/Luxury/the_residence_zanzibar/01_the_residence_zanzibar.jpg"), galleryStay("The Residence Zanzibar", "Luxury", "zanzibar/Luxury/the_residence_zanzibar/02_the_residence_zanzibar.webp"),
    galleryStay("Tulia Zanzibar", "Luxury", "zanzibar/Luxury/tulia_zanzibar_unique_beach_resort/01_tulia_zanzibar_unique_beach_resort.jpg"), galleryStay("Tulia Zanzibar", "Luxury", "zanzibar/Luxury/tulia_zanzibar_unique_beach_resort/02_tulia_zanzibar_unique_beach_resort.jpg"),
  ] },
  { name: "Family-friendly resort", text: "A practical beach base with room to unwind together and a wide choice of facilities.", property: "Royal Zanzibar Beach Resort", tier: "Mid-range", photo: "accommodations/royal-zanzibar.jpg", slides: [
    galleryStay("Royal Zanzibar Beach Resort", "Mid-range", "zanzibar/Midrange/royal_zanzibar/01_royal_zanzibar_beach_resort.jpg"), galleryStay("Royal Zanzibar Beach Resort", "Mid-range", "zanzibar/Midrange/royal_zanzibar/02_royal_zanzibar_beach_resort.jpg"),
    galleryStay("Neptune Pwani Beach Resort", "Mid-range", "zanzibar/Luxury/neptune_zanzibar/01_neptune_pwani_beach_resort_spa.jpg"), galleryStay("Neptune Pwani Beach Resort", "Mid-range", "zanzibar/Luxury/neptune_zanzibar/02_neptune_pwani_beach_resort_spa.jpg"),
    galleryStay("The Mora Zanzibar", "Luxury", "zanzibar/Luxury/the_mora_zanzibar/01_the_mora_zanzibar.jpg"), galleryStay("The Mora Zanzibar", "Luxury", "zanzibar/Luxury/the_mora_zanzibar/02_the_mora_zanzibar.jpg"),
  ] },
];

function ReferenceHero({
  imageSrc, eyebrow, title, lead, copy, action, actionHref = "/plan-your-trip", secondAction, secondActionHref = "#explore", active, navVariant = "destinations", trustItems, routeFacts, heroClass = "",
}: {
  imageSrc: string; eyebrow: string; title: string; lead?: string; copy: string;
  action: string; actionHref?: string; secondAction: string; secondActionHref?: string; active: string; navVariant?: "classic" | "destinations";
  trustItems?: string[]; routeFacts?: string[]; heroClass?: string;
}) {
  return <section className={`ref-hero ${heroClass}`}>
    <Photo src={imageSrc} alt="" priority className="ref-hero-image" sizes="100vw" />
    <div className="ref-hero-scrim" />
    <Header active={active} variant={navVariant} />
    <div className="shell ref-hero-body">
      <p className="eyebrow light">{eyebrow}</p>
      <h1>{title}</h1>
      {lead && <p className="ref-hero-lead">{lead}</p>}
      <p>{copy}</p>
      <div className="ref-actions"><PrimaryLink href={actionHref}>{action}</PrimaryLink><Link className="ghost-button" href={secondActionHref}>{secondAction}<span className="arrow" aria-hidden="true"><ArrowIcon /></span></Link></div>
      {routeFacts && <div className="ref-hero-route-facts">{routeFacts.map((fact, index) => <span key={fact}><b aria-hidden="true">{["▣", "△", "▧", "◇"][index]}</b>{fact}</span>)}</div>}
    </div>
    {!routeFacts && <div className="shell ref-hero-trust"><div className="ref-hero-rating"><TripadvisorLogo light compact /><small>5.0 {heroClass === "ref-hero-zanzibar" ? <span className="ref-zanzibar-hero-stars" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, i) => <span key={i}><Image src={image("figma-zanzibar-hero-star.svg")} alt="" width={16.6309} height={15.915} /></span>)}</span> : <RatingStars size={14} />}</small></div>{(trustItems || ["Local Tanzanian team", "Personal trip planning", "Your journey, your pace"]).map(item => <span key={item}><b aria-hidden="true">✓</b>{item}</span>)}<span className="sr-only">Current section: {active}</span></div>}
  </section>;
}

function Intro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="ref-intro"><span>{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

function PlaceGrid({ eyebrow, title, copy, cards, id = "explore", variant }: { eyebrow: string; title: string; copy: string; cards: Card[]; id?: string; variant?: "kilimanjaro" | "zanzibar" | "safari" }) {
  return <section className="ref-section ref-places" id={id}><div className="shell"><Intro eyebrow={eyebrow} title={title} copy={copy} />
    <div className={`ref-place-grid ${variant === "kilimanjaro" ? "ref-route-grid" : variant === "zanzibar" ? "ref-zanzibar-place-grid" : variant === "safari" ? "ref-safari-place-grid" : ""}`}>{cards.map((card, index) => <article className="ref-place" key={card.title}>
      <Photo src={card.image} alt={card.title} /><div className="ref-place-copy"><h3>{card.title}</h3>{variant === "kilimanjaro" && <div className="ref-route-tags"><span>{card.note}</span><span>{index === 0 ? "Hard" : index === 5 ? "Very hard" : "Moderate–hard"}</span></div>}<p>{card.copy}</p>{variant === "kilimanjaro" ? <div className="ref-route-action"><span>{card.price ? `From ${card.price} / person` : "Price on request"}</span><Link href={card.href || "/plan-your-trip"}>View Route <Image src={image("figma-kili-route-arrow.svg")} alt="" width={18} height={18} /></Link></div> : <>{card.note && <small>{card.note}</small>}{variant !== "safari" && <Link href={card.href || "/plan-your-trip"}>Explore this journey <span aria-hidden="true">↗</span></Link>}</>}</div>
    </article>)}</div>
  </div></section>;
}

function ImageCards({ eyebrow, title, copy, cards, dark = false, variant, className = "" }: { eyebrow: string; title: string; copy?: string; cards: Card[]; dark?: boolean; variant?: "climbs"; className?: string }) {
  return <section className={`ref-section ref-card-section ${dark ? "ref-dark" : ""} ${className}`}><div className="shell"><Intro eyebrow={eyebrow} title={title} copy={copy} />
    <div className={`ref-image-cards ${variant === "climbs" ? "ref-climb-cards" : ""}`}>{cards.map(card => <Link href={card.href || "/plan-your-trip"} className="ref-image-card" key={card.title}>
      <Photo src={card.image} alt="" /><div className="ref-image-shade" /><div className="ref-image-card-copy">{variant === "climbs" ? <><div className="ref-climb-card-head"><h3>{card.title}</h3><small>{card.note}</small></div><div className="ref-climb-card-details"><p>{card.copy}</p><strong>{card.price ? `From ${card.price} / person` : "Price on request"}</strong><span>View Trip <Image src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /></span></div></> : <><small>{card.note}</small><h3>{card.title}</h3><p>{card.copy}</p><span>{className === "ref-zanzibar-combinations" ? "Start planning" : "Plan this trip"}{className === "ref-zanzibar-combinations" ? <Image src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /> : <b aria-hidden="true"><ArrowIcon /></b>}</span></>}</div>
    </Link>)}</div>
  </div></section>;
}

function SafariStory() {
  return <section className="ref-section ref-dark safari-story" aria-labelledby="safari-story-title"><div className="shell safari-story-grid">
    <div className="safari-story-copy"><p className="eyebrow">MORE THAN A WILDLIFE CHECKLIST</p><h2 id="safari-story-title">What Makes a Tanzania Safari Special?</h2><p>A safari is a chance to slow down and watch a living landscape: grasslands, river valleys, forests and the animals that move between them.</p><p>Make room for the human side of Tanzania, too. Discuss respectful cultural experiences, local context and the visits that genuinely interest you.</p></div>
    <div className="safari-story-visual"><Photo className="safari-story-main" src={image("figma-safari-special-bob056321.png")} alt="Safari travellers pausing beside the water in Tanzania" /><div className="safari-story-card"><Photo src={image("figma-safari-special-rectangle128.png")} alt="Lions resting on the open plains" /><span>Wildlife, landscape and local knowledge — experienced at the pace of the bush.</span></div><Image className="safari-story-brand" src={image("figma-safari-special-whats-app-image20260918at110701am-removebg-preview1.png")} alt="Betheli Expeditions" width={160} height={90} /></div>
  </div></section>;
}

function SafariVehicles() {
  const vehicles = [
    ["Open-top safari vehicle", "Great for unhindered views, photography and the immersive feel of a classic safari drive.", "figma-safari-vehicles-img91031.png"],
    ["Closed vehicle with pop-up roof", "A practical option for rainier days, longer transfers and groups who want a quieter cabin.", "figma-safari-vehicles-img93051.png"],
    ["Comfort and practicalities", "Ask about the practical details of your safari vehicle before confirming your trip.", "figma-safari-vehicles-img93061.png"],
  ];
  return <section className="ref-section safari-vehicles" aria-labelledby="safari-vehicles-title"><div className="shell"><div className="ref-intro"><span>SAFARI VEHICLES</span><h2 id="safari-vehicles-title">Comfortable Rides for the Wild</h2></div><div className="ref-three-cards">{vehicles.map(([title, copy, src], index) => <article key={title}><div className="safari-vehicle-photo"><Photo src={image(src)} alt={title} /><span aria-hidden="true">0{index + 1}</span></div><div className="safari-vehicle-copy"><h3>{title}</h3><p>{copy}</p></div></article>)}</div></div></section>;
}

function SafariFaq() {
  const items = [["When is the best time for a Tanzania safari?","Drier periods often make wildlife easier to observe near water. Green seasons bring different scenery and birdlife. Migration movements follow rainfall and grazing, so sightings and crossings are never guaranteed."],["How many days should I allow?","Consider travel time as well as park days. A short trip may suit one region; more time allows a broader route. Ask the team to compare realistic options for your available days."],["What should I pack?","Please confirm a packing list for your safari with the team."],["What safari vehicles are used?","Ask the team to confirm your vehicle in the trip proposal."],["What accommodation can I choose?","Accommodation choices are confirmed in your quote."],["Can families go on safari?","Discuss your family’s needs and ages with the team."],["Can I travel privately or in a small group?","Ask the team about private and group options for your dates."]];
  return <section className="ref-section safari-faq" aria-labelledby="safari-faq-title"><div className="shell safari-faq-grid"><div className="safari-faq-heading"><p className="eyebrow">GOOD QUESTIONS</p><h2 id="safari-faq-title">Tanzania Safari Questions</h2><p>Useful answers for the first conversation and the planning that follows.</p><Link href="/contact" className="safari-faq-link">Ask our local team <span aria-hidden="true"><ArrowIcon /></span></Link></div><Accordion openCount={2} items={items} /></div></section>;
}

function ZanzibarOceanActivities() {
  return <section className="ref-section ref-dark ref-zanzibar-ocean" aria-labelledby="zanzibar-activities-title">
    <Photo className="ref-zanzibar-ocean-photo" src={image("figma-zanzibar-ocean-scrim.png")} alt="Snorkelers exploring a Zanzibar coral reef" sizes="100vw" />
    <div className="shell ref-zanzibar-ocean-content"><div><p className="eyebrow">CLASSIC ZANZIBAR ACTIVITIES</p><h2 id="zanzibar-activities-title">Explore Stone Town, spice farms and the ocean.</h2><p>Discover classic Zanzibar experiences: Stone Town walks, spice farm tours, sunset dhow sailing and snorkeling. These timeless activities offer a deeper look at the island’s culture, history and coastline.</p></div>
      <div className="ref-zanzibar-ocean-mini"><figure><Photo src={image("figma-zanzibar-ocean-rectangle.png")} alt="Sunset dhow sailing" /><figcaption>Sunset dhow sailing</figcaption></figure><figure><Photo src={image("figma-zanzibar-ocean-rectangle1.png")} alt="Stone Town street" /><figcaption>Stone Town exploration</figcaption></figure></div>
    </div>
  </section>;
}

function ZanzibarIslandIntro() {
  return <section className="ref-section ref-dark ref-zanzibar-intro"><div className="shell ref-zanzibar-intro-grid"><div className="ref-zanzibar-intro-copy"><p className="eyebrow">AN ISLAND WITH MANY STORIES</p><h2>More than a beach at the end of a trip.</h2><p>Zanzibar rewards the traveler who takes their time. Historic lanes in Stone Town, spice gardens in the interior, snorkeling reefs off the coast and long stretches of sand where the pace slows right down.</p><p>Tell us what genuinely interests you. We&apos;ll help you build an island stay that doesn&apos;t try to do everything in five days.</p><div className="ref-zanzibar-intro-tags">{["Beach","Stone Town","Spices","Ocean","Culture"].map(tag => <span key={tag}>{tag}</span>)}</div></div><div className="ref-zanzibar-intro-visual"><Photo src={image("figma-zanzibar-intro-bob056321.png")} alt="Zanzibar beach at dusk" /><div className="ref-zanzibar-intro-card"><Photo src={image("figma-zanzibar-intro-rectangle128.png")} alt="Traveller exploring a garden path" /><Image src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /><p>Betheli Expeditions is a proud Tanzanian owned tour operator company.</p></div><Image className="ref-zanzibar-intro-logo" src={image("figma-zanzibar-intro-logo.png")} alt="Betheli Expeditions" width={142} height={80} /></div></div></section>;
}

function ZanzibarFaq() {
  const items = [["When is the best time to visit?","Often-drier periods suit beach travel while rainy periods need more flexibility. Wind, tides and sea conditions vary around the island. Check current conditions for your activities."],["Which part of the island is right for me?","The north has a popular beach scene, the east coast has a stronger tidal rhythm and Stone Town centers on cultural exploring. The exact property and beach matter as much as the area."],["Can I combine Zanzibar with a safari or climb?","Discuss connections and recovery time with the team."],["What should I pack and wear?","Ask for guidance tailored to your plans and season."],["Can beginners snorkel or dive?","Confirm activities and conditions with the team."],["Are transfers and activities included?","Inclusions are confirmed in your written quote."]];
  return <section className="ref-section ref-zanzibar-faq"><div className="shell"><div className="ref-zanzibar-faq-head"><div><p className="eyebrow">GOOD QUESTIONS. HONEST ANSWERS.</p><h2>Zanzibar<br />frequently asked.</h2></div><p>General guidance to help you choose. Package details confirmed during planning.</p></div><Accordion items={items} openCount={1} /></div></section>;
}

function WhyGrid({ title, imageSrc, items, copy, className = "" }: { title: string; imageSrc: string; items: [string, string][]; copy?: string; className?: string }) {
  const kilimanjaroIcons = ["figma-kili-value-users.svg", "figma-kili-value-message.svg", "figma-kili-value-tent.svg", "figma-kili-value-mountain.svg", "figma-kili-value-shield.svg", "figma-kili-value-flag.svg"];
  return <section className={`ref-section ref-dark ref-why-grid ${className}`}><div className="shell"><Intro eyebrow="LOCAL KNOWLEDGE. PERSONAL CARE." title={title} copy={copy} />
    <Photo src={imageSrc} alt="Bathiel Expeditions team" sizes="(max-width: 700px) 100vw, 1200px" />
    <div className="ref-why-items">{items.map(([heading, text], index) => <article key={`${heading}-${index}`}><Image src={image(kilimanjaroIcons[index])} alt="" width={28} height={28} /><h3>{heading}</h3><p>{text}</p></article>)}</div>
  </div></section>;
}

function StaySelector({ eyebrow, title, copy, items }: { eyebrow: string; title: string; copy: string; items: StayOption[] }) {
  const [selected, setSelected] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = items[selected];
  const slides = current.slides;
  const slide = slides[slideIndex] || slides[0];
  const icons = ["figma-zanzibar-stay-building.svg","figma-zanzibar-stay-house.svg","figma-zanzibar-stay-bed.svg","figma-zanzibar-stay-users.svg"];
  const chooseStay = (index: number) => { setSelected(index); setSlideIndex(0); };
  const move = (direction: number) => setSlideIndex(index => (index + direction + slides.length) % slides.length);
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlideIndex(index => (index + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused, selected, slides.length]);
  return <section className="ref-section ref-stay"><div className="shell"><Intro eyebrow={eyebrow} title={title} copy={copy} /><div className="ref-stay-grid">
    <div className="ref-stay-options">{items.map((item, i) => <div className={selected === i ? "active" : ""} key={item.property}><button type="button" aria-expanded={selected === i} onClick={() => chooseStay(i)}><span className="ref-stay-icon"><Image src={image(icons[i])} alt="" width={20} height={20} /></span><span>{item.name}</span></button>{selected === i && <p>{item.text}</p>}</div>)}</div>
    <div className="ref-stay-gallery" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}><div className="ref-stay-photo" aria-live="polite"><Photo key={`${selected}-${slideIndex}-${slide.image}`} src={image(slide.image)} alt={slide.alt} /><div className="ref-stay-photo-meta"><span className={`accommodation-tier accommodation-tier-${slide.tier.toLowerCase().replace("-", "")}`}>{slide.tier}</span><strong>{slide.property}</strong></div><div className="ref-stay-arrows"><button type="button" aria-label={`Previous ${current.name} accommodation`} onClick={() => move(-1)}>‹</button><span>{slideIndex + 1} / {slides.length}</span><button type="button" aria-label={`Next ${current.name} accommodation`} onClick={() => move(1)}>›</button></div></div><div className="ref-thumbs">{items.map((item, i) => <button type="button" className={selected === i ? "active" : ""} aria-label={`Show ${item.name} accommodation collection`} aria-pressed={selected === i} onClick={() => chooseStay(i)} key={item.property}><Photo src={image(item.photo)} alt="" /></button>)}</div></div>
  </div></div></section>;
}

function TripOverviewSlider({ images }: { images: CmsImage[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const current = images[index] || images[0];
  const move = (direction: number) => setIndex(value => (value + direction + images.length) % images.length);

  useEffect(() => {
    if (paused || images.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex(value => (value + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
      if (event.key === "ArrowLeft" && images.length > 1) setIndex(value => (value - 1 + images.length) % images.length);
      if (event.key === "ArrowRight" && images.length > 1) setIndex(value => (value + 1) % images.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [expanded, images.length]);

  if (!current) return null;

  return <figure
    className="trip-ref-overview-slider"
    aria-label={`Overview image ${index + 1} of ${images.length}`}
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}
  >
    <button type="button" className="trip-ref-overview-open" aria-label={`Open ${current.alt || "trip overview image"} in a larger viewer`} onClick={() => setExpanded(true)}>
      <Photo key={`${index}-${current.src}`} src={current.src} alt={current.alt} sizes="(max-width: 650px) 100vw, 58vw" />
      <span className="trip-ref-overview-expand" aria-hidden="true">&#x26F6;</span>
    </button>
    {images.length > 1 && <div className="trip-ref-overview-controls">
      <button type="button" aria-label="Show previous overview image" onClick={() => move(-1)}>‹</button>
      <span>{index + 1} / {images.length}</span>
      <button type="button" aria-label="Show next overview image" onClick={() => move(1)}>›</button>
    </div>}
    {expanded && <div className="trip-ref-overview-lightbox" role="dialog" aria-modal="true" aria-label="Trip overview image viewer">
      <button type="button" className="trip-ref-overview-backdrop" aria-label="Close image viewer" onClick={() => setExpanded(false)} />
      <div className="trip-ref-overview-lightbox-panel">
        <button type="button" className="trip-ref-overview-close" aria-label="Close image viewer" onClick={() => setExpanded(false)}>×</button>
        <Photo key={`expanded-${index}-${current.src}`} src={current.src} alt={current.alt} sizes="95vw" />
        {images.length > 1 && <div className="trip-ref-overview-lightbox-controls">
          <button type="button" aria-label="Show previous overview image" onClick={() => move(-1)}>‹</button>
          <span>{index + 1} / {images.length}</span>
          <button type="button" aria-label="Show next overview image" onClick={() => move(1)}>›</button>
        </div>}
      </div>
    </div>}
  </figure>;
}

function Seasons({ eyebrow, title, copy, items, imageSrc }: { eyebrow: string; title: string; copy?: string; items: [string,string,string][]; imageSrc?: string }) {
  return <section className={`ref-section ref-seasons ${imageSrc ? "with-image" : ""}`}><div className="shell"><Intro eyebrow={eyebrow} title={title} copy={copy} />
    <div className="ref-season-grid">{items.map(([date,title,text]) => <article key={date}><b>{date}</b><h3>{title}</h3><p>{text}</p></article>)}</div>
  </div>{imageSrc && <Photo src={imageSrc} alt="" />}</section>;
}

function Safety() {
  const items = [
    { title: "Experienced mountain guides", copy: "Ask about your guide team’s experience and the support available on your chosen route.", icon: "users", photo: "drive-library/lemosho-barranco.webp" },
    { title: "Acclimatization strategy", copy: "Discuss the daily altitude profile, rest opportunities and a pace that suits your itinerary.", icon: "chart", photo: "figma-kili-journey-journey-landscape2.png" },
    { title: "Emergency procedures", copy: "Before booking, confirm communication, evacuation arrangements and insurance requirements.", icon: "shield", photo: "figma-kili-journey-summit-panorama.png" },
    { title: "Guide-to-client ratios", copy: "Request the confirmed guide-to-client ratio and group size for your departure.", icon: "group", photo: "figma-kili-group-trip-landscape3.png" },
    { title: "Mountain equipment", copy: "Confirm the equipment provided, rental options and what you will need to bring.", icon: "equipment", photo: "figma-kili-journey-journey-landscape1.png" },
    { title: "Health monitoring", copy: "Discuss check-ins and how the team responds to symptoms. Seek personal medical advice before travel.", icon: "heart", photo: "figma-kili-journey-journey-landscape3.png" },
  ];
  const paths: Record<string, React.ReactNode> = {
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2"/><path d="M17 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 2 4v2"/></>,
    chart: <><path d="M3 20h18M4 16l5-5 4 3 7-8"/><path d="M16 6h4v4"/></>,
    shield: <><path d="M12 2 4 5v6c0 5 3.3 8.6 8 11 4.7-2.4 8-6 8-11V5z"/><path d="M12 7v6m0 3h.01"/></>,
    group: <><circle cx="9" cy="8" r="3"/><path d="M4 20v-2a5 5 0 0 1 10 0v2M17 6l4 4m0-4-4 4"/></>,
    equipment: <><path d="M3 9h18v11H3zM8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 14h18m-11-2v4h4v-4"/></>,
    heart: <><path d="M20.8 8.4c0 4.7-8.8 11.2-8.8 11.2S3.2 13.1 3.2 8.4a4.4 4.4 0 0 1 8.8-.4 4.4 4.4 0 0 1 8.8.4Z"/><path d="M5 12h4l2-3 2 6 2-3h4"/></>,
  };
  return <section className="ref-section ref-dark ref-safety" id="safety"><div className="shell ref-safety-grid"><div><Intro eyebrow="CARE BEFORE THE SUMMIT" title="Your Safety Comes First" copy="The mountain deserves respect. So do your questions. Talk to us about the support and arrangements for your climb before you book." /><Photo src={image(items[0].photo)} alt="Experienced mountain guides on Kilimanjaro" /><p>Reaching the summit is never more important than returning safely. No itinerary can remove the risks of high altitude.</p></div><div className="ref-safety-list">{items.map((item) => <div className="ref-safety-topic" key={item.title}><span className="ref-safety-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[item.icon]}</svg></span><span><strong>{item.title}</strong><small>{item.copy}</small></span></div>)}<Link className="ref-safety-cta" href="/contact">Talk to a Guide <span aria-hidden="true">↗</span></Link></div></div></section>;
}

const kilimanjaroEnvironments = [
  { title: "Cultivation Zone", height: "1,000–1,800m", icon: "leaf", image: "drive-library/marangu-trail.webp", alt: "Trekkers crossing Kilimanjaro's green lower slopes", copy: "Cultivated foothills and open grassland form the mountain’s green, lived-in lower edge." },
  { title: "Montane Forest", height: "1,800–3,000m", icon: "forest", image: "drive-library/machame-rainforest.webp", alt: "Trekkers climbing through Kilimanjaro montane forest", copy: "Dense, humid forest surrounds the trail before the route opens into higher, drier country." },
  { title: "Heath & Moorland", height: "3,000–4,000m", icon: "grass", image: "drive-library/lemosho-moorland.webp", alt: "Trekkers crossing open heath and moorland on Kilimanjaro", copy: "Low shrubs, giant groundsels and broad mountain views replace the enclosed forest trail." },
  { title: "Alpine Desert", height: "4,000–5,000m", icon: "mountain", image: "drive-library/umbwe-alpine.webp", alt: "Trekkers crossing Kilimanjaro alpine desert", copy: "A stark, high-altitude landscape of rock, dust and strong light leads toward the summit slopes." },
  { title: "Arctic / Summit Zone", height: "5,000–5,895m", icon: "snow", image: "drive-library/marangu-summit.webp", alt: "Climbers at Uhuru Peak on Kilimanjaro", copy: "Ice, snow, wind and thin air define the final exposed approach to Uhuru Peak." },
];

function EnvironmentIcon({ type }: { type: string }) {
  const paths: Record<string, React.ReactNode> = {
    leaf: <><path d="M5 20c1-8 5-13 14-16 0 9-4 14-12 14"/><path d="M7 18c3-4 6-7 11-10"/></>,
    forest: <><path d="m7 3-4 7h3l-4 7h10l-4-7h3z"/><path d="M7 17v4M16 6l-3 6h2l-3 6h8l-3-6h2zM16 18v3"/></>,
    grass: <><path d="M5 21c0-7 2-12 6-16-1 7 0 11 1 16M12 21c0-6 2-10 7-13-3 6-3 9-3 13M4 21h16"/></>,
    mountain: <><path d="m3 20 7-13 3 5 2-3 6 11z"/><path d="m8 11 2 2 2-2"/></>,
    snow: <><path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3M9 20l3-3 3 3M4 10l4 1-1-4M20 14l-4-1 1 4M4 14l4-1-1 4M20 10l-4 1 1-4"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

function RouteEnvironments() {
  const [selected, setSelected] = useState(1);
  const environment = kilimanjaroEnvironments[selected];

  return <section className="route-environments" aria-labelledby="route-environments-title"><div className="shell route-environment-grid">
    <div className="route-environment-photo" aria-live="polite"><Photo key={environment.image} src={image(environment.image)} alt={environment.alt} /></div>
    <div className="route-environment-content"><div className="ref-intro"><span>A MOUNTAIN OF MANY WORLDS</span><h2 id="route-environments-title">Environments of Kilimanjaro</h2></div>
      <div className="route-environment-options">{kilimanjaroEnvironments.map((item, index) => <button type="button" className={selected === index ? "active" : ""} aria-pressed={selected === index} onClick={() => setSelected(index)} key={item.title}>
        <span className="route-environment-icon" aria-hidden="true"><EnvironmentIcon type={item.icon} /></span><span className="route-environment-copy"><strong>{item.title}</strong><small>{item.height}</small>{selected === index && <span className="route-environment-description">{item.copy}</span>}</span>
      </button>)}</div>
    </div>
  </div></section>;
}

function FaqPreview({ title, items, openCount = 1, id, variant }: { title: string; items?: string[][]; openCount?: number; id?: string; variant?: "kilimanjaro" }) {
  return <section className={`ref-section ref-faq ${variant === "kilimanjaro" ? "ref-kili-faq" : ""}`} id={id}><div className="shell"><Intro eyebrow={variant === "kilimanjaro" ? "GOOD QUESTIONS. HONEST ANSWERS." : "GOOD QUESTIONS"} title={title} copy={variant === "kilimanjaro" ? "A little clarity before a big adventure. Talk to our team about the details of your own climb." : "Useful answers for the first conversation and the planning that follows."} /><Accordion items={items} openCount={openCount} />{variant === "kilimanjaro" ? <p className="ref-kili-faq-note">Before booking, confirm your packing list, seasonal conditions, total cost and altitude support arrangements. This layout shows the first answer expanded.</p> : <Link className="ref-text-link" href="/faq">Explore all questions ↗</Link>}</div></section>;
}

function KilimanjaroStyleCards() {
  const styles = [
    { title: "SOLO", subtitle: "Travel your way", badge: "Travel Independently", copy: "A personalised safari designed around your interests, pace and plans.", best: "independent travellers", imageSrc: "figma-home-style1.png", href: "/plan-your-trip", action: "Start planning" },
    { title: "PRIVATE GROUP", subtitle: "Travel with your people", badge: "Just Your People", copy: "A private vehicle and itinerary for your partner, family or friends.", best: "couples, family, friends", imageSrc: "figma-home-style2.png", href: "/plan-your-trip", action: "Start planning" },
    { title: "JOIN A GROUP", subtitle: "Meet new people", badge: "Social & Shared", copy: "Join a small group and share the safari experience with other travellers.", best: "solo travellers & social travellers", imageSrc: "figma-home-style3.png", href: "/groups", action: "Check group dates" },
  ];
  return <div className="ref-kili-style-grid">{styles.map(item => <article className="ref-kili-style-card" key={item.title}>
    <div className="ref-kili-style-photo"><Photo src={image(item.imageSrc)} alt="" /><span className="ref-kili-style-badge">{item.badge}</span><div className="ref-kili-style-name"><h3>{item.title}</h3><p>{item.subtitle}</p></div></div>
    <div className="ref-kili-style-details"><p>{item.copy}</p><strong>Best for: {item.best}</strong><Link href={item.href}>{item.action}<Image src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /></Link></div>
  </article>)}</div>;
}

const tripSections = [
  ["general", "GENERAL"],
  ["overview", "OVERVIEW"],
  ["itinerary", "ITINERARY"],
  ["inclusions", "INCLUSIONS"],
  ["questions", "FREQUENTLY ASKED QUESTIONS"],
] as const;

function TripSectionNav() {
  const [activeSection, setActiveSection] = useState<string>("general");

  useEffect(() => {
    let frame = 0;
    const updateActiveSection = () => {
      const navHeight = document.querySelector(".trip-ref-nav")?.getBoundingClientRect().height ?? 0;
      const threshold = navHeight + 24;
      let current: string = tripSections[0][0];
      for (const [id] of tripSections) {
        const target = document.getElementById(id);
        if (target && target.getBoundingClientRect().top <= threshold) current = id;
      }
      setActiveSection(current);
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveSection);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", scheduleUpdate);
    };
  }, []);

  return <nav className="trip-ref-nav" aria-label="Trip sections"><div className="shell">
    <div className="trip-ref-nav-links">{tripSections.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={activeSection === id ? "location" : undefined} onClick={() => setActiveSection(id)}>{label}</a>)}</div>
    <PrimaryLink>Start planning</PrimaryLink>
  </div></nav>;
}

const safariParks: Card[] = [
  ["Serengeti","Wide grasslands, scattered acacias and wildlife on an extraordinary scale. Choose a region around your dates, rather than expecting the herds in one fixed place.","Best known for: Open plains, predators and seasonal migration",0],
  ["Ngorongoro Crater","Descend into a remarkable volcanic caldera with grassland, wetland and woodland habitats. Pair this landscape with other northern parks for contrast.","Best known for: Caldera scenery and varied habitats",1],
  ["Tarangire","Baobabs and the Tarangire River shape a distinctive safari landscape. In drier periods, animals may gather near water; every visit is different.","Best known for: Elephants, baobabs and river landscapes",2],
  ["Lake Manyara","Forest, lake and the Rift Valley escarpment create a more intimate setting. Birdlife and lake conditions vary with water levels and the season.","Best known for: Lakeshore, forest and Rift Valley views",3],
  ["Arusha National Park","Green foothills and Mount Meru views offer a quieter contrast to the open plains. Ask which activities and access arrangements suit your trip.","Best known for: Mount Meru scenery and forest habitats",4],
  ["Ruaha","A different side of Tanzania: broad dry-country scenery, baobabs and river habitats. Discuss the extra travel time needed for a southern safari.","Best known for: Wild landscapes and a southern safari setting",5],
].map(([title,copy,note,n]) => ({
  title: title as string,
  copy: copy as string,
  note: note as string,
  image: image(["drive-library/safari-migration.webp", "drive-library/safari-crater-road.webp", "drive-library/safari-vehicle.webp", "drive-library/safari-flamingos.webp", "drive-library/safari-viewpoint.webp", "drive-library/safari-road.webp"][Number(n)]),
}));

const zanzibarPlaces: Card[] = [
  ["Stone Town","Wander narrow alleys, visit historic landmarks and soak up the island’s cultural rhythm. It is a place to slow down and absorb the atmosphere.","Best known for: Architecture, markets and island history",0],
  ["Nungwi","A northern beach destination with a relaxed atmosphere, scenic coastline and a chance to see local fishing communities.","Best known for: Beaches, sunsets and coastal scenery",1],
  ["Paje","A southeastern beach destination known for its scenic coastline, water sports and laid-back island atmosphere.","Best known for: Beaches, water sports and coastal scenery",2],
  ["Kendwa","A quieter northern beach with calm waters and a peaceful setting. It is ideal for relaxation and sunset views.","Best known for: Quiet beaches and sunset views",3],
  ["Matemwe","A northeastern beach destination with a more secluded feel, scenic views and access to Mnemba Atoll for snorkeling.","Best known for: Secluded beaches and snorkeling",4],
  ["Prison Island","A short boat trip from Stone Town with giant tortoises, a historic prison and a beautiful beach for a day visit.","Best known for: Giant tortoises and island history",5],
].map(([title,copy,note,n]) => ({ title: title as string, copy: copy as string, note: note as string, image: image(`figma-zanzibar-mosaic-destination-photograph${n || ""}.png`) }));

export function SafariReferencePage() {
  const safaris: Card[] = [
    {title:"3-day Serengeti",copy:"A focused Serengeti idea for travelers with limited time.",note:"3 DAYS",image:image("drive-library/safari-migration.webp"),href:"/trips"},
    {title:"4-day Northern Tanzania",copy:"A short journey through contrasting northern parks.",note:"4 DAYS",image:image("drive-library/safari-crater-road.webp"),href:"/trips"},
    {title:"5-day Tanzania Safari",copy:"More time in the wild, at a pace that works for you.",note:"5 DAYS",image:image("drive-library/safari-picnic.webp"),href:"/trips"},
    {title:"7-day Tanzania Safari",copy:"A longer itinerary with room to slow down.",note:"7 DAYS",image:image("drive-library/safari-community.webp"),href:"/trips"},
  ];
  return <><ReferenceHero imageSrc={image("drive-library/safari-hero.webp")} eyebrow="TANZANIA SAFARIS" title="Experience the Wild Side of Tanzania" copy="Explore Serengeti, Ngorongoro, Tarangire and beyond. Your pace, your interests — shaped by a local Tanzanian team that knows these places well." action="Explore Safaris" actionHref="#explore" secondAction="Plan My Safari" secondActionHref="/plan-your-trip" active="Safari" />
    <main className="safari-page"><PlaceGrid eyebrow="FROM ICONIC PLAINS TO QUIETER WILDERNESS" title="Where Will Your Safari Take You?" copy="Get to know the places before choosing a route. Each destination brings its own landscape, rhythm and possibilities." cards={safariParks} variant="safari" />
      <ImageCards eyebrow="POPULAR PLANNING IDEAS" title="Choose Your Safari" copy="Four starting points, not fixed departures. Itinerary, availability and pricing are confirmed when you plan with us." cards={safaris} />
      <SafariStory />
      <SafariVehicles />
      <StaySelector eyebrow="FEATURED SAFARI ACCOMMODATION" title="Choose the stay that fits your safari" copy="Compare real properties across comfort levels. Final availability, room type and pricing are confirmed in your tailored quote." items={safariStayChoices} />
<WhyGrid title="Why Travel With Bathiel Expeditions?" imageSrc={image("drive-library/safari-guides.webp")} copy="Start with a conversation. A Tanzanian-owned team — not a booking engine — helps you shape the journey that fits you." items={[["Local perspective","Start with a Tanzanian team and a conversation about the places you want to see."],["Personal planning","Share your interests, available time and preferred pace before choosing an outline."],["Clear choices","Ask for a written quote showing your proposed itinerary and all the details to confirm."],["Thoughtful travel","Discuss wildlife etiquette, community visits and low-impact travel with the team."],["A journey that fits","Private and small-group preferences can be discussed; availability is confirmed with your quote."],["Local perspective","Start with a Tanzanian team and a conversation about the places you want to see."]]} />
      <Seasons eyebrow="PLAN AROUND THE SEASONS" title="When to Go on Safari" copy="There is no single perfect month. Match your interests to the season, then check current conditions with the team." items={[["JAN — FEB","Green plains","Seasonal herd activity in some areas. Showers remain possible; wildlife and migration locations vary."],["MAR — MAY","Longer rains","Greener landscapes and fewer visitors. Road conditions may affect access; confirm your route in advance."],["JUN — OCT","Often drier","Wildlife may gather near water. Popular months can be busier; river crossings are never guaranteed. A strong time for wildlife observation in many parks."],["NOV — DEC","Shorter rains","Fresh grazing may shift herd movements. Holiday periods attract more travelers; weather varies."]]} />
      <Testimonials /><CtaBanner title="Ready to experience Tanzania?" image={image("figma-zanzibar-combine-frame.png")} /><SafariFaq /></main><Footer /></>;
}

export function ZanzibarReferencePage() {
  return <><ReferenceHero imageSrc={image("figma-zanzibar-hero.png")} eyebrow="ZANZIBAR · THE INDIAN OCEAN" title="Discover Zanzibar" copy="White-sand beaches, turquoise water, historic Stone Town and island life that moves at its own pace." action="Plan My Zanzibar Trip" secondAction="Explore the Island" active="Zanzibar" heroClass="ref-hero-zanzibar" trustItems={["Local Tanzanian team", "Personal trip planning", "Your journey, your pace", "Quote on request, no pressure"]} />
    <main><PlaceGrid eyebrow="ISLAND BEACHES, STONE TOWNS AND COASTAL EXPLORATION" title="Where Will Your Zanzibar Journey Take You?" copy="Get to know the island’s distinct corners before choosing your route. Each destination brings its own pace, scenery and experiences." cards={zanzibarPlaces} variant="zanzibar" />
      <ZanzibarOceanActivities />
      <ZanzibarIslandIntro />
      <StaySelector eyebrow="FEATURED ZANZIBAR ACCOMMODATION" title="Find your island stay" copy="Compare real Zanzibar properties across comfort levels. Final beach, room type and availability are confirmed in your tailored quote." items={zanzibarStayChoices} />
      <Seasons eyebrow="PLAN AROUND THE SEASONS" title="Best time to visit Zanzibar." items={[["JAN — FEB","Warm island days","Warm with beach time between showers. Sea conditions and visibility vary."],["MAR — MAY","Longer rains","More frequent rain. Flexible plans needed for beach and boat days."],["JUN — OCT","Often drier","Less humid, a popular period. Wind and tides affect water activities."],["NOV — DEC","Shorter rains","Showers with sunny intervals. Holiday periods can bring more demand."]]} imageSrc={image("figma-zanzibar-hero.png")} />
      <ImageCards className="ref-zanzibar-combinations" eyebrow="A DIFFERENT KIND OF FINISH" title="Combine Zanzibar with Tanzania." copy="Choose the contrasts you want, then build in realistic travel and recovery time. Connections and park selection to confirm." cards={[{note:"SAFARI",title:"Wildlife, and nature",copy:"Park choices and onward connections tailored around your dates.",image:image("figma-zanzibar-combine-frame.png"),href:"/safari"},{note:"KILIMANJARO",title:"Summit, the roof of Africa",copy:"Space to rest after the climb. The island at your own pace.",image:image("figma-zanzibar-combine-frame1.png"),href:"/kilimanjaro"},{title:"Zanzibar island",copy:"One journey across the full range of Tanzania. Sequence to confirm.",image:image("figma-zanzibar-combine-frame2.png") }]} />
      <Testimonials /><ZanzibarFaq /><CtaBanner title="Ready to explore Zanzibar?" image={image("figma-zanzibar-hero.png")} /></main><Footer /></>;
}

const kilimanjaroRoutes: Card[] = [
  { title: "Machame Route", copy: "A scenic southern approach, camping beneath big skies and crossing dramatic ridges.", note: "7 trekking days · 56.7 km", image: image("drive-library/machame-hero.webp"), href: "/kilimanjaro/machame-route" },
  { title: "Lemosho Route", copy: "A quieter western start through forest, opening onto the broad Shira Plateau.", note: "8 trekking days · 64.7 km", image: image("drive-library/lemosho-hero.webp"), href: "/kilimanjaro/lemosho-route" },
  { title: "Marangu Route", copy: "The hut-based trail, with a direct approach and the same route for the descent.", note: "6 trekking days · 66.9 km", image: image("drive-library/marangu-hero.webp"), href: "/kilimanjaro/marangu-route" },
  { title: "Rongai Route", copy: "Approach from the north, with a gentler early gradient and quieter trails.", note: "7 trekking days · 68 km", image: image("drive-library/rongai-hero.webp"), href: "/kilimanjaro/rongai-route" },
  { title: "Northern Circuit", copy: "A longer journey around the mountain’s northern slopes, with time to settle into the pace.", note: "9 trekking days · approx. 97 km", image: image("drive-library/northern-circuit-hero.webp"), href: "/kilimanjaro/northern-circuit" },
  { title: "Umbwe Route", copy: "A steep, direct start for experienced trekkers; discuss acclimatization carefully.", note: "6 trekking days · 46.3 km", image: image("drive-library/umbwe-hero.webp"), href: "/kilimanjaro/umbwe-route" },
];

const routeFallbackFacts: Record<KilimanjaroRouteSlug, { days: string; difficulty: string; difficultyLevel: number; distanceKm: number; startingPrice: string; approximateDistance?: boolean }> = {
  machame: { days: "7", difficulty: "Hard", difficultyLevel: 4, distanceKm: 56.7, startingPrice: "$2,399" },
  lemosho: { days: "8", difficulty: "Moderate–hard", difficultyLevel: 3, distanceKm: 64.7, startingPrice: "$2,499" },
  marangu: { days: "6", difficulty: "Moderate–hard", difficultyLevel: 3, distanceKm: 66.9, startingPrice: "$2,050" },
  rongai: { days: "7", difficulty: "Moderate–hard", difficultyLevel: 3, distanceKm: 68, startingPrice: "$2,534" },
  "northern-circuit": { days: "9", difficulty: "Challenging", difficultyLevel: 4, distanceKm: 97, startingPrice: "$3,265", approximateDistance: true },
  umbwe: { days: "6", difficulty: "Very hard", difficultyLevel: 5, distanceKm: 46.3, startingPrice: "$2,317" },
};

const kilimanjaroPriceNote = "All starting prices are USD per person and exclude hotel accommodation. Pre- or post-trip hotel stays can be arranged on request at an additional cost.";

function routeDistanceLabel(distanceKm: number, approximate = false) {
  return `${approximate ? "Approx. " : ""}${distanceKm} km gate to gate`;
}

const routeTripSlugs: Array<[KilimanjaroRouteSlug, string]> = [
  ["machame", "Machame Route"],
  ["lemosho", "Lemosho Route"],
  ["marangu", "Marangu Route"],
  ["rongai", "Rongai Route"],
  ["northern-circuit", "Northern Circuit"],
  ["umbwe", "Umbwe Route"],
];

export function KilimanjaroReferencePage({ routeTrips }: { routeTrips: Partial<Record<KilimanjaroRouteSlug, CmsKilimanjaroRouteTrip>> }) {
  const routeCards = kilimanjaroRoutes.map((card, index) => {
    const route = routeTripSlugs[index][0];
    const trip = routeTrips[route];
    const facts = routeFallbackFacts[route];
    const distance = trip?.routeDistanceKm ?? facts.distanceKm;
    return { ...card, note: trip ? `${trip.trekkingDays} trekking days · ${distance} km` : card.note, price: trip?.startingPrice || facts.startingPrice };
  });
  return <><ReferenceHero imageSrc={image("drive-library/lemosho-hero.webp")} eyebrow="TANZANIA • THE ROOF OF AFRICA" title="Climb Mount Kilimanjaro" copy="Reach the Roof of Africa with experienced local guides, carefully planned routes and a team that knows the mountain from the ground up." action="Plan My Climb" secondAction="Explore Routes" active="Kilimanjaro" navVariant="classic" heroClass="ref-hero-kilimanjaro" trustItems={["Local Tanzanian guides", "Safety-focused", "Personal support", "Small groups"]} />
    <main><section className="ref-section ref-kili-intro"><div className="shell ref-intro-split"><div><Intro eyebrow="THE MOUNTAIN, AND EVERYTHING BETWEEN" title="More Than a Summit" copy="Kilimanjaro is a journey through worlds. Walk beneath a rainforest canopy, emerge into open moorland and cross the quiet, rocky alpine desert before reaching the Arctic summit." /><p>With Bathiel Expeditions, the climb begins with a conversation about you: your time, your experience and the kind of mountain journey you want.</p><p className="ref-kili-accent">One mountain. A different landscape every day.</p></div><Photo src={image("figma-kili-intro-climbers-above-the-clouds.png")} alt="Climbers above the clouds on Kilimanjaro" /></div><div className="shell ref-kili-facts">{[["figma-kili-fact-mountain.svg","5,895 m","Above sea level"],["figma-kili-fact-layers.svg","5 ecological zones","From forest to ice"],["figma-kili-fact-map.svg","6+ climbing routes","Find your own path"],["figma-kili-fact-star.svg","1 unforgettable experience","More than the summit"]].map(([icon,title,copy])=><div key={title}><span><Image src={image(icon)} alt="" width={24} height={24} /></span><div><b>{title}</b><small>{copy}</small></div></div>)}</div></section>
      <WhyGrid title="Why Climb Kilimanjaro With Us?" imageSrc={image("figma-kili-why-image2.png")} className="ref-kili-why-grid" items={[["Small Groups","Space to find your rhythm. Confirm group size for your departure."],["Personal Support","Real people to help with route choices, preparation and travel plans."],["Quality Equipment","Ask us for the current mountain equipment list and what to bring."],["Experienced Local Guides","Local knowledge, mountain experience and a warm Tanzanian welcome."],["Safety First","A thoughtful pace and clear conversations about your wellbeing."],["High Summit Success","Verified summit-success rate: rate pending verification. No summit is guaranteed."]]} />
      <PlaceGrid eyebrow="SIX WAYS TO THE ROOF OF AFRICA" title="Which Kilimanjaro Route Is Right For You?" copy="Explore the routes, then compare the current trekking-day durations, distances and starting rates." cards={routeCards} variant="kilimanjaro" />
      <section className="ref-section ref-comparison"><div className="shell"><Intro eyebrow="ROUTE FACTS" title="Compare Kilimanjaro Routes" copy="Compare route difficulty, trekking-day duration, distance and starting price. Arrival and departure days are excluded; distances are gate to gate and include the descent." /><div className="ref-table-wrap"><table><thead><tr><th>Route</th><th>Difficulty</th><th>Trekking days</th><th>Route distance</th><th>Starting price</th></tr></thead><tbody>{routeTripSlugs.map(([slug, label])=>{const trip=routeTrips[slug];const facts=routeFallbackFacts[slug];return <tr key={slug}><th>{label}</th><td><span className="ref-difficulty"><span>{facts.difficulty}</span><span aria-hidden="true">{Array.from({length:5},(_,index)=><i key={index} className={index<facts.difficultyLevel?"active":""} />)}</span></span></td><td>{trip ? `${trip.trekkingDays} days` : `${facts.days} days`}</td><td>{routeDistanceLabel(trip?.routeDistanceKm ?? facts.distanceKm, Boolean(!trip?.routeDistanceKm && facts.approximateDistance))}</td><td>{trip?.startingPrice || facts.startingPrice}</td></tr>;})}</tbody></table><p className="route-callout">{kilimanjaroPriceNote}</p></div></div></section>
      <section className="ref-section ref-dark ref-kili-journey"><div className="shell"><Intro eyebrow="RAINFOREST → MOORLAND → ALPINE DESERT → SUMMIT → DESCENT" title="What the Journey Looks Like" copy="Not just an ascent. A remarkable passage through changing landscapes, one step at a time." /><div className="ref-journey">{[["01 / RAINFOREST","The world turns green.","The trail begins in the forest: damp earth, moss and tall trees. Slow down and let the mountain set the pace.","drive-library/machame-rainforest.webp"],["02 / MOORLAND","Step into the open.","Heather gives way to wide horizons and giant groundsels. The summit feels closer, but the days remain unhurried.","drive-library/lemosho-moorland.webp"],["03 / ALPINE DESERT","A quieter kind of wilderness.","Vegetation thins, the air cools and volcanic rock stretches toward the sky. Every step becomes a little more deliberate.","drive-library/umbwe-alpine.webp"],["04 / SUMMIT • 5,895 M","A summit you carry home.","The final ascent is cold, slow and demanding. At Uhuru Peak, the African continent unfolds below the clouds.","drive-library/marangu-summit.webp"],["05 / DESCENT","Back through the worlds you crossed.","Return to warmer air and greener trails. There is time to rest, share stories and appreciate the whole journey.","drive-library/marangu-trail.webp"]].map(([step,title,copy,src],index)=><article key={step}><Photo src={image(src)} alt={title} /><div><small>{step}</small>{index === 3 ? <div className="ref-journey-summit-title"><Image src={image("figma-kili-journey-summit-mountain.svg")} alt="" width={53} height={45} /><h3>{title}</h3></div> : <h3>{title}</h3>}<p>{copy}</p></div></article>)}</div></div></section>
      <section className="ref-section ref-kili-styles"><div className="shell"><div className="ref-kili-style-intro"><h2>Choose your travel style</h2><p>Whether you want to meet new people, travel privately with your people, or explore Tanzania independently, choose the safari style that fits your journey.</p></div><KilimanjaroStyleCards /></div></section>
      <section className="ref-section ref-life-section"><div className="shell"><Intro eyebrow="BEFORE YOU LACE UP YOUR BOOTS" title="What Is Climbing Kilimanjaro Really Like?" copy="A practical picture of the experience, from preparing at home to your last day on the trail." /><div className="ref-fact-grid ref-life-grid">{[["Training & Preparation","Build walking endurance on hills, practise with your daypack and wear in your boots. Leave time to prepare."],["Arrival in Tanzania","Allow time for arrival, rest and a briefing. Confirm your transfers, accommodation and equipment check with us."],["First Days on the Mountain","Expect steady walking, changing weather and a slower pace than at home. Settle into life on the trail."],["Altitude & Acclimatization","More time can help you adapt, but altitude affects everyone differently. Tell your guide how you feel."],["Summit Night","Often a pre-dawn start, with cold temperatures and a long climb. Take it step by step; turning back is always valid."],["Descent & Celebration","The descent takes effort too. Rest afterwards and celebrate the journey, whether or not you reached the summit."]].map(([title,copy],i)=><article key={title}><small>{String(i+1).padStart(2,"0")}</small><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>
      <Safety />
      <section className="ref-section"><div className="shell"><Intro eyebrow="SCHEDULED DEPARTURES" title="Prefer to join a group?" copy="See the actual upcoming group departures and route details."/><PrimaryLink href="/groups">View group departures</PrimaryLink></div></section>
      <Testimonials /><FaqPreview variant="kilimanjaro" title="Kilimanjaro Frequently Asked Questions" items={[["How difficult is Kilimanjaro?","Kilimanjaro is a demanding high-altitude trek, not a technical climb on the usual trekking routes. Long walking days, cold weather and thinner air make it challenging, even for fit walkers. Prepare with regular hikes, choose an itinerary with time to acclimatize and tell your guide promptly if you feel unwell. Reaching the summit is never guaranteed."],...["Which route is best for beginners?","How many days should I spend on Kilimanjaro?","What is the best time to climb?","What should I pack?","What happens if I struggle with altitude?","How fit do I need to be?","Can I climb Kilimanjaro without previous mountain experience?","How much does it cost?","What happens after I reach the summit?"].map(q=>[q,"Discuss the details of your climb with the Bathiel team before booking."])]} /><CtaBanner title="Ready to Climb Kilimanjaro?" image={image("figma-kili-group-trip-landscape3.png")} /></main><Footer /></>;
}

type RouteDay = [title: string, location: string, copy: string, context?: string];

const routeItineraryImages: Record<KilimanjaroRouteSlug, string[]> = {
  machame: ["drive-library/machame-rainforest.webp", "drive-library/machame-hero.webp", "drive-library/machame-barranco.webp", "drive-library/machame-barranco.webp", "drive-library/machame-camp.webp", "drive-library/rongai-summit.webp", "drive-library/machame-rainforest.webp"],
  lemosho: ["drive-library/lemosho-hero.webp", "drive-library/lemosho-moorland.webp", "drive-library/lemosho-shira-plateau.webp", "drive-library/lemosho-barranco.webp", "drive-library/lemosho-barranco.webp", "drive-library/umbwe-camp.webp", "drive-library/rongai-summit.webp", "drive-library/marangu-rainforest.webp"],
  marangu: ["drive-library/marangu-rainforest.webp", "drive-library/marangu-trail.webp", "drive-library/marangu-huts.webp", "drive-library/marangu-trail.webp", "drive-library/marangu-summit.webp", "drive-library/marangu-rainforest.webp"],
  rongai: ["drive-library/rongai-trail.webp", "drive-library/rongai-camp.webp", "drive-library/rongai-hero.webp", "drive-library/rongai-trail.webp", "drive-library/rongai-camp.webp", "drive-library/rongai-summit.webp", "drive-library/marangu-rainforest.webp"],
  "northern-circuit": ["drive-library/northern-circuit-rainforest.webp", "drive-library/lemosho-shira-plateau.webp", "drive-library/northern-circuit-trail.webp", "drive-library/lemosho-moorland.webp", "drive-library/umbwe-alpine.webp", "drive-library/northern-circuit-hero.webp", "drive-library/umbwe-camp.webp", "drive-library/marangu-summit.webp", "drive-library/marangu-trail.webp"],
  umbwe: ["drive-library/umbwe-rainforest.webp", "drive-library/umbwe-trail.webp", "drive-library/umbwe-camp.webp", "drive-library/umbwe-alpine.webp", "drive-library/umbwe-camp.webp", "drive-library/marangu-summit.webp", "drive-library/marangu-trail.webp"],
};

const machameFallbackItinerary: RouteDay[] = [
  ["Into the rainforest", "Machame Gate → Machame Camp", "After registration and a briefing at Machame Gate, enter Kilimanjaro’s humid montane forest. The trail climbs steadily beneath a dense canopy, giving the group time to settle into a comfortable walking rhythm before the first night at camp.", "Expect damp ground, exposed roots and changing weather in the forest. Keep rain protection accessible, walk slowly from the beginning and tell your guide early if boots, clothing or your daypack need adjusting."],
  ["Climb onto the Shira Plateau", "Machame Camp → Shira 2 Camp", "Leave the forest behind as the vegetation opens into heath and moorland. A sustained ascent over rocky ridges leads toward the Shira Plateau, where clear conditions can reveal broad views across the western side of Kilimanjaro.", "The air becomes cooler and drier as elevation increases. The day is about maintaining an unhurried pace, drinking regularly and allowing your body to adapt rather than trying to walk quickly."],
  ["Acclimatize via Lava Tower", "Shira 2 → Lava Tower → Barranco", "Trek into the alpine desert toward Lava Tower before descending into the sheltered Barranco Valley. This higher daytime point followed by a lower sleeping camp is an important part of the route’s acclimatization profile.", "This can feel like the first serious altitude day even though the night ends lower. Eat and drink consistently, protect yourself from sun and wind, and be open with the guide about headaches, nausea or unusual fatigue."],
  ["Cross the Barranco Wall", "Barranco Camp → Karanga Camp", "Begin with the Barranco Wall, using hands for balance in a few places while guides manage the group through the standard trekking line. From the top, continue across ridges and valleys beneath Kilimanjaro’s southern glaciers toward Karanga Camp.", "The wall is dramatic but is not a technical rock climb on the normal route. The shorter overall day leaves time to recover, take in the southern views and prepare for the move to high camp."],
  ["Prepare at high camp", "Karanga Camp → Barafu Camp", "Climb through sparse alpine desert to Barafu, the high camp used for the summit attempt. On arrival, the mountain team explains the night plan while you organize warm layers, headlamp, water and the equipment needed for the climb.", "Rest is more important than sleep at this altitude. Eat the meal offered, keep warm and follow the guide’s instructions about timing, hydration and what to carry."],
  ["Summit attempt and descent", "Barafu → Uhuru Peak → Mweka Camp", "Set out in darkness and climb slowly toward Stella Point on the crater rim, then continue toward Uhuru Peak when conditions and wellbeing allow. After the summit attempt, descend past Barafu and continue to the lower, greener Mweka Camp.", "This is the longest and coldest day of the itinerary. Reaching the summit is never guaranteed; guides monitor the weather, pace and each trekker’s condition, and turning back can be the safest decision."],
  ["Return through the forest", "Mweka Camp → Mweka Gate", "Complete the descent through heath and rainforest to Mweka Gate. After park formalities and the farewell to the mountain crew, meet the onward transfer for the journey back to Moshi or Arusha.", "The lower trail can be muddy and demanding on tired knees, so continue using a controlled pace. The day closes the mountain itinerary; any hotel stay, airport transfer or onward safari is confirmed separately in the final proposal."],
];

const machameOverview = [
  "The Machame Route is a scenic camping approach on Kilimanjaro’s south-western side. It begins in montane rainforest, climbs onto the Shira Plateau and follows the mountain’s southern circuit through Lava Tower, Barranco and Karanga before reaching Barafu high camp.",
  "Its changing landscapes and climb-high, sleep-lower sections make Machame a popular choice for active trekkers who want a varied mountain journey. The route still involves consecutive hiking days, exposed high-altitude terrain and a long summit attempt, so good preparation and a deliberately slow pace are essential.",
];

function RouteTripItinerary({ trip, routeName, imageSrc, fallbackDays = [], fallbackImages = [], fallbackStay = "Mountain camping", fallbackNote }: { trip: CmsKilimanjaroRouteTrip | null; routeName: string; imageSrc: string; fallbackDays?: RouteDay[]; fallbackImages?: string[]; fallbackStay?: string; fallbackNote?: string }) {
  const trekkingDays = trip?.itinerary.filter((day) => day.dayType === "trekking") || [];
  const publishedDays = trekkingDays.length
    ? trekkingDays
    : trip?.itinerary.filter((day) => !/arrival|departure|recovery|briefing/i.test(day.title)) || [];
  const displayedDays = publishedDays.length ? publishedDays : fallbackDays.map(([title, location, copy], index) => ({
    key: `route-outline-day-${index + 1}`,
    title,
    summary: location,
    experience: copy,
    mealPlan: "Mountain meals — confirm in quote",
    dayType: "trekking" as const,
    accommodations: [fallbackStay],
    image: fallbackImages[index] ? {src: image(fallbackImages[index]), alt: `${routeName} — ${title}`} : null,
  }));
  const hasPublishedTrip = publishedDays.length > 0;
  return <section className="route-itinerary" id="itinerary"><div className="shell route-itinerary-grid">
    <aside>
      <Intro
        eyebrow={hasPublishedTrip ? `PUBLISHED TRIP · ${trip?.trekkingDays} TREKKING DAYS` : `ROUTE OUTLINE · ${fallbackDays.length} TREKKING DAYS`}
        title={`${routeName} Itinerary`}
        copy={hasPublishedTrip ? `The mountain itinerary below is taken from ${trip?.title}. Arrival and departure days are not counted as trekking days.` : `This complete day-by-day route outline counts trekking days only. Exact camps, timings and package services are confirmed for your departure.`}
      />
      {hasPublishedTrip && trip ? <>
        {trip.startingPrice && <p className="route-callout">Starting from {trip.startingPrice} USD per person. Hotel accommodation is excluded and can be arranged on request at an additional cost.</p>}
        {!!trip.destinations.length && <div className="route-callout"><b>Places on this trip</b><p>{trip.destinations.join(" · ")}</p></div>}
      </> : <div className="route-callout"><b>Planning note</b><p>{fallbackNote || "This route outline is ready for planning. Confirm the final camp sequence, meals, services and price in your written proposal."}</p></div>}
      <Photo src={image(imageSrc)} alt={`${routeName} landscape`} />
    </aside>
    <div className="route-days">
      {displayedDays.length ? displayedDays.map((day, index) => {
        const routeContext = fallbackDays[index]?.[3];
        return <article key={day.key}>
        <span className="route-day-number">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <small>DAY {index + 1}</small>
          <h3>{day.title}</h3>
          {day.summary && <p className="route-day-location">{day.summary}</p>}
          {day.experience && <p>{day.experience}</p>}
          {routeContext && <p>{routeContext}</p>}
          {(day.mealPlan || day.accommodations.length > 0) && <div className="route-day-facts">
            {day.mealPlan && <span>Meals: {day.mealPlan}</span>}
            {day.accommodations.length > 0 && <span>Stay: {day.accommodations.join(" / ")}</span>}
          </div>}
          {day.image && <Photo src={day.image.src} alt={day.image.alt || `${routeName}, day ${index + 1}`} />}
        </div>
      </article>;
      }) : null}
    </div>
  </div></section>;
}

export function MachameReferencePage({ trip }: { trip: CmsKilimanjaroRouteTrip | null }) {
  const routeFacts = routeFallbackFacts.machame;
  const distanceKm = trip?.routeDistanceKm ?? routeFacts.distanceKm;
  const packing = [
    ["figma-machame-packing-clothing.svg","Clothing","Layers, warm insulation and weather protection."],
    ["figma-machame-packing-footwear.svg","Footwear","Broken-in hiking boots and suitable socks."],
    ["figma-machame-packing-sleeping.svg","Sleeping","Check the sleeping bag and mat requirements."],
    ["figma-machame-packing-personal.svg","Personal Items","Sun protection, toiletries and personal medication."],
    ["figma-machame-packing-documents.svg","Documents","Travel documents, insurance and any required permits."],
    ["figma-machame-packing-camera.svg","Optional Gear","Discuss poles, a camera and other useful extras."],
  ];
  const machameFaq = [
    ["Is there a Machame itinerary?", trip ? `Yes. The current Sanity trip is ${trip.title}, with ${trip.trekkingDays} trekking days.` : "Yes. The page shows the complete standard seven-day Machame route outline. Confirm the final dates, camps and package services in your written proposal."],
    ["What is included in the package?", "Package inclusions depend on the dates and proposal. Ask for a written quote showing inclusions and exclusions."],
    ["How much does it cost?", `The seven-day Machame Route starts from ${trip?.startingPrice || routeFacts.startingPrice} USD per person. Hotel accommodation is excluded; ask the team to arrange a pre- or post-trip stay if you need one.`],
  ];
  return <><ReferenceHero imageSrc={image("drive-library/machame-hero.webp")} eyebrow="KILIMANJARO ROUTE" title="Machame Route" lead="A scenic southern approach through five mountain environments." copy="Follow the Machame trail through rainforest, across the Shira Plateau and around the southern circuit toward Kilimanjaro’s summit." action="Plan This Climb" secondAction="View Itinerary" secondActionHref="#itinerary" active="Home" navVariant="classic" routeFacts={[trip ? `${trip.trekkingDays} trekking days` : `${routeFacts.days} trekking days`, routeDistanceLabel(distanceKm), `From ${trip?.startingPrice || routeFacts.startingPrice}`]} />
    <main className="route-detail-page"><section className="route-overview"><div className="shell route-overview-grid"><Photo src={image("drive-library/machame-barranco.webp")} alt="Trekkers among giant groundsels on the Machame Route" /><div><Intro eyebrow={trip ? "PUBLISHED SANITY TRIP" : "ROUTE OVERVIEW"} title={trip ? trip.title : "Machame Route Overview"} /><div className="route-overview-copy">{machameOverview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="route-callout">{kilimanjaroPriceNote}</p>{trip && <p className="route-callout">This page follows the published {trip.title} package. Its displayed duration counts {trip.trekkingDays} trekking days; arrival and departure are excluded.</p>}</div><dl className="route-facts">{[["Trekking duration",trip ? `${trip.trekkingDays} days` : `${routeFacts.days} days`],["Route distance",routeDistanceLabel(distanceKm)],["Starting price",trip?.startingPrice || routeFacts.startingPrice],["Trip focus",trip?.itineraryFor || "Machame Route"]].map(([term,value])=><div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></div></div></section>
      <RouteTripItinerary trip={trip} routeName="Machame Route" imageSrc="drive-library/machame-camp.webp" fallbackDays={machameFallbackItinerary} fallbackImages={routeItineraryImages.machame} fallbackNote="This is the standard seven-day Machame outline. A six-day variation combines part of the schedule; confirm the exact plan and package services in your quote." />
      <RouteEnvironments />
      <section className="route-inclusions"><div className="shell"><Intro eyebrow="YOUR CLIMB, TAKEN CARE OF" title="What’s Included in Your Climb" copy="Use this package checklist when planning your enquiry. Hotel accommodation is separate from the climbing rate and can be added on request." /><div className="route-inclusion-stack">{[["01","PREPARATION","Before the climb","The arrangements around your journey.",[["figma-trips-inclusion-route.svg","Transfers","Pickup points and included transfers are still to confirm."],["figma-trips-inclusion-tent.svg","Accommodation","Mountain stays are confirmed in your quote. Add a pre- or post-climb hotel only if you need one."]]],["02","CLIMB & CAMP","On the mountain","Your team and everyday trail essentials.",[["figma-trips-inclusion-mountain.svg","Mountain","Climb services and camp setup details are still to confirm."],["figma-trips-inclusion-utensils.svg","Food","Meal plan, drinking water and dietary needs are still to confirm."],["figma-kili-value-users.svg","Guides & Crew","Guide and mountain crew arrangements are still to confirm."],["figma-trips-inclusion-ticket.svg","Park Fees","Park, camping and other fee coverage is still to confirm."]]],["03","ONGOING CARE","Support & safety","Discuss the plan before you commit.",[["figma-kili-value-shield.svg","Safety","Monitoring, emergency procedures and equipment are still to confirm."]]]].map(([num,label,title,copy,items])=><article key={String(num)}><header><small>{String(num)} / {String(label)}</small><h3>{String(title)}</h3><p>{String(copy)}</p></header><div>{(items as string[][]).map(([icon,itemTitle,itemCopy])=><section key={itemTitle}><Image src={image(icon)} alt="" width={28} height={28}/><div><h4>{itemTitle}</h4><p>{itemCopy}</p></div></section>)}</div></article>)}</div></div></section>
      <section className="route-summit"><div className="shell"><div><Intro eyebrow="THE MOUNTAIN’S MOST DEMANDING MOMENT" title="Summit Night" /><h3>Slow steps. Cold air. The possibility of sunrise above the clouds.</h3><p>A summit attempt usually means an early start in darkness, very cold temperatures and a slow, steady ascent. The aim is to reach Uhuru Peak, with sunrise a memorable part of the high-mountain experience when conditions allow.</p><p>Reaching the top is never guaranteed. Guides assess conditions and your ability along the way; turning around may be the right decision. A long descent follows any summit attempt.</p><PrimaryLink>Plan your climb</PrimaryLink></div></div></section>
      <section className="route-packing"><div className="shell"><Intro eyebrow="PREPARE FOR CHANGING CONDITIONS" title="What Should You Bring?" copy="Pack for a progression from forest trails to a cold, exposed summit environment." /><div className="route-packing-grid"><Photo src={image("drive-library/machame-rainforest.webp")} alt="Trekkers carrying mountain equipment through the Machame rainforest" /><div>{packing.map(([icon,title,copy])=><article key={title}><Image src={image(icon)} alt="" width={28} height={28}/><h3>{title}</h3><p>{copy}</p></article>)}<PrimaryLink>Ask for a packing list</PrimaryLink></div></div></div></section>
      <Safety />
      <section className="route-fit"><div className="shell"><Intro eyebrow="CHOOSE THE CLIMB THAT FITS YOU" title="Is This Route Right For You?" copy="Machame is a rewarding option for people who enjoy the journey and are willing to prepare for a serious mountain challenge." /><div className="route-fit-columns"><article><h3>Good for</h3>{[["figma-machame-fit-hiker.svg","Experienced hikers"],["figma-machame-fit-active.svg","Active travelers"],["figma-machame-fit-scenic.svg","Travelers wanting scenic landscapes"],["figma-machame-fit-long-days.svg","People comfortable with longer hiking days"]].map(([icon,text])=><p key={text}><Image src={image(icon)} alt="" width={24} height={24}/>{text}</p>)}</article><article><h3>Consider carefully</h3>{[["figma-machame-fit-altitude.svg","Altitude","Fitness alone does not predict how you will feel at altitude."],["figma-machame-fit-summit.svg","Long summit day","Expect a demanding combination of ascent and descent."],["figma-machame-fit-weather.svg","Weather","Be prepared for cold, wind, rain and changing conditions."],["figma-machame-fit-endurance.svg","Physical demands","Build endurance and practice sustained hiking before travel."]].map(([icon,title,copy])=><p key={title}><Image src={image(icon)} alt="" width={24} height={24}/><span><b>{title}</b><small>{copy}</small></span></p>)}</article></div><div className="route-fit-cta"><div><h3>Not sure which route is right for you?</h3><p>Compare the journey, pace and landscape before choosing.</p></div><PrimaryLink href="/kilimanjaro">Compare All Routes</PrimaryLink></div></div></section>
      <Testimonials /><ImageCards eyebrow="COMPARE YOUR OPTIONS" title="Compare other routes" cards={kilimanjaroRoutes.slice(0,4)} /><section className="route-faq"><div className="shell"><Intro eyebrow="BEFORE YOU CHOOSE YOUR CLIMB" title="Machame Route Frequently Asked Questions" copy="Answers based on what is currently published; confirm package-specific details with the team."/><Accordion items={machameFaq} openCount={2}/></div></section><CtaBanner title="Ready to climb Machame?" image={image("figma-kili-group-trip-landscape3.png")} /></main><Footer /></>;
}

export type KilimanjaroRouteSlug = "machame" | "lemosho" | "marangu" | "rongai" | "northern-circuit" | "umbwe";

type KilimanjaroRouteDetail = {
  name: string;
  shortName: string;
  heroImage: string;
  overviewImage: string;
  itineraryImage: string;
  mapImage: string;
  distanceKm: number;
  approximateDistance?: boolean;
  duration: string;
  days: number;
  difficulty: string;
  scenery: string;
  startingPrice?: string;
  lead: string;
  heroCopy: string;
  overview: [string, string];
  bestFor: string;
  startingPoint: string;
  accommodation: string;
  benefits: [string, string][];
  mapSteps: string[];
  itineraryNote: string;
  fitCopy: string;
  fitGoodFor: string[];
  itinerary: RouteDay[];
};

const routeDetailData: Record<Exclude<KilimanjaroRouteSlug, "machame">, KilimanjaroRouteDetail> = {
  lemosho: {
    name: "Lemosho Route", shortName: "Lemosho", heroImage: "drive-library/lemosho-hero.webp", overviewImage: "drive-library/lemosho-shira-plateau.webp", itineraryImage: "drive-library/lemosho-barranco.webp", mapImage: "figma-home-map.png", distanceKm: 64.7, duration: "8 Days", days: 8, difficulty: "Challenging", scenery: "Exceptional", lead: "A quiet western approach with room to find your rhythm.",
    heroCopy: "Begin in remote rainforest, cross the broad Shira Plateau and follow a beautifully varied line toward Kilimanjaro’s summit.",
    overview: ["The Lemosho Route begins on Kilimanjaro’s quieter western side, entering remote rainforest before opening onto the broad Shira Plateau. The approach gives trekkers a gradual introduction to the mountain and a memorable progression through forest, heath and high volcanic landscapes.", "After crossing Shira, the route joins the southern circuit around Lava Tower, Barranco and Karanga before the Barafu summit approach and Mweka descent. Seven- and eight-day versions are available; the longer schedule creates more time for acclimatization, although altitude remains a serious challenge for every climber."],
    bestFor: "Scenery and a longer approach", startingPoint: "Lemosho trailhead", accommodation: "Camping route",
    benefits: [["Quiet western start","Begin away from the busiest approaches, surrounded by forest and open mountain country."],["Time on the mountain","Seven- and eight-day plans offer a more gradual journey. Altitude response still varies."],["Shira Plateau","Cross one of Kilimanjaro’s most memorable landscapes with wide views in clear weather."],["Varied scenery","Move through rainforest, heath, alpine desert and the high summit environment."]],
    mapSteps: ["Enter through the western rainforest","Cross Shira and pass Moir Hut","Join the southern circuit toward Barafu","Summit at Uhuru Peak and descend via Mweka"],
    itineraryNote: "A 7-day alternative is available to discuss. Final camps, distances and daily measurements are confirmed during planning.",
    fitCopy: "Lemosho suits travelers who want a longer, scenic approach and are ready to prepare for consecutive high-altitude hiking days.",
    fitGoodFor: ["Travelers who value scenery","Trekkers wanting a longer approach","Active first-time altitude hikers","People comfortable with camping"],
    itinerary: [["Into the western rainforest","Londorossi Gate → Mti Mkubwa","After registration at Londorossi Gate, continue to the Lemosho trailhead and begin beneath Kilimanjaro’s rainforest canopy. The path climbs steadily to Mti Mkubwa, also known as Big Tree Camp, for the first night on the mountain.","The forest may be wet and muddy, so rain protection and careful footing matter. Use this opening day to adjust equipment and establish the slow, consistent pace needed higher on the route."],["Toward the Shira Plateau","Mti Mkubwa → Shira 1","Climb out of the forest as tall trees give way to heath and moorland. The trail rises onto the western edge of the Shira Plateau, bringing broader views of Kibo when cloud and weather allow.","The increase in altitude becomes more noticeable today. Drink regularly, protect yourself from sun and wind, and avoid using the open terrain as a reason to walk too quickly."],["Across Shira","Shira 1 → Shira 2","Cross the open plateau through high-altitude heath and volcanic scenery toward Shira 2 Camp. The measured distance allows time to settle into the rhythm of camp life and the thinner mountain air.","Guides may include a gentle acclimatization walk depending on the final plan and conditions. Rest, hydration and honest communication about how you feel are more important than speed."],["High ground and acclimatization","Shira 2 → Lava Tower → Barranco","Continue into the alpine desert and climb toward Lava Tower before descending into the Barranco Valley. Reaching a higher point during the day and sleeping lower is a deliberate part of this itinerary’s acclimatization profile.","Weather can change quickly in this exposed landscape. Keep warm and waterproof layers accessible, eat even if appetite is reduced and report any altitude symptoms to the guide."],["Around the southern flank","Barranco → Karanga","Climb the Barranco Wall on the standard trekking line, using hands for balance where needed, then cross a series of ridges and valleys beneath the southern glaciers. The day finishes at Karanga Camp.","The wall looks imposing but is not a technical climb on the usual route. A shorter afternoon provides useful recovery time before moving to the summit base."],["Prepare for the summit","Karanga → Barafu","Leave Karanga and ascend through sparse alpine desert to Barafu high camp. After arrival, prepare warm clothing, headlamp, water and personal equipment while the guide explains the summit-night schedule.","Rest is the priority, even if sleep is limited. Follow the crew’s guidance on eating, drinking and organizing only what is required for the overnight ascent."],["Summit attempt and descent","Barafu → Uhuru Peak → Mweka","Begin before dawn and climb slowly toward Stella Point on the crater rim, continuing to Uhuru Peak when conditions and wellbeing permit. After the summit attempt, descend past Barafu and continue to Mweka Camp.","This is the coldest and longest day of the trek. The guide may turn a climber around for safety, and reaching the summit is never guaranteed; the descent also requires concentration and energy."],["Return to the lower slopes","Mweka → Mweka Gate","Descend from the heath into warmer rainforest and continue to Mweka Gate for park formalities and the mountain-team farewell. Meet the transfer for the return to Moshi or Arusha.","The forest trail can be slippery after rain, so keep a controlled pace on tired legs. Post-climb accommodation and onward travel are confirmed in the final package proposal."]],
  },
  marangu: {
    name: "Marangu Route", shortName: "Marangu", heroImage: "drive-library/marangu-hero.webp", overviewImage: "drive-library/marangu-huts.webp", itineraryImage: "drive-library/marangu-rainforest.webp", mapImage: "route-map-marangu.png", distanceKm: 66.9, duration: "6 Days", days: 6, difficulty: "Challenging", scenery: "Classic", lead: "The classic hut-based route to the Roof of Africa.",
    heroCopy: "Follow Kilimanjaro’s historic south-eastern trail through forest, moorland and alpine desert, sleeping in mountain huts along the way.",
    overview: ["The Marangu Route follows Kilimanjaro’s historic south-eastern trail and is the only main route that uses shared mountain huts instead of tents. It moves from montane rainforest through open moorland and the alpine Saddle between Mawenzi and Kibo before the final approach to the crater rim.", "The ascent and descent share the same broad corridor, making Marangu direct but not easy. The six-day package includes an additional Horombo acclimatization day before Kibo Hut, giving the body more time to adjust than the five-day version while preserving the classic hut-based experience."],
    bestFor: "Trekkers who prefer mountain huts", startingPoint: "Marangu Gate", accommodation: "Shared mountain huts",
    benefits: [["Hut accommodation","Sleep in shared mountain huts rather than tents, with facilities varying by stop."],["Historic trail","Follow one of Kilimanjaro’s best-known routes through distinct ecological zones."],["Clear progression","Move through Mandara, Horombo and Kibo on a direct approach to the summit."],["Five- or six-day plans","Compare both options carefully; the extra day can support a more measured schedule."]],
    mapSteps: ["Begin at Marangu Gate","Stay at Mandara and Horombo huts","Approach the summit from Kibo Hut","Descend on the same route"],
    itineraryNote: "A 5-day alternative is available to discuss. The 6-day outline includes an additional acclimatization day; final arrangements are confirmed in your plan.",
    fitCopy: "Marangu may suit climbers who prefer huts and a direct trail, while still understanding that the pace, altitude and summit night are demanding.",
    fitGoodFor: ["Travelers who prefer huts","Trekkers wanting a direct route","People comfortable with shared facilities","Climbers considering a six-day plan"],
    itinerary: [["Forest to Mandara","Marangu Gate → Mandara Hut","After registration and meeting the mountain crew, begin on a broad trail through Kilimanjaro’s humid montane rainforest. The steady walk leads to Mandara Hut for the first night on the mountain.","The package describes roughly four to five hours of trekking through forest. Rain, mud and exposed roots are possible, so keep waterproofs accessible and establish a slow pace from the first climb."],["Into the moorland","Mandara Hut → Horombo Hut","Leave the forest and enter open heath and moorland, where clear weather may reveal Mawenzi and Kibo. The sustained ascent finishes at Horombo Hut, the route’s main acclimatization base.","This is a longer day with a significant gain in elevation. Drink regularly, protect yourself from sun and wind, and tell the guide how you feel as the air becomes thinner."],["Acclimatization at Horombo","Horombo Hut → Zebra Rocks or Mawenzi area → Horombo","Walk higher toward Zebra Rocks or the Mawenzi area, then return to Horombo for a second night at the same sleeping elevation. The outing helps prepare the body for the upper mountain without moving camp.","The day is part of the six-day package and is not an optional sightseeing stop. Move slowly, rest after the walk and use the time to review clothing and equipment before Kibo."],["Across the alpine saddle","Horombo Hut → Kibo Hut","Cross the broad Saddle between Mawenzi and Kibo as moorland gives way to stark alpine desert. Reach Kibo Hut, eat early and prepare for the summit attempt that begins during the night.","The exposed crossing can be cold, sunny and windy on the same day. Keep a steady pace and organize warm layers, headlamp, water and snacks before resting."],["Summit attempt and descent","Kibo Hut → Gillman’s Point → Uhuru Peak → Horombo Hut","Start shortly after midnight and climb slowly toward Gillman’s Point on the crater rim, continuing to Uhuru Peak when conditions and wellbeing allow. The return includes a long descent through Kibo to Horombo Hut.","The supplied package estimates a very long summit day. Reaching Uhuru Peak is never guaranteed; guides monitor altitude symptoms, weather and fatigue, and may decide that descending is the safest option."],["Back to Marangu Gate","Horombo Hut → Marangu Gate","Descend from moorland into rainforest and continue to Marangu Gate for park formalities and the crew farewell. Meet the transfer for the return to Moshi or Arusha.","The descent is long and can be hard on tired knees, particularly if the forest is wet. Hotel accommodation, airport transfers and any onward extension are confirmed in the written proposal."]],
  },
  rongai: {
    name: "Rongai Route", shortName: "Rongai", heroImage: "drive-library/rongai-hero.webp", overviewImage: "drive-library/rongai-trail.webp", itineraryImage: "drive-library/rongai-camp.webp", mapImage: "route-map-rongai.png", distanceKm: 68, duration: "7 Days", days: 7, difficulty: "Challenging", scenery: "Remote", lead: "A quieter northern approach beneath wide mountain skies.",
    heroCopy: "Approach Kilimanjaro near the Kenyan border, following a more remote trail before joining the eastern summit path.",
    overview: ["The Rongai Route approaches Kilimanjaro from the north, close to the Kenyan border, and begins in comparatively dry forest and open country. Its quieter early trails and gentler opening gradient give trekkers space to establish a steady rhythm away from the busier southern approaches.", "The itinerary grows more demanding as it crosses beneath Mawenzi and moves over the alpine Saddle toward Kibo Hut. After the summit attempt, the descent follows the Marangu corridor through moorland and rainforest, creating a north-to-south traverse with noticeably different landscapes."],
    bestFor: "Quieter trails and a northern approach", startingPoint: "Rongai Gate", accommodation: "Camping route",
    benefits: [["Quieter early trails","The northern start is often less busy than the popular southern approaches."],["Gentler opening gradient","Build a steady hiking rhythm during the first part of the route."],["Mawenzi views","Travel beneath Kilimanjaro’s dramatic eastern peak before turning toward Kibo."],["A traverse of the mountain","Ascend from the north and descend through the south-eastern Marangu corridor."]],
    mapSteps: ["Start near the Kenyan border","Climb via Simba and Kikelewa","Pass Mawenzi Tarn toward Kibo","Summit and descend via Marangu"],
    itineraryNote: "A 6-day alternative can be discussed. The 7-day outline allows a more measured approach; camps and timings are confirmed during planning.",
    fitCopy: "Rongai is a strong option for travelers drawn to quieter trails and a northern approach, with the fitness for a sustained summit journey.",
    fitGoodFor: ["Travelers seeking quieter trails","Trekkers who enjoy open landscapes","People wanting a north-to-south traverse","Active hikers ready for altitude"],
    itinerary: [["Begin on the northern slopes","Rongai Gate → Simba Camp","Travel to the northern trailhead near the Kenyan border, complete park formalities and begin through forest and open country. The gentler first stage leads to Simba Camp and an introduction to the quieter side of Kilimanjaro.","Use the opening day to check equipment and settle into the guide’s slow pace. Conditions on the northern side can feel drier, but water, sun protection and accessible rain layers remain important."],["Toward Second Cave","Simba Camp → Second Cave","Continue through heath and moorland with widening views across the northern plains and toward Kibo. The trail gains elevation steadily before reaching the Second Cave area.","The landscape feels open and remote, and wind or strong sun can increase exposure. Walk consistently rather than quickly and report even mild altitude symptoms to the guide."],["Across the remote north","Second Cave → Kikelewa Camp","Traverse the mountain’s quieter northern terrain as vegetation becomes lower and the scenery more rugged. The route bends toward Mawenzi, finishing near Kikelewa Camp.","This stage adds distance and elevation while the body is still adapting. Regular drinking, eating and an unhurried pace are essential parts of the acclimatization plan."],["Beneath Mawenzi","Kikelewa → Mawenzi Tarn","Climb beneath the dramatic ridges of Mawenzi to the tarn area, one of the route’s most distinctive camps. Depending on the final itinerary, the afternoon may include rest or a short acclimatization walk.","Temperatures drop quickly once the sun leaves the camp. Prepare warm layers early, keep the day gentle after arrival and use the time to recover before crossing the Saddle."],["To the summit base","Mawenzi Tarn → Kibo Hut","Cross the high alpine Saddle between Mawenzi and Kibo through exposed, sparsely vegetated terrain. Reach Kibo Hut, eat and organize equipment for the overnight summit attempt.","Wind, cold and altitude make this a serious transition day even where the ground looks gradual. Rest is the priority at Kibo; follow the guide’s instructions about timing, clothing and water."],["Summit attempt and descent","Kibo → Gillman’s Point → Uhuru Peak → Horombo","Set out in darkness and climb slowly toward the crater rim, continuing toward Uhuru Peak when conditions and wellbeing allow. After the summit attempt, descend through Kibo and continue to Horombo Hut.","This is the longest and most demanding stage. Summit success is never guaranteed, and guides may turn a climber around because of altitude, weather or fatigue before completing the long descent."],["Return through the forest","Horombo → Marangu Gate","Complete the north-to-south traverse by descending through moorland and rainforest to Marangu Gate. After park formalities and the mountain-team farewell, meet the onward transfer.","The lower path may be wet and slippery, so maintain a controlled pace on tired legs. Confirm the final hotel, transfer and any safari or Zanzibar extension in the package proposal."]],
  },
  "northern-circuit": {
    name: "Northern Circuit Route", shortName: "Northern Circuit", heroImage: "drive-library/northern-circuit-hero.webp", overviewImage: "drive-library/northern-circuit-trail.webp", itineraryImage: "drive-library/northern-circuit-rainforest.webp", mapImage: "route-map-northern-circuit.png", distanceKm: 97, approximateDistance: true, duration: "9 Days", days: 9, difficulty: "Challenging", scenery: "Panoramic", startingPrice: "$3,265", lead: "Kilimanjaro’s longest, most expansive route.",
    heroCopy: "Begin in the west, circle the mountain’s remote northern slopes and take time to experience Kilimanjaro from every angle.",
    overview: ["The Northern Circuit starts on the western Lemosho trail, crosses the Shira Plateau and then turns away from the busier southern paths to circle Kilimanjaro’s remote northern slopes. The changing views of Kibo, distant plains and high volcanic terrain make it the longest and most expansive of the commonly offered routes.", "The nine-day package provides a gradual journey through Mti Mkubwa, Shira, Moir, Buffalo, Third Cave and School Hut before the summit attempt. Extra time can create useful acclimatization opportunities, but the approximately 97-kilometre route still demands endurance, careful preparation and respect for altitude."],
    bestFor: "A long, remote and panoramic journey", startingPoint: "Lemosho trailhead", accommodation: "Camping route",
    benefits: [["The longest approach","Spend more time moving through Kilimanjaro’s changing landscapes."],["Remote northern slopes","Experience quieter country beyond the main southern trail network."],["Panoramic views","See the mountain from west, north and east as the route circles toward Kibo."],["A measured itinerary","The longer outline can support acclimatization, though no schedule guarantees it."]],
    mapSteps: ["Enter from Kilimanjaro’s western side","Circle the remote northern slopes","Turn toward School Hut and Kibo","Summit and descend through Mweka"],
    itineraryNote: "An 8-day alternative may be available. The longer itinerary, exact northern camps and daily measurements are confirmed during planning.",
    fitCopy: "The Northern Circuit suits hikers who value solitude, wide landscapes and a longer itinerary, and who are prepared for many consecutive days on the mountain.",
    fitGoodFor: ["Trekkers who value remote scenery","Travelers wanting a longer itinerary","Strong hikers comfortable with many days","People who enjoy quieter camps"],
    itinerary: [["Into the western forest","Londorossi Gate → Mti Mkubwa","After registration at Londorossi Gate, continue to the Lemosho trailhead and begin under Kilimanjaro’s rainforest canopy. The first trek finishes at Mti Mkubwa, or Big Tree Camp.","The opening day is deliberately measured. Rain and mud are possible in the forest, so keep waterproof layers accessible and use the walk to adjust boots, poles and your daypack."],["Open onto Shira","Mti Mkubwa → Shira 1","Climb out of the forest as the vegetation changes to heath and moorland. The route reaches the western edge of the Shira Plateau, with the first broad views of Kibo in clear weather.","The growing elevation becomes more noticeable today. Drink regularly, protect yourself from sun and wind and keep the pace slow enough to speak comfortably while walking."],["Across the plateau","Shira 1 → Shira 2","Follow an open trail across the Shira Plateau through high-altitude heath and volcanic terrain. The landscape feels increasingly expansive as the route moves toward Shira 2 Camp.","A gentle afternoon acclimatization walk may be included in the final plan. Recovery, hydration and honest communication about symptoms matter more than covering the ground quickly."],["Toward Moir","Shira 2 → Moir Hut","Leave the main southern line and move toward Moir Hut beneath Kilimanjaro’s north-western slopes. This transition introduces the quieter terrain that defines the Northern Circuit.","The trail may rise and fall as it approaches camp, adding useful exposure to elevation. Conditions are more exposed, so keep warm and waterproof layers ready throughout the day."],["The remote north","Moir Hut → Buffalo Camp","Traverse a series of ridges around the mountain’s northern side, with Kibo above and distant plains below. The path feels noticeably quieter than the southern circuit before reaching Buffalo Camp.","Repeated climbs and descents make this stage more demanding than the map may suggest. Eat and drink consistently and allow the guide to control the group’s pace across the high country."],["Across the northern flank","Buffalo Camp → Third Cave","Continue east beneath Kibo through stark alpine terrain toward Third Cave. Wide horizons and a strong sense of remoteness characterize this part of the route.","The body is adapting, but altitude symptoms can still develop or worsen. Use the quieter afternoon to rest, stay warm and prepare for the move toward summit base."],["Prepare at high camp","Third Cave → School Hut","Turn south toward Kibo and climb to School Hut, the high camp for the summit attempt. On arrival, eat, organize warm layers and equipment, and listen carefully to the guide’s briefing.","Sleep may be limited at this elevation, so focus on resting and keeping warm. Carry only the necessary summit items and follow the guide’s advice on water, timing and clothing."],["Summit attempt and descent","School Hut → Uhuru Peak → Mweka Camp","Begin during the night and climb toward the crater rim and Uhuru Peak when conditions and wellbeing allow. After the summit attempt, descend past high camp and continue to Mweka Camp on the southern side.","This is the longest, coldest stage of the nine-day package. Summit success is not guaranteed; guides monitor altitude, weather and fatigue, and the long descent requires concentration after the ascent."],["Return through the forest","Mweka Camp → Mweka Gate","Descend from heath into rainforest and continue to Mweka Gate, where the mountain itinerary finishes with park formalities and a farewell to the crew.","The final trail can be muddy and hard on tired knees. Meet the onward transfer at the gate; hotel accommodation and any safari or Zanzibar extension are confirmed in the proposal."]],
  },
  umbwe: {
    name: "Umbwe Route", shortName: "Umbwe", heroImage: "drive-library/umbwe-hero.webp", overviewImage: "drive-library/umbwe-trail.webp", itineraryImage: "drive-library/umbwe-camp.webp", mapImage: "route-map-umbwe.svg", distanceKm: 46.3, duration: "6 Days", days: 6, difficulty: "Very challenging", scenery: "Dramatic", lead: "A steep, direct route for experienced mountain trekkers.",
    heroCopy: "Climb quickly through dense southern forest toward dramatic ridges, then join Kilimanjaro’s southern circuit before the summit.",
    overview: ["The Umbwe Route is Kilimanjaro’s steepest and most direct southern approach. Its opening days climb rapidly through dense rainforest and along a dramatic ridge before reaching Barranco Camp, where the trail joins the better-known Southern Circuit toward Karanga and Barafu.", "This demanding six-day package is designed for experienced, well-prepared trekkers who are comfortable with strenuous hiking. The quick altitude gain leaves limited time to acclimatize, so route suitability, pace and the option of adding an extra Barranco acclimatization day should be discussed carefully before booking."],
    bestFor: "Experienced trekkers seeking a steep route", startingPoint: "Umbwe Gate", accommodation: "Camping route",
    benefits: [["A direct approach","Gain height quickly on a strong southern line through forest and ridge country."],["Dramatic terrain","Experience a rugged trail with an immediate sense of mountain adventure."],["Quieter opening days","The lower Umbwe trail is generally less travelled than Kilimanjaro’s main routes."],["Joins the southern circuit","Continue through Barranco and Karanga before the Barafu summit approach."]],
    mapSteps: ["Climb steeply from Umbwe Gate","Reach the Barranco valley","Continue via Karanga to Barafu","Summit and descend through Mweka"],
    itineraryNote: "Umbwe itineraries must be considered carefully because of the rapid ascent. Final acclimatization plan, camps and route suitability are confirmed with the team.",
    fitCopy: "Umbwe is intended for experienced, very fit trekkers who understand the demands of rapid altitude gain and want a steep, direct approach.",
    fitGoodFor: ["Experienced mountain trekkers","Very fit travelers","Hikers comfortable on steep trails","People seeking a quieter direct start"],
    itinerary: [["A steep forest beginning","Umbwe Gate → Umbwe Cave Camp","After registration at Umbwe Gate, enter dense rainforest and begin the route’s steep, direct climb. Roots, narrow sections and sustained ascent establish the demanding character of Umbwe before the first night at camp.","The supplied six-day package describes a serious opening stage, not a gentle warm-up. Keep rain protection accessible, use poles where helpful and follow the guide’s slow pace rather than pushing ahead."],["Onto the ridge","Umbwe Cave Camp → Barranco Camp","Continue above the forest and along Umbwe’s dramatic ridge as the landscape opens toward Kibo and the southern glaciers. The route enters the Barranco Valley and joins the Southern Circuit beneath the Barranco Wall.","The rapid elevation gain is the key challenge today. Eat and drink even if appetite falls, and tell the guide immediately about headaches, nausea, dizziness or unusual fatigue."],["Across the southern flank","Barranco Camp → Karanga Camp","Climb the Barranco Wall on the standard trekking line, using hands for balance in places, then cross ridges and valleys to Karanga Camp. The shorter stage leaves time to recover before moving higher.","The wall is exposed and dramatic but is not a technical climb on the usual itinerary. Guides manage spacing and footing, and the afternoon should be used for rest and acclimatization."],["Prepare at high camp","Karanga Camp → Barafu Camp","Leave Karanga and climb through alpine desert to Barafu, the base for the summit attempt. The guide explains the night plan while you prepare warm clothing, headlamp, water and essential equipment.","Rest is more important than sleep at high camp. Eat the meal offered, keep warm and avoid unnecessary activity before the overnight departure."],["Summit attempt and descent","Barafu Camp → Uhuru Peak → Mweka Camp","Set out in the early hours for Stella Point on the crater rim and continue to Uhuru Peak when conditions and wellbeing permit. After the summit attempt, descend past Barafu and continue to Mweka Camp.","This is the longest and most physically demanding day. Reaching the summit is never guaranteed; weather, altitude or fatigue may require an earlier descent under the guide’s direction."],["Return to the gate","Mweka Camp → Mweka Gate","Follow the trail down through rainforest to Mweka Gate for park formalities, certificates where applicable and the mountain-team farewell. Meet the Betheli transfer for the return to Moshi or Arusha.","The forest can be wet and slippery, so continue carefully despite the lower altitude. Confirm the hotel stay, airport transfer and any onward travel included in the final package."],
    ],
  },
};

const routePacking = [
  ["figma-machame-packing-clothing.svg","Clothing","Layers, warm insulation and weather protection."],
  ["figma-machame-packing-footwear.svg","Footwear","Broken-in hiking boots and suitable socks."],
  ["figma-machame-packing-sleeping.svg","Sleeping","Check the sleeping bag and mat requirements."],
  ["figma-machame-packing-personal.svg","Personal Items","Sun protection, toiletries and personal medication."],
  ["figma-machame-packing-documents.svg","Documents","Travel documents, insurance and any required permits."],
  ["figma-machame-packing-camera.svg","Optional Gear","Discuss poles, a camera and other useful extras."],
];

export function KilimanjaroRouteDetailPage({ route, trip }: { route: KilimanjaroRouteSlug; trip: CmsKilimanjaroRouteTrip | null }) {
  if (route === "machame") return <MachameReferencePage trip={trip} />;
  const detail = routeDetailData[route];
  const routeFacts = routeFallbackFacts[route];
  const startingPrice = trip?.startingPrice || routeFacts.startingPrice;
  const distanceKm = trip?.routeDistanceKm ?? detail.distanceKm;
  const distanceLabel = routeDistanceLabel(distanceKm, Boolean(!trip?.routeDistanceKm && detail.approximateDistance));
  const routeStays = Array.from(new Set(trip?.itinerary.flatMap(day => day.accommodations) || []));
  const routeFaq = [
    [`How difficult is the ${detail.name}?`, "A difficulty rating is not included in the published trip record. Share your hiking experience and health considerations with the team for route-specific advice."],
    ["How many days should I choose?", trip ? `The published ${trip.title} climb has ${trip.trekkingDays} trekking days. Arrival and departure are not included in that number.` : `The current ${detail.duration.toLowerCase()} route rate counts trekking days only. Compare the proposed camp sequence and acclimatization plan with the team before booking.`],
    [`How far is the ${detail.name}?`, `${distanceLabel}. Distance can vary slightly with the exact camps and trail variation confirmed for your departure.`],
    [`Is ${detail.shortName} suitable for beginners?`, "Route suitability depends on your experience, fitness, health and the specific itinerary. Discuss these with the local team before booking."],
    ["What is the best time to climb?", "Mountain weather and trail conditions vary by season and can change quickly. Share your preferred dates for current guidance."],
    ["How difficult is summit night?", "It is usually the most demanding part of the climb: a cold, early start, slow ascent and long descent. Guides assess conditions and your wellbeing throughout."],
    ["Where do we sleep?", routeStays.length ? `The published itinerary lists: ${routeStays.join(", ")}. Ask the team to confirm availability and final arrangements for your dates.` : `The standard route uses ${detail.accommodation.toLowerCase()}. Confirm the exact camps and final arrangements for your dates.`],
    ["What happens if I cannot continue?", "Tell your guide immediately if you feel unwell. The guide will assess the safest next step using the operator’s descent and emergency procedures."],
    ["What equipment is provided?", "Supplied equipment and rental options are confirmed with your package. Request the itemized equipment list before departure."],
    [`How much does the ${detail.name} cost?`, `The ${detail.duration.toLowerCase()} ${detail.name} starts from ${startingPrice} USD per person. Hotel accommodation is excluded and can be arranged on request at an additional cost.`],
    ["What should I pack?", "Prepare layered clothing, suitable footwear, cold-weather essentials, personal items and travel documents. Confirm the final list with the team."],
  ];
  const otherRoutes = kilimanjaroRoutes.filter(card => card.title !== detail.name).slice(0, 4);
  return <><ReferenceHero imageSrc={image(detail.heroImage)} eyebrow="KILIMANJARO ROUTE" title={detail.name} lead={trip ? trip.title : "Explore this Kilimanjaro route with the local team."} copy={trip ? `Review the published ${trip.trekkingDays}-day mountain itinerary. Arrival and departure days are excluded from this climb duration.` : `Review the current ${detail.duration.toLowerCase()} mountain outline, then confirm the exact day-by-day plan for your dates.`} action="Plan This Climb" secondAction="View Itinerary" secondActionHref="#itinerary" active="Kilimanjaro" navVariant="classic" routeFacts={[trip ? `${trip.trekkingDays} trekking days` : `${routeFacts.days} trekking days`, distanceLabel, `From ${startingPrice}`]} />
    <main className="route-detail-page">
      <section className="route-overview"><div className="shell route-overview-grid"><Photo src={image(detail.overviewImage)} alt={`${detail.name} landscape on Mount Kilimanjaro`} /><div><Intro eyebrow={trip ? "PUBLISHED SANITY TRIP" : "ROUTE OVERVIEW"} title={trip ? trip.title : `${detail.name} Overview`} /><div className="route-overview-copy">{detail.overview.map(paragraph => <p key={paragraph}>{paragraph}</p>)}<p className="route-callout">{kilimanjaroPriceNote}</p>{trip && <p className="route-callout">This page follows the published {trip.title} package. The displayed duration counts {trip.trekkingDays} mountain days only; arrival and departure are not included.</p>}</div><dl className="route-facts">{[["Trekking duration",trip ? `${trip.trekkingDays} days` : `${routeFacts.days} days`],["Route distance",distanceLabel],["Starting price",startingPrice],["Accommodation options",routeStays.join(", ") || detail.accommodation]].map(([term,value])=><div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl></div></div></section>
      <RouteTripItinerary trip={trip} routeName={detail.name} imageSrc={detail.itineraryImage} fallbackDays={detail.itinerary} fallbackImages={routeItineraryImages[route]} fallbackStay={detail.accommodation} fallbackNote={detail.itineraryNote} />
      <RouteEnvironments />
      <section className="route-inclusions"><div className="shell"><Intro eyebrow="YOUR CLIMB, TAKEN CARE OF" title="What’s Included in Your Climb" copy="Use this package checklist when planning your enquiry. Hotel accommodation is separate from the climbing rate and can be added on request." /><div className="route-inclusion-stack">{[["01","PREPARATION","Before the climb","The arrangements around your journey.",[["figma-trips-inclusion-route.svg","Transfers","Pickup points and included transfers are confirmed in your quote."],["figma-trips-inclusion-tent.svg","Accommodation","Mountain stays are confirmed in your quote. Add a pre- or post-climb hotel only if you need one."]]],["02","ON THE MOUNTAIN","Climb & stay","Your team and everyday trail essentials.",[["figma-trips-inclusion-mountain.svg","Mountain","Climb services and overnight arrangements are confirmed before travel."],["figma-trips-inclusion-utensils.svg","Food","Meal plan, drinking water and dietary needs are confirmed in planning."],["figma-kili-value-users.svg","Guides & Crew","Guide and mountain crew arrangements are confirmed for your group."],["figma-trips-inclusion-ticket.svg","Park Fees","Park and applicable accommodation fee coverage is itemized in your quote."]]],["03","ONGOING CARE","Support & safety","Discuss the plan before you commit.",[["figma-kili-value-shield.svg","Safety","Monitoring, emergency procedures and equipment are confirmed with the team."]]]].map(([num,label,title,copy,items])=><article key={String(num)}><header><small>{String(num)} / {String(label)}</small><h3>{String(title)}</h3><p>{String(copy)}</p></header><div>{(items as string[][]).map(([icon,itemTitle,itemCopy])=><section key={itemTitle}><Image src={image(icon)} alt="" width={28} height={28}/><div><h4>{itemTitle}</h4><p>{itemCopy}</p></div></section>)}</div></article>)}</div></div></section>
      <section className="route-summit"><div className="shell"><div><Intro eyebrow="THE MOUNTAIN’S MOST DEMANDING MOMENT" title="Summit Night" /><h3>Slow steps. Cold air. The possibility of sunrise above the clouds.</h3><p>A summit attempt usually means an early start in darkness, very cold temperatures and a slow, steady ascent. The aim is Uhuru Peak, with sunrise a memorable part of the high-mountain experience when conditions allow.</p><p>Reaching the top is never guaranteed. Guides assess conditions and your ability along the way; turning around may be the right decision. A long descent follows any summit attempt.</p><PrimaryLink>Plan your climb</PrimaryLink></div></div></section>
      <section className="route-packing"><div className="shell"><Intro eyebrow="PREPARE FOR CHANGING CONDITIONS" title="What Should You Bring?" copy="Pack for a progression from lower trails to a cold, exposed summit environment." /><div className="route-packing-grid"><Photo src={image("figma-machame-packing-expedition-photograph.png")} alt="Mountain equipment" /><div>{routePacking.map(([icon,title,copy])=><article key={title}><Image src={image(icon)} alt="" width={28} height={28}/><h3>{title}</h3><p>{copy}</p></article>)}<PrimaryLink>Ask for a packing list</PrimaryLink></div></div></div></section>
      <Safety />
      <section className="route-fit"><div className="shell"><Intro eyebrow="PLAN WITH THE CURRENT ITINERARY" title="Confirm the route details before booking" copy={trip ? "Compare the published trip duration, destinations, accommodation and package price with the plan for your dates. Ask the local team about any details not listed here." : "Use the complete route outline above to plan your climb, then confirm the exact camps, dates, services and price in your written proposal."} /><div className="route-fit-cta"><div><h3>Need help choosing?</h3><p>Talk through your timeframe and experience with the team.</p></div><PrimaryLink href="/plan-your-trip">Plan your climb</PrimaryLink></div></div></section>
      <Testimonials /><ImageCards eyebrow="COMPARE YOUR OPTIONS" title="Compare other routes" cards={otherRoutes} /><section className="route-faq"><div className="shell"><Intro eyebrow="BEFORE YOU CHOOSE YOUR CLIMB" title={`${detail.name} Frequently Asked Questions`} copy="The essentials, answered. Package-specific details will be confirmed during planning."/><Accordion items={routeFaq} openCount={2}/></div></section><CtaBanner title={`Ready to climb ${detail.shortName}?`} image={image(detail.heroImage)} />
    </main><Footer /></>;
}

function HomeFaq() {
  const [tab, setTab] = useState("All");
  const categories = ["All", ...faqCategories.map(([category]) => category.charAt(0) + category.slice(1).toLowerCase())];
  const featuredQuestions = ["Is airfare included in the package price?", "How difficult is Kilimanjaro?", "Will I see the Big Five or the Great Migration?", "Which coast should I choose?", "Do I need a visa for Tanzania?", "Can I combine Kilimanjaro, safari and Zanzibar?"];
  const selectedQuestions = tab === "All" ? featuredQuestions : faqCategories.find(([category]) => category.toLowerCase() === tab.toLowerCase())?.[2] || [];
  const questions = selectedQuestions.map(question => [question, faqAnswers[question] || "Please ask the Bathiel team to confirm this detail for your proposed trip."]);
  return <section className="home-ref-faq shell"><Intro eyebrow="" title="Frequently Asked Questions" copy="Whether you want to meet new people, travel privately with your people, or explore" /><div className="home-ref-faq-tabs" role="group" aria-label="FAQ categories">{categories.map(category => <button type="button" aria-pressed={tab === category} className={tab === category ? "active" : ""} onClick={() => setTab(category)} key={category}>{category}</button>)}<PrimaryLink>Start planning</PrimaryLink></div><Accordion key={tab} items={questions} openCount={0} /><Link className="home-ref-faq-more" href="/faq">View all questions <ArrowIcon /></Link></section>;
}

type TripCategory = "Day Trips" | "Zanzibar" | "Safari" | "Kilimanjaro";
type TripCard = CmsTripCard;

const tripCards: TripCard[] = [
  { title: "Family Safari & Beach Escape", src: "figma-zanzibar-hero.png", href: "/trips/northern-serengeti", categories: ["Zanzibar"], days: 8, price: "$2,286" },
  { title: "Kilimanjaro Summit Journey", src: "figma-home-hero.png", href: "/trips/northern-serengeti", categories: ["Kilimanjaro"], days: 8, price: "$2,286" },
  { title: "Serengeti Family Adventure", src: "home-15.jpg", href: "/trips/northern-serengeti", categories: ["Safari"], days: 8, price: "$2,286" },
  { title: "Summit, Safari & Coast", src: "figma-kili-group-trip-landscape3.png", href: "/trips/northern-serengeti", categories: ["Kilimanjaro"], days: 10, price: "$2,940" },
  { title: "Zanzibar Culture & Coast", src: "figma-home-story-zanzibar.png", href: "/trips/northern-serengeti", categories: ["Zanzibar"], days: 6, price: "$1,732" },
  { title: "Tarangire & Ngorongoro Safari", src: "figma-safari-destinations-destination-photograph2.png", href: "/trips/northern-serengeti", categories: ["Safari"], days: 6, price: "$1,732" },
  { title: "Lemosho Route & Zanzibar", src: "drive-library/lemosho-shira-plateau.webp", href: "/trips/northern-serengeti", categories: ["Kilimanjaro"], days: 10, price: "$2,940" },
];

function TripCardList({ trips, grid = false }: { trips: TripCard[]; grid?: boolean }) {
  return <div className={`home-ref-adventure-cards${grid ? " trips-ref-card-grid" : ""}`}>{trips.map((trip) => <Link href={trip.href} key={`${trip.href}-${trip.title}`}><Photo src={contentImage(trip.src)} alt={trip.title} /><h3>{trip.title}</h3><small>{trip.days} {trip.days === 1 ? "DAY" : "DAYS"}</small><div className={`home-ref-trip-bottom${trip.price ? "" : " home-ref-trip-bottom-request"}`}><span className="home-ref-trip-price">{trip.price ? <>starts from<br /><b>{trip.price}</b><br />per person</> : <b>Price on request</b>}</span><span className="home-ref-trip-link">View Trip</span></div></Link>)}</div>;
}

function HomeAdventures({ trips }: { trips?: CmsTripCard[] }) {
  const [location, setLocation] = useState("All locations");
  const [price, setPrice] = useState("All prices");
  const [duration, setDuration] = useState("Any duration");
  const availableTrips = trips?.length ? trips : tripCards;
  const prices = Array.from(new Set(availableTrips.map((trip) => trip.price))).filter(Boolean);
  const durations = Array.from(new Set(availableTrips.map((trip) => trip.days))).sort((a, b) => a - b);
  const visible = availableTrips.filter((trip) => (location === "All locations" || trip.categories.includes(location as TripCategory)) && (price === "All prices" || trip.price === price) && (duration === "Any duration" || `${trip.days} days` === duration)).slice(0, 5);
  return <div className="shell home-ref-adventures"><div><div><h2>Day trips, Kilimanjaro, Safari and Zanzibar.</h2></div><div className="home-ref-adventure-filters"><select aria-label="Filter by location" value={location} onChange={e => setLocation(e.target.value)}>{["All locations","Day Trips","Kilimanjaro","Safari","Zanzibar"].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Filter by price" value={price} onChange={e => setPrice(e.target.value)}><option>All prices</option>{prices.map(value => <option key={value}>{value}</option>)}</select><select aria-label="Filter by duration" value={duration} onChange={e => setDuration(e.target.value)}><option>Any duration</option>{durations.map(days => <option key={days} value={`${days} days`}>{days} {days === 1 ? "day" : "days"}</option>)}</select></div></div><TripCardList trips={visible} /><Link className="home-ref-view-trips" href="/trips">View all trips <ArrowIcon /></Link></div>;
}

function HomeAdventureSelector() {
  const adventures = [
    { eyebrow: "SAFARI", title: "Wildlife, and Nature", copy: "Park choices and onward connections tailored around your dates.", src: "figma-zanzibar-combine-frame.png", href: "/safari" },
    { eyebrow: "KILIMANJARO", title: "Summit, the roof of Africa", copy: "Space to rest after the climb. The island at your own pace.", src: "figma-zanzibar-combine-frame1.png", href: "/kilimanjaro" },
    { eyebrow: "", title: "Zanzibar island", copy: "One journey across the full range of Tanzania. Sequence to confirm.", src: "figma-zanzibar-combine-frame2.png", href: "/zanzibar" },
  ];

  return <section className="home-ref-select">
    <div className="shell">
      <Intro eyebrow="" title="Select your Tanzanian adventure" copy="Whether you want to meet new people, travel privately with your people, or explore Tanzania independently, choose the safari style that fits your journey." />
      <div className="home-ref-select-cards">{adventures.map((adventure) => <Link href={adventure.href} key={adventure.title} className="home-ref-select-card">
        <Photo src={image(adventure.src)} alt="" />
        <div>{adventure.eyebrow && <small>{adventure.eyebrow}</small>}<h3>{adventure.title}</h3><p>{adventure.copy}</p><span>Start planning <Image src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /></span></div>
      </Link>)}</div>
    </div>
  </section>;
}

function HomeRouteExplorer() {
  const routes = [
    { name: "Rongai Route", src: "route-map-rongai.png", alt: "Illustrated Kilimanjaro route map for the Rongai Route", href: "/kilimanjaro/rongai-route", copy: "The Rongai Route approaches Kilimanjaro from the north-east, following a quieter trail before joining the summit path near Kibo Hut." },
    { name: "Lemosho Route", src: "figma-home-map.png", alt: "Illustrated Kilimanjaro route map for the Lemosho Route", href: "/kilimanjaro/lemosho-route", copy: "The Lemosho Route begins on the quieter western side of Kilimanjaro and is known for its spectacular scenery and excellent acclimatisation. With a longer itinerary and lower traffic during the first days, it is one of the most enjoyable ways to experience the mountain." },
    { name: "Machame Route", src: "route-map-machame.png", alt: "Illustrated Kilimanjaro route map for the Machame Route", href: "/kilimanjaro/machame-route", copy: "The Machame Route climbs from the south-west through Shira, Barranco and Karanga before reaching the summit approach from Barafu Camp." },
    { name: "Northern Circuit Route", src: "route-map-northern-circuit.png", alt: "Illustrated Kilimanjaro route map for the Northern Circuit Route", href: "/kilimanjaro/northern-circuit", copy: "The Northern Circuit follows the western approach before circling Kilimanjaro's quieter northern slopes and turning toward the summit." },
    { name: "Marangu Route", src: "route-map-marangu.png", alt: "Illustrated Kilimanjaro route map for the Marangu Route", href: "/kilimanjaro/marangu-route", copy: "The Marangu Route approaches from the south-east, passing Mandara, Horombo and Kibo huts on the way to Uhuru Peak." },
  ];
  const [selectedIndex, setSelectedIndex] = useState(1);
  const selectedRoute = routes[selectedIndex];

  return <div className="shell home-ref-map">
    <div className="home-ref-route-image" aria-live="polite"><Photo key={selectedRoute.src} src={image(selectedRoute.src)} alt={selectedRoute.alt} /></div>
    <div className="home-ref-route-list"><h2>Routes that we offer</h2><div role="tablist" aria-label="Kilimanjaro routes">{routes.map((route, index) => <article key={route.name} className={index === selectedIndex ? "active" : ""}>
      <button type="button" role="tab" aria-selected={index === selectedIndex} aria-controls={`route-panel-${index}`} id={`route-tab-${index}`} onClick={() => setSelectedIndex(index)}>{index + 1}. {route.name}<span><ArrowIcon /></span></button>
      {index === selectedIndex && <div id={`route-panel-${index}`} role="tabpanel" aria-labelledby={`route-tab-${index}`}>{route.copy && <p>{route.copy}</p>}<Link href={route.href}>Explore route</Link></div>}
    </article>)}</div></div>
  </div>;
}

function HomeMoments() {
  const scroller = useRef<HTMLDivElement>(null);
  const [activeMoment, setActiveMoment] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const moments = [
    ["figma-kili-routes-route-landscape.png", "Climbers crossing a snow-covered Kilimanjaro slope"],
    ["figma-kili-routes-route-landscape4.png", "Climbers crossing Kilimanjaro's alpine desert"],
    ["figma-kili-routes-route-landscape2.png", "Climbers walking through Kilimanjaro forest"],
    ["zanzibar-03.jpg", "Climbers resting above the clouds"],
    ["figma-kili-routes-route-landscape3.png", "Climbers crossing Kilimanjaro's green moorland"],
    ["figma-kili-why-image2.png", "Bathiel Expeditions climbing team"],
    ["figma-kili-intro-climbers-above-the-clouds.png", "Climbers pausing above Kilimanjaro's cloud line"],
    ["figma-kili-journey-journey-landscape1.png", "Climbers crossing a footbridge on Kilimanjaro"],
    ["figma-kili-journey-journey-landscape3.png", "Climbers following a high-altitude mountain stream"],
    ["figma-kili-safety-expedition-team-photograph.png", "The full Betheli Expeditions mountain team"],
    ["figma-kili-group-trip-landscape3.png", "Climbers approaching Kilimanjaro beneath drifting clouds"],
  ];
  const showMoment = (index: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = scroller.current;
    if (!viewport) return;
    const cards = viewport.querySelectorAll<HTMLElement>("figure");
    const nextIndex = Math.max(0, Math.min(moments.length - 1, index));
    const card = cards[nextIndex];
    if (!card) return;
    setActiveMoment(nextIndex);
    viewport.scrollTo({ left: card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2, behavior });
  };
  const updateActiveMoment = () => {
    const viewport = scroller.current;
    if (!viewport) return;
    const center = viewport.scrollLeft + viewport.clientWidth / 2;
    const cards = Array.from(viewport.querySelectorAll<HTMLElement>("figure"));
    const nearest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center);
      const bestCard = cards[best];
      const bestDistance = Math.abs(bestCard.offsetLeft + bestCard.offsetWidth / 2 - center);
      return distance < bestDistance ? index : best;
    }, 0);
    setActiveMoment(nearest);
  };
  useEffect(() => {
    const viewport = scroller.current;
    if (!viewport) return;
    const updateOverflow = () => {
      const scrollable = viewport.scrollWidth - viewport.clientWidth > 4;
      setHasOverflow(scrollable);
      if (!scrollable) setActiveMoment(0);
    };
    updateOverflow();
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(viewport);
    window.addEventListener("resize", updateOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, []);

  const progress = ((activeMoment + 1) / moments.length) * 100;
  return <section className="home-ref-moments" id="moments"><div className="shell"><Intro eyebrow="" title="Unforgettable Moments in the Heart of Mount Kilimanjaro" copy="Experience breathtaking sunrises, explore volcanic landscapes, and create memories at one of Africa’s most iconic destinations." /></div><div className="home-ref-moment-viewport" ref={scroller} onScroll={updateActiveMoment}><div className="home-ref-moment-images">{moments.map(([src, alt], index) => <figure key={src} className={index === 3 ? "featured" : ""}><Photo src={image(src)} alt={alt} />{index === 3 && <figcaption><span>Alpine Desert Crossing</span><small>Cross Kilimanjaro’s vast volcanic alpine desert on foot.</small></figcaption>}</figure>)}</div></div>{hasOverflow && <div className="home-ref-moment-controls" aria-label="Moments gallery controls"><button type="button" onClick={() => showMoment(activeMoment - 1)} aria-label="Previous moment" disabled={activeMoment === 0}>←</button><input type="range" min="0" max={moments.length - 1} step="1" value={activeMoment} aria-label="Moments slider position" aria-valuetext={`Moment ${activeMoment + 1} of ${moments.length}`} onChange={event => showMoment(Number(event.target.value), "auto")} style={{ background: `linear-gradient(90deg,#fff 0 ${progress}%,rgba(255,255,255,.25) ${progress}% 100%)` }} /><span aria-live="polite">{activeMoment + 1} / {moments.length}</span><button type="button" onClick={() => showMoment(activeMoment + 1)} aria-label="Next moment" disabled={activeMoment === moments.length - 1}>→</button></div>}</section>;
}

export function HomeReferencePage({ trips }: { trips?: CmsTripCard[] } = {}) {
  const styleCards = [
    {eyebrow:"Travel Independently",title:"SOLO",subtitle:"Travel your way",copy:"A personalised safari designed around your interests, pace and plans.",best:"Best for: independent travellers",src:"figma-home-style1.png",href:"/plan-your-trip",action:"Start planning"},
    {eyebrow:"Just Your People",title:"PRIVATE GROUP",subtitle:"Travel with your people",copy:"A private vehicle and itinerary for your partner, family or friends.",best:"Best for: couples, family, friends",src:"figma-home-style2.png",href:"/plan-your-trip",action:"Start planning"},
    {eyebrow:"Social & Shared",title:"JOIN A GROUP",subtitle:"Meet new people",copy:"Join a small group and share the safari experience with other travellers.",best:"Best for: solo travellers & social travellers",src:"figma-home-style3.png",href:"/groups",action:"Check group dates"},
  ];
  return <><section className="home-ref-hero"><Photo src={image("figma-home-hero.png")} alt="" priority className="home-ref-hero-image" /><div className="home-ref-hero-scrim" /><Header active="Home" variant="classic" /><div className="shell home-ref-hero-copy"><h1>Climbing Kilimanjaro is an experience of a lifetime</h1><p>Three routes, chosen because they give you the acclimatisation days the mountain actually demands. Guides who have walked them since they were teenagers. And when your legs are done, the Serengeti and Zanzibar are a short flight away.</p><PrimaryLink>Start planning</PrimaryLink></div><aside className="home-ref-floating"><div className="home-ref-floating-top"><div className="home-ref-avatar-stack" aria-hidden="true">{["figma-home-team1.png","figma-home-team2.png","figma-home-team3.png"].map(src => <Photo key={src} src={image(src)} alt="" />)}<span>500+</span></div><strong>Summit Climbers</strong></div><p>Travel through volcanic landscapes, golden skies, and timeless beauty with expertly guided Mount Kilimanjaro tours.</p><Link href="/plan-your-trip">Book now <b><ArrowIcon /></b></Link></aside></section>
    <main><section className="home-ref-trust shell"><div><TripadvisorLogo /><span className="home-ref-rating-row">5.0 <RatingStars size={20} /></span><small>Rated from 23 reviews</small></div><div className="home-ref-photo-strip">{["figma-home-gallery1.png","drive-library/marangu-summit.webp","figma-home-gallery3.png","figma-home-gallery4.png"].map((src,i)=><figure key={src}><Photo src={image(src)} alt={["Hikers on Kilimanjaro snow","Betheli climbers celebrating at Uhuru Peak","Kilimanjaro landscape","Tents on Mount Kilimanjaro"][i]} />{i===0&&<figcaption><b>A peak of Kilimanjaro</b><small>Where courage meets nature, reaching Tanzania’s highest peak.</small></figcaption>}</figure>)}</div></section>
      <section className="home-ref-styles shell"><Intro eyebrow="" title="Choose your travel style" copy="Whether you want to meet new people, travel privately with your people, or explore Tanzania independently, choose the safari style that fits your journey." /><div className="home-ref-style-grid">{styleCards.map(card=><article key={card.title}><Link className="home-ref-style-card" href={card.href} aria-label={`${card.title}: ${card.action}`}><div className="home-ref-style-visual"><Photo src={image(card.src)} alt="" /><div className="home-ref-style-label">{card.eyebrow}</div><div className="home-ref-style-heading"><h3>{card.title}</h3><span>{card.subtitle}</span></div></div><div className="home-ref-style-copy"><p>{card.copy}</p><small>{card.best}</small><span className="home-ref-style-action">{card.action}<b><ArrowIcon /></b></span></div></Link></article>)}</div><div className="home-ref-stats">{[["5,895 m","Uhuru Peak, the Roof of Africa"],["94 %","Of our climbers reach it"],["7–9 day","On the mountain, three routes"],["$1,450","Starting price per person for a 6-day Kilimanjaro climb"]].map(([stat,copy])=><div key={stat}><b>{stat}</b><span>{copy}</span></div>)}</div></section>
      <HomeAdventureSelector />
      <HomeMoments />
      <section className="home-ref-dark"><HomeRouteExplorer /><HomeAdventures trips={trips} /></section>
      <section className="home-ref-story"><div className="shell"><div className="home-ref-story-visual"><Photo src={image("figma-home-story-guide.png")} alt="Local guide with travellers in Tanzania" /><div className="home-ref-story-overlay"><Photo src={image("figma-home-story-climber.png")} alt="Climber above the clouds at sunset" /><Image className="home-ref-story-overlay-arrow" src={image("figma-kili-group-button-arrow.svg")} alt="" width={40} height={40} /><span>Betheli Expeditions is a proud Tanzanian owned tour operator company.</span><Image className="home-ref-story-brand" src={image("figma-home-story-brand.png")} alt="" width={133} height={86} /></div></div><div><h2>Your Trusted Guide to the Heart of Africa</h2><p>Betheli Expeditions is a proud Tanzanian-owned tour operator company, rooted in the ancient and revered Maasai tribe, known for our unwavering passion and deep reverence for wildlife. With over a decade of invaluable experience in the East African tourism industry, covering captivating destinations like Tanzania, Zanzibar, Kenya, Uganda, and Rwanda, we have embarked on a thrilling and challenging journey as the proprietors of Betheli Expeditions.</p><div className="home-ref-story-end"><strong>94%<small>of our travelers<br />reach the summit</small></strong><Link href="/zanzibar"><Photo src={image("figma-home-story-zanzibar.png")} alt="Zanzibar beach" /><Image src={image("figma-home-story-card-arrow.svg")} alt="" width={31} height={31} />Zanzibar island</Link><Link href="/safari"><Photo src={image("figma-home-story-wildlife.png")} alt="Cheetahs in Tanzania" /><Image src={image("figma-home-story-card-arrow.svg")} alt="" width={31} height={31} />Wildlife safari</Link></div></div></div></section>
      <section className="home-ref-team shell" id="team"><Intro eyebrow="" title="Meet the team" copy="Whether you want to meet new people, travel privately with your people, or explore" /><div>{[["Jacqueline Laizer","Co-Founder of Betheli Expeditions"],["Emmanuel Laizer","Founder of Betheli Expeditions"],["Clara Encinas","Marketing Manager"]].map(([name,role],i)=><article key={name}><Photo src={image(`figma-home-team${i+1}.png`)} alt={name} /><h3>{name}</h3><p>{role}</p></article>)}</div></section>
      <div id="reviews"><Testimonials /></div><CtaBanner title="Ready to Climb Kilimanjaro?" image={image("figma-kili-group-trip-landscape3.png")} />
      <HomeFaq /></main><HomeFooter /></>;
}

function TripAccommodation({ day, mealPlan, options }: { day: number; mealPlan: string; options: TripStayOption[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [mealInfoOpen, setMealInfoOpen] = useState(false);
  const selected = options[selectedIndex] ?? options[0];
  // Each property keeps its own gallery. Never fill a lodge gallery with images
  // belonging to other properties, even when they share the same price tier.
  const slides = selected ? (selected.slides?.length ? selected.slides : [selected]) : [];
  const slide = slides[slideIndex] || slides[0];
  const chooseOption = (index: number) => { setSelectedIndex(index); setSlideIndex(0); };
  const move = (direction: number) => setSlideIndex(index => (index + direction + slides.length) % slides.length);
  useEffect(() => {
    if (paused || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setSlideIndex(index => (index + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused, selectedIndex, slides.length]);
  return <>
    <div className="trip-ref-day-meta">
      <span className="trip-ref-accommodation-label"><Image src={image("figma-trips-accommodation.svg")} alt="" width={45} height={45} />Day {day} | Accommodation</span>
      <button className="trip-ref-meal" type="button" aria-expanded={mealInfoOpen} aria-controls={`meal-note-${day}`} onClick={() => setMealInfoOpen(open => !open)}><Image src={image("figma-trips-meal.png")} alt="" width={20} height={20} />Meal Plan: {mealPlan}<Image src={image("figma-trips-meal-info.svg")} alt="More information" width={20} height={20} /></button>
    </div>
    {mealInfoOpen && <p className="trip-ref-meal-note" id={`meal-note-${day}`}>The daily meal plan and any dietary arrangements are confirmed in your final trip proposal.</p>}
    {selected && slide && <div className="trip-ref-lodge">
      <div className="trip-ref-lodge-options" role="group" aria-label={`Day ${day} accommodation options`}>
        <p>Options based on your packages:</p>
        {options.map((option, index) => {
          const selectedOption = selectedIndex === index;
          const icon = option.tier === "Luxury" ? "figma-trips-premium-crown.svg" : "figma-trips-signature-star.svg";
          return <button type="button" className={`trip-ref-lodge-option${selectedOption ? " active" : ""}`} aria-pressed={selectedOption} onClick={() => chooseOption(index)} key={`${option.tier}-${option.property}`}><span className="trip-ref-lodge-tier"><span className="trip-ref-lodge-tier-icon"><Image src={image(icon)} alt="" width={28} height={28} /></span>{option.tier}</span><span className="trip-ref-lodge-name">{option.property}</span></button>;
        })}
        <small>Property availability and the final room category are confirmed in your trip proposal.</small>
      </div>
      <figure aria-live="polite" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}><Photo key={`${selectedIndex}-${slideIndex}-${slide.image}`} src={contentImage(slide.image)} alt={slide.alt} /><span className={`accommodation-tier accommodation-tier-${slide.tier.toLowerCase().replace("-", "")}`}>{slide.tier}</span><div className="trip-ref-lodge-arrows"><button type="button" aria-label={`Previous ${selected.tier.toLowerCase()} accommodation`} onClick={() => move(-1)}>‹</button><span>{slideIndex + 1} / {slides.length}</span><button type="button" aria-label={`Next ${selected.tier.toLowerCase()} accommodation`} onClick={() => move(1)}>›</button></div><figcaption>{slide.property}</figcaption></figure>
    </div>}
  </>;
}

const tripInclusionChapters = [
  {
    marker: "01 / PREPARATION", title: "Before your safari", description: "Get ready for the journey ahead.",
    items: [
      { icon: "route", title: "Arrival and departure transfers", description: "Transfers at the start and end of your trip." },
      { icon: "clipboard", title: "Pre-safari briefing", description: "Review your day-by-day plan and practical arrangements before setting off." },
    ],
  },
  {
    marker: "02 / SAFARI DAYS", title: "On safari", description: "The vehicle, guiding and daily essentials.",
    items: [
      { icon: "ticket", title: "Park and conservation fees", description: "Entry fees listed in your confirmed proposal." },
      { icon: "mountain", title: "Professional safari guide", description: "Local guiding throughout the route." },
      { icon: "backpack", title: "4×4 safari vehicle", description: "A vehicle arranged for the group and itinerary." },
      { icon: "tent", title: "Accommodation as confirmed", description: "Lodge or camp nights selected for your package." },
      { icon: "utensils", title: "Meals as listed", description: "Meal plans confirmed for each overnight stay." },
      { icon: "droplets", title: "Drinking water", description: "Water provisions for safari days as confirmed." },
    ],
  },
  {
    marker: "03 / ONGOING CARE", title: "Support throughout", description: "Care and coordination along the way.",
    items: [
      { icon: "heart", title: "Thoughtful pacing and practical support", description: "Help with the day-to-day details of your journey." },
      { icon: "message", title: "On-trip coordination and support", description: "Help with the day-to-day details of your safari." },
    ],
  },
];

function TripFacts({ itineraryFor = "Northern Serengeti Safari", travelDatesText = "To be confirmed", guestsText = "2 Adults" }: { itineraryFor?: string; travelDatesText?: string; guestsText?: string }) {
  const facts = [
    { label: "Itinerary for", value: itineraryFor, icon: "route" },
    { label: "Travel Dates", value: travelDatesText, icon: "calendar" },
    { label: "Guests", value: guestsText, icon: "guests" },
  ] as const;
  return <div className="trip-ref-facts">{facts.map(fact => <div className="trip-ref-fact" key={fact.label}><span className="trip-ref-fact-icon" aria-hidden="true"><TripFactIcon type={fact.icon} /></span><span><small>{fact.label}</small><strong>{fact.value}</strong></span></div>)}</div>;
}

function TripFactIcon({ type }: { type: "route" | "calendar" | "guests" }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    {type === "route" && <><path d="M3 19.5 9 5l3.1 7.2 2.3-4.8L21 19.5H3Z" /><path d="m6.6 14 2.3 1.5 2.1-1.3 2.1 1.4 2-1.2" /></>}
    {type === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 10h18" /><path d="m9.5 15.5 1.7 1.7 3.5-3.6" /></>}
    {type === "guests" && <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20h-11Z" /><path d="M16 5.2a3 3 0 0 1 0 5.6M17.2 13a5.5 5.5 0 0 1 3.3 5v2H18" /></>}
  </svg>;
}

const tripEnvironments = [
  { icon: "🌳", title: "Tarangire", altitude: "Baobabs & elephants", photo: "figma-safari-destinations-destination-photograph2.png", copy: "Tarangire combines open savannah, ancient baobabs and seasonal wildlife around the river. Game drives are paced around the day’s conditions and your group’s interests." },
  { icon: "⛰️", title: "Ngorongoro", altitude: "Crater floor", photo: "figma-safari-destinations-destination-photograph1.png", copy: "The crater’s grasslands, woodland and soda lake create a compact wildlife landscape. Your guide helps shape the day around the best conditions and a respectful pace." },
  { icon: "🦓", title: "Central Serengeti", altitude: "Open plains", photo: "figma-safari-packages-trip-card1.png", copy: "Central Serengeti offers long horizons, resident wildlife and a strong base for game drives as the route moves north." },
  { icon: "🌾", title: "Northern Serengeti", altitude: "Migration country", photo: "figma-trips-lion-photo.png", copy: "Northern Serengeti is shaped by the seasonal movement of wildebeest and zebra. Exact sightings and river crossings can never be guaranteed." },
  { icon: "🌊", title: "Mara River", altitude: "Seasonal crossings", photo: "figma-trips-hero.png", copy: "The Mara River is a dramatic landscape to explore with your guide. Wildlife movements, water levels and road conditions guide the day’s plan." },
];

function TripEnvironments({ title = "Landscapes of Northern Tanzania", environments = tripEnvironments }: { title?: string; environments?: typeof tripEnvironments }) {
  const [selected, setSelected] = useState(1);
  if (!environments.length) return null;
  const current = environments[selected] || environments[0];
  return <section className="ref-section ref-dark trip-ref-environments" aria-labelledby="trip-environments-title"><div className="shell trip-ref-environments-grid">
    <div className="trip-ref-environment-photo" aria-live="polite"><Photo src={contentImage(current.photo)} alt={`${current.title} on safari`} /></div>
    <div className="trip-ref-environment-content"><h2 id="trip-environments-title">{title}</h2><div className="trip-ref-environment-options">{environments.map((zone, index) => <div className="trip-ref-environment-option" key={zone.title}><button type="button" aria-expanded={selected === index} aria-controls={`trip-environment-detail-${index}`} onClick={() => setSelected(index)}><span aria-hidden="true">{zone.icon}</span>{zone.title} <small>{zone.altitude}</small></button>{selected === index && <p id={`trip-environment-detail-${index}`}>{zone.copy}</p>}</div>)}</div></div>
  </div></section>;
}

const tripFaqItems = [
  { category: "Booking", question: "Is airfare included in the package price?", answer: faqAnswers["Is airfare included in the package price?"] },
  { category: "Kilimanjaro", question: "How difficult is Kilimanjaro?", answer: faqAnswers["How difficult is Kilimanjaro?"] },
  { category: "Safari", question: "Will I see the Big Five or the Great Migration?", answer: faqAnswers["Will I see the Big Five or the Great Migration?"] },
  { category: "Zanzibar", question: "Which coast should I choose?", answer: faqAnswers["Which coast should I choose?"] },
  { category: "Travel", question: "Do I need a visa for Tanzania?", answer: faqAnswers["Do I need a visa for Tanzania?"] },
  { category: "General", question: "Can I combine Kilimanjaro, safari and Zanzibar?", answer: faqAnswers["Can I combine Kilimanjaro, safari and Zanzibar?"] },
];

function TripFaq() {
  const [category, setCategory] = useState("All");
  const categories = ["All", "Booking", "Kilimanjaro", "Safari", "Zanzibar", "Travel", "General"];
  const items = tripFaqItems.filter(item => category === "All" || item.category === category).map(item => [item.question, item.answer]);
  return <section className="ref-section trip-ref-faq" id="questions"><div className="shell"><h2>Frequently Asked Questions</h2><p>Useful answers for the first conversation and the planning that follows.</p><div className="trip-ref-faq-toolbar"><div className="trip-ref-faq-tabs" role="group" aria-label="Filter frequently asked questions">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><PrimaryLink>Start planning</PrimaryLink></div><Accordion key={category} items={items} openCount={0} /></div></section>;
}

export function TripsReferencePage({ trips, initialCategory }: { trips?: CmsTripCard[]; initialCategory?: string } = {}) {
  const [duration, setDuration] = useState("Any duration");
  const categories: ("All" | TripCategory)[] = ["All", "Day Trips", "Zanzibar", "Safari", "Kilimanjaro"];
  const normalizedInitialCategory = categories.find(item => item.toLowerCase() === initialCategory?.toLowerCase()) ?? "All";
  const [category, setCategory] = useState<"All" | TripCategory>(normalizedInitialCategory);
  const availableTrips = trips?.length ? trips : tripCards;
  const durationOptions = Array.from(new Set(availableTrips.map((trip) => trip.days))).sort((a, b) => a - b);
  const visibleTrips = availableTrips.filter((trip) => (category === "All" || trip.categories.includes(category)) && (duration === "Any duration" || `${trip.days} days` === duration));
  const selectCategory = (nextCategory: "All" | TripCategory) => {
    setCategory(nextCategory);
    const nextUrl = nextCategory === "All" ? "/trips" : `/trips?category=${encodeURIComponent(nextCategory)}`;
    window.history.pushState(null, "", nextUrl);
  };

  return <><ReferenceHero imageSrc={image("trips-hero-elephants.jpg")} eyebrow="TAILORED TANZANIA JOURNEYS" title="Trips across Tanzania" lead="Climb, safari and coast — shaped into one thoughtful journey." copy="Browse a selection of trip ideas, then talk with our local team to adapt the route, pace and stays around you." action="Start planning" secondAction="Explore trips" secondActionHref="#all-trips" active="Trips" navVariant="classic" />
    <main className="trips-index-page"><section className="ref-section trips-ref-listing" id="all-trips"><div className="shell"><div className="trips-ref-listing-head"><div><p className="eyebrow">FIND YOUR TANZANIA JOURNEY</p><h2>Day trips, Kilimanjaro, Safari and Zanzibar.</h2><p>Choose a starting point. Every itinerary can be refined around your dates, interests and travel style.</p></div><div className="home-ref-adventure-filters"><select aria-label="Filter trips by duration" value={duration} onChange={event => setDuration(event.target.value)}><option>Any duration</option>{durationOptions.map(days => <option key={days} value={`${days} days`}>{days} {days === 1 ? "day" : "days"}</option>)}</select></div></div><div className="trips-ref-filter-summary" aria-live="polite"><span>Showing <strong>{visibleTrips.length}</strong> {visibleTrips.length === 1 ? "trip" : "trips"}{category === "All" ? " across all categories" : ` in ${category}`}{duration === "Any duration" ? "" : ` for ${duration}`}</span>{duration !== "Any duration" && <button type="button" onClick={() => setDuration("Any duration")}>Clear duration</button>}</div><div className="trips-ref-category-nav" role="group" aria-label="Filter trips by category">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} className={category === item ? "active" : ""} onClick={() => selectCategory(item)}>{item}</button>)}</div>{visibleTrips.length ? <TripCardList trips={visibleTrips} grid /> : <p className="trips-ref-empty">No trips match these filters. Try another category or duration.</p>}</div></section>
      <CtaBanner title="Not sure which trip fits?" text="Tell us the places you are drawn to, your available time and who you are travelling with. We’ll help shape the route." image={image("figma-safari-why-image2.png")} />
    </main><Footer /></>;
}

export function TripDetailReferencePage({ data, trips = [], slug }: { data?: CmsTripPageData | null; trips?: CmsTripCard[]; slug: string }) {
  const [openDays, setOpenDays] = useState<Set<number>>(() => new Set([0]));
  const [mapOpen, setMapOpen] = useState(false);
  const days = data?.itinerary.map(day => ({
    title: day.title,
    copy: day.summary,
    image: day.image?.src,
    alt: day.image?.alt || "",
    experience: day.experience,
    mealPlan: day.mealPlan,
    stays: day.stays,
  })) ?? [
    { title: "Arrival", copy: "The group arrives at Kilimanjaro International Airport (JRO). A Betheli Expeditions representative meets you and transfers you to your hotel in Arusha.", image: "figma-safari-destinations-destination-photograph4.png", alt: "Giraffes near Mount Meru outside Arusha", experience: "Settle in, meet your travel team and take time to rest after your flight. Your guide will confirm the following morning’s departure, luggage arrangements and the rhythm of the safari ahead.", mealPlan: "Half Board", stays: [
      { property: "Mount Meru Hotel", tier: "Mid-range", image: "accommodations/mount-meru-hotel.jpg", alt: "Mount Meru Hotel in Arusha" },
      { property: "Arusha Coffee Lodge", tier: "Luxury", image: "accommodations/arusha-coffee-lodge.jpg", alt: "Arusha Coffee Lodge" },
    ] as TripStayOption[] },
    { title: "Tarangire National Park", copy: "Leave Arusha for Tarangire National Park, a landscape of baobabs, open grassland and elephant herds. Timings and activities are confirmed with your guide.", image: "figma-safari-destinations-destination-photograph2.png", alt: "Elephants gathering at the Tarangire River", experience: "Enjoy an unhurried first game drive as you get used to the vehicle and the pace of safari days. Tarangire’s river and ancient baobabs create a beautiful setting for watching wildlife in the afternoon light.", mealPlan: "Full Board", stays: [
      { property: "Arumeru River Lodge", tier: "Mid-range", image: "accommodations/arumeru-river-lodge.jpg", alt: "Guest room at Arumeru River Lodge" },
      { property: "Nimali Tarangire", tier: "Luxury", image: "accommodations/nimali-tarangire.webp", alt: "Nimali Tarangire safari lodge" },
    ] as TripStayOption[] },
    { title: "Ngorongoro Crater", copy: "Travel to the Ngorongoro Conservation Area and descend into the crater to explore one of East Africa’s most remarkable wildlife habitats.", image: "figma-safari-destinations-destination-photograph1.png", alt: "Ngorongoro Crater landscape", experience: "The crater floor brings grassland, woodland and lake edges into one extraordinary day. Your guide follows wildlife movement and road conditions, leaving room for quiet observation as well as classic big-game sightings.", mealPlan: "Full Board", stays: [
      { property: "Lake Masek Tented Lodge", tier: "Mid-range", image: "accommodations/lake-masek-tented-lodge.jpg", alt: "Lake Masek Tented Lodge" },
      { property: "Neptune Ngorongoro Luxury Lodge", tier: "Luxury", image: "accommodations/neptune-ngorongoro.webp", alt: "Neptune Ngorongoro Luxury Lodge" },
    ] as TripStayOption[] },
    { title: "Central Serengeti", copy: "Continue into the Serengeti, with game viewing along the way as the landscape opens into long horizons and kopjes.", image: "figma-trips-lion-photo.png", alt: "Lion in the Central Serengeti", experience: "Arriving in the central plains is part of the experience: every transfer can become a game drive. Keep your camera ready for lions, giraffe, zebra and the smaller moments that make the Serengeti feel alive.", mealPlan: "Full Board", stays: [
      { property: "Karibu River Camp", tier: "Mid-range", image: "accommodations/karibu-river-camp.jpg", alt: "Karibu River Camp tented suite" },
      { property: "Meliá Serengeti Lodge", tier: "Luxury", image: "accommodations/melia-serengeti-lodge.jpg", alt: "Meliá Serengeti Lodge" },
    ] as TripStayOption[] },
    { title: "Northern Serengeti", copy: "Explore Northern Serengeti and the Mara River region, where seasonal migration movements shape the day’s route.", image: "figma-safari-packages-trip-card1.png", alt: "Wildebeest and zebra in Northern Serengeti", experience: "Spend time around the northern plains and river country with the flexibility to follow wildlife. From July to October, wildebeest and zebra may gather near the Mara River, but crossings and sightings are always guided by nature rather than a timetable.", mealPlan: "Full Board", stays: [
      { property: "Karibu River Camp", tier: "Mid-range", image: "accommodations/karibu-river-camp.jpg", alt: "Karibu River Camp accommodation" },
      { property: "Lemala Kuria Hills", tier: "Luxury", image: "accommodations/lemala-kuria-hills.jpg", alt: "Lemala Kuria Hills accommodation" },
    ] as TripStayOption[] },
    { title: "Northern Serengeti to Arusha", copy: "Take a final morning in the north before beginning the return journey to Arusha. Your exact travel arrangement is confirmed with the team.", image: "figma-trips-hero.png", alt: "Northern Tanzania safari landscape", experience: "Use the final drive to reflect on the landscapes, wildlife and people you have met along the way. Your team can help with onward travel details and a smooth connection to the next part of your journey.", mealPlan: "Breakfast", stays: [
      { property: "Mount Meru Hotel", tier: "Mid-range", image: "accommodations/mount-meru-hotel.jpg", alt: "Mount Meru Hotel in Arusha" },
      { property: "Gran Meliá Arusha", tier: "Luxury", image: "accommodations/gran-melia-arusha.jpg", alt: "Gran Meliá Arusha" },
    ] as TripStayOption[] },
  ];
  const allDaysOpen = openDays.size === days.length;
  useEffect(() => {
    if (!mapOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMapOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mapOpen]);
  const environments = data?.landscapes.map(item => ({ icon: item.icon, title: item.title, altitude: item.descriptor, photo: item.image.src, copy: item.description }));
  const inclusionChapters = data?.inclusionGroups ?? tripInclusionChapters;
  const currentTrip = trips.find(trip => trip.href === `/trips/${slug}`);
  const tripsByHref = new Map(trips.map(trip => [trip.href, trip]));
  const selectedTrips = [
    ...(data?.relatedTrips || []).map(related => tripsByHref.get(related.href)).filter((trip): trip is CmsTripCard => Boolean(trip)),
    ...trips.filter(trip => trip.href !== `/trips/${slug}` && (!currentTrip || trip.categories.some(category => currentTrip.categories.includes(category)))),
  ];
  const seenRelatedHrefs = new Set<string>();
  const relatedTripCards: Card[] = selectedTrips.filter(trip => {
    if (trip.href === `/trips/${slug}` || seenRelatedHrefs.has(trip.href)) return false;
    seenRelatedHrefs.add(trip.href);
    return true;
  }).slice(0, 3).map(trip => ({
    title: trip.title,
    copy: trip.categories.join(" • "),
    note: `${trip.days} ${trip.days === 1 ? "DAY" : "DAYS"}`,
    image: trip.src,
    href: trip.href,
    price: trip.price,
  }));
  const mapImage = data?.map.src ?? image("tanzania-national-parks-map.png");
  const mapAlt = data?.map.alt || "Map of Tanzania showing its national parks";
  return <><section className="trip-ref-hero" id="general"><Photo src={data?.heroImage.src ?? image("figma-trips-hero.png")} alt={data?.heroImage.alt || ""} priority sizes="100vw" /><div className="trip-ref-hero-shade" /><Header active="Home" variant="classic" /><div className="shell trip-ref-hero-copy"><Link className="trip-ref-back-link" href="/trips"><span className="trip-ref-back-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg></span>Back to trips</Link><p>{data ? (data.startingPrice ? <>From <b>{data.startingPrice}</b></> : <b>Price on request</b>) : <>From <b>$1,732</b></>}</p><h1>{data?.title ?? "6-Day Northern Serengeti River Crossing Safari"}</h1><p>{data?.heroSummary ?? "A migration-focused safari through Tarangire, Central Serengeti, Northern Serengeti and Ngorongoro, with a full day at the Mara River."}</p><div className="trip-ref-rating"><TripadvisorLogo light compact /><small>5.0 <RatingStars size={14} /></small></div></div></section>
    <TripSectionNav />
    <main><section className="ref-section ref-dark trip-ref-overview" id="overview"><div className="shell"><div><h2>{data?.title ?? "6-Day Northern Serengeti River Crossing Safari"}</h2>{data?.overviewParagraphs?.length ? data.overviewParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>) : <><p>Experience Tanzania’s Great Migration on this 6-day safari through Tarangire, Central Serengeti, Northern Serengeti and Ngorongoro Crater. Designed around the river-crossing season, the journey includes a full day exploring Northern Serengeti and the Mara River, where wildebeest and zebra gather in dramatic numbers.</p><p>From the elephant-filled plains of Tarangire to the dramatic Mara River and the endless Serengeti, this safari brings together Tanzania’s unforgettable landscapes, diverse wildlife and the extraordinary spectacle of the Great Migration.</p></>}<TripFacts itineraryFor={data?.itineraryFor} travelDatesText={data?.travelDatesText} guestsText={data?.guestsText} /></div><TripOverviewSlider images={data?.overviewImages?.length ? data.overviewImages : [{ src: image("figma-safari-destinations-destination-photograph.png"), alt: "Hot-air balloons over the Serengeti at sunset" }]} /></div></section>
<section className="ref-section trip-ref-itinerary" id="itinerary"><div className="shell"><aside><div className="trip-ref-itinerary-sticky"><button type="button" className="trip-ref-map-button" onClick={() => setMapOpen(true)} aria-haspopup="dialog"><Photo src={mapImage} alt={mapAlt} /><span className="trip-ref-map-hint">Tap for a closer look <Image src={image("figma-trips-map-search.svg")} alt="" width={20} height={20} /></span></button><h3>Destinations Included</h3><ul>{(data?.destinations ?? ["Tarangire National Park", "Ngorongoro Crater", "Central Serengeti", "Northern Serengeti – Mara River"]).map(destination => <li key={destination}>{destination}</li>)}</ul><div className="trip-ref-quote"><div className="trip-ref-quote-heading"><Image src={image("figma-trips-quote-plan.svg")} alt="" width={20} height={18} /><span>Plan Trip</span></div><h3>{data?.planningTitle ?? "Experience the 6-Day Northern Serengeti Safari for yourself."}</h3><p>{data?.planningDescription ?? "Speak with a senior planner for a thoughtful first proposal built around your dates and priorities."}</p><div className="trip-ref-quote-actions"><Link href="/plan-your-trip" className="trip-ref-quote-button">Request a Quote<Image src={image("figma-trips-quote-arrow.svg")} alt="" width={34} height={34} /></Link><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="trip-ref-quote-whatsapp"><Image src={image("figma-trips-quote-whatsapp.svg")} alt="" width={31} height={31} />WhatsApp Us</a></div></div></div></aside><div><div className="trip-ref-itinerary-title"><h2>Itinerary</h2><button type="button" aria-expanded={allDaysOpen} onClick={()=>setOpenDays(allDaysOpen ? new Set() : new Set(days.map((_, index) => index)))}>{allDaysOpen ? "Collapse All Days" : "Show All Days"}</button></div>{days.map((day,i)=><details key={day.title} open={openDays.has(i)}><summary onClick={(event)=>{event.preventDefault();setOpenDays(current=>{const next=new Set(current);if(next.has(i))next.delete(i);else next.add(i);return next;});}}><span className="trip-ref-day-number">Day {i+1}</span><span className="trip-ref-day-dot" aria-hidden="true" /><span className="trip-ref-day-name">{day.title}</span><Image className="trip-ref-day-chevron" src={image("figma-trips-itinerary-chevron.svg")} alt="" width={50} height={50} /></summary><p>{day.copy}</p>{(day.image || day.experience) && <div className="trip-ref-day-experience">{day.image && <Photo src={contentImage(day.image)} alt={day.alt} />}{day.experience && <p>{day.experience}</p>}</div>}{day.stays.length > 0 && <TripAccommodation day={i+1} mealPlan={day.mealPlan} options={day.stays} />}</details>)}</div></div></section>
      {mapOpen && <div className="trip-ref-map-modal" role="dialog" aria-modal="true" aria-label={mapAlt}><button type="button" className="trip-ref-map-backdrop" aria-label="Close map" onClick={() => setMapOpen(false)} /><div className="trip-ref-map-modal-panel"><button type="button" className="trip-ref-map-close" aria-label="Close map" onClick={() => setMapOpen(false)}>×</button><Photo src={mapImage} alt={`Expanded ${mapAlt}`} /></div></div>}
      {data?.practicalInformation.length ? <section className="ref-section trip-ref-practical"><div className="shell"><Intro eyebrow="BEFORE YOU GO" title="Practical information" copy="Useful details from the published trip plan to help you prepare for the day." /><div className="trip-ref-practical-grid">{data.practicalInformation.map(item => <article key={item.key}><span aria-hidden="true">✓</span><div><h3>{item.title}</h3><p>{item.details}</p></div></article>)}</div></div></section> : null}
      <TripEnvironments title={data?.landscapesTitle} environments={environments} />
      <section className="ref-section trip-ref-inclusions" id="inclusions"><div className="shell"><Intro eyebrow={data?.inclusionsEyebrow ?? "YOUR SAFARI, TAKEN CARE OF"} title={data?.inclusionsTitle ?? "What’s included in your safari"} copy={data?.inclusionsDescription ?? "Use this checklist when planning your enquiry. All package details are subject to confirmation in your quote."} /><div className="trip-ref-chapters">{inclusionChapters.map(chapter=><article className="trip-ref-chapter" key={chapter.title}><div className="trip-ref-chapter-heading"><span>{chapter.marker}</span><h3>{chapter.title}</h3><p>{chapter.description}</p></div><div className="trip-ref-chapter-items">{chapter.items.map(item=><div className="trip-ref-chapter-item" key={item.title}><Image src={image(item.icon === "users" ? "figma-kili-value-users.svg" : item.icon === "shield" ? "figma-kili-value-shield.svg" : `figma-trips-inclusion-${item.icon}.svg`)} alt="" width={24} height={24} /><h4>{item.title}</h4><p>{item.description}</p></div>)}</div></article>)}</div></div></section>
      {data?.notIncluded.length ? <section className="ref-section trip-ref-exclusions"><div className="shell"><Intro eyebrow="EXCLUSIONS" title="What’s not included" copy="Plan for these items separately unless your final written proposal specifically includes them." /><ul>{data.notIncluded.map(item => <li key={item}><span aria-hidden="true">×</span><span>{item}</span></li>)}</ul></div></section> : null}
      <CtaBanner
        title={data?.title ? `Plan your ${data.title}` : "Plan your Tanzania journey"}
        text="Share your preferred dates, travel style and priorities. Our local team will shape the route, pace and details around your journey."
        image={data?.heroImage.src ?? image("figma-safari-why-image2.png")}
        centerImage={data?.overviewImages[0]?.src ?? data?.heroImage.src ?? image("figma-safari-why-image2.png")}
      />
      <Testimonials />
      {relatedTripCards.length > 0 && <ImageCards eyebrow="Related Trips" title="You Might Also Like" cards={relatedTripCards} variant="climbs" className="trip-ref-related" />}
      <TripFaq /></main><Footer /></>;
}
