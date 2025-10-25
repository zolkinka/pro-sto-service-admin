import React from 'react';
import styled from 'styled-components';
import { AppButton } from '@/components/ui/AppButton';

// Простые иконки для демонстрации
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

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing['2xl']};
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSize.xl};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  flex-wrap: wrap;
  align-items: center;
`;

const ButtonShowcase: React.FC = () => {
  const handleClick = (buttonText: string) => {
    alert(`Clicked: ${buttonText}`);
    console.log(`Button clicked: ${buttonText}`);
  };

  const handleLoadingTest = () => {
    alert('This would trigger a loading state in a real application');
  };

  return (
    <Container>
      <h1 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: '700' }}>
        AppButton Component Showcase
      </h1>
      
      <Section>
        <SectionTitle>All Variants (Size L)</SectionTitle>
        <ButtonGroup>
          <AppButton variant="primary" onClick={() => handleClick('Primary')}>
            Primary
          </AppButton>
          <AppButton variant="secondary" onClick={() => handleClick('Secondary')}>
            Secondary
          </AppButton>
          <AppButton variant="danger" onClick={() => handleClick('Danger')}>
            Danger
          </AppButton>
          <AppButton variant="invisible" onClick={() => handleClick('Invisible')}>
            Invisible
          </AppButton>
          <AppButton variant="default" onClick={() => handleClick('Default')}>
            Default
          </AppButton>
        </ButtonGroup>
      </Section>
      
      <Section>
        <SectionTitle>All Sizes</SectionTitle>
        <ButtonGroup>
          <AppButton size="M" onClick={() => handleClick('Medium')}>
            Medium
          </AppButton>
          <AppButton size="L" onClick={() => handleClick('Large')}>
            Large
          </AppButton>
        </ButtonGroup>
      </Section>
      
      <Section>
        <SectionTitle>States</SectionTitle>
        <ButtonGroup>
          <AppButton onClick={() => handleClick('Default state')}>
            Default
          </AppButton>
          <AppButton disabled>
            Disabled
          </AppButton>
          <AppButton loading onClick={handleLoadingTest}>
            Loading
          </AppButton>
        </ButtonGroup>
      </Section>
      
      <Section>
        <SectionTitle>With Icons</SectionTitle>
        <ButtonGroup>
          <AppButton iconLeft={<SearchIcon />} onClick={() => handleClick('Search')}>
            Search
          </AppButton>
          <AppButton iconRight={<ArrowIcon />} onClick={() => handleClick('Continue')}>
            Continue
          </AppButton>
          <AppButton 
            onlyIcon 
            iconLeft={<MenuIcon />} 
            onClick={() => handleClick('Menu')}
            data-testid="menu-button"
          />
        </ButtonGroup>
      </Section>
      
      <Section>
        <SectionTitle>Interactive Examples</SectionTitle>
        <ButtonGroup>
          <AppButton 
            variant="primary" 
            onClick={() => {
              console.log('Console log test!');
              alert('Check the browser console!');
            }}
          >
            Console Test
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
          <AppButton 
            variant="danger"
            onClick={() => {
              if (confirm('Are you sure you want to delete?')) {
                alert('Deleted successfully!');
              }
            }}
          >
            Delete Item
          </AppButton>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionTitle>Real-world Examples</SectionTitle>
        <ButtonGroup>
          <AppButton variant="primary" iconRight={<ArrowIcon />}>
            Continue to Payment
          </AppButton>
          <AppButton variant="secondary" iconLeft={<SearchIcon />}>
            Find Services
          </AppButton>
          <AppButton variant="invisible" size="M">
            Cancel
          </AppButton>
        </ButtonGroup>
      </Section>
    </Container>
  );
};

export default ButtonShowcase;