/**
 * Izračun napretka onboardinga majstora
 */

export type OnboardingStep = {
  id: string;
  label: string;
  done: boolean;
};

export function calcProfileCompletion(
  profile: {
    bio?: string | null;
    categories?: string[];
    cities?: string[];
    galleryImages?: string[];
  } | null,
  user?: { phone?: string | null } | null
): { percent: number; steps: OnboardingStep[] } {
  const steps: OnboardingStep[] = [
    {
      id: "categories",
      label: "Odabrane kategorije usluga",
      done: !!(profile?.categories && profile.categories.length > 0),
    },
    {
      id: "cities",
      label: "Odabrani gradovi rada",
      done: !!(profile?.cities && profile.cities.length > 0),
    },
    {
      id: "bio",
      label: "Opis / bio",
      done: !!(profile?.bio && profile.bio.trim().length >= 20),
    },
    {
      id: "gallery",
      label: "Galerija radova (min. 1 slika)",
      done: !!(profile?.galleryImages && profile.galleryImages.length > 0),
    },
    {
      id: "phone",
      label: "Broj telefona",
      done: !!(user?.phone && user.phone.trim().length >= 6),
    },
  ];

  if (!profile) {
    return { percent: 0, steps };
  }

  const done = steps.filter((s) => s.done).length;
  const percent = Math.round((done / steps.length) * 100);

  return { percent, steps };
}
