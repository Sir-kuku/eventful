export const generateShareLinks = (eventId: string, title: string, date: string) => {
  // Construct the public frontend URL for this specific event
  const baseUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/event/${eventId}`;
  
  // Safely encode text and URL for query parameters
  const text = encodeURIComponent(`Check out this event: ${title} on ${date}!`);
  const url = encodeURIComponent(baseUrl);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
    whatsapp: `https://wa.me/?text=${text}%20${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
  };
};
