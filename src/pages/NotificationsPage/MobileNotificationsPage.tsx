import { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { notificationStore } from '../../stores/NotificationStore';
import { MobileMenu } from '../../mobile-components/MobileMenu';
import { MobileNotificationsHeader } from '../../mobile-components/Notifications/MobileNotificationsHeader';
import { MobileNotificationsList } from '../../mobile-components/Notifications/MobileNotificationsList';
import './MobileNotificationsPage.css';

export const MobileNotificationsPage = observer(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const PULL_THRESHOLD = 80; // Порог для активации refresh

  useEffect(() => {
    // Сбрасываем фильтр на "Все"
    notificationStore.setFilterIsRead(undefined);
    notificationStore.fetchNotifications(true);
    notificationStore.getUnreadCount();
    
    return () => {
      // Cleanup при размонтировании
      notificationStore.cleanup();
    };
  }, []);

  const handleRefresh = async () => {
    setIsPulling(true);
    await Promise.all([
      notificationStore.fetchNotifications(true),
      notificationStore.getUnreadCount()
    ]);
    setIsPulling(false);
    setPullDistance(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - touchStartY.current;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance >= PULL_THRESHOLD) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div 
      className="mobile-notifications-page"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <MobileNotificationsHeader onMenuClick={handleMenuToggle} />
      
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div 
          className="mobile-notifications-page__pull-indicator"
          style={{ height: pullDistance }}
        >
          <div 
            className={`mobile-notifications-page__spinner ${
              isPulling || pullDistance >= PULL_THRESHOLD 
                ? 'mobile-notifications-page__spinner_active' 
                : ''
            }`}
          />
        </div>
      )}

      <div className="mobile-notifications-page__container">
        <h1 className="mobile-notifications-page__title">Уведомления</h1>
        <MobileNotificationsList />
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={handleMenuClose} />
    </div>
  );
});

MobileNotificationsPage.displayName = 'MobileNotificationsPage';
