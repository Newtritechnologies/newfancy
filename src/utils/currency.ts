export const HERO_BANNER_IMG = '/store-images/fancy_hero_banner_1794550856206.jpg';
export const PROMO_BRIDAL_IMG = '/store-images/fancy_promo_bridal_1794550857074.jpg';
export const ABOUT_BOUTIQUE_IMG = '/store-images/fancy_boutique_about_1794550856286.jpg';

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
