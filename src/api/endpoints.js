import { api, RESTAURANT_SLUG } from './client.js';

export async function fetchRestaurant() {
  const res = await api.get(`/restaurants/public/${RESTAURANT_SLUG}`);
  return res.data.restaurant;
}

export async function fetchMenu() {
  const res = await api.get(`/menu/public/${RESTAURANT_SLUG}`);
  return res.data.menu;
}

export async function fetchDeals() {
  const res = await api.get(`/deals/public/${RESTAURANT_SLUG}`);
  return res.data.deals;
}

export async function fetchTrending() {
  const res = await api.get(`/trending/public/${RESTAURANT_SLUG}`);
  return res.data.items;
}

export async function fetchRunning() {
  const res = await api.get(`/running/public/${RESTAURANT_SLUG}`);
  return res.data.items;
}

export async function fetchReviews() {
  const res = await api.get(`/reviews/public/${RESTAURANT_SLUG}`);
  return res.data.reviews;
}

export async function submitReview(payload) {
  const res = await api.post(`/reviews/public/${RESTAURANT_SLUG}`, payload);
  return res.data.review;
}

export async function placeOrder(payload) {
  const res = await api.post(`/orders/public/${RESTAURANT_SLUG}`, payload);
  return res.data.order;
}

export async function trackOrder(orderNumber, phone) {
  const res = await api.get(`/orders/public/track/${orderNumber}`, { params: { phone } });
  return res.data.order;
}

export async function chat(message, sessionId, locale) {
  const res = await api.post(`/chatbot/${RESTAURANT_SLUG}`, { message, sessionId, locale });
  return res.data;
}
