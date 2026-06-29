function resolvePhotoUrl(photo) {
  if (!photo?.sizes?.urlTemplate) return null;
  return photo.sizes.urlTemplate
    .replace('{width}', '800')
    .replace('{height}', '600');
}

function resolveDetailPhotoUrl(photo) {
  if (!photo?.urlTemplate) return null;
  return photo.urlTemplate
    .replace('{width}', '800')
    .replace('{height}', '600');
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  return Number(priceStr.replace(/[^0-9.]/g, '')) || 0;
}

function parseReviewCount(countStr) {
  if (!countStr) return 0;
  return Number(countStr.replace(/[^0-9]/g, '')) || 0;
}

function extractAmenities(aboutData) {
  if (!aboutData?.content) return [];
  const amenitiesSection = aboutData.content.find((s) => s.title === 'Amenities');
  if (!amenitiesSection?.content) return [];
  return amenitiesSection.content.map((a) => a.title).filter(Boolean);
}

export function mapSearchResult(item) {
  const id = item.id || String(Math.random());
  const photo = item.cardPhotos?.[0];
  return {
    id,
    name: item.title?.replace(/^\d+\.\s*/, '') || 'Unknown Hotel',
    slug: (item.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: item.primaryInfo || '',
    price: parsePrice(item.priceForDisplay),
    rating: item.bubbleRating?.rating || 0,
    reviews: parseReviewCount(item.bubbleRating?.count),
    city: '',
    state: '',
    address: '',
    latitude: 0,
    longitude: 0,
    amenities: item.primaryInfo ? [item.primaryInfo] : [],
    images: photo ? [resolvePhotoUrl(photo)].filter(Boolean) : [],
    featured: false,
    available: true,
    roomTypes: [],
    phone: '',
    email: '',
    website: '',
    provider: item.provider || item.commerceInfo?.provider || '',
    commerceUrl: item.commerceInfo?.externalUrl || '',
    priceSummary: item.priceSummary || '',
    source: 'tripadvisor',
  };
}

export function mapDetailResult(data) {
  const photos = (data.photos || []).map(resolveDetailPhotoUrl).filter(Boolean);
  const priceDisplay = data.price?.displayPrice || data.price?.priceForDisplay?.text || '';
  const amenities = extractAmenities(data.about);
  const tags = data.about?.tags || [];

  const reviewSamples = (data.reviews?.content || []).map((r) => ({
    title: r.title,
    text: r.text,
    rating: r.bubbleRatingText || '',
    date: r.publishedDate,
    author: r.userProfile?.deprecatedContributionCount || 'Guest',
    avatar: r.userProfile?.avatar?.urlTemplate
      ? r.userProfile.avatar.urlTemplate.replace('{width}', '40').replace('{height}', '40')
      : null,
  }));

  return {
    id: String(data.id || ''),
    name: data.title || 'Unknown Hotel',
    slug: (data.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    description: '',
    price: parsePrice(priceDisplay),
    rating: data.rating || data.reviews?.ratingValue || 0,
    reviews: data.numberReviews || data.reviews?.count || 0,
    city: '',
    state: '',
    address: data.location?.address || '',
    latitude: data.geoPoint?.latitude || 0,
    longitude: data.geoPoint?.longitude || 0,
    amenities,
    images: photos,
    featured: false,
    available: true,
    roomTypes: [],
    phone: '',
    email: '',
    website: '',
    provider: data.price?.providerName || '',
    commerceUrl: '',
    priceSummary: data.rankingDetails || '',
    source: 'tripadvisor',
    reviewSamples,
    reviewBreakdown: data.reviews?.ratingCounts || null,
    tags,
    nearbyRestaurants: (data.restaurantsNearby?.content || []).map((r) => ({
      name: r.title,
      rating: r.bubbleRating?.rating,
      reviews: r.bubbleRating?.numberReviews,
      distance: r.distance,
    })),
  };
}
