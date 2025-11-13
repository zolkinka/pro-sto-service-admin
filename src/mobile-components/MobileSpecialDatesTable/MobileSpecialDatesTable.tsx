import React, { useState } from 'react';
import { format } from 'date-fns';
import type { OperatingHoursResponseDto } from '../../../services/api-client/types.gen';
import { formatTime } from '../../pages/SchedulePage/utils';
import MobileConfirmDeleteModal from '../MobileConfirmDeleteModal/MobileConfirmDeleteModal';
import './MobileSpecialDatesTable.css';

export interface MobileSpecialDatesTableProps {
  specialDates: OperatingHoursResponseDto[];
  onDelete: (uuid: string) => void;
  'data-testid'?: string;
}

const MobileSpecialDatesTable: React.FC<MobileSpecialDatesTableProps> = ({
  specialDates,
  onDelete,
  'data-testid': dataTestId,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    uuid: string;
    date: string;
  } | null>(null);

  const handleDeleteClick = (uuid: string, dateStr: string) => {
    setDeleteConfirmation({ uuid, date: dateStr });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation?.uuid) {
      onDelete(deleteConfirmation.uuid);
      setDeleteConfirmation(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  if (specialDates.length === 0) {
    return (
      <div className="mobile-special-dates-table mobile-special-dates-table_empty" data-testid={dataTestId}>
        <p className="mobile-special-dates-table__empty-message">
          Нет специальных дат
        </p>
      </div>
    );
  }

  return (
    <div className="mobile-special-dates-table" data-testid={dataTestId}>
      {/* Header */}
      <div className="mobile-special-dates-table__row mobile-special-dates-table__row_header">
        <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_date">
          <span className="mobile-special-dates-table__header-text">Дата</span>
        </div>
        <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_type">
          <span className="mobile-special-dates-table__header-text">Тип дня</span>
        </div>
        <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_time">
          <span className="mobile-special-dates-table__header-text">Время</span>
        </div>
        <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_action">
          <span className="mobile-special-dates-table__header-text">&nbsp;</span>
        </div>
      </div>

      {/* Data rows */}
      {specialDates.map((date) => {
        const formattedDate = date.specific_date 
          ? format(new Date(date.specific_date), 'dd.MM.yyyy')
          : '-';
        
        const typeText = date.is_closed ? 'Выходной' : 'Сокращенный';
        
        const timeText = date.is_closed 
          ? '-' 
          : `${formatTime(date.open_time)}-${formatTime(date.close_time)}`;

        return (
          <div
            key={date.uuid}
            className="mobile-special-dates-table__row"
            data-testid={`${dataTestId}-row-${date.uuid}`}
          >
            <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_date">
              <span className="mobile-special-dates-table__cell-text">
                {formattedDate}
              </span>
            </div>
            <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_type">
              <span className="mobile-special-dates-table__cell-text">
                {typeText}
              </span>
            </div>
            <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_time">
              <span className="mobile-special-dates-table__cell-text">
                {timeText}
              </span>
            </div>
            <div className="mobile-special-dates-table__cell mobile-special-dates-table__cell_action">
              <button
                className="mobile-special-dates-table__delete-button"
                onClick={() => date.uuid && handleDeleteClick(date.uuid, formattedDate)}
                data-testid={`${dataTestId}-delete-${date.uuid}`}
                type="button"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0975 18.1409 18.8867 17.8 19.485C17.4999 20.0118 17.0472 20.4353 16.5017 20.6997C15.882 21 15.0911 21 13.5093 21H10.4907C8.90891 21 8.11803 21 7.49834 20.6997C6.95276 20.4353 6.50009 20.0118 6.19998 19.485C5.85911 18.8867 5.8065 18.0975 5.70129 16.5193L5 6M10 10.5V15.5M14 10.5V15.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}

      <MobileConfirmDeleteModal
        isOpen={!!deleteConfirmation}
        title="Удалить дату?"
        message={
          deleteConfirmation
            ? `Вы действительно хотите удалить дату ${deleteConfirmation.date}?`
            : undefined
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
      />
    </div>
  );
};

export default MobileSpecialDatesTable;
