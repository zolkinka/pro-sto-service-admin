import React from 'react';
import './NewBookingBanner.css';

interface NewBookingBannerProps {
  count: number;
  onClick: () => void;
}

const BellIcon: React.FC = () => (
  <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8.81436 14.583C9.00894 14.5832 9.16679 14.7409 9.1669 14.9355C9.1669 14.9778 9.15935 15.0204 9.14346 15.0596C8.76226 15.9991 7.79716 16.666 6.6669 16.666C5.53661 16.666 4.57158 15.9991 4.19033 15.0596C4.17445 15.0204 4.1669 14.9778 4.1669 14.9355C4.167 14.7408 4.32471 14.583 4.51944 14.583H8.81436ZM6.6669 0C7.71154 7.89456e-05 8.5585 0.846936 8.5585 1.8916V1.97754C10.3438 2.58883 11.6652 4.04206 11.8661 5.8125L12.2392 9.0957C12.3063 9.68701 12.5552 10.2511 12.9599 10.7266C13.874 11.8005 13.0048 13.3328 11.4813 13.333H1.85244C0.328893 13.333 -0.540945 11.8005 0.372951 10.7266C0.777664 10.2511 1.02751 9.68706 1.09463 9.0957L1.4667 5.8125C1.66764 4.04204 2.98996 2.58881 4.7753 1.97754V1.8916C4.7753 0.846888 5.62218 0 6.6669 0Z"
      fill="currentColor"
    />
  </svg>
);

const ArrowIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Функция для корректного склонения слова "запись"
 */
const getPluralForm = (count: number): string => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'записей';
  }

  if (lastDigit === 1) {
    return 'запись';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'записи';
  }

  return 'записей';
};

export const NewBookingBanner: React.FC<NewBookingBannerProps> = ({ count, onClick }) => {
  const getText = () => {
    if (count === 1) {
      return 'Новая запись';
    }
    return `${count} ${count === 2 ? 'Новых' : 'Новых'} ${getPluralForm(count)}`;
  };

  return (
    <button
      className="new-booking-banner"
      onClick={onClick}
      type="button"
      aria-label={`${count} новых бронирований`}
    >
      <span className="new-booking-banner__icon" aria-hidden="true">
        <BellIcon />
      </span>
      <span className="new-booking-banner__text">{getText()}</span>
      <span className="new-booking-banner__arrow" aria-hidden="true">
        <ArrowIcon />
      </span>
    </button>
  );
};
