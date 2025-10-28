import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AppTag } from './index';

const meta: Meta<typeof AppTag> = {
  title: 'UI/AppTag',
  component: AppTag,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Компонент тега/метки с различными размерами, цветами и возможностью закрытия.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Содержимое тега',
    },
    size: {
      control: 'select',
      options: ['S', 'M'],
      description: 'Размер тега',
      table: {
        defaultValue: { summary: 'M' },
      },
    },
    color: {
      control: 'select',
      options: ['default', 'blue', 'red', 'yellow', 'green'],
      description: 'Цветовой вариант тега',
      table: {
        defaultValue: { summary: 'default' },
      },
    },
    closable: {
      control: 'boolean',
      description: 'Показывать кнопку закрытия',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      action: 'closed',
      description: 'Callback при закрытии тега',
    },
    className: {
      control: 'text',
      description: 'Дополнительный CSS класс',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID для тестирования',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppTag>;

// Базовые примеры

export const Default: Story = {
  args: {
    children: 'Tag',
    size: 'M',
    color: 'default',
  },
};

export const SizeS: Story = {
  args: {
    children: 'Small Tag',
    size: 'S',
    color: 'default',
  },
};

export const SizeM: Story = {
  args: {
    children: 'Medium Tag',
    size: 'M',
    color: 'default',
  },
};

// Все цвета - размер M

export const AllColorsM: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <AppTag size="M" color="default">Default</AppTag>
      <AppTag size="M" color="blue">Blue</AppTag>
      <AppTag size="M" color="red">Red</AppTag>
      <AppTag size="M" color="yellow">Yellow</AppTag>
      <AppTag size="M" color="green">Green</AppTag>
    </div>
  ),
};

// Все цвета - размер S

export const AllColorsS: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <AppTag size="S" color="default">Default</AppTag>
      <AppTag size="S" color="blue">Blue</AppTag>
      <AppTag size="S" color="red">Red</AppTag>
      <AppTag size="S" color="yellow">Yellow</AppTag>
      <AppTag size="S" color="green">Green</AppTag>
    </div>
  ),
};

// С возможностью закрытия

export const Closable: Story = {
  args: {
    children: 'Closable Tag',
    size: 'M',
    color: 'default',
    closable: true,
  },
};

export const ClosableAllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <AppTag size="M" color="default" closable>Default</AppTag>
      <AppTag size="M" color="blue" closable>Blue</AppTag>
      <AppTag size="M" color="red" closable>Red</AppTag>
      <AppTag size="M" color="yellow" closable>Yellow</AppTag>
      <AppTag size="M" color="green" closable>Green</AppTag>
    </div>
  ),
};

export const ClosableSmall: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
      <AppTag size="S" color="default" closable>Default</AppTag>
      <AppTag size="S" color="blue" closable>Blue</AppTag>
      <AppTag size="S" color="red" closable>Red</AppTag>
      <AppTag size="S" color="yellow" closable>Yellow</AppTag>
      <AppTag size="S" color="green" closable>Green</AppTag>
    </div>
  ),
};

// Длинный текст

export const LongText: Story = {
  render: () => (
    <div style={{ maxWidth: '300px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Размер M</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="default">
            Very long tag text that should be handled properly
          </AppTag>
          <AppTag size="M" color="blue" closable>
            Another long tag with close button
          </AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Размер S</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="S" color="default">
            Very long small tag text
          </AppTag>
          <AppTag size="S" color="red" closable>
            Small tag with close
          </AppTag>
        </div>
      </div>
    </div>
  ),
};

// Группы тегов

export const TagGroups: Story = {
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Категории</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="blue">React</AppTag>
          <AppTag size="M" color="blue">TypeScript</AppTag>
          <AppTag size="M" color="blue">JavaScript</AppTag>
          <AppTag size="M" color="green">Frontend</AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Статусы</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="green">Completed</AppTag>
          <AppTag size="M" color="yellow">In Progress</AppTag>
          <AppTag size="M" color="red">Blocked</AppTag>
          <AppTag size="M" color="default">Pending</AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Фильтры (с закрытием)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="S" color="blue" closable>Автомойка</AppTag>
          <AppTag size="S" color="blue" closable>Шиномонтаж</AppTag>
          <AppTag size="S" color="yellow" closable>Москва</AppTag>
          <AppTag size="S" color="green" closable>Онлайн оплата</AppTag>
        </div>
      </div>
    </div>
  ),
};

// Интерактивный пример

const InteractiveExample: React.FC = () => {
  const [tags, setTags] = React.useState([
    { id: 1, text: 'JavaScript', color: 'blue' as const },
    { id: 2, text: 'TypeScript', color: 'blue' as const },
    { id: 3, text: 'React', color: 'green' as const },
    { id: 4, text: 'Node.js', color: 'green' as const },
    { id: 5, text: 'Critical', color: 'red' as const },
    { id: 6, text: 'High Priority', color: 'yellow' as const },
  ]);

  const handleClose = (id: number) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  return (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Кликните на × чтобы удалить тег</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {tags.map(tag => (
          <AppTag
            key={tag.id}
            size="M"
            color={tag.color}
            closable
            onClose={() => handleClose(tag.id)}
          >
            {tag.text}
          </AppTag>
        ))}
      </div>
      {tags.length === 0 && (
        <p style={{ marginTop: '16px', color: '#888' }}>
          Все теги удалены. Обновите страницу, чтобы сбросить.
        </p>
      )}
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveExample />,
};

// Различные сценарии использования

export const UseCases: Story = {
  render: () => (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Навыки и технологии</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="S" color="blue">React</AppTag>
          <AppTag size="S" color="blue">Vue</AppTag>
          <AppTag size="S" color="blue">Angular</AppTag>
          <AppTag size="S" color="green">HTML</AppTag>
          <AppTag size="S" color="green">CSS</AppTag>
          <AppTag size="S" color="yellow">JavaScript</AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Типы услуг</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="default">Мойка кузова</AppTag>
          <AppTag size="M" color="default">Химчистка салона</AppTag>
          <AppTag size="M" color="default">Полировка</AppTag>
          <AppTag size="M" color="default">Шиномонтаж</AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Активные фильтры</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="blue" closable>Район: Центр</AppTag>
          <AppTag size="M" color="yellow" closable>Цена: до 5000₽</AppTag>
          <AppTag size="M" color="green" closable>Рейтинг: 4+</AppTag>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Уведомления</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <AppTag size="M" color="red">3 новых</AppTag>
          <AppTag size="M" color="yellow">5 ожидают</AppTag>
          <AppTag size="M" color="green">12 завершено</AppTag>
        </div>
      </div>
    </div>
  ),
};

// Accessibility пример

export const Accessibility: Story = {
  render: () => (
    <div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 8px 0' }}>Теги с правильными aria-атрибутами</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <AppTag size="M" color="default" data-testid="tag-default">
          Default Tag
        </AppTag>
        <AppTag size="M" color="blue" closable data-testid="tag-closable">
          Closable Tag
        </AppTag>
      </div>
      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        Компонент поддерживает клавиатурную навигацию и screen readers.
        Попробуйте использовать Tab для навигации и Enter/Space для закрытия.
      </p>
    </div>
  ),
};
