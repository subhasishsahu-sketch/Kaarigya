/**
 * Curated, verified, high-availability image library for authentic Indian handicrafts.
 * Includes multiple fallback tiers for every craft category and artisan.
 */

export const CRAFT_FALLBACK_IMAGES: Record<string, string[]> = {
  applique: [
    "https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80"
  ],
  metalwork: [
    "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80"
  ],
  handloom: [
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80"
  ],
  woodcraft: [
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80"
  ],
  painting: [
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=800&q=80"
  ],
  counterfeit: [
    "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80"
  ]
};

export const ARTISAN_FALLBACK_AVATARS: Record<string, string> = {
  "Sita Devi Mahapatra": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  "Ramesh Kumar Sahu": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  "Anita Das & Weavers Collective": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
  "Manjunath Gowda": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  "Radha Jha": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  "default": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
};

/**
 * Returns a robust fallback image URL for any craft category
 */
export function getCraftCategoryFallback(craftCategory?: string, productId?: string): string {
  if (productId === "CRAFT-00999" || (craftCategory && craftCategory.toLowerCase().includes("counterfeit"))) {
    return CRAFT_FALLBACK_IMAGES.counterfeit[0];
  }

  if (productId === "CRAFT-00125" || (craftCategory && (craftCategory.toLowerCase().includes("metal") || craftCategory.toLowerCase().includes("dhokra") || craftCategory.toLowerCase().includes("brass")))) {
    return CRAFT_FALLBACK_IMAGES.metalwork[0];
  }

  if (productId === "CRAFT-00126" || (craftCategory && (craftCategory.toLowerCase().includes("handloom") || craftCategory.toLowerCase().includes("silk") || craftCategory.toLowerCase().includes("saree") || craftCategory.toLowerCase().includes("ikat")))) {
    return CRAFT_FALLBACK_IMAGES.handloom[0];
  }

  if (productId === "CRAFT-00127" || (craftCategory && (craftCategory.toLowerCase().includes("wood") || craftCategory.toLowerCase().includes("toy") || craftCategory.toLowerCase().includes("channapatna") || craftCategory.toLowerCase().includes("lacquer")))) {
    return CRAFT_FALLBACK_IMAGES.woodcraft[0];
  }

  if (productId === "CRAFT-00128" || (craftCategory && (craftCategory.toLowerCase().includes("painting") || craftCategory.toLowerCase().includes("madhubani") || craftCategory.toLowerCase().includes("mithila") || craftCategory.toLowerCase().includes("art")))) {
    return CRAFT_FALLBACK_IMAGES.painting[0];
  }

  return CRAFT_FALLBACK_IMAGES.applique[0];
}

/**
 * Returns a reliable avatar URL for an artisan
 */
export function getArtisanAvatar(artisanName?: string): string {
  if (!artisanName) return ARTISAN_FALLBACK_AVATARS.default;
  for (const [name, url] of Object.entries(ARTISAN_FALLBACK_AVATARS)) {
    if (artisanName.toLowerCase().includes(name.toLowerCase().split(" ")[0])) {
      return url;
    }
  }
  return ARTISAN_FALLBACK_AVATARS.default;
}
