import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <h1 className="not-found__title">404</h1>
      <h2 className="not-found__subtitle">Страница не найдена</h2>
      <p className="not-found__description">
        Извините, но запрашиваемая страница не существует. 
        Возможно, она была перемещена или удалена.
      </p>
      <Link className="not-found__link" to={ROUTES.DASHBOARD}>
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;
