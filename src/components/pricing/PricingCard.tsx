/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { ReactNode } from "react";

interface PricingCardProps {
  index: number;
  name: string;
  price: string;
  blurb: string;
  features: string[];
  ctaHref: string;
}

export function PricingCard({
  name,
  price,
  features,
  ctaHref,
}: PricingCardProps) {
  const slug = name.replace(/\s+/g, "-").toLowerCase();

  return (
    <article
      className="pricing-card-new"
      aria-labelledby={`pricing-card-${slug}`}
    >
      <header className="pricing-card-new__header">
        <h3 id={`pricing-card-${slug}`} className="pricing-card-new__name">
          {name.toUpperCase()}
        </h3>
        <div className="pricing-card-new__price">{price}</div>
      </header>

      <ul className="pricing-card-new__features">
        {features.map((line) => (
          <li key={line} className="pricing-card-new__feature-row">
            <span className="pricing-card-new__feature-label">{line}</span>
            <span className="pricing-card-new__feature-plus" aria-hidden="true">
              +
            </span>
          </li>
        ))}
      </ul>

      <div className="pricing-card-new__cta-wrap">
        <a href={ctaHref} className="pricing-card-new__button">
          GET STARTED →
        </a>
      </div>
    </article>
  );
}
