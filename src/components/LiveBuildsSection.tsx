"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import {
  CardBody,
  CardContainer,
  CardItem,
  CardVideo,
  type CardVideoApi,
} from "@/components/ui/3d-card-effect";

gsap.registerPlugin(ScrollTrigger);

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFDE03] focus-visible:ring-offset-2 focus-visible:ring-offset-black";

interface Build {
  slug: string;
  kind: "demo" | "client";
  year: number;
  title: string;
  blurb: string;
  tags: string[];
  href: string;
}

// Copy from the site's own data — no invented claims or results.
// kind "demo" badges as "DEMO BUILD", "client" badges as "LIVE CLIENT SITE".
const builds: Build[] = [
  {
    slug: "zenvora-clinic",
    kind: "client",
    year: 2026,
    title: "Zenvora Aesthetics — Skin, Hair & Fat-Loss Clinic",
    blurb:
      "A premium aesthetic clinic website I designed and built — clean, soft-neutral skincare and clinic visuals for Zenvora Aesthetics in Indiranagar.",
    tags: ["Aesthetic Clinic", "Skincare", "Web Design"],
    href: "https://www.zenvoraaesthetics.in/",
  },
  {
    slug: "kites-sports-foundation",
    kind: "client",
    year: 2025,
    title: "Kites Sports Foundation",
    blurb:
      "Informational site for a sports foundation: programmes, events and community outreach in a bold, high-energy layout.",
    tags: ["Web Development", "Sports", "Non-Profit"],
    href: "https://www.kitessportsfoundation.in/",
  },
  {
    slug: "play-365-titanfa",
    kind: "client",
    year: 2025,
    title: "Play 365 Titan FA",
    blurb:
      "Web portal for a football academy: news, fixtures and a talent showcase.",
    tags: ["Web Development", "Football", "Academy Portal"],
    href: "https://www.play365titanfa.in/",
  },
];

function BuildCard({ build }: { build: Build }) {
  const revealRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<CardVideoApi | null>(null);
  const [playing, setPlaying] = useState(false);
  const [videoErrored, setVideoErrored] = useState(false);

  // GSAP scroll reveal on a wrapper OUTSIDE CardContainer's inner div
  // (which owns the inline tilt transform). fromTo keeps cards visible
  // even if the ScrollTrigger never fires.
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;
    const anim = gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      }
    );
    return () => {
      anim.kill();
    };
  }, []);

  const isDemo = build.kind === "demo";

  return (
    <div ref={revealRef} className="w-full max-w-[26rem] flex flex-col items-center">
      <CardContainer
        containerClassName="w-full min-w-0"
        className="w-full"
      >
        <CardBody className="w-full h-auto text-center">
          {/* Top row: badge + year (mono) — translateZ 20 */}
          <CardItem translateZ={20} className="w-full mb-2">
            <div className="flex items-center justify-center gap-1.5">
              <span
                className="rounded-none border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest text-white shadow-[1px_1px_0px_#000]"
              >
                {isDemo ? "DEMO BUILD" : "LIVE CLIENT SITE"}
              </span>
              <span className="text-[10px] font-mono text-white/40">
                {build.year}
              </span>
            </div>
          </CardItem>

          {/* Title (Instrument Serif) — translateZ 50 */}
          <CardItem translateZ={50} className="w-full mt-2 mb-2">
            <h3
              className="font-heading italic text-3xl md:text-5xl tracking-tight text-white leading-none"
            >
              {build.title}
            </h3>
          </CardItem>

          {/* Blurb (2 lines max) — translateZ 40 */}
          <CardItem translateZ={40} className="w-full mb-3">
            <p
              className="mx-auto max-w-[24rem] text-sm md:text-base text-white/70 font-body leading-relaxed line-clamp-2"
            >
              {build.blurb}
            </p>
          </CardItem>

          {/* Video frame (16:10, 2px border, object-cover, poster) — translateZ 100 */}
          <CardItem translateZ={100} className="w-full mb-3">
            <CardVideo
              ref={videoRef}
              webm={`/videos/builds/${build.slug}.webm`}
              mp4={`/videos/builds/${build.slug}.mp4`}
              title={build.title}
              onPlayingChange={setPlaying}
              onError={() => setVideoErrored(true)}
            />
          </CardItem>

          {/* Tag chips (mono) — translateZ 30 */}
          <CardItem translateZ={30} className="w-full mt-3 mb-2">
            <div className="flex flex-wrap justify-center gap-1.5">
              {build.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-none border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardItem>

          {/* Footer: live-site link + play/pause button — translateZ 20 */}
          <CardItem translateZ={20} className="w-full mt-3">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 w-full">
              <a
                href={build.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-none border-2 border-black bg-white text-black px-4 py-2 text-[11px] font-mono font-bold uppercase shadow-[2px_2px_0px_#000]",
                  "hover:bg-[#F27D26] hover:shadow-[2px_2px_0px_#FFDE03] transition-all duration-200",
                  focusRing
                )}
              >
                Visit live site <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              {!videoErrored && (
                <button
                  onClick={() => videoRef.current?.toggle()}
                  aria-pressed={playing}
                  aria-label={
                    playing
                      ? `Pause preview of ${build.title}`
                      : `Play preview of ${build.title}`
                  }
                  disabled={!!(videoRef.current?.errored)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-none border-2 border-black bg-black text-white px-4 py-2 text-[11px] font-mono font-bold uppercase shadow-[2px_2px_0px_#000]",
                    "hover:bg-[#F27D26] hover:shadow-[2px_2px_0px_#FFDE03] transition-all duration-200",
                    focusRing
                  )}
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
              )}
            </div>
          </CardItem>
        </CardBody>
      </CardContainer>
    </div>
  );
}

export default function LiveBuildsSection() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Mono subline: hover copy on fine pointer, tap copy on touch.
  const subline = coarse
    ? "Tap a card to play."
    : "Hover a card to watch the site run.";

  return (
    <section
      id="live-builds"
      aria-label="Live builds"
      className={cn(
        "relative bg-black border-2 border-white rounded-none shadow-[4px_4px_0px_#F27D26] hover:shadow-[4px_4px_0px_#FFDE03] transition-shadow duration-200 overflow-x-clip select-none",
        "py-24 px-6 md:px-12 lg:px-24"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-4 mb-16 md:mb-20">
          {/* Mono label — follows the site's [LABEL] header pattern */}
          <span className="text-[10px] tracking-[4px] text-white/40 uppercase font-mono">
            [LIVE_BUILDS]
          </span>
          <h2 className="font-heading italic text-5xl md:text-7xl leading-none tracking-[-2px] text-white">
            Real sites. Live now.
          </h2>
          <p className="text-xs font-mono text-white/60">{subline}</p>
        </div>

        {/* Grid: 1 column below lg, 3 columns from lg, cards centered */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-center justify-center">
          {builds.map((build) => (
            <BuildCard key={build.slug} build={build} />
          ))}
        </div>
      </div>
    </section>
  );
}
