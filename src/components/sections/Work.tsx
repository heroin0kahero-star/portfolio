"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { PortfolioProject } from "../../types";

interface CaseCardProps {
  project: PortfolioProject;
}

export function CaseCard({ project }: CaseCardProps) {
  const hasScreenshot = Boolean(
    project.caseStudy.screenshots.desktop ||
      project.caseStudy.screenshots.phone
  );

  return (
    <article
      className="group relative rounded-[1.5rem] border border-white/5 bg-white/[0.02] overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,0.2)]"
    >
      {/* Media placeholder area */}
      <div className="relative h-64 md:h-96 bg-white/[0.03] overflow-hidden">
        {hasScreenshot ? (
          <img
            src={project.caseStudy.screenshots.desktop || ""}
            alt={`${project.title} — desktop screenshot`}
            width={800}
            height={600}
            className="object-cover w-full h-full"
            loading="eager"
            style={{ display: "block" }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-white/10 bg-white/[0.02]">
            <img
              src="https://picsum.photos/seed/zenvora/800/600"
              alt="Placeholder — add real screenshot"
              width={800}
              height={600}
              className="object-cover w-full h-full opacity-40"
              style={{ display: "block" }}
            />
            <span className="text-[10px] font-mono text-muted uppercase tracking-widest">
              Screenshot to add
            </span>
          </div>
        )}
        <a
          href={project.siteUrl || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 bottom-4 z-20 inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-mono text-ink hover:bg-white/20 transition-colors"
        >
          <ArrowUpRight className="h-3 w-3" /> Open site
        </a>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-4">
          <div>
            <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-accent">
              {project.year} · {project.role || "Web Development"}
            </span>
            <h3 className="mt-1 text-xl font-bold text-ink leading-tight">
              {project.title}
            </h3>
            <p className="mt-2 text-sm text-muted max-w-[45ch]">
              {project.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono font-bold uppercase tracking-wider border border-white/10 bg-white/[0.02] px-2 py-0.5 rounded text-muted hover:text-ink transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <dt className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            Client needed
          </dt>
          <dd className="text-sm text-ink leading-relaxed">
            {project.caseStudy.clientNeeded}
          </dd>
          <dt className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            What I built
          </dt>
          <dd className="text-sm text-ink leading-relaxed">
            {project.caseStudy.whatIBuilt}
          </dd>
        </dl>

        {project.caseStudy.tools.length > 0 && (
          <div className="mb-6">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted block mb-2">
              Tools
            </span>
            <div className="flex flex-wrap gap-2">
              {project.caseStudy.tools.map((tool) => (
                <span
                  key={tool}
                  className="text-[10px] font-mono border border-white/10 bg-white/[0.02] px-2 py-0.5 rounded text-muted"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.caseStudy.result && (
          <div className="pt-6 border-t border-white/5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted block mb-2">
              Result
            </span>
            <p className="text-sm text-accent font-semibold">
              {project.caseStudy.result}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export function WorkSection({ projects }: { projects: PortfolioProject[] }) {
  const reduced = useReducedMotion();
  return (
    <section
      id="work"
      className="py-24 px-6 lg:px-12 bg-ground"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-ink">
              Work
            </h2>
            <p className="mt-3 text-base text-muted max-w-[55ch]">
              Each project is shown once, in full — what the client needed,
              what I built, and the tools I used.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              whileInView={
                reduced
                  ? {}
                  : {
                      y: [20, 0],
                      opacity: [0, 1],
                      transition: { duration: 0.5 },
                    }
              }
              initial={reduced ? {} : { y: 20, opacity: 0 }}
              viewport={{ once: true }}
              style={{ animationDelay: reduced ? "0ms" : `${index * 100}ms` }}
              className="group"
            >
              <CaseCard project={project} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
