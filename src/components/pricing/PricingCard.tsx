/**
 * @license SPDX-License-Identifier: Apache-2.0
 */

import type { PointerEvent as ReactPointerEvent } from "react";
import { buildPackageWhatsAppUrl } from "../../config";

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
}

const TILT_STRENGTH = 6;

export function PricingCard({ name, price, features }: PricingCardProps) {
  const slug = name.replace(/\s+/g, "-").toLowerCase();
  const headingId = `pricing-card-${slug}`;
  const whatsappHref = buildPackageWhatsAppUrl(name);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    event.currentTarget.style.setProperty(
      "--price-tilt-y",
      `${(x * TILT_STRENGTH).toFixed(2)}deg`,
    );
    event.currentTarget.style.setProperty(
      "--price-tilt-x",
      `${(-y * TILT_STRENGTH).toFixed(2)}deg`,
    );
  };

  const resetTilt = (event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty("--price-tilt-x", "0deg");
    event.currentTarget.style.setProperty("--price-tilt-y", "0deg");
  };

  return (
    <article
      className="pricing-card"
      aria-labelledby={headingId}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <header className="pricing-card__header">
        <h3 id={headingId} className="pricing-card__name">
          {name}
        </h3>
        <div className="pricing-card__price">{price}</div>
      </header>

      <ul className="pricing-card__features">
        {features.map((line) => (
          <li key={line} className="pricing-card__feature">
            <span className="pricing-card__feature-label">{line}</span>
            <span className="pricing-card__feature-plus" aria-hidden="true">
              +
            </span>
          </li>
        ))}
      </ul>

      <div className="pricing-card__cta">
        <a
          href={whatsappHref}
          className="pricing-card__button"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Get started with the ${name} package on WhatsApp`}
        >
          <span>Get started</span>
          <span className="pricing-card__button-arrow" aria-hidden="true">
            →
          </span>
        </a>
      </div>
    </article>
  );
}
