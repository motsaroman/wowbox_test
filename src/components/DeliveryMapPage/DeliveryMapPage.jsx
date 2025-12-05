import { useEffect, useMemo, useCallback, useState } from "react";
import { useDeliveryStore } from "../../store/deliveryStore";
import {
  YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer,
  YMapMarker, YMapClusterer, clusterByGrid, YMapListener, YMapFeature,
  YMapControls, YMapZoomControl 
} from "../../lib/ymaps";
import markerIcon from "../../assets/images/5post-geo.png";
import DeliveryHeader from "./components/DeliveryHeader";
import CourierPanel from "./components/CourierPanel";
import styles from "./DeliveryMapPage.module.css";

export default function DeliveryMapPage({ isOpen, onClose, onDeliverySelect, initialMode = "pickup", currentData = {} }) {
  const { 
    deliveryMode, points, polygons, 
    mapLocation, isLoading, courierMarker,
    initStore, handleMapClickAction, selectedCity,
    checkFreeShipping,
    addressError // <--- Достаем ошибку
  } = useDeliveryStore();

  const [hoveredPointId, setHoveredPointId] = useState(null);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const gridSizedMethod = useMemo(() => clusterByGrid({ gridSize: 64 }), []);

  useEffect(() => {
    if (isOpen) {
      initStore(initialMode, currentData);
    }
  }, [isOpen]);

  const handlePointClick = async (point) => {
    const checkAddress = `${selectedCity.name}, ПВЗ 5Post: ${point.name}`;
    let finalPrice = point.price || selectedCity.price || 350;

    const isFree = await checkFreeShipping(checkAddress);
    
    if (isFree) {
        finalPrice = 0;
        alert("🎉 Вам доступна бесплатная доставка за повторный заказ!");
    }

    onDeliverySelect({
      mode: "pickup",
      point: { 
          id: point.id, 
          name: point.name, 
          address: point.address, 
          price: finalPrice 
      },
      cityFias: selectedCity.fias,
      cityName: selectedCity.name 
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
        
        {/* Передаем ошибку в хедер */}
        <DeliveryHeader 
            onClose={onClose} 
            onOpenMobilePanel={() => setIsMobilePanelOpen(true)}
            error={addressError}
        />

        <div className={styles.mapContainer}>
           {isLoading && <div className={styles.loader}>Загрузка...</div>}
           
           <YMap location={mapLocation} mode="vector">
              <YMapDefaultSchemeLayer />
              <YMapDefaultFeaturesLayer />
              <YMapListener onClick={(_, e) => handleMapClickAction(e.coordinates)} />

              <YMapControls position="right">
                <YMapZoomControl />
              </YMapControls>

              {deliveryMode === 'courier' && polygons?.features?.map((feature, idx) => (
                  <YMapFeature key={idx} geometry={feature.geometry} style={{ fill: 'rgba(0, 200, 83, 0.4)', stroke: [{ color: '#00C853', width: 2 }] }} />
              ))}

              {deliveryMode === 'courier' && courierMarker && (
                  <YMapMarker coordinates={courierMarker.coordinates}>
                      <div className={styles.courierPin}>🏠</div>
                  </YMapMarker>
              )}

              {deliveryMode === 'pickup' && <YMapClusterer marker={renderMarker} cluster={renderCluster} method={gridSizedMethod} features={features} />}
           </YMap>

           {deliveryMode === 'courier' && !isMobilePanelOpen && (
             <button 
                className={styles.mobileSpecifyBtn} 
                onClick={() => setIsMobilePanelOpen(true)}
             >
                Указать адрес
             </button>
           )}

           {deliveryMode === 'courier' && (
             <CourierPanel 
                isOpen={isMobilePanelOpen} 
                onClose={() => setIsMobilePanelOpen(false)}
                onConfirm={(data) => { onDeliverySelect(data); onClose(); }} 
             />
           )}
        </div>
      </div>
    </div>
  );
}