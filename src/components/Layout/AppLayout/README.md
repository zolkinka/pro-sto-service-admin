# AppLayout

Базовый layout компонент для всех страниц приложения.

## Расположение
`src/components/layout/AppLayout/`

## Использование

```tsx
import AppLayout from '@/components/layout/AppLayout';

const ServicesPage = () => {
  return (
    <AppLayout>
      <h1>Услуги</h1>
      {/* Контент страницы */}
    </AppLayout>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| children | React.ReactNode | Контент страницы |

## Особенности

- **Фон**: #F9F8F5
- **Минимальная высота**: 100vh
- **Фиксированный хедер**: AppHeader остается на месте при скролле
- **Отступ контента**: 129px сверху (48px верх + 49px хедер + 32px отступ)
- **Центрирование**: Контент центрирован по горизонтали

## Структура

```tsx
<LayoutContainer>
  <AppHeader />
  <MainContent>
    {children}
  </MainContent>
</LayoutContainer>
```
