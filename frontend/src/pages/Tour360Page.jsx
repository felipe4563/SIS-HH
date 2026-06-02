import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import TourVirtual360 from './Home/TourVirtual360';

const Tour360Page = () => {
  const navigate  = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state?.imagenes360?.length) navigate('/', { replace: true });
  }, [state, navigate]);

  if (!state?.imagenes360?.length) return null;

  return (
    <TourVirtual360
      imagenes360={state.imagenes360}
      nombreHabitacion={state.nombreHabitacion || 'Habitación'}
      onClose={() => navigate(-1)}
    />
  );
};

export default Tour360Page;
