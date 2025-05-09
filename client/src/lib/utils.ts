import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatPrice(price: number): string {
  return `${price} ل.س`;
}

export const getStarRating = (rating: number): JSX.Element[] => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(React.createElement('i', { key: `star-${i}`, className: "fas fa-star text-yellow-400" }));
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(React.createElement('i', { key: "half-star", className: "fas fa-star-half-alt text-yellow-400" }));
  }

  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(React.createElement('i', { key: `empty-star-${i}`, className: "far fa-star text-yellow-400" }));
  }

  return stars;
};

// Icons mapping for categories
export const getCategoryIcon = (icon: string) => {
  const iconMap: Record<string, string> = {
    calculator: "fas fa-calculator",
    flask: "fas fa-flask",
    language: "fas fa-language",
    globe: "fas fa-globe",
    landmark: "fas fa-landmark",
    atom: "fas fa-atom",
    book: "fas fa-book",
    paintbrush: "fas fa-paint-brush",
    music: "fas fa-music",
    code: "fas fa-code"
  };
  
  return iconMap[icon] || "fas fa-book";
};

// Get initials from a name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
