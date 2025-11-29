import React from 'react';
import ReactDOM from 'react-dom';

const API_KEY = 'ff404e0a-8fd1-4724-83a1-c82ee98cd33a';

const loadYmapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.ymaps3) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/v3/?apikey=${API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error('Ошибка загрузки Яндекс Карт'));
    document.head.appendChild(script);
  });
};

await loadYmapsScript();

// 1. Импортируем сам API, Reactify и Clusterer
const [ymaps3React, ymaps3Clusterer] = await Promise.all([
  ymaps3.import('@yandex/ymaps3-reactify'),
  ymaps3.import('@yandex/ymaps3-clusterer@0.0.1'),
  ymaps3.ready
]);

export const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);

export const { 
  YMap, 
  YMapDefaultSchemeLayer, 
  YMapDefaultFeaturesLayer, 
  YMapMarker,
  YMapFeatureDataSource,
  YMapLayer
} = reactify.module(ymaps3);

export const {
  YMapClusterer,
  clusterByGrid
} = reactify.module(ymaps3Clusterer);