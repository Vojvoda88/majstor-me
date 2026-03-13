import { MAX_IMAGES_PER_REQUEST, MAX_IMAGE_SIZE_BYTES } from "./constants";

export function validateImageCount(count: number): { valid: boolean; error?: string } {
  if (count > MAX_IMAGES_PER_REQUEST) {
    return { valid: false, error: `Maksimalno ${MAX_IMAGES_PER_REQUEST} slika po zahtjevu` };
  }
  return { valid: true };
}

export function validateImageSize(bytes: number): { valid: boolean; error?: string } {
  if (bytes > MAX_IMAGE_SIZE_BYTES) {
    return { valid: false, error: `Slika prevelika (max ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB)` };
  }
  return { valid: true };
}
