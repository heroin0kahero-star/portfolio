/**
 * @license SPDX-License-Identifier: Apache-2.0
 *
 * Site-wide contact configuration.
 *
 * The WhatsApp number is stored once, in international format with digits
 * only (country code + local number). Change it here and every generated
 * WhatsApp link follows.
 */

export const WHATSAPP_NUMBER = "918792009091";

/** Build a wa.me link with an encoded, prefilled message. */
export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** The message used by every package card's "Get started" button. */
export function buildPackageWhatsAppUrl(packageName: string): string {
  return buildWhatsAppUrl(
    `Hi Suman, I'm interested in the ${packageName} package. Can we talk?`,
  );
}
