import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Панель управления</h1>
      <div className="dashboard__content">
        <p>Добро пожаловать в админскую панель сервиса бронирования автоуслуг!</p>
        <p>Здесь будет основной функционал администрирования.</p>
        <p style={{ marginTop: '16px' }}>Для просмотра компонентов используйте Storybook: <code>npm run storybook</code></p>
      </div>
    </div>
  );
};

export default Dashboard;