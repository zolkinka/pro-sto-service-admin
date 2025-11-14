import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons';
import './MobileDateNavigation.css';

interface MobileDateNavigationProps {
  formattedDate: string;
  onPrevious: () => void;
  onNext: () => void;
  disabled?: boolean;
}

export const MobileDateNavigation = ({
  formattedDate,
  onPrevious,
  onNext,
  disabled = false,
}: MobileDateNavigationProps) => {
  return (
    <div className="mobile-date-navigation">
      <button
        className="mobile-date-navigation__arrow"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Предыдущий период"
      >
        <ChevronLeftIcon size={20} />
      </button>

      <span className="mobile-date-navigation__date">{formattedDate}</span>

      <button
        className="mobile-date-navigation__arrow"
        onClick={onNext}
        disabled={disabled}
        aria-label="Следующий период"
      >
        <ChevronRightIcon size={20} />
      </button>
    </div>
  );
};
