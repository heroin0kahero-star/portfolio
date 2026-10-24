import { useEffect, useRef, useState } from 'react';
import { Engine } from './Experience/Engine';
import { stages } from '../../data/stages';
import { hexToRgb, rgbToCmyk, sampleImageMood, getLuminance } from './utils';
import './workgallery.css';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      (window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))) ||
      (window.WebGL2RenderingContext && canvas.getContext('webgl2'))
    );
  } catch {
    return false;
  }
}

function StaticFallback({ stageData }: { stageData: any[] }) {
  return (
    <section id="process" aria-labelledby="process-heading" className="work-gallery work-gallery--static">
      <div className="work-gallery__static-inner">
        <header className="work-gallery__header-static">
          <span className="work-gallery__toplabel">HOW WE WORK TOGETHER</span>
          <span className="process-eyebrow">My process</span>
          <h2 id="process-heading" className="process-title">
            How we work together
          </h2>
          <p className="process-intro">
            A clear path from the first conversation to what happens after launch. Five stages, one person accountable for the whole build.
          </p>
        </header>
        <div className="work-gallery__static-grid">
          {stageData.map((stage) => {
            const light = getLuminance(stage.mood) > 0.4;
            return (
              <article key={stage.id} className="work-gallery__static-row">
                <div className="work-gallery__static-media">
                  <img src={stage.image} alt={`${stage.title}`} loading="lazy" />
                </div>
                <div className={`work-gallery__card ${light ? 'work-gallery__card--light' : ''}`}>
                  <div className="work-gallery__card-top">
                    <span className="work-gallery__card-index">{stage.id}</span>
                    <span className="work-gallery__card-kicker">STAGE</span>
                  </div>
                  <h3 className="work-gallery__card-title">{stage.title.toUpperCase()}</h3>
                  <p className="work-gallery__card-body">{stage.text}</p>
                  <ul className="work-gallery__card-tags">
                    {stage.tags.map((tag) => (
                      <li key={tag} className="work-gallery__card-tag-row">
                        <span>{tag}</span>
                        <span aria-hidden="true">+</span>
                      </li>
                    ))}
                  </ul>
                  <div className="work-gallery__card-bottom">
                    <span className="work-gallery__card-pill">{stage.id} / 05</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function WorkGallery({ className = '' }: { className?: string }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion());
  const [noWebGL, setNoWebGL] = useState(!isWebGLAvailable());
  const [activeIndex, setActiveIndex] = useState(0);
  const [stageData, setStageData] = useState<any[]>(stages.map((s) => ({ ...s, mood: '#1f1f1f', cmyk: { c: 0, m: 0, y: 0, k: 100 }, rgb: { r: 31, g: 31, b: 31 } })));
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setReducedMotion(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const loadMoods = async () => {
      const updated = await Promise.all(
        stages.map(async (stage) => {
          const mood = await sampleImageMood(stage.image);
          const rgb = hexToRgb(mood);
          const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
          return { ...stage, mood, rgb, cmyk };
        })
      );
      setStageData(updated);
      if (engineRef.current?.gallery) {
        updated.forEach((s, i) => {
          if (engineRef.current?.gallery?.planes[i]) {
            engineRef.current.gallery.planes[i].userData.mood = s.mood;
          }
        });
      }
    };
    loadMoods();
  }, []);

  const isStatic = reducedMotion || noWebGL;

  useEffect(() => {
    if (isStatic) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const engine = new Engine(canvas);
    engineRef.current = engine;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            engine.start();
          } else {
            engine.stop();
          }
        });
      },
      { rootMargin: '100px 0px 100px 0px' }
    );

    engine.init().then(() => {
      // Set moods
      stageData.forEach((s, i) => {
        if (engine.gallery?.planes[i]) {
          engine.gallery.planes[i].userData.mood = s.mood;
        }
      });
      observer.observe(section);
    });

    const interval = setInterval(() => {
      if (engine.gallery && engine.camera) {
        const idx = engine.gallery.getActivePlaneIndex(engine.camera.position.z);
        if (idx !== -1 && idx !== activeIndex) {
          setActiveIndex(idx);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, [isStatic, stageData]);

  if (isStatic) {
    return <StaticFallback stageData={stageData} />;
  }

  const activeStage = stageData[activeIndex] || stageData[0];
  const light = getLuminance(activeStage.mood) > 0.4;

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-labelledby="process-heading"
      className={`work-gallery ${className}`.trim()}
      style={{ height: `${stages.length * 100}vh` }}
    >
      <div className="work-gallery__pin">
        <canvas ref={canvasRef} className="work-gallery__canvas webgl" aria-hidden="true" />
        <div className="work-gallery__overlay">
          <div className="work-gallery__topbar">
            <span className="work-gallery__toplabel">HOW WE WORK TOGETHER</span>
            <span className="work-gallery__stagetop">
              STAGE {activeStage.id} / 05
            </span>
          </div>
          <div className="work-gallery__grid">
            <div className="work-gallery__left">
              <div className="work-gallery__intro">
                <span className="process-eyebrow">My process</span>
                <h2 id="process-heading" className="process-title">
                  How we work together
                </h2>
                <p className="process-intro">
                  A clear path from the first conversation to what happens after launch. Five stages, one person accountable for the whole build.
                </p>
              </div>
              <div className="work-gallery__meta">
                <div className="work-gallery__meta-row">
                  <span className="work-gallery__meta-id">{activeStage.id}</span>
                </div>
                <h3 className="work-gallery__meta-title">{activeStage.title.toUpperCase()}</h3>
                <div
                  className="work-gallery__meta-dot"
                  style={{ backgroundColor: activeStage.mood }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="work-gallery__right">
              <div className={`work-gallery__card ${light ? 'work-gallery__card--light' : ''}`} key={activeIndex}>
                <div className="work-gallery__card-top">
                  <span className="work-gallery__card-index">{activeStage.id}</span>
                  <span className="work-gallery__card-kicker">STAGE</span>
                </div>
                <h3 className="work-gallery__card-title">{activeStage.title.toUpperCase()}</h3>
                <p className="work-gallery__card-body">{activeStage.text}</p>
                <ul className="work-gallery__card-tags">
                  {activeStage.tags.map((tag) => (
                    <li key={tag} className="work-gallery__card-tag-row">
                      <span>{tag}</span>
                      <span aria-hidden="true">+</span>
                    </li>
                  ))}
                </ul>
                <div className="work-gallery__card-bottom">
                  <span className="work-gallery__card-pill">{activeStage.id} / 05</span>
                </div>
              </div>
              <div className="work-gallery__readout">
                <div className="work-gallery__readout-row">
                  <span className="work-gallery__readout-label">CMYK</span>
                  <span className="work-gallery__readout-value">
                    {activeStage.cmyk.c} {activeStage.cmyk.m} {activeStage.cmyk.y} {activeStage.cmyk.k}
                  </span>
                </div>
                <div className="work-gallery__readout-row">
                  <span className="work-gallery__readout-label">RGB</span>
                  <span className="work-gallery__readout-value">
                    {activeStage.rgb.r} {activeStage.rgb.g} {activeStage.rgb.b}
                  </span>
                </div>
                <div className="work-gallery__readout-row">
                  <span className="work-gallery__readout-label">HEX</span>
                  <span className="work-gallery__readout-value">{activeStage.mood.toUpperCase()}</span>
                </div>
                <div className="work-gallery__readout-row">
                  <span className="work-gallery__readout-label">PMS</span>
                  <span className="work-gallery__readout-value">—</span>
                </div>
              </div>
            </div>
          </div>
          <div className="work-gallery__bottom">
            <div className="work-gallery__progress">
              <div
                className="work-gallery__progress-fill"
                style={{ width: `${((activeIndex + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
