export const listingStatusText = {
  illustrative: 'Illustrative profile',
  historical: 'Historical advertisement · closed',
  current_verified: 'Currently verified vacancy',
}

export function listingStatus(job) {
  return listingStatusText[job.listing_status] ? job.listing_status : 'illustrative'
}
