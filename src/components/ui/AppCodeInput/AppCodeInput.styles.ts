import styled from 'styled-components';

interface CodeLabelProps {
  $error?: boolean;
}

interface CodeFieldProps {
  $error?: boolean;
}

// Контейнер для всех полей
export const CodeInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

// Label
export const CodeLabel = styled.label<CodeLabelProps>`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme, $error }) =>
    $error ? theme.colors.red[300] : theme.colors.gray[800]};
`;

// Контейнер для input полей
export const CodeFieldsContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
`;

// Одно поле для цифры
export const CodeField = styled.input<CodeFieldProps>`
  flex: 1;
  min-width: 52px;
  height: 52px;
  border: 1px solid;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.gray[100]};
  border-color: ${({ $error, theme }) =>
    $error ? theme.colors.red[400] : theme.colors.gray[200]};

  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: ${({ theme }) => theme.colors.gray[900]};

  transition: all 0.2s ease;

  &:focus {
    outline: none;
    box-shadow: none;
    border-color: ${({ $error, theme }) =>
      $error ? theme.colors.red[400] : theme.colors.primary[500]};
  }

  &:hover:not(:disabled) {
    border-color: ${({ $error, theme }) =>
      $error ? theme.colors.red[400] : theme.colors.gray[600]};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Скрыть стрелки у number input */
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
  }
`;

// Текст ошибки
export const ErrorText = styled.span`
  font-family: ${({ theme }) => theme.fonts.onest};
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  color: ${({ theme }) => theme.colors.red[300]};
`;
