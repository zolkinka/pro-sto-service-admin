import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { theme } from '../src/styles/theme';
import { GlobalStyles } from '../src/styles/GlobalStyles';

const preview: Preview = {
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      viewports: {
        mobile: { 
          name: 'Mobile', 
          styles: { width: '375px', height: '667px' },
          type: 'mobile'
        },
        tablet: { 
          name: 'Tablet', 
          styles: { width: '768px', height: '1024px' },
          type: 'tablet'
        },
        desktop: { 
          name: 'Desktop', 
          styles: { width: '1440px', height: '900px' },
          type: 'desktop'
        },
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1f2937',
        },
        {
          name: 'gray',
          value: '#f9fafb',
        },
      ],
    },
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;