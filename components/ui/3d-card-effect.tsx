"use client";

import { cn } from "@/lib/utils";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

/**
 * Imperative handle exposed by CardVideo so a sibling (e.g. the footer
 * play/pause button) can drive playback without knowing the video node.
 */
export interface CardVideoApi {
  toggle: () => void;
  play: () => void;
  pause: () => void;
  readonly errored: boolean;
}

/**
 * CardContainer — perspective root + tilt layer.
 *
 * Tilt is disabled when `(hover: none)`, `(pointer: coarse)` or
 * `prefers-reduced-motion: reduce` matches. Media queries are read inside
 * an effect so SSR stays safe. When disabled, `isMouseEntered` is never
 * set to true — touch browsers fire synthetic mouseenter on tap, which
 * would otherwise leave the card stuck "hovered".
 */
export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const [tiltDisabled, setTiltDisabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)"
    );
    const update = () => setTiltDisabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (tiltDisabled || !containerRef.current) return;
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
    },
    [tiltDisabled]
  );

  const handleMouseEnter = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      if (tiltDisabled) return;
      setIsMouseEntered(true);
    },
    [tiltDisabled]
  );

  const handleMouseLeave = useCallback(
    (_e: React.MouseEvent<HTMLDivElement>) => {
      if (tiltDisabled) return;
      setIsMouseEntered(false);
      if (!containerRef.current) return;
      containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
    },
    [tiltDisabled]
  );

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center", containerClassName)}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "flex items-center justify-center relative transition-all duration-200 ease-linear",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "[transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: any;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    handleAnimations();
  }, [isMouseEntered]);

  const handleAnimations = () => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  };

  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Create a hook to use the context
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};

/* ------------------------------------------------------------------ */
/* CardVideo                                                          */
/* ------------------------------------------------------------------ */

interface CardVideoProps {
  webm?: string;
  mp4?: string;
  title: string;
  onPlayingChange?: (playing: boolean) => void;
  onError?: () => void;
  className?: string;
}

// One video playing at a time across every card on the page.
let activeVideo: HTMLVideoElement | null = null;

function claimExclusive(video: HTMLVideoElement): void {
  if (activeVideo && activeVideo !== video) {
    try {
      activeVideo.pause();
    } catch {
      // ignore — the other card may already be detached
    }
  }
  activeVideo = video;
}

function releaseExclusive(video: HTMLVideoElement): void {
  if (activeVideo === video) {
    activeVideo = null;
  }
}

// Warn once per video src (avoid spamming the console on every re-render).
const warnedVideoSrcs = new Set<string>();

export const CardVideo = React.forwardRef<CardVideoApi, CardVideoProps>(
  function CardVideo(
    { webm, mp4, title, onPlayingChange, onError, className },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const stateRef = useRef({ playing: false, errored: false });
    const [playing, setPlaying] = useState(false);
    const [errored, setErrored] = useState(false);
    const [near, setNear] = useState(false);
    const [coarse, setCoarse] = useState(false);
    const sourcesReadyRef = useRef(false);
    const warnedRef = useRef(false);

    stateRef.current = { playing, errored };

    const hintText = coarse ? "Tap to play" : "Hover to play";

    // Pointer coarseness — drives the hint label.
    useEffect(() => {
      const mq = window.matchMedia("(pointer: coarse)");
      const update = () => setCoarse(mq.matches);
      update();
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }, []);

    // Lazy loading: attach sources only once the card is within ~300px of
    // the viewport, then switch preload to "metadata".
    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          setNear(entries.some((entry) => entry.isIntersecting));
        },
        { root: null, rootMargin: "300px 0px", threshold: 0 }
      );
      io.observe(el);
      return () => io.disconnect();
    }, []);

    useEffect(() => {
      const el = videoRef.current;
      if (!el) return;
      if (near) {
        el.preload = "metadata";
        if (!sourcesReadyRef.current) {
          sourcesReadyRef.current = true;
          el.load();
        }
      } else {
        el.pause();
        if (stateRef.current.playing) {
          setPlaying(false);
          onPlayingChange?.(false);
        }
        releaseExclusive(el);
      }
    }, [near, onPlayingChange]);

    // Pause playback when the page is hidden.
    useEffect(() => {
      const onVisibilityChange = () => {
        if (!document.hidden) return;
        const el = videoRef.current;
        if (!el) return;
        el.pause();
        if (stateRef.current.playing) {
          setPlaying(false);
          onPlayingChange?.(false);
        }
        releaseExclusive(el);
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
      return () =>
        document.removeEventListener("visibilitychange", onVisibilityChange);
    }, [onPlayingChange]);

    const handleError = useCallback(() => {
      if (warnedRef.current) return;
      warnedRef.current = true;
      if (!warnedVideoSrcs.has(title)) {
        warnedVideoSrcs.add(title);
        console.warn(
          `[Live Builds] video preview failed to load for "${title}".`
        );
      }
      setErrored(true);
      onError?.();
      if (activeVideo === videoRef.current) {
        activeVideo = null;
      }
    }, [title, onError]);

    const startPlaying = useCallback(() => {
      const el = videoRef.current;
      if (!el || errored || !el.paused) return;
      claimExclusive(el);
      const promise = el.play();
      if (promise !== undefined) {
        promise.catch(() => {
          // Autoplay rejected silently (per spec).
        });
      }
      setPlaying(true);
      onPlayingChange?.(true);
    }, [errored, onPlayingChange]);

    const stopPlaying = useCallback(() => {
      const el = videoRef.current;
      if (!el) return;
      el.pause();
      setPlaying(false);
      onPlayingChange?.(false);
      releaseExclusive(el);
    }, [onPlayingChange]);

    const toggle = useCallback(() => {
      const el = videoRef.current;
      if (!el || errored) return;
      if (el.paused || el.ended) {
        startPlaying();
      } else {
        stopPlaying();
      }
    }, [errored, startPlaying, stopPlaying]);

    // Desktop hover: play on card hover, pause + reset to poster frame on
    // leave. When tilt is disabled (touch / reduced motion) the context
    // never reports entered, so this effect does nothing there.
    const [isMouseEntered] = useMouseEnter();
    useEffect(() => {
      const el = videoRef.current;
      if (!el || errored) return;
      if (isMouseEntered) {
        startPlaying();
      } else {
        stopPlaying();
        el.currentTime = 0;
      }
    }, [isMouseEntered, errored, startPlaying, stopPlaying]);

    useImperativeHandle(
      ref,
      () => ({
        toggle,
        play: startPlaying,
        pause: stopPlaying,
        get errored() {
          return stateRef.current.errored;
        },
      }),
      [toggle, startPlaying, stopPlaying]
    );

    return (
      <div
        className={cn("relative w-full aspect-[16/10]", className)}
        style={{ display: "block" }}
      >
        <video
          ref={videoRef}
          preload={near ? "metadata" : "none"}
          muted
          loop
          playsInline
          disablePictureInPicture
          onError={handleError}
          className="absolute inset-0 w-full h-full object-cover block"
          style={{ objectFit: "cover" }}
        >
          {webm && <source src={webm} type="video/webm" />}
          {mp4 && <source src={mp4} type="video/mp4" />}
        </video>

        {!playing && !errored && (
          <div
            className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-none border border-white/10 bg-black/40 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white/90 shadow-[0_0_6px_#000]"
          >
            <span>{hintText}</span>
          </div>
        )}
      </div>
    );
  }
);

CardVideo.displayName = "CardVideo";
