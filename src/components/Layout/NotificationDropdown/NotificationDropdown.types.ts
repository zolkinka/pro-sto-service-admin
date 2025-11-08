import type { NotificationResponseDto } from '../../../../services/api-client';

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface NotificationItemProps {
  notification: NotificationResponseDto;
  onClick: (uuid: string) => void;
}

export interface NotificationData {
  licensePlate?: string;
  region?: string;
  bookingUuid?: string;
}
