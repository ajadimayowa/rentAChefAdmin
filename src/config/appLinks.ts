// Store listing URLs for the mobile app. The live listings are the defaults;
// VITE_PLAY_STORE_URL / VITE_APP_STORE_URL can still override them per build.
export const PLAY_STORE_URL =
import.meta.env.VITE_PLAY_STORE_URL?.trim() || 'https://play.google.com/store/apps/details?id=com.app.rentachef';
export const APP_STORE_URL =
import.meta.env.VITE_APP_STORE_URL?.trim() || 'https://apps.apple.com/us/app/rent-a-chef-ng/id6812654118';
