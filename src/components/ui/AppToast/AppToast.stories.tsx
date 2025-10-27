import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ToastProvider } from './ToastProvider';
import { useToast } from './useToast';
import AppButton from '../AppButton/AppButton';
import type { ToastType } from './AppToast.types';

const meta: Meta<typeof ToastProvider> = {
  title: 'UI/AppToast',
  component: ToastProvider,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Компонент для демонстрации toast'ов
const ToastDemo: React.FC<{
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  closable?: boolean;
}> = ({ type, title, message, duration, closable }) => {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px' }}>
      <AppButton
        onClick={() => {
          showToast({
            type,
            title,
            message,
            duration,
            closable,
          });
        }}
      >
        Показать {type} уведомление
      </AppButton>
    </div>
  );
};

// Компонент для демонстрации всех типов
const AllTypesDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <AppButton
        variant="primary"
        onClick={() => {
          showToast({
            type: 'success',
            title: 'Успешно!',
            message: 'Операция выполнена успешно',
          });
        }}
      >
        Success
      </AppButton>

      <AppButton
        variant="danger"
        onClick={() => {
          showToast({
            type: 'error',
            title: 'Ошибка!',
            message: 'Произошла ошибка при выполнении операции',
          });
        }}
      >
        Error
      </AppButton>

      <AppButton
        variant="secondary"
        onClick={() => {
          showToast({
            type: 'info',
            title: 'Информация',
            message: 'Это информационное сообщение для пользователя',
          });
        }}
      >
        Info
      </AppButton>

      <AppButton
        variant="secondary"
        onClick={() => {
          showToast({
            type: 'warning',
            title: 'Внимание!',
            message: 'Это предупреждающее сообщение',
          });
        }}
      >
        Warning
      </AppButton>
    </div>
  );
};

// Компонент для демонстрации разных длительностей
const DurationDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <AppButton
        onClick={() => {
          showToast({
            type: 'info',
            title: '2 секунды',
            message: 'Это уведомление закроется через 2 секунды',
            duration: 2000,
          });
        }}
      >
        2 секунды
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'info',
            title: '4 секунды (по умолчанию)',
            message: 'Это уведомление закроется через 4 секунды',
            duration: 4000,
          });
        }}
      >
        4 секунды
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'info',
            title: '8 секунд',
            message: 'Это уведомление закроется через 8 секунд',
            duration: 8000,
          });
        }}
      >
        8 секунд
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'warning',
            title: 'Бесконечное',
            message: 'Это уведомление не закроется автоматически',
            duration: 0,
          });
        }}
      >
        Без автозакрытия
      </AppButton>
    </div>
  );
};

// Компонент для демонстрации множественных toast'ов
const MultipleToastsDemo: React.FC = () => {
  const { showToast, hideAll } = useToast();

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <AppButton
        onClick={() => {
          showToast({
            type: 'success',
            message: 'Уведомление #1',
          });
        }}
      >
        Добавить уведомление
      </AppButton>

      <AppButton
        variant="secondary"
        onClick={() => {
          for (let i = 1; i <= 5; i++) {
            setTimeout(() => {
              showToast({
                type: i % 2 === 0 ? 'info' : 'success',
                title: `Уведомление #${i}`,
                message: `Это уведомление номер ${i}`,
                duration: 6000,
              });
            }, i * 200);
          }
        }}
      >
        Показать 5 подряд
      </AppButton>

      <AppButton
        variant="danger"
        onClick={hideAll}
      >
        Закрыть все
      </AppButton>
    </div>
  );
};

// Компонент для демонстрации с/без заголовка
const TitleDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <AppButton
        onClick={() => {
          showToast({
            type: 'success',
            title: 'С заголовком',
            message: 'Это уведомление с заголовком',
          });
        }}
      >
        С заголовком
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'success',
            message: 'Это уведомление без заголовка',
          });
        }}
      >
        Без заголовка
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'info',
            title: 'Длинный заголовок для проверки переноса текста',
            message: 'Это уведомление с очень длинным сообщением для проверки того, как будет выглядеть текст при переносе на несколько строк. Текст должен красиво переноситься и не выходить за границы контейнера.',
          });
        }}
      >
        Длинный текст
      </AppButton>
    </div>
  );
};

// Компонент для демонстрации закрываемости
const ClosableDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div style={{ padding: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <AppButton
        onClick={() => {
          showToast({
            type: 'info',
            title: 'Можно закрыть',
            message: 'У этого уведомления есть кнопка закрытия',
            closable: true,
            duration: 0,
          });
        }}
      >
        С кнопкой закрытия
      </AppButton>

      <AppButton
        onClick={() => {
          showToast({
            type: 'warning',
            title: 'Нельзя закрыть',
            message: 'У этого уведомления нет кнопки закрытия (закроется через 4 секунды)',
            closable: false,
          });
        }}
      >
        Без кнопки закрытия
      </AppButton>
    </div>
  );
};

// Stories
export const AllTypes: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <AllTypesDemo />
    </ToastProvider>
  ),
};

export const Success: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="success"
        title="Успешно!"
        message="Операция выполнена успешно"
      />
    </ToastProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="error"
        title="Ошибка!"
        message="Произошла ошибка при выполнении операции"
      />
    </ToastProvider>
  ),
};

export const Info: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="info"
        title="Информация"
        message="Это информационное сообщение"
      />
    </ToastProvider>
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="warning"
        title="Внимание!"
        message="Это предупреждающее сообщение"
      />
    </ToastProvider>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="info"
        message="Уведомление без заголовка"
      />
    </ToastProvider>
  ),
};

export const DifferentDurations: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <DurationDemo />
    </ToastProvider>
  ),
};

export const MultipleToasts: Story = {
  render: () => (
    <ToastProvider position="top-right" maxToasts={5}>
      <MultipleToastsDemo />
    </ToastProvider>
  ),
};

export const WithAndWithoutTitle: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <TitleDemo />
    </ToastProvider>
  ),
};

export const ClosableOptions: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ClosableDemo />
    </ToastProvider>
  ),
};

export const PositionTopRight: Story = {
  render: () => (
    <ToastProvider position="top-right">
      <ToastDemo
        type="success"
        title="Top Right"
        message="Уведомление в правом верхнем углу"
      />
    </ToastProvider>
  ),
};

export const PositionTopLeft: Story = {
  render: () => (
    <ToastProvider position="top-left">
      <ToastDemo
        type="success"
        title="Top Left"
        message="Уведомление в левом верхнем углу"
      />
    </ToastProvider>
  ),
};

export const PositionBottomRight: Story = {
  render: () => (
    <ToastProvider position="bottom-right">
      <ToastDemo
        type="success"
        title="Bottom Right"
        message="Уведомление в правом нижнем углу"
      />
    </ToastProvider>
  ),
};

export const PositionBottomLeft: Story = {
  render: () => (
    <ToastProvider position="bottom-left">
      <ToastDemo
        type="success"
        title="Bottom Left"
        message="Уведомление в левом нижнем углу"
      />
    </ToastProvider>
  ),
};

export const Interactive: Story = {
  render: () => (
    <ToastProvider position="top-right" maxToasts={3}>
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Интерактивная демонстрация</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Попробуйте различные функции компонента AppToast:
          <br />
          • Наведите курсор на уведомление, чтобы приостановить таймер
          <br />
          • Нажмите кнопку × для ручного закрытия
          <br />
          • Создайте несколько уведомлений (максимум 3)
        </p>
        <AllTypesDemo />
      </div>
    </ToastProvider>
  ),
};
