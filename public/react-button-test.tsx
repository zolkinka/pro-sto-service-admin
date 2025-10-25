import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { theme } from '../src/styles/theme';
import { AppButton } from '../src/components/ui/AppButton';

// Простые иконки для тестирования
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 14L10.344 10.344M11.8889 6.44444C11.8889 9.42813 9.42813 11.8889 6.44444 11.8889C3.46076 11.8889 1 9.42813 1 6.44444C1 3.46076 3.46076 1 6.44444 1C9.42813 1 11.8889 3.46076 11.8889 6.44444Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4H14M2 8H14M2 12H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ButtonTestApp: React.FC = () => {
  const handleClick = (buttonText: string) => {
    alert(`Clicked: ${buttonText}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{ 
        fontFamily: theme.fonts.onest,
        padding: '40px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}>
          <h1 style={{ marginBottom: '40px', color: '#374151' }}>AppButton React Component Test</h1>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#374151', fontSize: '20px' }}>All Variants (Size L)</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <AppButton variant="primary" onClick={() => handleClick('Primary')}>Primary</AppButton>
              <AppButton variant="secondary" onClick={() => handleClick('Secondary')}>Secondary</AppButton>
              <AppButton variant="danger" onClick={() => handleClick('Danger')}>Danger</AppButton>
              <AppButton variant="invisible" onClick={() => handleClick('Invisible')}>Invisible</AppButton>
              <AppButton variant="default" onClick={() => handleClick('Default')}>Default</AppButton>
            </div>
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#374151', fontSize: '20px' }}>All Sizes</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <AppButton size="M" onClick={() => handleClick('Medium')}>Medium</AppButton>
              <AppButton size="L" onClick={() => handleClick('Large')}>Large</AppButton>
            </div>
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#374151', fontSize: '20px' }}>States</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <AppButton onClick={() => handleClick('Default state')}>Default</AppButton>
              <AppButton disabled>Disabled</AppButton>
              <AppButton loading>Loading</AppButton>
            </div>
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#374151', fontSize: '20px' }}>With Icons</h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <AppButton iconLeft={<SearchIcon />} onClick={() => handleClick('Search')}>Search</AppButton>
              <AppButton iconRight={<ArrowIcon />} onClick={() => handleClick('Continue')}>Continue</AppButton>
              <AppButton onlyIcon iconLeft={<MenuIcon />} onClick={() => handleClick('Menu')} data-testid="menu-button" />
            </div>
          </div>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px', color: '#374151', fontSize: '20px' }}>Interactive Test</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <AppButton 
                variant="primary" 
                onClick={() => console.log('Console log test!')}
              >
                Click me (check console)
              </AppButton>
              <AppButton 
                variant="secondary" 
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Form submit prevented!');
                }}
              >
                Submit Button
              </AppButton>
            </div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

// Инициализация приложения
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ButtonTestApp />);
}