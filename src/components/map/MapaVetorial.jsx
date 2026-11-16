import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RotateCcw, Map as MapIcon, MousePointerClick } from 'lucide-react';
import { METRIC_CONFIG, computeBreaks, getColorForValue, getLegendItems, formatMetric } from '../../constants';

export default function MapaVetorial({
  data,
  selectedMetric,
  onMetricChange,
  selectedUf,
  onSelectUf,
  onResetView
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geojsonLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Armazenamos referências mutáveis para garantir acesso síncrono nos event listeners do Leaflet
  const latestDataRef = useRef(data);
  const latestMetricRef = useRef(selectedMetric);
  const latestSelectedUfRef = useRef(selectedUf);
  const latestOnSelectUfRef = useRef(onSelectUf);

  // Escala de cores da métrica atual: quintis calculados sobre os estados exibidos
  const colorScale = useMemo(
    () => computeBreaks((data || []).map((d) => d[selectedMetric])),
    [data, selectedMetric]
  );
  const latestScaleRef = useRef(colorScale);
  latestScaleRef.current = colorScale;

  latestDataRef.current = data;
  latestMetricRef.current = selectedMetric;
  latestSelectedUfRef.current = selectedUf;
  latestOnSelectUfRef.current = onSelectUf;

  // Função auxiliar para calcular o estilo de um polígono do GeoJSON
  const getFeatureStyle = (feature) => {
    const sigla = feature.properties.sigla || feature.properties.UF || feature.properties.name;
    const currentData = latestDataRef.current || [];
    const stateData = currentData.find(
      (d) => d.uf === sigla || (d.nome && d.nome.toLowerCase() === (feature.properties.name || '').toLowerCase())
    );
    const metric = latestMetricRef.current;
    const currentSelectedUf = latestSelectedUfRef.current;

    if (!stateData) {
      return {
        fillColor: '#94a3b8',
        weight: 1,
        opacity: 0.8,
        color: '#ffffff',
        fillOpacity: 0.4
      };
    }

    const color = getColorForValue(stateData[metric], latestScaleRef.current);
    const isSelected = stateData.uf === currentSelectedUf;

    return {
      fillColor: color,
      weight: isSelected ? 3 : 1.2,
      opacity: 1,
      color: isSelected ? '#38bdf8' : '#ffffff',
      fillOpacity: isSelected ? 0.95 : 0.85
    };
  };

  // Gerador de conteúdo HTML para os tooltips
  const getTooltipContent = (stateData) => {
    const metric = latestMetricRef.current;
    const conf = METRIC_CONFIG[metric] || {};
    const valFormatted = formatMetric(metric, stateData[metric]);

    return `
      <div class="leading-tight">
        <strong class="text-sm font-bold text-white">${stateData.nome} (${stateData.uf})</strong><br/>
        <span class="text-slate-300 text-sm">${conf.label}:</span> 
        <strong class="text-sky-300 font-bold">${valFormatted}</strong>
      </div>
    `;
  };

  // Atualizador da camada de marcadores de centroides
  const updateMarkers = () => {
    if (!markersLayerRef.current) return;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const currentData = latestDataRef.current || [];
    const metric = latestMetricRef.current;
    const currentSelectedUf = latestSelectedUfRef.current;
    const conf = METRIC_CONFIG[metric] || {};

    currentData.forEach((d) => {
      if (!d.lat || !d.lng) return;

      const isSelected = d.uf === currentSelectedUf;
      const icon = L.divIcon({
        className: '',
        html: `
          <div class="custom-state-marker w-7 h-7 flex items-center justify-center rounded-full text-white font-bold text-xs cursor-pointer shadow-md transition-transform duration-150 ${isSelected
            ? 'ring-2 ring-white scale-110 !bg-blue-600'
            : 'bg-slate-900/80 hover:bg-blue-600 hover:scale-110'
          }">
            ${d.uf}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([d.lat, d.lng], { icon });

      const tooltipVal = formatMetric(metric, d[metric]);

      marker.bindTooltip(`
        <div class="leading-tight text-white">
          <strong class="text-sm">${d.nome} (${d.uf})</strong> - Região ${d.regiao}<br/>
          <span class="text-slate-300 text-sm">${conf.label}:</span> <b>${tooltipVal}</b>
        </div>
      `, { className: 'custom-leaflet-tooltip' });

      marker.on('click', () => {
        if (latestOnSelectUfRef.current) {
          latestOnSelectUfRef.current(d.uf);
        }
      });

      layer.addLayer(marker);
    });
  };

  // 1º useEffect: Inicialização ÚNICA do mapa Leaflet (sem dependências)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Instanciação imperativa do mapa
    const map = L.map(mapContainerRef.current, {
      center: [-14.235, -53.18],
      zoom: 4,
      minZoom: 3,
      maxZoom: 7,
      zoomControl: false,
      attributionControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // URL atualizada do OSM (sem necessidade de declarar subdomínios)
    const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Carregamento do GeoJSON do Brasil
    fetch('https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar GeoJSON');
        return res.json();
      })
      .then((geojson) => {
        if (!mapInstanceRef.current) return;

        const geojsonLayer = L.geoJSON(geojson, {
          style: (feature) => getFeatureStyle(feature),
          onEachFeature: (feature, layer) => {
            const sigla = feature.properties.sigla || feature.properties.UF;
            const currentData = latestDataRef.current || [];
            const stateData = currentData.find(
              (d) => d.uf === sigla || (d.nome && d.nome.toLowerCase() === (feature.properties.name || '').toLowerCase())
            );

            if (stateData) {
              layer.on({
                mouseover: (e) => {
                  const l = e.target;
                  l.setStyle({ weight: 3, color: '#f8fafc', fillOpacity: 0.85 });
                  l.bringToFront();
                },
                mouseout: (e) => {
                  if (geojsonLayerRef.current) {
                    geojsonLayerRef.current.resetStyle(e.target);
                  }
                },
                click: () => {
                  if (latestOnSelectUfRef.current) {
                    latestOnSelectUfRef.current(stateData.uf);
                  }
                }
              });

              layer.bindTooltip(getTooltipContent(stateData), {
                className: 'custom-leaflet-tooltip',
                sticky: true
              });
            }
          }
        }).addTo(map);

        geojsonLayerRef.current = geojsonLayer;
        tileLayer.bringToBack();
        updateMarkers();
      })
      .catch((err) => {
        console.warn('Erro ao carregar GeoJSON de estados:', err);
        updateMarkers();
      });

    // Cleanup: Destrói o mapa ao desmontar o componente para evitar vazamentos de memória e erros no StrictMode
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      geojsonLayerRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // 2º useEffect: Atualização reativa de estilo, dados, métrica e marcadores sem recriar o mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Atualiza o estilo e o tooltip de cada polígono GeoJSON
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.eachLayer((layer) => {
        if (layer.feature) {
          geojsonLayerRef.current.resetStyle(layer);
          const sigla = layer.feature.properties.sigla || layer.feature.properties.UF;
          const stateData = (data || []).find(
            (d) => d.uf === sigla || (d.nome && d.nome.toLowerCase() === (layer.feature.properties.name || '').toLowerCase())
          );
          if (stateData && layer.getTooltip()) {
            layer.setTooltipContent(getTooltipContent(stateData));
          }
        }
      });
    }

    // Atualiza a camada de marcadores
    updateMarkers();

    // Centraliza o mapa suavemente se a UF selecionada tiver coordenadas
    if (selectedUf && data) {
      const selected = data.find((d) => d.uf === selectedUf);
      if (selected && selected.lat && selected.lng) {
        mapInstanceRef.current.flyTo([selected.lat, selected.lng], 5.5, { duration: 0.8 });
      }
    } else if (!selectedUf && mapInstanceRef.current) {
      mapInstanceRef.current.setView([-14.235, -53.18], 4);
    }
  }, [selectedMetric, data, selectedUf]);

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([-14.235, -53.18], 4);
    }
    if (onResetView) {
      onResetView();
    }
  };

  // Legenda gerada a partir dos mesmos limites usados para colorir o mapa
  const conf = METRIC_CONFIG[selectedMetric] || { unit: '', label: '' };
  const legendItems = getLegendItems(colorScale, selectedMetric);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm flex flex-col transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <MapIcon className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Distribuição Espacial Federativa
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Clique em um estado para inspecionar os cruzamentos de dados
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="map-metric" className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Métrica:
          </label>
          <select
            id="map-metric"
            value={selectedMetric}
            onChange={(e) => onMetricChange(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm py-1.5 px-3 rounded-xl border border-transparent focus:border-blue-500 focus:outline-none transition-colors"
          >
            {Object.entries(METRIC_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.shortLabel || config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative w-full h-[460px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legenda Dinâmica do Mapa */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg text-sm min-w-[200px]">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            {conf.label}
          </h4>
          <div className="space-y-1">
            {legendItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3 rounded shadow-xs shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 dark:text-slate-400 text-xs tabular-nums">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-400">Mais escuro = valor maior. Faixas por quintis.</p>
        </div>

        {/* Botão Resetar Zoom */}
        <button
          onClick={handleResetZoom}
          className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Resetar Zoom
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>* Dados tratados a partir de microdados públicos oficiais</span>
        <span className="flex items-center gap-1">
          <MousePointerClick className="w-3 h-3" /> Interativo via Leaflet
        </span>
      </div>
    </div>
  );
}

