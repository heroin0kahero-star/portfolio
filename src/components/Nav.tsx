"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "../lib/utils";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-ground/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <a
            href="#"
            className="font-mono text-xs font-bold uppercase tracking-widest text-ink"
          >
            Suman
          </a>

          <div
            className={cn(
              "hidden lg:flex items-center gap-8",
              open && "lg:hidden"
            )}
          >
            <a href="#work" className="text-sm text-muted hover:text-ink transition-colors">
              Work
            </a>
            <a href="#pricing" className="text-sm text-muted hover:text-ink transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-sm text-muted hover:text-ink transition-colors">
              About
            </a>
            <a href="#contact" className="text-sm text-muted hover:text-ink transition-colors">
              Contact
            </a>
          </div>

          <div className="ml-4 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-ink"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden absolute left-0 right-0 top-16 border-t border-white/5 bg-ground px-6 pb-8"
          >
            <div className="flex flex-col gap-4">
              <a
                href="#work"
                onClick={() => setOpen(false)}
                className="block text-sm text-muted hover:text-ink transition-colors py-2"
              >
                Work
              </a>
              <a
                href="#pricing"
                onClick={() => setOpen(false)}
                className="block text-sm text-muted hover:text-ink transition-colors py-2"
              >
                Pricing
              </a>
              <a
                href="#about"
                onClick={() => setOpen(false)}
                className="block text-sm text-muted hover:text-ink transition-colors py-2"
              >
                About
              </a>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="block text-sm text-muted hover:text-ink transition-colors py-2"
              >
                Contact
              </a>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 text-xs font-mono font-bold uppercase tracking-widest text-accent"
            >
              <X className="h-4 w-4 mr-2" /> Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
