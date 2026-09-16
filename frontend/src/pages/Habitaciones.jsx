import { useState, useContext } from "react";
import HabitacionesLista from "../pages/habitacion/HabitacionesLista.jsx";
import HabitacionForm from "../pages/habitacion/HabitacionesForm.jsx";
import Imagenes360Manager from "./habitacion/Imagenes360manager.jsx";
import { AuthContext } from "../context/AuthContext";

const Habitaciones = () => {
  const { usuario } = useContext(AuthContext);
  const tienePermiso = (p) => usuario?.permisos?.includes(p);
  const [activeTab, setActiveTab] = useState("habitaciones");
  const [editando, setEditando] = useState(null);
  const [reload, setReload] = useState(false);

  // Estado para el modal de imágenes 360°
  const [show360Modal, setShow360Modal] = useState(false);
  const [habitacion360, setHabitacion360] = useState(null);

  // Cuando se hace click en "Editar"
  const handleEditHabitacion = (habitacion) => {
    setEditando(habitacion);
    setActiveTab("formulario");
  };

  // Cuando se hace click en "Tour 360°"
  const handleTour360 = (habitacion) => {
    setHabitacion360(habitacion);
    setShow360Modal(true);
  };

  // Cerrar modal 360°
  const handleClose360 = () => {
    setShow360Modal(false);
    setHabitacion360(null);
  };

  // Después de guardar la habitación (crear o editar)
  const handleHabitacionSaved = () => {
    setEditando(null);
    setReload(!reload);
    setActiveTab("habitaciones");
  };

  // Cuando se actualiza algo en el modal 360°
  const handleUpdate360 = () => {
    setReload(!reload);
  };

  const tabs = [
    { id: "habitaciones", label: "Habitaciones", icon: "🛏️", visible: true },
    {
      id: "formulario",
      label: "Registrar/Editar",
      icon: "📝",
      visible: tienePermiso("habitacion.crear") || tienePermiso("habitacion.editar"),
    },
  ].filter((tab) => tab.visible);

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-gray-100 mb-1">
          🏨 Gestión de Habitaciones
        </h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mb-6">
          Administra las habitaciones, sus imágenes y el tour virtual 360°
        </p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 dark:bg-gray-800 p-1 mb-6 self-start w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "formulario") setEditando(null);
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white dark:bg-gray-700 text-brand-orange shadow-sm"
                  : "text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido según la pestaña activa */}
        {activeTab === "habitaciones" && (
          <HabitacionesLista
            onEdit={handleEditHabitacion}
            onTour360={handleTour360}
            reload={reload}
          />
        )}

        {activeTab === "formulario" && (tienePermiso("habitacion.crear") || tienePermiso("habitacion.editar")) && (
          <HabitacionForm
            id={editando?.id_habitacion}
            onSuccess={handleHabitacionSaved}
            onCancel={() => setActiveTab("habitaciones")}
          />
        )}

        {/* Modal de Imágenes 360° */}
        {show360Modal && habitacion360 && (
          <Imagenes360Manager
            habitacion={habitacion360}
            onClose={handleClose360}
            onUpdate={handleUpdate360}
          />
        )}
      </div>
    </div>
  );
};

export default Habitaciones;
