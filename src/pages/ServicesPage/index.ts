import React from 'react';
import { PlatformRoute } from '../../router/PlatformRoute';
import ServicesPageDesktop from './ServicesPage';
import MobileServicesPageComponent from './MobileServicesPage';

export { ServicesPageDesktop as ServicesPage };
export { MobileServicesPageComponent as MobileServicesPage };

// Обертка для поддержки платформы (desktop/mobile)
export default () => {
  return React.createElement(PlatformRoute, {
    desktop: ServicesPageDesktop,
    mobile: MobileServicesPageComponent,
  });
};
