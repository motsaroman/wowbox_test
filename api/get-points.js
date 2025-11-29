import axios from 'axios';
import { parseStringPromise } from 'xml2js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { fias } = req.query;
  console.log(`[API] Запрос точек для FIAS: ${fias}`);

  if (!fias) {
    return res.status(400).json({ message: 'FIAS code is required' });
  }

  try {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
    <pointsInfo>
        <auth token="fd75c9cf6f7b2adc67b2eebd0b440b07"/>
        <partner>5POST</partner>
        <fias>${fias}</fias>
    </pointsInfo>`;

    console.log(`[API] Отправляем XML в 5Post:`, xmlRequest);

    // Отправка запроса
    const response = await axios.post('https://api.dalli-service.com/v1/', xmlRequest, {
      headers: { 'Content-Type': 'application/xml' }
    });

    console.log(`[API] Ответ от 5Post (Raw XML):`, response.data.substring(0, 500) + '...');

    // Парсинг
    const result = await parseStringPromise(response.data);
    
    // Логируем структуру после парсинга, чтобы видеть, где лежат массивы
    console.log(`[API] Распарсенный объект:`, JSON.stringify(result, null, 2));

    const points = [];
    
    // Проверка структуры (самое важное место)
    if (result.pointsInfo && result.pointsInfo.point) {
      console.log(`[API] Найдено точек: ${result.pointsInfo.point.length}`);

      for (const pt of result.pointsInfo.point) {
        // Логируем одну точку для примера
        if (points.length === 0) console.log(`[API] Пример сырой точки:`, pt); 

        const gpsString = pt.GPS ? pt.GPS[0] : null;
        let coords = [55.75, 37.57]; 
        
        if (gpsString) {
            const parts = gpsString.split(',');
            if (parts.length === 2) {
                coords = [parseFloat(parts[1]), parseFloat(parts[0])];
            }
        }

        points.push({
          id: pt.$.code, 
          name: pt.name ? pt.name[0] : 'Пункт выдачи',
          address: pt.address ? pt.address[0] : '',
          coordinates: coords, // Уже в формате [lng, lat]
          workSchedule: pt.workShedule ? pt.workShedule[0] : '',
          description: pt.description ? pt.description[0] : ''
        });
      }
    } else {
        console.warn(`[API] Внимание! Структура XML не содержит pointsInfo.point`);
    }

    console.log(`[API] Итого отдаем на фронт: ${points.length} точек`); // ЛОГ 6
    return res.status(200).json(points);

  } catch (error) {
    console.error('[API] Ошибка:', error);
    return res.status(500).json({ message: error.message });
  }
}