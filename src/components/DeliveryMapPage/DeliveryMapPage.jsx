import { useEffect, useMemo, useCallback, useState } from "react";
import { useDeliveryStore } from "../../store/deliveryStore";
import {
  YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer,
  YMapMarker, YMapClusterer, clusterByGrid, YMapListener, YMapFeature
} from "../../lib/ymaps";
import markerIcon from "../../assets/images/5post-geo.png";
import DeliveryHeader from "./components/DeliveryHeader";
import CourierPanel from "./components/CourierPanel";
import styles from "./DeliveryMapPage.module.css";

export default function DeliveryMapPage({ isOpen, onClose, onDeliverySelect, initialMode = "pickup", currentData = {} }) {
  // Достаем состояние из стора
  const { 
    deliveryMode, points, polygons, 
    mapLocation, isLoading, courierMarker,
    initStore, handleMapClickAction, selectedCity
  } = useDeliveryStore();

  const [hoveredPointId, setHoveredPointId] = useState(null);
  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  // Инициализация при открытии
  useEffect(() => {
    if (isOpen) {
      initStore(initialMode, currentData);
    }
  }, [isOpen]);

  // Хендлер клика по ПВЗ (остался здесь, т.к. зависит от пропса onDeliverySelect)
  const handlePointClick = (point) => {
    onDeliverySelect({
      mode: "pickup",
      point: { id: point.id, name: point.name, address: point.address, price: selectedCity.price },
      cityFias: selectedCity.fias
    });
    onClose();
  };

  const features = useMemo(() => points.map((pt) => ({
    type: 'Feature', id: pt.id, geometry: { coordinates: pt.coordinates }, properties: { ...pt }
  })), [points]);

  const renderMarker = useCallback((feature) => {
      const isHovered = hoveredPointId === feature.id;
      const pt = feature.properties;
      return (
        <YMapMarker key={feature.id} coordinates={feature.geometry.coordinates} zIndex={isHovered ? 2000 : 100}>
          <div className={styles.markerWrapper} onMouseEnter={() => setHoveredPointId(feature.id)} onMouseLeave={() => setHoveredPointId(null)}>
            <img src={markerIcon} alt={pt.name} className={styles.imageMarker} onClick={() => handlePointClick(pt)}/>
            {isHovered && (
              <div className={styles.tooltip}>
                <div className={styles.tooltipTitle}>{pt.name}</div>
                <div className={styles.tooltipAddress}>{pt.address}</div>
                {pt.workSchedule && <div className={styles.tooltipSchedule}>🕒 {pt.workSchedule}</div>}
                <div className={styles.tooltipArrow}></div>
              </div>
            )}
          </div>
        </YMapMarker>
      );
  }, [hoveredPointId, selectedCity]);

  const renderCluster = useCallback((coordinates, features) => (
    <YMapMarker key={`${coordinates.join('-')}`} coordinates={coordinates}>
        <div className={styles.cluster}><div className={styles.clusterContent}><span className={styles.clusterText}>{features.length}</span></div></div>
    </YMapMarker>
  ), []);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        {/* Шапка с табами */}
        <DeliveryHeader onClose={onClose} />

        <div className={styles.mapContainer}>
           {isLoading && <div className={styles.loader}>Загрузка...</div>}
           
           <YMap location={mapLocation} mode="vector">
              <YMapDefaultSchemeLayer />
              <YMapDefaultFeaturesLayer />
              <YMapListener onClick={(_, e) => handleMapClickAction(e.coordinates)} />

              {/* Полигоны */}
              {deliveryMode === 'courier' && polygons?.features?.map((feature, idx) => (
                  <YMapFeature key={idx} geometry={feature.geometry} style={{ fill: 'rgba(0, 200, 83, 0.4)', stroke: [{ color: '#00C853', width: 2 }] }} />
              ))}

              {/* Маркер курьера */}
              {deliveryMode === 'courier' && courierMarker && (
                  <YMapMarker coordinates={courierMarker.coordinates}>
                      <div style={{fontSize: '34px', transform: 'translate(-50%, -100%)', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))'}}>🏠</div>
                  </YMapMarker>
              )}

              {/* ПВЗ Кластеры */}
              {deliveryMode === 'pickup' && <YMapClusterer marker={renderMarker} cluster={renderCluster} method={gridSizedMethod} features={features} />}
           </YMap>

           {/* Панель ввода для курьера */}
           {deliveryMode === 'courier' && <CourierPanel onConfirm={(data) => { onDeliverySelect(data); onClose(); }} />}
        </div>
      </div>
    </div>
  );
}