/**
 * @license SPDX-License-Identifier: Apache-2.0
 * CaseCard — project case study card with client need, what was built, and result.
 * Honesty: uses TODO(result) placeholders for missing metrics — nothing is invented.
 */

import React from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

interface CaseCardProps {
  title: string;
  client: string;
  siteUrl?: string;
  caseStudy: {
    clientNeeded: string;
    whatIBuilt: string;
    result?: string;
  };
}

export function CaseCard({ title, client, siteUrl, caseStudy }: CaseCardProps) {
  const hasResult = Boolean(caseStudy.result && !caseStudy.result.startsWith("TODO"));

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-[1.25rem] border border-white/5 bg-white/[0.02] p-6 md:p-8 flex flex-col gap-4 group hover:bg-white/[0.03] hover:border-white/20 transition-all"
    >
      <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
        <div className="flex-1">
          <span className="text-[10px] tracking-widest text-white/40 uppercase font-mono block mb-2">
            {client}
          </span>
          <h3 className="font-heading italic text-xl md:text-2xl text-white leading-tight">
            {title}
          </h3>
        </div>
        {siteUrl && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[10px] font-mono text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
          >
            Live site <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block mb-1">
            Client Needed
          </span>
          <p className="text-sm text-white/70 font-body font-light leading-relaxed">
            {caseStudy.clientNeeded}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block mb-1">
            What I Built
          </span>
          <p className="text-sm text-white/70 font-body font-light leading-relaxed">
            {caseStudy.whatIBuilt}
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider block mb-1">
            Result
          </span>
          <p className="text-sm text-white/70 font-body font-light leading-relaxed">
            {hasResult ? caseStudy.result : "TODO(result): metric not yet provided"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
