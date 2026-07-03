export function imageUrl(photo) {
  if (!photo || !photo.image) return "";
  return photo.image.startsWith("http") ? photo.image : `/uploads/${photo.image}`;
}
