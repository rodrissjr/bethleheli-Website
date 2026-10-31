"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { PageKey } from "@/lib/routes";
import { sendEnquiry } from "@/lib/enquiry";
import { whatsappHref, whatsappNumber } from "@/lib/whatsapp";
import { HomeFooter } from "@/components/home-footer";
import type { CmsGroupDeparture } from "@/sanity/content-types";

const navItems = [
  ["Home", "/"], ["Kilimanjaro", "/kilimanjaro"], ["Safari", "/safari"], ["Zanzibar", "/zanzibar"], ["Trips", "/trips"],
  ["Group Climbs", "/groups"], ["Contact", "/contact"],
] as const;
const navSubmenus: Record<string, readonly (readonly [string, string])[]> = {
  Kilimanjaro: [["Kilimanjaro overview", "/kilimanjaro"], ["Machame Route", "/kilimanjaro/machame-route"], ["Lemosho Route", "/kilimanjaro/lemosho-route"], ["Marangu Route", "/kilimanjaro/marangu-route"], ["Rongai Route", "/kilimanjaro/rongai-route"], ["Northern Circuit", "/kilimanjaro/northern-circuit"], ["Umbwe Route", "/kilimanjaro/umbwe-route"], ["Group climbs", "/groups"]],
  Trips: [["All trips", "/trips"], ["Zanzibar", "/trips?category=Zanzibar"], ["Safari", "/trips?category=Safari"], ["Kilimanjaro", "/trips?category=Kilimanjaro"]],
};
const mobileNavItems = [
  ["Home", "/"], ["Kilimanjaro", "/kilimanjaro"], ["Safari", "/safari"], ["Zanzibar", "/zanzibar"], ["Trips", "/trips"],
  ["Group Climbs", "/groups"], ["Contact", "/contact"],
] as const;

const photos = {
  summit: "/images/figma-home-hero.png",
  climbers: "/images/figma-kili-intro-climbers-above-the-clouds.png",
  trail: "/images/figma-faq-hero.png",
  team: "/images/home-06.png",
  guide: "/images/home-07.png",
  silhouette: "/images/home-14.jpg",
  cheetah: "/images/home-15.jpg",
  safari: "/images/figma-safari-hero.png",
  safari2: "/images/safari-03.jpg",
  safari3: "/images/safari-04.jpg",
  safari4: "/images/safari-06.jpg",
  zanzibar: "/images/figma-zanzibar-hero.png",
  beach: "/images/zanzibar-03.jpg",
  coast: "/images/zanzibar-04.jpg",
  stoneTown: "/images/zanzibar-05.jpg",
  ocean: "/images/zanzibar-06.jpg",
  plan: "/images/figma-plan-hero.png",
};

export function Photo({ src, alt, className = "", priority = false, sizes }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  return <Image className={className} src={src} alt={alt} width={1200} height={800} sizes={sizes || (className.includes("hero") ? "100vw" : "(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw")} loading={priority ? "eager" : "lazy"} />;
}

export function ArrowIcon() { return <svg className="arrow-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M5 15 15 5M6 5h9v9" /></svg>; }
function Arrow() { return <span className="arrow" aria-hidden="true"><ArrowIcon /></span>; }
export function RatingStars({ size = 16 }: { size?: number }) {
  return <span className="rating-stars" role="img" aria-label="5 out of 5 stars">{Array.from({ length: 5 }, (_, index) => <svg key={index} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m10 1.8 2.48 5.03 5.55.81-4.02 3.91.95 5.53L10 14.47l-4.96 2.61.95-5.53-4.02-3.91 5.55-.81L10 1.8Z" /></svg>)}</span>;
}
function Stars({ summary = false }: { summary?: boolean }) { return <Image className="figma-review-stars" src={summary ? "/images/figma-testimonial-rating-summary.svg" : "/images/figma-testimonial-stars.svg"} alt="5 out of 5 stars" width={summary ? 114 : 96} height={summary ? 18 : 16} />; }

export function PrimaryLink({ href = "/plan-your-trip", children = "Start planning", dark = false, onClick }: { href?: string; children?: React.ReactNode; dark?: boolean; onClick?: () => void }) {
  return <Link href={href} className={`button ${dark ? "button-dark" : ""}`} onClick={onClick}>{children}<Arrow /></Link>;
}

function Logo({ onClick }: { onClick?: () => void } = {}) {
  return <Link href="/" className="logo" aria-label="Betheli Expeditions home" onClick={onClick}><Image src="/images/logo.png" alt="Betheli Expeditions" width={1672} height={940} loading="eager" /></Link>;
}

export function TripadvisorLogo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return <Image className={`tripadvisor-logo${light ? " tripadvisor-logo-light" : ""}${compact ? " tripadvisor-logo-compact" : ""}`} src="/images/tripadvisor-logo.svg" alt="Tripadvisor" width={211} height={34} />;
}

function navigationItemIsCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/kilimanjaro") return pathname === href || pathname.startsWith("/kilimanjaro/");
  if (href === "/trips") return pathname === href || pathname.startsWith("/trips/");
  return pathname === href;
}

export function Header({ overlay = true, variant }: { overlay?: boolean; active?: string; variant?: "destinations" | "classic" }) {
  const [open, setOpen] = useState(false);
  const [routesOpen, setRoutesOpen] = useState(false);
  const [tripsOpen, setTripsOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // All pages use the same route map. The previous classic/destinations split
  // made the menu appear to change from page to page and could mark the wrong
  // item as active after a client-side transition.
  const items = navItems;

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const closeMenu = () => {
      setOpen(false);
      toggleRef.current?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      } else if (event.key === "Tab" && drawerRef.current) {
        const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>("button, a[href]"));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!drawerRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first?.focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    const onResize = () => {
      if (window.innerWidth > 900) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("popstate", closeMenu);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("popstate", closeMenu);
    };
  }, [open]);

  return <><header className={`site-header ${overlay ? "site-header-overlay" : "site-header-solid"}${variant ? ` site-header-${variant}` : ""}`}>
    <div className="shell header-inner">
      <Logo />
      <button ref={toggleRef} type="button" className="menu-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(value => !value)}><span /><span /><span /></button>
      <nav id="main-nav" className="main-nav" aria-label="Main navigation">
        {items.map(([label, href]) => {
          const current = navigationItemIsCurrent(pathname, href);
          if (label === "Kilimanjaro") return <div className={`nav-menu-item${current ? " active" : ""}`} key={label}><Link href={href} aria-current={current ? "page" : undefined}>{label}</Link><button type="button" aria-label="Show Kilimanjaro routes" aria-expanded={routesOpen} aria-controls="desktop-routes-menu" onClick={() => setRoutesOpen(value => !value)}><span aria-hidden="true">⌄</span></button><div className={`nav-submenu${routesOpen ? " open" : ""}`} id="desktop-routes-menu">{navSubmenus.Kilimanjaro.slice(0, -1).map(([routeLabel, routeHref]) => <Link key={routeHref} href={routeHref} aria-current={pathname === routeHref ? "page" : undefined} onClick={() => setRoutesOpen(false)}>{routeLabel}<ArrowIcon /></Link>)}</div></div>;
          if (label === "Trips") return <div className={`nav-menu-item${current ? " active" : ""}`} key={label}><Link href={href} aria-current={current ? "page" : undefined}>{label}</Link><button type="button" aria-label="Show trip categories" aria-expanded={tripsOpen} aria-controls="desktop-trips-menu" onClick={() => setTripsOpen(value => !value)}><span aria-hidden="true">⌄</span></button><div className={`nav-submenu nav-submenu-trips${tripsOpen ? " open" : ""}`} id="desktop-trips-menu">{navSubmenus.Trips.map(([tripLabel, tripHref]) => <Link key={tripHref} href={tripHref} onClick={() => setTripsOpen(false)}>{tripLabel}<ArrowIcon /></Link>)}</div></div>;
          return <Link key={href} href={href} aria-current={current ? "page" : undefined} className={current ? "active" : undefined}>{label}</Link>;
        })}
      </nav>
      <PrimaryLink href="/plan-your-trip">Plan Your Trip</PrimaryLink>
    </div>
  </header>{open && createPortal(<div className="mobile-menu">
    <button type="button" className="mobile-menu-backdrop" aria-label="Close navigation" tabIndex={-1} onClick={() => { setOpen(false); toggleRef.current?.focus(); }} />
    <div className="mobile-menu-drawer" ref={drawerRef} id="mobile-nav" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="mobile-menu-head"><Logo onClick={() => setOpen(false)} /><button ref={closeRef} type="button" className="mobile-menu-close" aria-label="Close navigation" onClick={() => { setOpen(false); toggleRef.current?.focus(); }}><span /><span /></button></div>
      <p className="mobile-menu-eyebrow">Explore Betheli</p>
      <nav className="mobile-menu-links" aria-label="Mobile navigation links">
        {mobileNavItems.map(([label, href], index) => {
          const current = navigationItemIsCurrent(pathname, href);
          return <Link key={href} href={href} aria-current={current ? "page" : undefined} className={current ? "active" : undefined} onClick={() => setOpen(false)}><span className="mobile-menu-number">{String(index + 1).padStart(2, "0")}</span><span>{label}</span><ArrowIcon /></Link>;
        })}
      </nav>
      <details className="mobile-route-menu">
        <summary>Kilimanjaro routes <span aria-hidden="true">⌄</span></summary>
        <div>{navSubmenus.Kilimanjaro.slice(1, -1).map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}<ArrowIcon /></Link>)}</div>
      </details>
      <details className="mobile-route-menu mobile-trip-menu">
        <summary>Trip categories <span aria-hidden="true">⌄</span></summary>
        <div>{navSubmenus.Trips.slice(1).map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowIcon /></Link>)}</div>
      </details>
      <div className="mobile-menu-footer"><PrimaryLink href="/plan-your-trip" onClick={() => setOpen(false)}>Plan Your Trip</PrimaryLink><p>Your journey, your pace. Planned with a local team.</p></div>
    </div>
  </div>, document.body)}</>;
}

/** Adds a restrained entrance treatment after an element enters the viewport.
 * Keeping the class client-only means the page remains fully readable without
 * JavaScript or for visitors who prefer reduced motion. */
export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const selectors = [
      ".ref-section .ref-intro", ".ref-section .ref-intro-split", ".ref-section .ref-image-card",
      ".home-ref-styles article", ".home-ref-select-card", ".home-ref-story > .shell",
      ".testimonial-section .testimonials-heading", ".testimonial-section .review-card", ".cta-banner",
      ".contact-layout", ".plan-layout",
    ].join(",");
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });

    nodes.forEach((node, index) => {
      node.classList.remove("is-revealed");
      node.classList.add("scroll-reveal");
      node.style.setProperty("--reveal-delay", `${Math.min(index % 5, 3) * 55}ms`);
      observer.observe(node);
    });
    return () => {
      observer.disconnect();
      nodes.forEach((node) => {
        node.classList.remove("scroll-reveal", "is-revealed");
        node.style.removeProperty("--reveal-delay");
      });
    };
  }, [pathname]);

  return null;
}

export function Footer() {
  return <HomeFooter />;
}

export function Hero({ eyebrow, title, text, image, children, short = false }: { eyebrow?: string; title: string; text: string; image: string; children?: React.ReactNode; short?: boolean }) {
  return <section className={`hero ${short ? "hero-short" : ""}`}>
    <Photo src={image} alt="" priority className="hero-image" sizes="100vw" />
    <div className="hero-scrim" />
    <Header overlay />
    <div className="shell hero-content">
      {eyebrow && <p className="eyebrow light">{eyebrow}</p>}
      <h1>{title}</h1><p>{text}</p>
      <div className="hero-actions">{children || <><PrimaryLink /><Link className="ghost-button" href="/groups">Explore the mountain <Arrow /></Link></>}</div>
    </div>
  </section>;
}

function TrustRow() { return <div className="trust-row"><span>✦ TripAdvisor</span><Stars /><i /> <span>Trusted local team</span><i /><span>Flexible planning</span><i /><span>24/7 support</span></div>; }

export function SectionIntro({ eyebrow, title, text, align = "center" }: { eyebrow?: string; title: string; text?: string; align?: "center" | "left" }) {
  return <div className={`section-intro ${align}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{text && <p>{text}</p>}</div>;
}

const styles = [
  { title: "SOLE ESCAPE", text: "A personalised safari designed around your pace, interests, and comfort.", image: "/images/figma-home-style1.png", href: "/plan-your-trip" },
  { title: "PRIVATE GROUP", text: "A private climb and itinerary for your friends, family, or team.", image: "/images/figma-home-style2.png", href: "/plan-your-trip" },
  { title: "JOIN A GROUP", text: "Join a small group and share the safari adventure with fellow travellers.", image: "/images/figma-home-style3.png", href: "/groups" },
];

export function StyleCards() { return <div className="style-grid">{styles.map((item) => <article className="style-card" key={item.title}><Photo src={item.image} alt="" /><div /><h3>{item.title}</h3><p>{item.text}</p><Link href={item.href}>Start planning <Arrow /></Link></article>)}</div>; }

function StatRow() { return <div className="stat-row"><div><strong>5,895 m</strong><span>Uhuru Peak, the Roof of Africa</span></div><div><strong>94 %</strong><span>of our travellers reach the summit</span></div><div><strong>7 - 9 day</strong><span>climbs for better acclimatisation</span></div><div><strong>$2,399</strong><span>guide price for a climb</span></div></div>; }

const destinations = [
  { title: "Lemosho Route", subtitle: "A wild beginning / 8 days", image: photos.trail, href: "/kilimanjaro/lemosho-route" },
  { title: "Machame Route", subtitle: "The whisky route / 7 days", image: photos.summit, href: "/kilimanjaro/machame-route" },
  { title: "Serengeti", subtitle: "Wildlife in its element", image: photos.safari, href: "/safari" },
  { title: "Zanzibar Island", subtitle: "A slower, brighter finish", image: photos.zanzibar, href: "/zanzibar" },
];

function DestinationCards({ items = destinations }: { items?: { title: string; subtitle: string; image: string; href: string }[] }) {
  return <div className="destination-grid">{items.map((item) => <Link className="destination-card" href={item.href} key={item.title}><Photo src={item.image} alt={item.title} /><div /><span>{item.subtitle}</span><h3>{item.title}</h3><b>View journey <Arrow /></b></Link>)}</div>;
}

const reviews = [
  { name:"Viktor", date:"January 2026 • Friends", category:"Tanzania Safari", quote:"Tanzania is a beautiful and amazing country!", copy:"Every minute of the safari was fantastic and impressive, we left satisfied and are already planning to return. It was professionally organized, congratulations! Sam, our guide, demonstrated exceptional professional expertise, and it was a pleasure to listen to him during the daily tours.", tags:["Friends","Safari","Expert guide"], image:"/images/tripadvisor-review-viktor-safari-group.jpg", avatar:"/images/tripadvisor-avatar-viktor.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r1047816995-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Kata", date:"January 2025 • Solo", category:"Marangu Route", quote:"Unforgettable Adventure with Betheli Expeditions", copy:"Our guides were incredible — they were experienced, knowledgeable, and made sure we were well taken care of every step of the way. The hike itself is beautiful, with lush rainforests, alpine meadows, and spectacular views of the mountain.", tags:["Solo traveler","Kilimanjaro","Marangu Route"], image:"/images/tripadvisor-review-kata.jpg", avatar:"/images/tripadvisor-avatar-kata.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r995364646-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Elena P", date:"January 2025 • Friends", category:"Mount Kilimanjaro", quote:"Beautiful experience on Mount Kilimanjaro", copy:"Unique and indescribable experience as beautiful as , we spent 5 days trekking on Mount Kilimanjaro and our guides and all of them were unique and really good in accompanying us in this adventure! Rating 10, thank you!!!", tags:["Friends","5-day trek","Kilimanjaro"], image:"/images/tripadvisor-review-elena.jpg", avatar:"/images/tripadvisor-avatar-elena.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r994236487-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Daniela B", date:"October 2019 • Friends", category:"Machame Route", quote:"Kilimanjaro trekking Machame Route 7 days", copy:"Wonderful trekking and fantastic team. We met serious, kind and specialized people. They attended us on the trek making us feel at home. All of us reached the top of the mountain!!! I highly recommend Betheli expedition", tags:["Friends","7-day trek","Machame Route"], image:"/images/tripadvisor-review-daniela.jpg", avatar:"/images/tripadvisor-avatar-daniela.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r718855459-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Islastyle6", date:"June 2019 • Friends", category:"Mount Meru", quote:"Great trip with wonderful guides, chefs and porters!", copy:"Our trip up Mt. Meru with Richard, Paul, Kennedy and all the guides and porters was excellent. Betheli Expedition staff catered to our every need and request with no complaints and always with a smile on their faces. We were a group of 12 women on our yearly trek together and we truly enjoyed ourselves!", tags:["Friends","Mount Meru","Group trek"], image:"/images/tripadvisor-review-islastyle.jpg", avatar:"/images/tripadvisor-avatar-islastyle.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r682066448-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Ralph T", date:"March 2019 • Couples", category:"Mount Meru", quote:"A great trip to the top of Mount Meru", copy:"Betheli organised a fantastic trek up to the top of Mount Meru at short notice. We were supported on the trip by a fantastic team - led by our guide Richard - who provided tasty food, carried everything we could possibly need, kept us going up the tricky climb, and even taught us some Swahili along the way!", tags:["Couples","Mount Meru","Summit trek"], image:"/images/tripadvisor-review-ralph.jpg", avatar:"/images/tripadvisor-avatar-ralph.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r663221493-Betheli_Expeditions-Arusha_Arusha_Region.html" },
  { name:"Arpad B", date:"February 2026 • Friends", category:"Kilimanjaro", quote:"Amazing trip with amazing people", copy:"Very well organized, professional, helpful, dedicated team, ready to fulfill each request at any time with experienced and devoted guides.", tags:["Friends","Professional team","5-star review"], image:"/images/tripadvisor-review-arpad-summit.jpg", avatar:"/images/tripadvisor-avatar-arpad.jpg", url:"https://www.tripadvisor.com/ShowUserReviews-g297913-d16714059-r1050280462-Betheli_Expeditions-Arusha_Arusha_Region.html" },
];
const groupClimbReviews = reviews.filter(review => review.category !== "Tanzania Safari");

export function Testimonials({ groupClimbsOnly = false, title = "What our customers say", text = "Real stories from travelers who climbed, explored, and relaxed with Betheli Expeditions." }: { groupClimbsOnly?: boolean; title?: string; text?: string } = {}) {
  const reviewItems = groupClimbsOnly ? groupClimbReviews : reviews;
  const scroller = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(0);
  const [activeReview, setActiveReview] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);
  const updatePosition = () => {
    const viewport = scroller.current;
    if (!viewport) return;
    const maxScroll = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
    const nextPosition = viewport.scrollLeft / maxScroll;
    const cards = Array.from(viewport.children).filter((child): child is HTMLElement => child instanceof HTMLElement && child.classList.contains("review-card"));
    const firstOffset = cards[0]?.offsetLeft ?? 0;
    const targetOffset = viewport.scrollLeft + firstOffset;
    const nextReview = viewport.scrollLeft >= maxScroll - 2 ? cards.length - 1 : cards.reduce((closestIndex, card, index) => {
      const closest = cards[closestIndex];
      return Math.abs(card.offsetLeft - targetOffset) < Math.abs(closest.offsetLeft - targetOffset) ? index : closestIndex;
    }, 0);
    setPosition(nextPosition);
    setActiveReview(nextReview);
  };
  useEffect(() => {
    const viewport = scroller.current;
    if (!viewport) return;
    const updateOverflow = () => {
      const scrollable = viewport.scrollWidth - viewport.clientWidth > 4;
      setHasOverflow(scrollable);
      if (!scrollable) {
        setPosition(0);
        setActiveReview(0);
      }
    };
    updateOverflow();
    viewport.scrollLeft = 0;
    setPosition(0);
    setActiveReview(0);
    const observer = new ResizeObserver(updateOverflow);
    observer.observe(viewport);
    window.addEventListener("resize", updateOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateOverflow);
    };
  }, []);
  const seek = (percent: number) => {
    const viewport = scroller.current;
    if (!viewport) return;
    const next = Math.max(0, Math.min(100, percent)) / 100;
    setPosition(next);
    setActiveReview(Math.round(next * (reviewItems.length - 1)));
    viewport.scrollTo({ left: next * Math.max(0, viewport.scrollWidth - viewport.clientWidth), behavior: "smooth" });
  };
  const progress = 25 + position * 75;
  return <section className="testimonial-section"><div className="shell"><div className="testimonials-heading"><SectionIntro eyebrow="" title={title} text={text} align="left" /><div className="testimonial-rating-summary"><div className="testimonial-rating-copy"><strong>5.0 Reviews</strong><small>23 verified reviews</small></div><Stars summary /></div></div><div className="review-grid" ref={scroller} onScroll={updatePosition}>{reviewItems.map(review => <article className="review-card" key={review.name}><div className="review-visual"><Photo src={review.image} alt={`Traveler photo from ${review.name}'s review`} /><span>{review.category}</span></div><div className="review-copy"><div className="review-person"><Photo src={review.avatar} alt={`${review.name}'s TripAdvisor profile picture`} /><div><div className="review-stars"><Stars /> <b>5.0</b></div><strong>{review.name}</strong><small>{review.date}</small></div></div><h3>“{review.quote}”</h3><p>{review.copy}</p><div className="review-tags">{review.tags.map(tag => <span key={tag}>{tag}</span>)}</div><footer><Photo src="/images/home-12.png" alt="" /><a href={review.url} target="_blank" rel="noopener noreferrer">Read full review on Trip Advisor</a></footer></div></article>)}</div>{hasOverflow && <div className="review-controls" aria-label="Review carousel controls"><input type="range" min="0" max="100" value={Math.round(position * 100)} aria-label="Review slider position" aria-valuetext={`${activeReview + 1} of ${reviewItems.length} reviews`} onChange={event => seek(Number(event.target.value))} style={{ background: `linear-gradient(90deg,#fff 0 ${progress}%,rgba(255,255,255,.16) ${progress}% 100%)` }} /><span className="review-count" aria-live="polite">{activeReview + 1} of {reviewItems.length} reviews</span></div>}</div></section>;
}

const commonFaqs = [
  ["What is included in the package price?", "Every trip is planned around your dates, interests and group. The final inclusions are confirmed in a written proposal before booking."],
  ["Is airfare included in the package price?", "Airfare is confirmed separately as part of your final itinerary."],
  ["Is there flexibility in the package price?", "Yes. The route, trip length and accommodation choices can be discussed with the local team."],
  ["Can I combine Kilimanjaro, safari and Zanzibar?", "You can discuss all three in one journey. Total duration, recovery time, transport connections and arrangements are confirmed with the team."],
  ["What should I pack and wear?", "Your team will share the appropriate guidance for the journey you are planning."],
  ["Can beginners climb or dive?", "Ask the local team about the pace, preparation and experience level that suits your journey."],
];

export function Accordion({ items = commonFaqs, openCount = 1 }: { items?: string[][]; openCount?: number }) {
  const container = useRef<HTMLDivElement>(null);
  // Browsers can restore native <details> state before React hydrates a page.
  // Reapply the intended initial state once mounted, including after a FAQ tab changes.
  useEffect(() => {
    container.current?.querySelectorAll("details").forEach((details, index) => {
      details.open = index < openCount;
    });
  }, [items, openCount]);
  return <div className="accordion" ref={container}>{items.map(([question, answer], index) => <details key={`${question}-${index}`} suppressHydrationWarning open={index < openCount}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>;
}

export function CtaBanner({ title = "Ready to Climb Kilimanjaro?", text = "Experience breathtaking sunrises, explore volcanic landscapes, and create memories at one of Africa’s most iconic destinations.", image = "/images/figma-kili-group-trip-landscape3.png", centerImage }: { title?: string; text?: string; image?: string; centerImage?: string }) {
  return <section className="shell cta-wrap"><div className="cta-banner"><Photo src={image} alt="" sizes="(max-width: 700px) 100vw, 1200px" /><div /><section><h2>{title}</h2><p>{text}</p><PrimaryLink /></section><aside><Photo src={centerImage || image} alt="Tanzania expedition landscape" /><span>Betheli Expeditions is a proud Tanzanian owned tour operator company.</span></aside><Photo className="cta-brand" src="/images/logo.png" alt="" /></div></section>;
}

function HomePage() { return <><Hero title="Climbing Kilimanjaro is an experience of a lifetime" text="Three routes, chosen because they give you the acclimatisation days the mountain actually demands. Guides who have walked them since they were teenagers. And when your legs are done, the Serengeti and Zanzibar are a short flight away." image={photos.summit}><PrimaryLink /><Link className="ghost-button" href="/groups">See group climbs <Arrow /></Link></Hero><TrustRow />
  <main><section className="shell space"><SectionIntro eyebrow="TRAVEL YOUR WAY" title="Choose your travel style" text="Whether you want to travel your own way or with a group, explore Tanzania independently, choose the setup that fits your journey." align="left" /><StyleCards /><StatRow /></section>
  <section className="gallery-section"><SectionIntro eyebrow="DISCOVER TANZANIA" title="Unforgettable Moments in the Heart of Mount Kilimanjaro" text="Experience breathtaking sunrises, explore volcanic landscapes, and create memories at one of Africa’s most iconic destinations." /><div className="scattered-gallery"><Photo src={photos.summit} alt="Snowy Kilimanjaro" /><Photo src={photos.trail} alt="Hikers on a mountain trail" /><Photo src={photos.team} alt="Kilimanjaro group" /><Photo src={photos.safari} alt="Tanzania wildlife" /><Photo src={photos.zanzibar} alt="Zanzibar coast" /></div></section>
  <section className="dark-section route-section"><div className="shell route-layout"><div className="map-card"><div className="map-line">⌁<span>Uhuru Peak</span><span>Karanga Camp</span><span>Barafu Camp</span><span>Millennium Camp</span></div></div><div><p className="eyebrow light">KILIMANJARO CLIMBS</p><h2>Routes that we offer</h2><ol><li>Rongai Route</li><li>Lemosho Route <p>The Lemosho Route begins on the quiet western side of Kilimanjaro. It is known for its spectacular scenery and excellent acclimatisation.</p></li><li>Machame Route</li><li>Northern Circuit Route</li><li>Marangu Route</li></ol><PrimaryLink href="/kilimanjaro" /></div></div></section>
  <section className="shell space adventures"><SectionIntro eyebrow="FIND YOUR ADVENTURE" title="Kilimanjaro, Safari and Zanzibar" text="Choose the route, the wildlife and the coast that will make your journey yours." align="left" /><DestinationCards /></section>
  <section className="story-section"><div className="shell story-grid"><div className="story-images"><Photo src={photos.guide} alt="Betheli guide" /><Photo src={photos.safari} alt="Tanzania safari" /><blockquote>Betheli Expeditions is a proud Tanzanian owned tour operator company.</blockquote></div><div><p className="eyebrow">OUR STORY</p><h2>Your Trusted Guide to the Heart of Africa</h2><p>Betheli Expeditions is a proud Tanzanian-owned tour operator company, rooted in the ancient and revered Maasai tribe, known for our unwavering passion and deep reverence for wildlife.</p><p>With over a decade of invaluable experience in the East African tourism industry, we have embarked on a thrilling and challenging journey as the proprietors of Betheli Expeditions.</p><div className="story-stat"><strong>94%</strong><span>of our travellers<br />reach the summit</span></div></div></div></section>
  <Team /><Testimonials /><CtaBanner /><section className="shell faq-preview"><SectionIntro eyebrow="TRAVEL WITH CONFIDENCE" title="Frequently Asked Questions" text="We’ve answered the questions our travellers ask before setting off." align="left" /><Accordion /><Link className="text-link" href="/faq">View all questions <Arrow /></Link></section></main><Footer /></>; }

function Team() { const people = [["Jacqueline Laizer", photos.guide, "Co-Founder of Betheli Expeditions"], ["Jacqueline Laizer", photos.silhouette, "Co-Founder of Betheli Expeditions"], ["Jacqueline Laizer", photos.team, "Co-Founder of Betheli Expeditions"]]; return <section className="shell team-section"><SectionIntro eyebrow="THE PEOPLE BEHIND THE JOURNEY" title="Meet the team" text="The people behind every well-paced journey, from your first question to your return." align="left" /><div className="team-grid">{people.map(([name, image, role], index) => <article key={`${name}-${index}`}><Photo src={image} alt={name} /><h3>{name}</h3><p>{role}</p></article>)}</div></section>; }

type DestinationContent = { page: "kilimanjaro" | "safari" | "zanzibar"; heroTitle: string; heroText: string; eyebrow: string; heroImage: string; intro: string; placesTitle: string; places: { title: string; subtitle: string; image: string; href: string }[]; darkTitle: string; darkText: string; darkImage: string; careTitle: string; careItems: [string, string][]; faqTitle: string; ctaTitle: string };

const destinationContent: Record<"kilimanjaro" | "safari" | "zanzibar", DestinationContent> = {
  kilimanjaro: { page: "kilimanjaro", eyebrow: "KILIMANJARO CLIMBS", heroTitle: "Climb Mount Kilimanjaro", heroText: "Mount Kilimanjaro is more than a mountain. It’s a journey through distinct worlds, guided by a local team that knows every path.", heroImage: photos.silhouette, intro: "Every route, every day and every detail is designed to give you the time, space and support to climb well.", placesTitle: "Which Kilimanjaro Route Is Right for You?", places: [{ title: "Machame Route", subtitle: "The whisky route / 7 days", image: photos.summit, href: "/kilimanjaro/machame-route" }, { title: "Lemosho Route", subtitle: "A longer, quieter approach", image: photos.trail, href: "/kilimanjaro/machame-route" }, { title: "Marangu Route", subtitle: "A classic route with huts", image: photos.climbers, href: "/groups" }, { title: "Rongai Route", subtitle: "A drier northern approach", image: photos.silhouette, href: "/groups" }, { title: "Northern Circuit", subtitle: "The longest route", image: photos.safari, href: "/groups" }, { title: "Umbwe Route", subtitle: "For experienced climbers", image: photos.summit, href: "/groups" }], darkTitle: "Why Climb Kilimanjaro With Us?", darkText: "Climbing is a personal challenge. Our local crew makes room for that experience while looking after the logistics, your pace and every detail that matters on the mountain.", darkImage: photos.team, careTitle: "Your Safety Comes First", careItems: [["Experienced mountain guides", "A local crew that knows the routes, weather and pace of the mountain."], ["Thoughtful acclimatisation", "Routes and days are chosen to give your body time to adapt."], ["Medical support", "Support plans and safety checks are built into each climb."], ["A supportive team", "From your first enquiry through to the final descent." ]], faqTitle: "Kilimanjaro Frequently Asked Questions", ctaTitle: "Ready to Climb Kilimanjaro?" },
  safari: { page: "safari", eyebrow: "TANZANIA SAFARI", heroTitle: "Experience the Wild Side of Tanzania", heroText: "From Serengeti migrations to Tarangire’s baobabs, your safari is shaped around the people, places and pace you want to discover.", heroImage: photos.safari, intro: "We plan around your interests, not around a fixed route. Every Tanzania safari begins with a conversation.", placesTitle: "Where Will Your Safari Take You?", places: [{ title: "Serengeti", subtitle: "Endless plains and wildlife", image: photos.safari, href: "/trips" }, { title: "Ngorongoro Crater", subtitle: "A world within a world", image: photos.safari2, href: "/safari" }, { title: "Tarangire", subtitle: "Baobabs and elephants", image: photos.safari3, href: "/safari" }, { title: "Lake Manyara", subtitle: "A lakeside wild escape", image: photos.safari4, href: "/safari" }, { title: "Arusha National Park", subtitle: "Mountain views nearby", image: photos.trail, href: "/safari" }, { title: "Ruaha", subtitle: "A wilder, quieter south", image: photos.cheetah, href: "/safari" }], darkTitle: "What Makes a Tanzania Safari Special?", darkText: "A safari is not a checklist. It is the light changing across the plains, the quiet in the vehicle and the feeling of sharing a place where wild things still set the rhythm.", darkImage: photos.guide, careTitle: "Comfortable Rides for the Wild", careItems: [["Open-top safari vehicle", "Designed for game viewing and the long, beautiful drives between places."], ["Closed vehicle with pop-up roof", "A comfortable option when the weather or itinerary calls for it."], ["Comfort and practicalities", "The details that help you enjoy the time you are spending outdoors."], ["Flexible pacing", "Your guide can slow down, move on or make time when a moment asks for it."]], faqTitle: "Tanzania Safari Questions", ctaTitle: "Ready for the Machame Route?" },
  zanzibar: { page: "zanzibar", eyebrow: "ZANZIBAR ISLAND", heroTitle: "Discover Zanzibar", heroText: "White-sand beaches, turquoise waters, historic Stone Town and a slower rhythm make an island extension the perfect end to a Tanzania journey.", heroImage: photos.zanzibar, intro: "Zanzibar brings beaches, historic streets and small, personal moments together in an island experience shaped to your pace.", placesTitle: "Where Will Your Zanzibar Journey Take You?", places: [{ title: "Stone Town", subtitle: "History, colour and culture", image: photos.stoneTown, href: "/zanzibar" }, { title: "Nungwi", subtitle: "Northern beach life", image: photos.beach, href: "/zanzibar" }, { title: "Paje", subtitle: "Palm-lined coastline", image: photos.coast, href: "/zanzibar" }, { title: "Kendwa", subtitle: "Bright water and softer days", image: photos.ocean, href: "/zanzibar" }, { title: "Matemwe", subtitle: "A village by the sea", image: photos.zanzibar, href: "/zanzibar" }, { title: "Prison Island", subtitle: "A short boat ride away", image: photos.safari2, href: "/zanzibar" }], darkTitle: "Explore Stone Town, spice farms and the ocean.", darkText: "Discover classic island experiences. Stone Town walks, spice farm stops and dhow sailing can be the small details that make a Zanzibar extension feel truly yours.", darkImage: photos.ocean, careTitle: "What kind of accommodation is right for you?", careItems: [["Boutique hotel", "Personal touches, quiet courtyards and intimate island stays."], ["Beachfront villa", "A different kind of connection with the coast."], ["Private suite", "A quieter space to settle in and recharge."], ["Family-friendly resort", "Practical for family groups and shared time by the sea."]], faqTitle: "Zanzibar frequently asked.", ctaTitle: "Ready to explore Zanzibar?" },
};

function DestinationPage({ content }: { content: DestinationContent }) { return <><Hero eyebrow={content.eyebrow} title={content.heroTitle} text={content.heroText} image={content.heroImage}><PrimaryLink>{content.page === "zanzibar" ? "Plan my Zanzibar trip" : "Start planning"}</PrimaryLink><Link className="ghost-button" href="/groups">Explore the mountain <Arrow /></Link></Hero><TrustRow /><main><section className="shell destination-intro"><SectionIntro eyebrow="PLANNED AROUND YOU" title={content.intro} align="left" /><div className="intro-visual"><Photo src={content.page === "zanzibar" ? photos.beach : content.page === "safari" ? photos.safari2 : photos.climbers} alt="" /></div></section><section className="shell space"><SectionIntro eyebrow="CHOOSE YOUR JOURNEY" title={content.placesTitle} text="Start with the place that draws you in, then shape the route, pace and details with our local team." align="left" /><DestinationCards items={content.places} /></section><section className="dark-section feature-split"><div className="shell"><div className="feature-copy"><p className="eyebrow light">DESIGNED FOR THE EXPERIENCE</p><h2>{content.darkTitle}</h2><p>{content.darkText}</p><PrimaryLink /></div><div className="feature-photo"><Photo src={content.darkImage} alt="" /></div></div></section><section className="shell care-section"><SectionIntro eyebrow="TRAVEL WELL" title={content.careTitle} text="The experience is shaped by the practical choices that let you settle into the journey." align="left" /><div className="care-grid">{content.careItems.map(([title, text], i) => <article key={title}><span>{["✦", "◌", "⌁", "◐"][i]}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section><Testimonials /><CtaBanner title={content.ctaTitle} image={content.darkImage} /><section className="shell faq-preview"><SectionIntro eyebrow="PRACTICAL QUESTIONS" title={content.faqTitle} text="Useful answers for the first conversation and the planning that follows." align="left" /><Accordion /><Link className="text-link" href="/faq">View all questions <Arrow /></Link></section></main><Footer /></>; }

function MachamePage() { const itinerary = ["Arrival in Arusha", "Machame Gate to Machame Camp", "Machame Camp to Shira Camp", "Shira Camp to Barranco Camp", "Barranco Camp to Karanga Camp", "Karanga Camp to Barafu Camp", "Summit attempt & descent", "Mweka Camp to Mweka Gate"]; return <><Hero eyebrow="KILIMANJARO ROUTE" title="Machame Route" text="The iconic route to the Roof of Africa. A spectacular route that helps you acclimatise as the scenery changes around you." image={photos.summit} short><PrimaryLink /><Link className="ghost-button" href="/groups">Join a group <Arrow /></Link></Hero><TrustRow /><main><section className="shell route-overview"><div className="route-overview-img"><Photo src={photos.climbers} alt="Kilimanjaro climbers" /></div><div><p className="eyebrow">OVERVIEW</p><h2>Machame Route Overview</h2><p>The Machame Route is one of Kilimanjaro’s most recognised approaches. Its varied terrain, carefully paced days and changing landscapes make it a popular choice for climbers who want a longer, more immersive journey.</p><dl><div><dt>Route type</dt><dd>Camping route</dd></div><div><dt>Duration</dt><dd>7 days on the mountain</dd></div><div><dt>Difficulty</dt><dd>Challenging</dd></div><div><dt>Style</dt><dd>Scenic and varied</dd></div></dl></div></section><section className="dark-section route-map"><div className="shell route-layout"><div className="map-card"><div className="map-line route-red">⌁<span>Machame Gate</span><span>Shira Camp</span><span>Barranco</span><span>Barafu</span><span>Uhuru Peak</span></div></div><div><p className="eyebrow light">THE JOURNEY, DAY BY DAY</p><h2>Your Route to the Roof of Africa</h2><p>Each day is paced to support acclimatisation while the route opens into a different side of the mountain.</p><div className="route-facts"><span>7 days</span><span>5,895 m summit</span><span>Camping</span></div></div></div></section><section className="shell itinerary"><SectionIntro eyebrow="ROUTE ITINERARY" title="Machame Route Itinerary" text="A day-by-day outline for your planning conversation." align="left" /><div className="itinerary-list">{itinerary.map((item, index) => <details key={item} open={index === 0}><summary><b>Day {index + 1}</b>{item}<span>⌄</span></summary><p>Today’s route and accommodation details are confirmed in your final itinerary with the local team.</p></details>)}</div></section><section className="dark-section environment"><div className="shell environment-grid"><Photo src={photos.silhouette} alt="Mount Kilimanjaro scenery" /><div><p className="eyebrow light">THE ALTITUDE STORY</p><h2>Environments of Kilimanjaro</h2>{["Cultivation Zone — 1,000–1,800m", "Montane Forest — 1,800–2,800m", "Heath & Moorland — 2,800–4,000m", "Alpine Desert — 4,000–5,000m", "Arctic Summit Zone — 5,000–5,895m"].map((x) => <p className="zone" key={x}>{x}</p>)}</div></div></section><section className="shell care-section"><SectionIntro eyebrow="WHAT IS INCLUDED" title="What’s Included in Your Climb" text="The planning details are confirmed with you before booking." align="left" /><div className="inclusions"><article><b>Before the climb</b><span>Support with your route and planning conversation.</span></article><article><b>On the mountain</b><span>A local team and carefully paced itinerary.</span></article><article><b>Support & safety</b><span>Support plans shaped around the mountain journey.</span></article></div></section><CtaBanner title="Ready to climb Machame?" image={photos.summit} /><Testimonials /><section className="shell faq-preview"><SectionIntro eyebrow="MACHAME ROUTE FAQ" title="Machame Route Frequently Asked Questions" align="left" /><Accordion /><Link className="text-link" href="/faq">View all questions <Arrow /></Link></section></main><Footer /></>; }

function TripPage() { const days = ["Arrival at Kilimanjaro International Airport", "Tarangire National Park", "Ngorongoro Crater", "Central Serengeti", "Northern Serengeti", "Northern Serengeti to Arusha"]; return <><Hero eyebrow="FROM $1,732" title="6-Day Northern Serengeti River Crossing Safari" text="A roaming, focused safari through Tarangire, Central Serengeti, Northern Serengeti and Ngorongoro, with a stay at the Mara River." image={photos.safari2} short><PrimaryLink>Start planning</PrimaryLink></Hero><nav className="trip-subnav"><div className="shell"><a href="#overview">Overview</a><a href="#itinerary">Itinerary</a><a href="#included">Included</a><a href="#reviews">Reviews</a><PrimaryLink /></div></nav><main><section id="overview" className="dark-section trip-overview"><div className="shell"><div><p className="eyebrow light">NORTHERN SERENGETI</p><h2>6-Day Northern Serengeti River Crossing Safari</h2><p>Beginning in Tarangire and moving north through the Serengeti, this route is designed to follow the rhythm of the journey and make space for time in the places that hold your attention.</p><div className="trip-pills"><span>6 days</span><span>Private safari</span><span>River crossing season</span></div></div><Photo src={photos.climbers} alt="Tanzania journey" /></div></section><section id="itinerary" className="shell trip-itinerary"><aside><div className="mini-map">⌁<b>Mt Kilimanjaro</b><span>Arusha</span><span>Tarangire</span><span>Serengeti</span></div><h3>Destinations included</h3><ul><li>Arusha</li><li>Tarangire National Park</li><li>Serengeti National Park</li><li>Ngorongoro Crater</li></ul></aside><div><SectionIntro eyebrow="YOUR ITINERARY" title="A journey through Tanzania" text="Each day is an outline. Final details are confirmed as part of your tailored itinerary." align="left" />{days.map((day, i) => <details key={day} open={i === 0}><summary><b>Day {i + 1}</b>{day}<span>⌄</span></summary><p>Arrive, settle in and spend time with your guide discussing the journey ahead. Accommodation, timings and exact activities are confirmed with the local team.</p>{i === 2 && <Photo src={photos.cheetah} alt="Wildlife on safari" />}</details>)}</div></section><section className="dark-section environment"><div className="shell environment-grid"><Photo src={photos.silhouette} alt="Tanzania landscape" /><div><p className="eyebrow light">A PLACE OF MANY WORLDS</p><h2>Environments of Tanzania</h2><p className="zone">Open plains and long horizons</p><p className="zone">Forest, crater and woodland</p><p className="zone">River country and seasonal wildlife</p></div></div></section><section id="included" className="shell care-section"><SectionIntro eyebrow="PLANNING DETAILS" title="What’s included in your safari" text="Final inclusions are confirmed in the itinerary you receive before booking." align="left" /><div className="inclusions"><article><b>Before the journey</b><span>Support with route and travel planning.</span></article><article><b>On safari</b><span>Your planned days, transport and local guiding.</span></article><article><b>Support & safety</b><span>Practical support from a local team.</span></article></div></section><CtaBanner title="Unforgettable Moments in the Heart of Mount Kilimanjaro" image={photos.safari} /><div id="reviews"><Testimonials /></div><section className="shell faq-preview"><SectionIntro eyebrow="MORE TO EXPLORE" title="Frequently Asked Questions" align="left" /><Accordion /></section></main><Footer /></>; }

function ChipSet({ options, selected, onSelect, figmaCheck = false, label }: { options: string[]; selected: string; onSelect: (x: string) => void; figmaCheck?: boolean; label?: string }) {
  return <div className="chips" role="group" aria-label={label}>{options.map((item) => <button type="button" onClick={() => onSelect(item)} aria-pressed={selected === item} className={selected === item ? "selected" : ""} key={item}>{item}{selected === item && (figmaCheck ? <Image className="plan-chip-check" src="/images/figma-plan-check.svg" alt="" width={15} height={15} /> : <span aria-hidden="true">✓</span>)}</button>)}</div>;
}

function FormNotice({ text }: { text: string }) { return <p className="form-notice" aria-live="polite">{text}</p>; }

function HoneypotField() {
  return <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ display: "none" }} />;
}

function hasEnquiryContactMethod(form: HTMLFormElement) {
  const fields = new FormData(form);
  return ["email", "phone", "whatsapp"].some(name => String(fields.get(name) || "").trim().length > 0);
}

function PlanStepActions({ step, total, onBack, onNext }: { step: number; total: number; onBack: () => void; onNext: () => void }) {
  return <div className="plan-step-actions">{step > 0 && <button type="button" className="plan-step-back" onClick={onBack}>← Back</button>}<span>Step {step + 1} of {total}</span>{step < total - 1 && <button type="button" className="plan-step-next" onClick={onNext}>Continue <Arrow /></button>}</div>;
}

function PlanPage({ web3FormsAccessKey }: { web3FormsAccessKey: string }) {
  const router = useRouter();
  const [interest, setInterest] = useState("Combination");
  const [dateStyle, setDateStyle] = useState("My dates are flexible");
  const [travelStyle, setTravelStyle] = useState("Flexible");
  const [arrival, setArrival] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const labels = ["Interests", "Dates", "Travellers", "Duration", "Style", "About you"];

  const jumpTo = (index: number) => {
    const next = Math.max(0, Math.min(labels.length - 1, index));
    setActiveStep(next);
    document.querySelector(".enquiry-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fields = new FormData(e.currentTarget);
    const submittedArrival = String(fields.get("arrival") || "");
    const submittedDeparture = String(fields.get("departure") || "");
    if (submittedArrival && submittedDeparture && submittedDeparture < submittedArrival) {
      setNotice("Your departure date should be after your arrival date.");
      jumpTo(1);
      return;
    }
    if (!e.currentTarget.reportValidity() || !hasEnquiryContactMethod(e.currentTarget)) {
      setNotice("Please complete your name and enter either an email address or WhatsApp number.");
      jumpTo(5);
      return;
    }
    setSending(true);
    setNotice("Sending your trip request…");
    const result = await sendEnquiry("trip", e.currentTarget, { interest, dateStyle, travelStyle }, web3FormsAccessKey);
    if (result.ok) {
      router.push("/thank-you");
      return;
    }
    setNotice(result.message);
    setSending(false);
  }

  const stage = (index: number) => ({ id: `plan-step-${index + 1}`, hidden: activeStep !== index, "aria-hidden": activeStep !== index });
  const reassurance = [
    ["figma-plan-local-team.svg", "Local team", "Start with people based in Tanzania, and share the places you want to discover."],
    ["figma-plan-personal-support.svg", "Personal support", "Ask your questions in your own words. The planning conversation should feel human."],
    ["figma-plan-custom-itineraries.svg", "Custom itineraries", "Discuss an outline around your interests and available time. Final arrangements are to confirm."],
    ["figma-plan-no-obligation.svg", "No obligation", "This is an enquiry, not a booking or payment. Review the proposed details before deciding."],
  ];

  return <><Hero eyebrow="A PERSONAL JOURNEY BEGINS HERE" title="Let’s Plan Your Tanzania Adventure" text="Tell us what you want to experience and our team will help you build the right trip." image={photos.plan} short><></></Hero><main className="plan-main"><div className="shell">
    <SectionIntro eyebrow="YOUR TRIP REQUEST" title="A Few Details. A World of Possibilities." text="You don’t need every answer yet. Share what you know, and leave the rest for a conversation." align="left" />
    <div className="plan-layout"><form className="enquiry-form" data-sd-ignore onSubmit={submit} noValidate><HoneypotField />
      <nav className="progress" aria-label="Trip request steps">{labels.map((label, index) => <button type="button" className={`${activeStep === index ? "active" : ""}${index < activeStep ? " complete" : ""}`} aria-current={activeStep === index ? "step" : undefined} aria-controls={`plan-step-${index + 1}`} onClick={() => jumpTo(index)} key={label}><b>{index < activeStep ? "✓" : index + 1}</b><span>{label}</span></button>)}<p aria-live="polite">Step {activeStep + 1} of 6 · {labels[activeStep]}</p></nav>
      <fieldset {...stage(0)}><legend><small>STEP 1 OF 6</small>What Would You Love to Experience?</legend><ChipSet options={["Kilimanjaro", "Safari", "Zanzibar", "Combination"]} selected={interest} onSelect={setInterest} figmaCheck label="What would you love to experience?" /><PlanStepActions step={0} total={labels.length} onBack={() => jumpTo(0)} onNext={() => jumpTo(1)} /></fieldset>
      <fieldset {...stage(1)}><legend><small>STEP 2 OF 6</small>When Are You Thinking of Traveling?</legend><ChipSet options={["I have dates", "My dates are flexible"]} selected={dateStyle} onSelect={setDateStyle} figmaCheck label="Travel date flexibility" /><div className={`input-row plan-date-row ${dateStyle === "I have dates" ? "is-current" : ""}`}><label>Preferred arrival<input type="date" name="arrival" onInput={event => setArrival(event.currentTarget.value)} onChange={event => setArrival(event.currentTarget.value)} aria-label="Preferred arrival date" /></label><label>Preferred departure<input type="date" name="departure" min={arrival || undefined} aria-label="Preferred departure date" /></label></div><label className={`plan-flexible-field ${dateStyle === "My dates are flexible" ? "is-current" : ""}`}>Flexible timing<input type="text" name="timing" placeholder="A month, season or possible travel window" /></label><PlanStepActions step={1} total={labels.length} onBack={() => jumpTo(0)} onNext={() => jumpTo(2)} /></fieldset>
      <fieldset {...stage(2)}><legend><small>STEP 3 OF 6</small>Who’s Coming Along?</legend><div className="input-row"><label>Number of adults<input type="number" min="1" name="adults" placeholder="Enter number" /></label><label>Number of children<input type="number" min="0" name="children" placeholder="Enter number or 0" /></label></div><PlanStepActions step={2} total={labels.length} onBack={() => jumpTo(1)} onNext={() => jumpTo(3)} /></fieldset>
      <fieldset {...stage(3)}><legend><small>STEP 4 OF 6</small>How Much Time Do You Have?</legend><label>Number of days<input type="text" inputMode="numeric" name="days" placeholder="Your available days, or ‘not sure yet’" /></label><PlanStepActions step={3} total={labels.length} onBack={() => jumpTo(2)} onNext={() => jumpTo(4)} /></fieldset>
      <fieldset {...stage(4)}><legend><small>STEP 5 OF 6</small>What’s Your Travel Style?</legend><ChipSet options={["Private", "Small Group", "Solo", "Flexible"]} selected={travelStyle} onSelect={setTravelStyle} figmaCheck label="Travel style" /><PlanStepActions step={4} total={labels.length} onBack={() => jumpTo(3)} onNext={() => jumpTo(5)} /></fieldset>
      <fieldset {...stage(5)}><legend><small>STEP 6 OF 6</small>Anything Else We Should Know?</legend><label>Your ideas, questions or needs<textarea name="notes" placeholder="Interests, comfort preferences, children’s ages, access needs or anything that matters to you…" /></label><div className="input-row"><label>Name *<input name="name" required autoComplete="name" placeholder="Your full name" /></label><label>Email<input name="email" type="email" autoComplete="email" placeholder="Your email address" /></label></div><div className="input-row"><label>WhatsApp or phone<input name="whatsapp" type="tel" autoComplete="tel" placeholder="Include country code" /></label><label>Country<input name="country" autoComplete="country-name" placeholder="Your country of residence" /></label></div><small>Name and either email or WhatsApp are required. We’ll use these details to respond to your trip enquiry. Please don’t include passport numbers or sensitive medical information.</small><div className="plan-final-actions"><button type="button" className="plan-step-back" onClick={() => jumpTo(4)}>← Back</button><button className="submit-button" disabled={sending}>{sending ? "Sending…" : "Send My Trip Request"} <Arrow /></button></div><p className="plan-payment-note">No payment is requested here.</p><FormNotice text={notice} /></fieldset>
    </form><aside className="planning-aside"><Photo src={photos.climbers} alt="Kilimanjaro climbing group" /><p className="eyebrow">YOUR FIRST CONVERSATION</p><h2>Let’s Shape It Together</h2>{reassurance.map(([icon, title, copy]) => <div key={title}><div className="planning-aside-heading"><Image src={`/images/${icon}`} alt="" width={24} height={24} /><b>{title}</b></div><p>{copy}</p></div>)}<a className="whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">Prefer WhatsApp? <Arrow /></a><small>Chat with our team on WhatsApp at +{whatsappNumber}. Response timing will be confirmed by the team.</small><div className="planning-socials"><p>Follow our journeys</p><nav aria-label="Betheli Expeditions social media"><a href="https://web.facebook.com/betheliexpeditions?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" aria-label="Betheli Expeditions on Facebook"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.4 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.6-4.3 4.5v2.1H7v3.2h2.8V21h3.6Z" /></svg><span>Facebook</span></a><a href="https://www.instagram.com/betheliexpeditions/" target="_blank" rel="noopener noreferrer" aria-label="Betheli Expeditions on Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="planning-social-dot" cx="17.7" cy="6.7" r=".9" /></svg><span>Instagram</span></a><a className="planning-social-tripadvisor" href="https://www.tripadvisor.com/Attraction_Review-g297913-d16714059-Reviews-Betheli_Expeditions-Arusha_Arusha_Region.html" target="_blank" rel="noopener noreferrer" aria-label="Betheli Expeditions on Tripadvisor"><Image src="/images/tripadvisor-logo.svg" alt="" width={100} height={17} /></a></nav></div></aside></div>
  </div></main><Footer /></>;
}

function ContactPage({ web3FormsAccessKey }: { web3FormsAccessKey: string }) { const router = useRouter(); const [topic, setTopic] = useState("Custom trip"); const [notice, setNotice] = useState(""); const [sending, setSending] = useState(false); async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); if (!e.currentTarget.reportValidity() || !hasEnquiryContactMethod(e.currentTarget)) return setNotice("Please enter your name and either an email address or phone number."); setSending(true); setNotice("Sending your message…"); const result = await sendEnquiry("contact", e.currentTarget, { topic }, web3FormsAccessKey); if (result.ok) { router.push("/thank-you"); return; } setNotice(result.message); setSending(false); }
  return <><Hero eyebrow="CONTACT BATHIEL EXPEDITIONS" title="Let’s Start Planning" text="A question, a rough idea or a whole adventure in mind? Start a conversation with the Bathiel team." image={photos.summit} short><></></Hero><main className="contact-main shell"><div className="contact-layout"><form data-sd-ignore onSubmit={submit} noValidate><HoneypotField /><p className="eyebrow">Let’s talk about your trip.</p><div className="input-row"><label>Name *<input name="name" required autoComplete="name" placeholder="Your full name" /></label><label>Email<input type="email" name="email" autoComplete="email" placeholder="Your email address" /></label></div><label>WhatsApp or phone<input type="tel" name="phone" autoComplete="tel" placeholder="Include country code" /></label><small>Name and either email or phone are required.</small><label>What can we help you with?</label><ChipSet options={["Kilimanjaro", "Safari", "Zanzibar", "Custom trip", "Other"]} selected={topic} onSelect={setTopic} figmaCheck label="What can we help you with?" /><label>Your message *<textarea name="message" required placeholder="Tell us a little about your plans, or ask your question..." /></label><p className="privacy">We’ll use these details to respond to your enquiry. Please don’t include passport numbers or sensitive personal information.</p><button className="submit-button small-submit" disabled={sending}>{sending ? "Sending…" : "Send My Message"} <Arrow /></button><FormNotice text={notice} /></form><aside className="contact-aside"><section><h2>Prefer a Conversation?</h2><p>WhatsApp is another way to share your ideas and questions with our team.</p><a className="whatsapp" href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp Us <Arrow /></a><small>WhatsApp: +{whatsappNumber}</small></section>{[["Email", "info@betheliexpeditions.com", "Send your questions or trip ideas in your own time."], ["Mobile", "+255 692 796 412 / +255 738 304 984", "Call our Tanzanian team to discuss your plans."], ["Office location", "Usa River, Arusha — P.O. Box 15444", "Please contact us before visiting the office."]].map(([t, a, c]) => <div key={t}><h3>{t}</h3><b>{a}</b><p>{c}</p></div>)}<p>Have a fuller trip brief? Use Plan Your Trip to share dates, interests and traveller numbers.</p></aside></div></main><Footer /></>; }

export const faqCategories = [
  ["KILIMANJARO", "Climbing the mountain", ["How difficult is Kilimanjaro?", "Which route should I choose?", "What equipment do I need?", "What altitude support is provided?", "When is the best time to climb?"]],
  ["SAFARI", "Parks, wildlife & itineraries", ["Will I see the Big Five or the Great Migration?", "How many days should I spend on safari?", "Can children travel on safari?", "What vehicles and accommodation are used?", "Which parks should I visit?"]],
  ["ZANZIBAR", "Beaches, culture & the island", ["Which coast should I choose?", "Can I snorkel or dive year-round?", "What should I wear in Stone Town and villages?", "How many days should I spend?"]],
  ["BOOKING", "Before you commit", ["Is airfare included in the package price?", "How do I start planning a trip?", "What should my written quote include?", "Can I change or cancel my trip?", "How early should I book?"]],
  ["PAYMENTS", "Clear terms, no surprises", ["Is a deposit required?", "Which payment methods are accepted?", "Are tips and fees included?"]],
  ["TRAVEL", "Getting ready to go", ["Do I need a visa for Tanzania?", "What health preparations should I make?", "Should I arrange travel insurance?", "Are airport pickups and domestic flights arranged?"]],
  ["GENERAL", "The first conversation is simple", ["Can I combine Kilimanjaro, safari and Zanzibar?", "Do I need a full itinerary before contacting you?", "How can I contact Betheli Expeditions?", "Are you a licensed operator in Tanzania?"]],
] as const;

export const faqAnswers: Record<string, string> = {
  "Which route should I choose?": "The best route depends on your fitness, trekking experience, available time and preferred accommodation. Lemosho and the Northern Circuit offer scenic trekking with more time to acclimatise. Marangu suits climbers who prefer mountain huts, while Umbwe is steeper and more demanding. Betheli Expeditions will help you choose the route that suits you best.",
  "How difficult is Kilimanjaro?": "Kilimanjaro is a challenging high-altitude trek. Standard trekking routes do not require technical mountaineering skills, but long walking days, cold temperatures and summit night demand preparation and determination. Regular hiking and fitness training help, but even very fit climbers can develop altitude sickness. A gradual ascent and enough acclimatisation time are essential.",
  "What equipment do I need?": "You will need comfortable, worn-in hiking boots, layered clothing, waterproof jacket and trousers, a warm insulated jacket, thermal underwear, gloves and a warm hat. Other essentials include a cold-weather sleeping bag, daypack, trekking poles, headlamp, sunglasses, sunscreen and water bottles. Prepare for conditions ranging from rainforest rain to freezing summit temperatures.",
  "What altitude support is provided?": "Our mountain team carries emergency oxygen, a first-aid kit and a radio for communication. We encourage a steady pace and time for acclimatisation. Tell your guide immediately if you feel unwell. Emergency oxygen supports treatment but does not replace descent when altitude illness becomes serious. Your health always comes before reaching the summit.",
  "When is the best time to climb?": "June to October generally offers drier weather and clearer views, although nights near the summit remain cold and popular routes can be busy. January and February are often relatively dry and slightly warmer. April and May bring the long rains, while November usually brings shorter rains and quieter trails. Mountain weather is unpredictable in every season, so come prepared for rain, wind and freezing summit temperatures.",
  "Will I see the Big Five or the Great Migration?": "Tanzania offers excellent opportunities to see the Big Five—lion, leopard, elephant, buffalo and rhino—particularly when combining the Serengeti and Ngorongoro Crater. Wildlife sightings are never guaranteed. The Great Migration moves through the Serengeti–Mara ecosystem throughout the year, following rainfall and fresh grazing. We plan around seasonal movements, but exact locations and river crossings remain unpredictable.",
  "How many days should I spend on safari?": "We recommend 5–7 days for a rewarding safari that combines several parks without feeling rushed. A 3–4-day safari suits a shorter visit, while 8–10 days allows more time to explore, enjoy quieter areas and focus on wildlife photography. We tailor each itinerary to your interests, pace and budget.",
  "Can children travel on safari?": "Yes. A safari can be a wonderful family adventure. We tailor family trips with comfortable accommodation, manageable driving distances and activities suited to your children’s ages. Some lodges and activities have age restrictions, which we check while planning your trip.",
  "What vehicles and accommodation are used?": "Our safaris use 4×4 safari vehicles suited to Tanzania’s terrain. Accommodation ranges from comfortable lodges and tented camps to luxury properties, depending on your preferences and budget. Tented camps often include proper beds, private bathrooms and welcoming hospitality. Your proposal will specify the vehicle arrangements and accommodation for your trip.",
  "Which parks should I visit?": "The Northern Circuit—Serengeti, Ngorongoro, Tarangire, Lake Manyara and Arusha National Park—is ideal for first-time visitors and iconic wildlife. The Southern Circuit, including Nyerere and Ruaha, offers vast wilderness and fewer crowds. The Western Circuit is suited to chimpanzee trekking and remote adventures, while the Eastern Circuit can combine wildlife, forest hiking and the coast. We will help you choose or combine circuits around your dates and interests.",
  "Which coast should I choose?": "Choose Zanzibar’s north coast—Nungwi or Kendwa—for golden sunsets, lively beach stays and swimming generally less affected by tides. For village experiences and a changing tidal shoreline, consider Matemwe in the northeast or Paje and Jambiani in the southeast. Mafia and Pemba offer quieter escapes close to nature. We will help you find the coast that fits your preferred pace and experience.",
  "Can I snorkel or dive year-round?": "Snorkelling and diving are possible throughout the year, but conditions vary with location, winds, rainfall and tides. Visibility and sea conditions can change daily, and trips depend on local conditions. We plan activities with local operators to help you make the most of your stay.",
  "What should I wear in Stone Town and villages?": "Light, comfortable clothing that covers your shoulders and knees is respectful when visiting Stone Town and local villages. Swimwear is suitable at the beach and pool; please cover up when walking through communities, shops and public areas. Ask permission before photographing people.",
  "How many days should I spend?": "We recommend 3–5 nights for a relaxing beach extension after a safari or Kilimanjaro climb. A stay of 4–6 nights gives you more time for Stone Town, ocean activities and unhurried beach days. If you would like to explore more than one island, allow extra time for transfers.",
  "Is airfare included in the package price?": "International flights are generally excluded unless clearly stated. Domestic flights may be included depending on your itinerary. Your written quote will specify which flights and transfers are covered.",
  "How do I start planning a trip?": "Contact Betheli Expeditions with your preferred travel dates, number of travellers, interests and approximate budget. Whether you dream of a safari, mountain trek, cultural experience or beach escape, we will create a personalised itinerary and refine it with you.",
  "What should my written quote include?": "Your quote should clearly outline your itinerary, accommodation, meal plan, transport, activities, park fees and any included flights or transfers. It should also state the total price and currency, inclusions and exclusions, payment schedule and cancellation conditions, so you know what to expect before booking.",
  "Can I change or cancel my trip?": "Yes, although changes are subject to availability and may involve additional costs. Cancellation charges depend on how close to departure you cancel and the terms of your booking. We explain these conditions before you confirm. Contact us as soon as possible if your plans change so we can explore the available options.",
  "How early should I book?": "We recommend booking 6–12 months in advance, especially for peak-season travel, Great Migration safaris, Kilimanjaro climbs and group departures. Planning early gives you a wider choice of lodges and camps and allows time to secure trekking arrangements and required permits. For a last-minute trip, contact us and we will check current availability.",
  "Is a deposit required?": "Yes. A deposit of 30% confirms your booking and allows us to secure accommodation and other services. Your quote will clearly state the deposit amount and the deadline for paying the remaining balance.",
  "Which payment methods are accepted?": "We accept bank transfers and online payments through a secure payment link. We will provide payment instructions when you are ready to book and explain any applicable transaction charges.",
  "Are tips and fees included?": "Tips are not included unless specifically stated and are left to your discretion. Park entrance fees and other charges included in your package will be clearly listed in your quote, alongside any exclusions or additional costs, so you can budget with confidence.",
  "Do I need a visa for Tanzania?": "Visa requirements depend on your nationality. Many visitors need a visa, while others are exempt or require approval before travelling. Check the official Tanzania Immigration website before booking. Your passport should have at least six months’ validity and one unused visa page.",
  "What health preparations should I make?": "Consult your doctor or a travel clinic well before departure about routine vaccinations, malaria prevention and personal health needs. Yellow fever vaccination requirements depend on where you are travelling from and your transit route. If you are climbing Kilimanjaro, discuss altitude preparation and your fitness for the trek. Carry your regular medication and tell us about relevant medical conditions or dietary requirements.",
  "Should I arrange travel insurance?": "Yes. We strongly recommend comprehensive insurance covering medical treatment, emergency evacuation, cancellation and your planned activities. For Kilimanjaro, confirm that your policy covers trekking up to 5,895 metres and mountain rescue. Check current compulsory inbound insurance requirements before travelling; Zanzibar requires a separate local policy for foreign visitors even if you already have travel insurance.",
  "Are airport pickups and domestic flights arranged?": "Yes. Betheli Expeditions can arrange airport pickups, drop-offs and domestic flights as part of your itinerary. Share your flight details with us so we can coordinate your arrival and onward travel. Your quote will clearly state which transfers and flights are included.",
  "Can I combine Kilimanjaro, safari and Zanzibar?": "Absolutely. Experience the challenge of Kilimanjaro, the wonder of a wildlife safari and the tranquillity of Zanzibar in one personalised itinerary. We arrange the connections, accommodation and activities, with time to rest and appreciate every part of your journey.",
  "Do I need a full itinerary before contacting you?": "Not at all. Bring us your ideas, even if they are only beginning to take shape. Share your interests, approximate dates, number of travellers and budget if you have one. We will guide you through the options and create an itinerary around you.",
  "How can I contact Betheli Expeditions?": "Email info@betheliexpeditions.com, call +255 692 796 412 or +255 738 304 984, WhatsApp +255 692 796 412, or complete our website’s Start Planning form. Our team will help you take the first step, whether you have a simple question or a complete adventure in mind.",
  "Are you a licensed operator in Tanzania?": "Yes. Betheli Expeditions (T) Ltd is a Tanzanian-owned tour operator based in Arusha, holding a Class A tourism licence. We are also affiliated with the Tanzania Association of Tour Operators (TATO). You can view our profile on TATO’s official website, and we are happy to share our registration and licensing details on request.",
};

function FaqPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const filterItems = ["All", "Kilimanjaro", "Safari", "Zanzibar", "Booking", "Payments", "Travel", "General"];
  const current = useMemo(() => faqCategories
    .filter(([category]) => filter === "All" || category.toLowerCase() === filter.toLowerCase())
    .map(([category, title, questions]) => [category, title, questions.filter(q => q.toLowerCase().includes(search.toLowerCase()))] as const)
    .filter(([, , questions]) => questions.length > 0), [filter, search]);
  const questionCount = current.reduce((total, [, , questions]) => total + questions.length, 0);
  const status = search ? `${questionCount} ${questionCount === 1 ? "answer" : "answers"} matching “${search}”` : `${questionCount} ${filter === "All" ? "questions across all topics" : `${filter} ${questionCount === 1 ? "question" : "questions"}`}`;
  return <><Hero eyebrow="FREQUENTLY ASKED QUESTIONS" title="Good Questions. Honest Answers." text="Practical guidance for your Tanzania adventure. Most questions can be answered in a conversation — use Plan Your Trip to start." image={photos.trail} short><PrimaryLink>Plan Your Trip</PrimaryLink><a className="ghost-button" href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp Us <Arrow /></a></Hero><main className="faq-page"><section className="faq-filter-section"><div className="faq-filters shell"><label className="search"><Image src="/images/figma-faq-search.svg" alt="" width={20} height={20} /><input aria-label="Search your question" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search your question…" /></label><div className="filter-buttons">{filterItems.map((item) => <button type="button" aria-pressed={filter === item} aria-controls="faq-results" className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div><p className="faq-filter-status" aria-live="polite">Showing <strong>{status}</strong></p></div></section><section className="shell category-grid" id="faq-results" key={`${filter}-${search}`}>{current.map(([eyebrow, title, questions]) => <div className={`faq-category faq-category-${eyebrow.toLowerCase()}`} key={eyebrow}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><Accordion items={questions.map(q => [q, faqAnswers[q] || "Please ask the Bathiel team to confirm this detail for your proposed trip."])} /></div>)}{current.length===0 && <p>No questions match your search. Try another term or contact the team.</p>}</section><section className="faq-invitation"><div className="shell"><div className="faq-invitation-card"><Photo src="/images/figma-faq-cta.jpg" alt="Travellers watching giraffes in Tanzania" /><div className="faq-invitation-scrim" /><div className="faq-invitation-copy"><p className="eyebrow light">LET&apos;S MAKE IT YOUR JOURNEY</p><h2>Still Have Questions?</h2><p>Tell us what you have in mind. We&apos;ll help you explore the options and shape a journey around you.</p><div className="faq-invitation-actions"><PrimaryLink>Talk to Our Local Team</PrimaryLink><a className="ghost-button" href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp Us <Arrow /></a></div></div></div></div></section></main><Footer /></>;
}

const fallbackGroupDepartures: CmsGroupDeparture[] = [
  { id: "lemosho-2026-10-06", day: "06", month: "Oct", monthIndex: 9, year: "2026", dateTime: "2026-10-06", title: "Kilimanjaro via Lemosho route - 7 days", range: "From 06 October - 14 October", highlights: ["🌙 Starry sky", "🚙 High-Altitude Drop-Off", "⛺ Extra Summit"], price: "$3170", deposit: "$100" },
  { id: "machame-2026-10-09", day: "09", month: "Oct", monthIndex: 9, year: "2026", dateTime: "2026-10-09", title: "Kilimanjaro via Machame route - 7 days", range: "From 09 October - 17 October", highlights: ["🌳 Starts in a Tropical Forest", "🦜 Forest Birds"], price: "$3072", deposit: "$100" },
  { id: "rongai-2026-10-10", day: "10", month: "Oct", monthIndex: 9, year: "2026", dateTime: "2026-10-10", title: "Kilimanjaro via Rongai route - 6 days", range: "From 10 October - 17 October", highlights: ["🧍 Fewer hikers", "🌤 Less Rainfall", "🌲 Starts in a Coniferous Forest", "🚶 For experienced hikers"], price: "$2767", deposit: "$100" },
  { id: "marangu-2026-10-30", day: "30", month: "Oct", monthIndex: 9, year: "2026", dateTime: "2026-10-30", title: "Kilimanjaro via Marangu route - 6 days", range: "From 30 October - 06 November", highlights: ["🌳 Starts in a Tropical Forest", "🦜 Forest Birds", "🏠 Overnight Stay in Huts"], price: "$2638", deposit: "$100" },
  { id: "machame-2026-10-31", day: "31", month: "Oct", monthIndex: 9, year: "2026", dateTime: "2026-10-31", title: "Kilimanjaro via Machame route - 7 days", range: "From 31 October - 08 November", highlights: ["🌳 Starts in a Tropical Forest", "🦜 Forest Birds"], price: "$2765", deposit: "$100", originalPrice: "$3072", discountPercent: 10, seasonLabel: "Rain Season" },
];

const groupBenefitIcons: Record<string, string> = {
  users: "/images/figma-kili-value-users.svg",
  localTeam: "/images/figma-plan-local-team.svg",
  calendar: "/images/figma-trips-fact-dates.svg",
};

export function GroupsPage({ departures, web3FormsAccessKey = "" }: { departures?: CmsGroupDeparture[]; web3FormsAccessKey?: string } = {}) {
  const trips = departures ?? fallbackGroupDepartures;
  const [year, setYear] = useState(() => trips[0]?.year || "2026");
  const [month, setMonth] = useState(() => trips[0]?.month || "Oct");
  const [selectedDeparture, setSelectedDeparture] = useState<string | null>(null);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from(new Set(trips.map(trip => trip.year))).sort();
  const visibleTrips = trips.filter(trip => trip.year === year && trip.month === month);
  const selectedTrip = trips.find(trip => trip.id === selectedDeparture);
  const benefits = [
    { key: "small-groups", iconKey: "users", title: "Small groups", description: "Shared pace, personal support" },
    { key: "local-team", iconKey: "localTeam", title: "Local mountain team", description: "Guides, cooks and porters" },
    { key: "scheduled", iconKey: "calendar", title: "Scheduled departures", description: "Clear dates and route choices" },
  ];

  return <><main className="groups-page"><section className="group-climb-hero"><Photo className="group-climb-hero-image" src="/images/figma-kili-group-trip-landscape.png" alt="A small group climbing together on the snowy slopes of Mount Kilimanjaro" priority /><div className="group-climb-hero-scrim" /><Header overlay variant="classic" /><div className="group-climb-hero-content shell"><p className="eyebrow light">CLIMB TOGETHER</p><h1>Share the journey.<br />Reach the Summit together.</h1><p>Join a scheduled Kilimanjaro departure with other travellers, supported by an experienced local mountain team from the first step to the summit attempt.</p><div className="group-climb-hero-actions"><a className="button" href="#group-departures">View group dates <Arrow /></a><Link className="ghost-button" href="/contact">Ask about a climb <Arrow /></Link></div><div className="group-climb-benefits" aria-label="Group climb benefits">{benefits.map(benefit => <span key={benefit.key}><Image src={groupBenefitIcons[benefit.iconKey] || groupBenefitIcons.calendar} alt="" width={28} height={28} /><span><b>{benefit.title}</b>{benefit.description}</span></span>)}</div></div></section><section id="group-departures" className="group-schedule shell"><header>
    <p className="eyebrow">UPCOMING DEPARTURES</p><h2>Climb Kilimanjaro with free airport transfers; accommodation available at extra cost!</h2>
    <div className="year-tabs" role="group" aria-label="Departure year">{years.map(value => <button type="button" aria-pressed={year === value} onClick={() => setYear(value)} className={year === value ? "active" : ""} key={value}>{value}</button>)}</div>
    <div className="months" role="group" aria-label="Departure month">{months.map(value => <button type="button" aria-pressed={month === value} onClick={() => setMonth(value)} className={month === value ? "active" : ""} key={value}>{value}{trips.some(trip => trip.year === year && trip.month === value && trip.seasonLabel) ? " ☔" : ""}</button>)}</div>
  </header>
  <section className="group-list" aria-live="polite" aria-label={`Departures for ${month} ${year}`}>
    {visibleTrips.length ? visibleTrips.map(trip => <article key={trip.id}><time dateTime={trip.dateTime}><b>{trip.day}</b><span>{trip.month}</span></time><div className="group-title"><h2>{trip.title}</h2><p>{trip.range}</p>{trip.seasonLabel && <small>☔ {trip.seasonLabel}</small>}</div><ul className="group-highlights">{trip.highlights.map(x => <li key={x}>{x}</li>)}</ul><strong className="group-price">{trip.originalPrice && <del>{trip.originalPrice}</del>}{trip.price}{trip.discountPercent && <em>{trip.discountPercent}%</em>}</strong><div className="group-action"><button type="button" className={trip.originalPrice ? "join secondary" : "join"} onClick={() => setSelectedDeparture(trip.id)}>JOIN GROUP</button><span>Deposit {trip.deposit}</span></div></article>) :
      <div className="group-empty"><h2>{`No published departures for ${month} ${year} yet.`}</h2><p>Ask our team about group dates or a private Kilimanjaro climb that fits your calendar.</p><Link className="join" href="/plan-your-trip">Ask about dates <Arrow /></Link></div>}
  </section></section><div className="group-advisor-wrap shell"><AdvisorCard /></div><Testimonials groupClimbsOnly title="Stories from the mountain" text="Hear from travellers who shared the trail, supported one another and climbed with the Betheli mountain team." /></main><Footer />{selectedTrip && <GroupJoinForm departure={selectedTrip} web3FormsAccessKey={web3FormsAccessKey} onClose={() => setSelectedDeparture(null)} />}</>;
}

function GroupJoinForm({ departure, web3FormsAccessKey, onClose }: { departure: CmsGroupDeparture; web3FormsAccessKey: string; onClose: () => void }) {
  const { title, range, price, deposit } = departure;
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || !hasEnquiryContactMethod(form)) {
      setNotice("Please enter your name and either an email address or WhatsApp number.");
      return;
    }
    setSending(true);
    setNotice("Sending your request…");
    const result = await sendEnquiry("trip", form, { interest: "Kilimanjaro group climb", dateStyle: "Fixed group departure", departure: range, timing: `${title} — ${range}`, days: title.match(/\d+ days/)?.[0] || "" }, web3FormsAccessKey);
    if (result.ok) {
      router.push("/thank-you");
      return;
    }
    setNotice(result.message);
    setSending(false);
  }
  return createPortal(<div className="group-join-modal" role="dialog" aria-modal="true" aria-labelledby="group-join-title"><button type="button" className="group-join-backdrop" aria-label="Close join group form" onClick={onClose} /><section className="group-join-panel"><button ref={closeRef} type="button" className="group-join-close" aria-label="Close join group form" onClick={onClose}>×</button><p className="eyebrow">JOIN A DEPARTURE</p><h2 id="group-join-title">Join this Kilimanjaro group</h2><div className="group-join-selection"><strong>{title}</strong><span>{range}</span><b>{price} per person · Deposit {deposit}</b></div><form data-sd-ignore onSubmit={submit} noValidate><HoneypotField /><div className="input-row"><label>Full name *<input name="name" required autoComplete="name" placeholder="Your full name" /></label><label>Email<input type="email" name="email" autoComplete="email" placeholder="you@example.com" /></label></div><div className="input-row"><label>WhatsApp number<input name="whatsapp" autoComplete="tel" placeholder="+255…" /></label><label>Number of travellers *<input type="number" name="adults" required min="1" max="20" defaultValue="1" /></label></div><small>Name and either email or WhatsApp are required.</small><div className="input-row group-date-preference"><label>Preferred travel date<input type="date" name="arrival" /></label><label className="group-flexible-date"><input type="checkbox" name="dateFlexibility" value="My dates are flexible" /><span><b>My dates are flexible</b><small>The team can suggest a nearby departure.</small></span></label></div><label>Country<input name="country" autoComplete="country-name" placeholder="Where are you travelling from?" /></label><label>Anything we should know?<textarea name="notes" placeholder="Experience, questions, dietary needs or other details…" /></label><p className="privacy">Submitting this form sends an enquiry only. Your place is confirmed after the team contacts you and completes the booking process.</p><button className="submit-button" disabled={sending}>{sending ? "Sending…" : "Request to join"}<Arrow /></button><FormNotice text={notice} /></form></section></div>, document.body);
}

function AdvisorCard() { return <section className="advisor-card"><div className="advisor-card-photo"><Photo src={photos.guide} alt="Betheli Expeditions local trip advisor" /><span><i aria-hidden="true" />Online now</span></div><div className="advisor-card-content"><header><div><p className="eyebrow">YOUR LOCAL TRIP ADVISOR</p><h2>Betheli Team</h2></div><span className="advisor-location"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.1 7-12A7 7 0 1 0 5 9c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>Based in Tanzania</span></header><h3>Want to plan a memorable Tanzanian adventure?</h3><p>Share your dates and ideas with our local planners. The Betheli team will help you shape the right climb, safari, island stay or combination.</p><div className="advisor-actions"><a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button"><Image src="/images/figma-trips-quote-whatsapp.svg" alt="" width={22} height={22} />WhatsApp</a><Link href="/contact" className="button advisor-enquiry"><Image src="/images/figma-home-footer-mail.svg" alt="" width={20} height={20} />Send an enquiry</Link></div></div></section>; }

const thankYouTrips = [
  { title: "6-Day Northern Serengeti Safari", label: "SAFARI", copy: "Follow the landscapes and wildlife of northern Tanzania.", image: "/images/northern-serengeti-migration.webp", href: "/trips/northern-serengeti" },
  { title: "4-Day Mount Meru Trek", label: "MOUNTAIN", copy: "A rewarding highland trek through Arusha National Park.", image: "/images/figma-safari-destinations-destination-photograph4.png", href: "/trips/mount-meru-trek" },
  { title: "9-Day Northern Circuit Route", label: "KILIMANJARO", copy: "A quieter, gradual route around Kilimanjaro's northern slopes.", image: "/images/figma-kili-routes-route-landscape4.png", href: "/trips/northern-circuit-route" },
];

function ThankYouPage() {
  return <><main className="thank-you-page">
    <section className="thank-you-hero">
      <Photo className="thank-you-hero-image" src="/images/figma-plan-hero.png" alt="Tanzania landscape at sunset" priority sizes="100vw" />
      <div className="thank-you-hero-scrim" />
      <Header overlay variant="classic" />
      <div className="shell thank-you-hero-content">
        <div className="thank-you-tick" aria-hidden="true"><Image src="/images/svgrepo-check-circle.svg" alt="" width={96} height={96} priority /></div>
        <p className="eyebrow light">ENQUIRY RECEIVED</p>
        <h1>Thank you.<br />We&apos;re excited to welcome you.</h1>
        <p>Your message is safely with the Betheli Expeditions team. A local trip planner will review what you shared and contact you using the details in your enquiry.</p>
        <div className="thank-you-actions"><Link className="button" href="/trips">Explore more trips <Arrow /></Link><Link className="ghost-button" href="/">Return home <Arrow /></Link></div>
      </div>
    </section>

    <section className="thank-you-next shell" aria-labelledby="thank-you-next-title">
      <div className="thank-you-next-intro"><Image src="/images/svgrepo-compass.svg" alt="" width={56} height={56} /><p className="eyebrow">WHAT HAPPENS NEXT</p><h2 id="thank-you-next-title">Your Tanzania journey starts with a conversation.</h2></div>
      <ol>
        <li><b>1</b><span><strong>We review your ideas</strong>Your dates, interests and questions help us understand the journey you have in mind.</span></li>
        <li><b>2</b><span><strong>A local planner gets in touch</strong>We&apos;ll continue the conversation using the contact details you provided.</span></li>
        <li><b>3</b><span><strong>We shape the trip together</strong>Routes, pace and stays can be refined around you before anything is confirmed.</span></li>
      </ol>
    </section>

    <section className="thank-you-suggestions">
      <div className="shell"><SectionIntro eyebrow="KEEP DREAMING" title="More journeys you might like" text="While we review your enquiry, explore a few different ways to experience Tanzania." align="left" />
        <div className="thank-you-trip-grid">{thankYouTrips.map(trip => <Link href={trip.href} key={trip.href} className="thank-you-trip-card"><Photo src={trip.image} alt={trip.title} /><span>{trip.label}</span><div><h3>{trip.title}</h3><p>{trip.copy}</p><b>View trip <Arrow /></b></div></Link>)}</div>
        <div className="thank-you-more"><Link href="/trips" className="button button-dark">See all trips <Arrow /></Link><a href={whatsappHref} target="_blank" rel="noopener noreferrer">Prefer WhatsApp? Talk with our local team.</a></div>
      </div>
    </section>
  </main><Footer /></>;
}

export function SitePage({ page, web3FormsAccessKey = "" }: { page: PageKey; web3FormsAccessKey?: string }) {
  switch (page) {
    case "home": return <HomePage />;
    case "kilimanjaro": return <DestinationPage content={destinationContent.kilimanjaro} />;
    case "machame": return <MachamePage />;
    case "safari": return <DestinationPage content={destinationContent.safari} />;
    case "zanzibar": return <DestinationPage content={destinationContent.zanzibar} />;
    case "plan": return <PlanPage web3FormsAccessKey={web3FormsAccessKey} />;
    case "contact": return <ContactPage web3FormsAccessKey={web3FormsAccessKey} />;
    case "faq": return <FaqPage />;
    case "trips": return <TripPage />;
    case "groups": return <GroupsPage web3FormsAccessKey={web3FormsAccessKey} />;
    case "thankYou": return <ThankYouPage />;
  }
}
