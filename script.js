document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form'); 
    
    // Elementy DOM (definiowane raz na początku dla wydajności)
    const btcPriceElement = document.querySelector('.btc-price');
    const priceChangeElement = document.querySelector('.price-change');
    const dataValueElements = document.querySelectorAll('.data-value');
    const fearGreedValueElement = document.querySelector('.fear-greed-value');
    const fearGreedIndicatorElement = document.querySelector('.fear-greed-indicator');
    const bitcoinApiSourceElement = document.getElementById('bitcoin-api-source');
    const bitcoinApiToggleElement = document.getElementById('bitcoin-api-toggle');
    const dataSourceElement = document.querySelector('.data-source');
    const searchInputElement = document.getElementById('search-input');
    const searchTabsElements = document.querySelectorAll('.search-tab');
    const bitcoinPanelElement = document.querySelector('.bitcoin-panel');
    const searchWrapperElement = document.querySelector(".search-wrapper");
    const countryPanelTemplate = document.getElementById('country-panel-template');

    am5.ready(() => { 
        try { 
            // --- Konfiguracja --- 
            const config = {
                bitcoin: {
                    primary: { name: 'CoinGecko', endpoint: 'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false', refreshInterval: 30000 },
                    secondary: { name: 'CoinPaprika', endpoint: 'https://api.coinpaprika.com/v1/tickers/btc-bitcoin', refreshInterval: 30000 },
                    currentApi: 'primary'
                },
                markets: { /* Nieaktywne */ },
                fearGreed: { endpoint: 'https://api.alternative.me/fng/', refreshInterval: 600000 },
                fees: { endpoint: 'https://mempool.space/api/v1/fees/recommended' }
            };

            const GhibliPalette = [
                '#8EC0E4', '#94C9B3', '#D8A76A', '#F3C45F', '#D69A9C',
                '#8D7357', '#95A78D', '#C1B5A3', '#DBC376', '#A2C0D9',
                '#E1AD9B', '#7B8881', '#CEB888', '#93AAC5', '#B5BDAF'
            ];

            const ExtendedMarketIndexes = {
                US: [{ symbol: 'DJI', name: 'Dow Jones', flag: '🇺🇸' }, { symbol: 'SPX', name: 'S&P 500', flag: '🇺🇸' }, { symbol: 'IXIC', name: 'NASDAQ', flag: '🇺🇸' }, { symbol: 'RUT', name: 'Russell 2000', flag: '🇺🇸' }, { symbol: 'NYA', name: 'NYSE Composite', flag: '🇺🇸' }],
                GB: [{ symbol: 'FTSE', name: 'FTSE 100', flag: '🇬🇧' }, { symbol: 'FTMC', name: 'FTSE 250', flag: '🇬🇧' }, { symbol: 'FTAI', name: 'FTSE AIM All-Share', flag: '🇬🇧' }],
                DE: [{ symbol: 'DAX', name: 'DAX', flag: '🇩🇪' }, { symbol: 'MDAXI', name: 'MDAX', flag: '🇩🇪' }, { symbol: 'SDAXI', name: 'SDAX', flag: '🇩🇪' }],
                JP: [{ symbol: 'N225', name: 'Nikkei 225', flag: '🇯🇵' }, { symbol: 'TOPX', name: 'TOPIX', flag: '🇯🇵' }, { symbol: 'JPXN', name: 'JPX Nikkei 400', flag: '🇯🇵' }],
                CN: [{ symbol: '000001.SS', name: 'Shanghai Composite', flag: '🇨🇳' }, { symbol: '399001.SZ', name: 'Shenzhen Component', flag: '🇨🇳' }, { symbol: '000300.SS', name: 'CSI 300', flag: '🇨🇳' }],
                RU: [{ symbol: 'IMOEX', name: 'MOEX Russia', flag: '��🇺' }, { symbol: 'RTSI', name: 'RTS Index', flag: '🇷🇺' }],
                AU: [{ symbol: 'AXJO', name: 'ASX 200', flag: '🇦🇺' }, { symbol: 'AXAT', name: 'ALL ORDINARIES', flag: '🇦🇺' }],
                FR: [{ symbol: 'FCHI', name: 'CAC 40', flag: '🇫🇷' }], IN: [{ symbol: 'BSESN', name: 'BSE SENSEX', flag: '🇮🇳' }], HK: [{ symbol: 'HSI', name: 'Hang Seng', flag: '🇭🇰' }],
                KR: [{ symbol: 'KS11', name: 'KOSPI', flag: '🇰🇷' }], BR: [{ symbol: 'BVSP', name: 'BOVESPA', flag: '🇧🇷' }], CA: [{ symbol: 'GSPTSE', name: 'S&P/TSX', flag: '🇨🇦' }],
                ZA: [{ symbol: 'J203.JO', name: 'JSE Top 40', flag: '🇿🇦' }], EG: [{ symbol: 'CASE30', name: 'EGX 30', flag: '🇪🇬' }], NG: [{ symbol: 'NGSEINDEX', name: 'NSE All Share', flag: '🇳🇬' }],
                KE: [{ symbol: 'NSE20', name: 'NSE 20', flag: '🇰🇪' }], IL: [{ symbol: 'TA35', name: 'TA-35', flag: '🇮🇱' }], TR: [{ symbol: 'XU100', name: 'BIST 100', flag: '🇹🇷' }],
                PL: [{ symbol: 'WIG20', name: 'WIG20', flag: '🇵🇱' }], CH: [{ symbol: 'SSMI', name: 'SMI', flag: '🇨🇭' }], NL: [{ symbol: 'AEX', name: 'AEX', flag: '🇳🇱' }],
                SE: [{ symbol: 'OMX30', name: 'OMX Stockholm 30', flag: '🇸🇪' }], MX: [{ symbol: 'MXX', name: 'IPC MEXICO', flag: '🇲🇽' }], SG: [{ symbol: 'STI', name: 'Straits Times Index', flag: '🇸🇬' }],
                TW: [{ symbol: 'TWII', name: 'TSEC Weighted Index', flag: '🇹🇼' }], NZ: [{ symbol: 'NZ50', name: 'NZX 50', flag: '🇳🇿' }], AR: [{ symbol: 'MERV', name: 'MERVAL', flag: '🇦🇷' }],
                CL: [{ symbol: 'IPSA', name: 'S&P CLX IPSA', flag: '🇨🇱' }], ID: [{ symbol: 'JKSE', name: 'Jakarta Composite', flag: '🇮🇩' }], MY: [{ symbol: 'KLCI', name: 'FTSE Bursa Malaysia KLCI', flag: '🇲🇾' }],
                TH: [{ symbol: 'SET', name: 'SET Index', flag: '🇹🇭' }], SA: [{ symbol: 'TASI', name: 'Tadawul All Share', flag: '🇸🇦' }], AE: [{ symbol: 'DFMGI', name: 'DFM General Index', flag: '🇦🇪' }],
                PT: [{ symbol: 'PSI20', name: 'PSI 20', flag: '🇵🇹' }]
            };

            let regions = {};
            let colorIndex = 0;
            let openPanelCount = 0;
            const panelStartX = 50;
            const panelStartY = 100;
            const panelOffsetX = 25;
            const panelOffsetY = 25;
            let lastBtcPrice = null; // Do animacji flash
            const konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
            let konamiCodeIndex = 0;

            // --- Funkcje Pomocnicze ---
            const formatPrice = (price) => {
                if (price === undefined || price === null || isNaN(price)) return "N/A"; // Dodano obsługę błędów
                return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
            }

            const formatChange = (change) => {
                if (change === undefined || change === null || isNaN(change)) return { text: "N/A", class: "" };
                const formatted = change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
                return { text: formatted, class: change >= 0 ? 'positive' : 'negative' };
            };

            const getCurrentTime = () => new Date().toLocaleTimeString('pl-PL');

            const getGhibliColor = (index) => {
                const palette = GhibliPalette; // Użyj zdefiniowanej palety
                return index < palette.length ? palette[index] : palette[Math.floor(Math.random() * palette.length)];
            };
            
            // Funkcja pomocnicza do obsługi błędów API i aktualizacji UI
            const handleFetchError = (sourceName, errorMsg, error) => {
                console.error(errorMsg, error);
                // Użyj globalnych referencji do elementów DOM
                if (btcPriceElement) btcPriceElement.textContent = "Błąd API";
                if (priceChangeElement) {
                    priceChangeElement.textContent = "N/A";
                    priceChangeElement.className = "price-change"; // Reset klasy
                }
                if (dataValueElements) {
                    dataValueElements.forEach((el, index) => {
                         // Indeksy 0-3 to dane BTC, indeks 4 to opłaty
                         if (index < 4) { // Tylko resetuj dane BTC (1h, 7d, 30d, Dominacja)
                             el.textContent = "N/A";
                             el.className = "data-value"; // Reset klasy
                         }
                    });
                }
                 // Nie resetuj Fear & Greed, jeśli błąd dotyczy tylko API Bitcoina
                // if (fearGreedValueElement && fearGreedIndicatorElement) { ... } 
                 // Nie resetuj Market Indexes, jeśli błąd dotyczy tylko API Bitcoina (już niepotrzebne, bo obsługa błędów jest w loadMarketIndexes)
                updateLastRefreshTime(`Błąd API (${sourceName})`); // Przekaż nazwę źródła
            };
            
            const updateLastRefreshTime = (errorMessage = null) => {
                 if (!dataSourceElement) return; // Dodatkowe zabezpieczenie
                const sourceName = config.bitcoin.currentApi === 'primary' ? config.bitcoin.primary.name : config.bitcoin.secondary.name;
                if (errorMessage) dataSourceElement.textContent = `${errorMessage} | ${getCurrentTime()}`;
                else dataSourceElement.textContent = `Źródło: ${sourceName} | Ostatnia aktualizacja: ${getCurrentTime()}`;
            };
            
            // --- Funkcje API ---
            const fetchBitcoinDataCoinGecko = async (updatePriceAndChanges = true) => {
                const sourceConfig = config.bitcoin.primary;
                const endpoint = sourceConfig.endpoint;
                console.log(`Próba połączenia z ${sourceConfig.name} API Bitcoin:`, endpoint);
                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`); // Dodaj tekst błędu
                    const data = await response.json();
                    
                    // --- Zawsze próbuj zaktualizować dominację --- 
                    const dominance = data.market_data?.market_cap_percentage?.btc;
                    console.log("[CoinGecko] Dominance:", dominance); // Logowanie dominacji
                    if (dominance !== undefined) {
                        dataValueElements[3].textContent = `${dominance.toFixed(2)}%`;
                        dataValueElements[3].className = "data-value"; 
                    } else if (updatePriceAndChanges) { // Tylko resetuj, jeśli to główne zapytanie
                        dataValueElements[3].textContent = "N/A";
                        dataValueElements[3].className = "data-value";
                    }
                    // -------------------------------------------------

                    if (updatePriceAndChanges) { // Aktualizuj resztę tylko jeśli to wywołanie jest dla głównego API
                         const price = data.market_data?.current_price?.usd;
                         const change1h = data.market_data?.price_change_percentage_1h_in_currency?.usd;
                         const change24h = data.market_data?.price_change_percentage_24h_in_currency?.usd;
                         const change7d = data.market_data?.price_change_percentage_7d_in_currency?.usd;
                         const change30d = data.market_data?.price_change_percentage_30d_in_currency?.usd;
                         if (price === undefined || change24h === undefined) throw new Error('Niekompletne dane z CoinGecko');

                         // Aktualizacja UI (cena, zmiany, opłaty)
                         btcPriceElement.textContent = formatPrice(price);
                         const changeFormatted24h = formatChange(change24h);
                         priceChangeElement.textContent = `${changeFormatted24h.text} (24h)`;
                         priceChangeElement.className = `price-change ${changeFormatted24h.class}`;
                         const intervals = [change1h, change7d, change30d];
                         intervals.forEach((change, index) => {
                             const formatted = formatChange(change);
                             dataValueElements[index].textContent = formatted.text;
                             dataValueElements[index].className = `data-value ${formatted.class}`;
                         });

                         fetchTransactionFees(price); // Pobierz opłaty tylko jeśli główne dane są OK
                         updateLastRefreshTime(); // Aktualizuj czas i źródło (CoinGecko)
                         return true; // Sukces dla głównego zapytania
                    } else {
                        return true; // Sukces dla pobrania samej dominacji
                    }
                } catch (error) {
                     // Jeśli błąd wystąpił podczas próby pobrania tylko dominacji, zaloguj i kontynuuj
                     if (!updatePriceAndChanges) {
                          console.warn(`Nie udało się pobrać dominacji z CoinGecko: ${error.message}`);
                          dataValueElements[3].textContent = "N/A"; // Ustaw N/A dla dominacji
                          dataValueElements[3].className = "data-value";
                          return false; // Błąd pobrania dominacji
                     } else {
                          // Błąd w głównym zapytaniu CoinGecko
                          handleFetchError(sourceConfig.name, `Błąd pobierania danych Bitcoin (${sourceConfig.name}):`, error);
                          return false; // Błąd
                     }
                }
            };
            
             // NOWA funkcja dla CoinPaprika (aktualizuje tylko cenę, zmiany, opłaty)
             const fetchBitcoinDataCoinPaprika = async () => {
                 const sourceConfig = config.bitcoin.secondary;
                 const endpoint = sourceConfig.endpoint;
                 console.log(`Próba połączenia z ${sourceConfig.name} API Bitcoin:`, endpoint);
                 try {
                     const response = await fetch(endpoint);
                     if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
                     const data = await response.json();
                     const price = data?.quotes?.USD?.price;
                     const change24h = data?.quotes?.USD?.percent_change_24h;
                     // CoinPaprika dostarcza też inne interwały
                     const change1h = data?.quotes?.USD?.percent_change_1h;
                     const change7d = data?.quotes?.USD?.percent_change_7d;
                     const change30d = data?.quotes?.USD?.percent_change_30d;
                     const dominance = data?.dominance_percentage; // Poprawka: CoinPaprika zwraca to pole na głównym poziomie
                     
                     if (price === undefined || change24h === undefined) throw new Error('Niekompletne dane z CoinPaprika');
                     console.log("[CoinPaprika] Dominance:", dominance); // Logowanie dominacji

                     // Aktualizacja UI
                     btcPriceElement.textContent = formatPrice(price);
                     const changeFormatted24h = formatChange(change24h);
                     priceChangeElement.textContent = `${changeFormatted24h.text} (24h)`;
                     priceChangeElement.className = `price-change ${changeFormatted24h.class}`;
                     // Aktualizuj inne interwały, jeśli dostępne
                     const intervals = [change1h, change7d, change30d];
                     intervals.forEach((change, index) => {
                         if (change !== undefined) {
                             const formatted = formatChange(change);
                             dataValueElements[index].textContent = formatted.text;
                             dataValueElements[index].className = `data-value ${formatted.class}`;
                         } else {
                             dataValueElements[index].textContent = "N/A";
                             dataValueElements[index].className = "data-value";
                         }
                     });
                     dataValueElements[3].textContent = dominance !== undefined ? `${dominance.toFixed(2)}%` : "N/A";
                     dataValueElements[3].className = "data-value";

                     fetchTransactionFees(price); // Pobierz opłaty tylko jeśli główne dane są OK
                     updateLastRefreshTime();
                     return true; // Sukces
                 } catch (error) {
                      // Użyj nowej wersji handleFetchError
                      handleFetchError(sourceConfig.name, `Błąd pobierania danych Bitcoin (${sourceConfig.name}):`, error);
                     return false; // Błąd
                 }
             };
            
            const fetchTransactionFees = async (currentBtcPrice) => {
                 const endpoint = config.fees.endpoint;
                 try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`Mempool API error: Status ${response.status} ${await response.text()}`);
                    const fees = await response.json();
                    const feeRate = fees.halfHourFee;
                    if (feeRate && !isNaN(feeRate) && currentBtcPrice && !isNaN(currentBtcPrice)) {
                        const typicalTxSizeBytes = 140; // Zakładamy typowy rozmiar transakcji w vBytes
                        const costSatoshi = feeRate * typicalTxSizeBytes;
                        const costUSD = (costSatoshi / 100000000) * currentBtcPrice;
                        dataValueElements[4].textContent = `${feeRate.toFixed(0)} sat/vB ($${costUSD.toFixed(2)})`;
                    } else dataValueElements[4].textContent = "N/A";
                 } catch (error) {
                     console.error('Błąd pobierania opłat transakcyjnych:', error);
                     dataValueElements[4].textContent = "Błąd API Fee";
                 }
            };

            const fetchFearGreedIndex = async () => {
                const endpoint = config.fearGreed.endpoint;
                console.log("Próba pobierania danych Fear & Greed Index:", endpoint);
                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
                    const data = await response.json();
                    const value = parseInt(data?.data?.[0]?.value);
                    const valueClassification = data?.data?.[0]?.value_classification;
                    if (isNaN(value) || !valueClassification) throw new Error('Niekompletne dane Fear & Greed');
                    
                    // Aktualizacja UI
                    fearGreedValueElement.textContent = `${value} (${valueClassification})`;
                    const position = Math.max(0, Math.min(100, value));
                    fearGreedIndicatorElement.style.left = `${position}%`;
                    let color = 'var(--text-secondary)'; // Domyślny kolor
                    if (value <= 25) color = '#FF3B30';
                    else if (value <= 45) color = '#FF9500';
                    else if (value <= 55) color = '#FFCC00';
                    else if (value <= 75) color = '#9BDB1D';
                    else if (value > 75) color = '#4CD964';
                    fearGreedValueElement.style.color = color;
                    fearGreedIndicatorElement.style.background = color; // Ustaw kolor wskaźnika
                    
                    return true;
                } catch (error) {
                     handleFetchError(
                         { fearGreed: { value: fearGreedValueElement, indicator: fearGreedIndicatorElement } },
                         'Błąd pobierania danych Fear & Greed:', 
                         'Błąd API F&G', 
                         error
                     );
                    return false;
                }
            };

            // NOWA funkcja dla Alpha Vantage
            const loadMarketIndexes = async (country, contentElement) => {
                const indexes = ExtendedMarketIndexes[country] || [];
                const apiKey = 'ZJPQUDLDPOVXN74F'; // Twój klucz API
                const delayBetweenCalls = 15000; // Zwiększone opóźnienie do 15s

                if (!contentElement) { console.error('Brak elementu docelowego dla indeksów'); return; }
                if (indexes.length === 0) { contentElement.innerHTML = `<p>Brak skonfigurowanych indeksów dla ${country}</p>`; return; }

                contentElement.innerHTML = `<div class="loading"></div><p>Ładowanie danych indeksów (Alpha Vantage)...</p>`;
                let html = `<div class="index-list">`;
                let errorOccurred = false;

                const fetchIndexData = async (index) => {
                    const endpoint = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${index.symbol}&apikey=${apiKey}`;
                    console.log(`Pobieranie danych dla ${index.name} (${index.symbol}) z Alpha Vantage...`);
                    try {
                        const response = await fetch(endpoint);
                        if (!response.ok) {
                             // Rzuć błąd dla błędów HTTP innych niż puste odpowiedzi
                             throw new Error(`HTTP error! status: ${response.status} ${await response.text()}`);
                        }
                        const data = await response.json();

                        if (data['Note']) { // Sprawdzenie notatki o limicie API
                             throw new Error('Osiągnięto limit API Alpha Vantage. Spróbuj ponownie później.');
                        }
                        if (data['Error Message']) { // Sprawdzenie komunikatu o błędzie
                            throw new Error(`Błąd API Alpha Vantage: ${data['Error Message']}`);
                        }
                        const quote = data['Global Quote'];
                        if (!quote || Object.keys(quote).length === 0) {
                           // Zwróć błąd, aby wyświetlić w UI
                           console.warn(`Brak danych (lub pusty obiekt) dla symbolu: ${index.symbol}`);
                           throw new Error(`Brak danych dla symbolu: ${index.symbol}`);
                        }

                        const price = quote['05. price'] ? formatPrice(parseFloat(quote['05. price'])) : "Brak danych";
                        const changePercent = quote['10. change percent'] ? parseFloat(quote['10. change percent'].replace('%', '')) : undefined;
                        const change1D = formatChange(changePercent);
                        return { price, change1D };

                    } catch (error) {
                        console.error(`Błąd pobierania danych dla ${index.name} (${index.symbol}):`, error);
                        errorOccurred = true; // Zaznacz, że wystąpił błąd
                        return { price: "Błąd API", change1D: { text: "N/A", class: "" }, errorMessage: error.message };
                    }
                };

                // Wykonuj zapytania sekwencyjnie z opóźnieniem
                for (let i = 0; i < indexes.length; i++) {
                    const index = indexes[i];
                    const { price, change1D, errorMessage } = await fetchIndexData(index);

                    html += `<div class="index-item">
                                 <div class="index-header"><span class="index-flag">${index.flag}</span><span class="index-name">${index.name}</span></div>
                                 <div class="index-price">${price}</div>
                                 <div class="index-intervals"><div class="interval-grid" style="grid-template-columns: 1fr;"><div class="interval-item"><span class="interval-label">Zmiana (1D):</span><span class="interval-value ${change1D.class}">${change1D.text}</span></div></div></div>
                             </div>`;

                    if (errorMessage) {
                         html += `<div class="error-message" style="font-size: 0.8em; color: var(--negative); padding: 0 10px 5px 10px;">${errorMessage}</div>`;
                    }
                    
                    // Poczekaj przed następnym wywołaniem, ale nie po ostatnim
                    if (i < indexes.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
                    }
                }

                const dataSourceText = errorOccurred ? 'Dane: Alpha Vantage (Wystąpiły błędy)' : 'Dane: Alpha Vantage';
                html += `</div><div class="data-source">${dataSourceText} | ${getCurrentTime()}</div>`;
                contentElement.innerHTML = html;
            };
            
            // --- Inicjalizacja Mapy --- 
            let root = am5.Root.new("chartdiv");
            root.setThemes([am5themes_Animated.new(root), am5themes_Dark.new(root)]);

            let chart = root.container.children.push(
                am5map.MapChart.new(root, {
                    panX: "rotateX", panY: "rotateY",
                    projection: am5map.geoOrthographic(),
                    paddingBottom: 20, paddingTop: 20, paddingLeft: 20, paddingRight: 20,
                    backgroundSeries: { mapPolygons: { fill: am5.color(0x1e1e1e), stroke: am5.color(0x333333), strokeWidth: 0.5 } }
                })
            );

            let polygonSeries = chart.series.push(
                am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_worldLow, exclude: ["AQ"] })
            );

            // Ustawienie tooltipText globalnie dla serii
            polygonSeries.mapPolygons.template.setAll({
                 tooltipText: "{name}", // Używa pola "name" z geoJSON
                 toggleKey: "active", 
                 interactive: true, 
                 fill: am5.color(0x3b3b3b) // Domyślny kolor przed załadowaniem danych
            });

            polygonSeries.mapPolygons.template.states.create("hover", { fill: am5.color(0x546c8c) });

            polygonSeries.events.on("datavalidated", () => {
                console.log("Mapa została w pełni załadowana - inicjalizuję regiony");
                regions = {}; // Resetuj regiony na wszelki wypadek
                colorIndex = 0;
                am5.array.each(polygonSeries.dataItems, (dataItem) => {
                    const countryId = dataItem.get("id");
                    const name = dataItem.get("name"); // Pobierz pełną nazwę z danych mapy
                    // Zapisz pełną nazwę kraju w obiekcie regions
                    regions[countryId] = { name: name, color: getGhibliColor(colorIndex) };
                    const polygon = dataItem.get("mapPolygon");
                    if (polygon) {
                        polygon.set("fill", am5.color(regions[countryId].color)); // Użyj zapisanego koloru
                        // Tooltip już ustawiony globalnie, ale można nadpisać, gdyby zaszła potrzeba
                        // polygon.set("tooltipText", name); 
                        if (["US", "GB", "DE", "RU", "CN", "JP", "AU"].includes(countryId)) {
                            polygon.set("strokeWidth", 0.5);
                            polygon.set("stroke", am5.color(0xFFFFFF, 0.5));
                        }
                        polygon.set("interactive", true); // Upewnij się, że interaktywność jest włączona
                        
                        // Dodaj listener kliknięcia do każdego polygonu
                        polygon.events.on("click", (ev) => {
                            const clickedCountryId = ev.target.dataItem.get("id"); 
                            const clickedName = regions[clickedCountryId]?.name || `Kraj: ${clickedCountryId}`;
                            console.log("Kliknięto kraj (pojedynczy handler):", clickedCountryId, clickedName); 
                            
                            if (ExtendedMarketIndexes[clickedCountryId]) { 
                                const existingPanel = document.getElementById(`panel-${clickedCountryId}`); 
                                if (existingPanel) {
                                    existingPanel.style.display = 'block';
                                    existingPanel.style.zIndex = "1000";
                                } else {
                                    const panelX = panelStartX + (openPanelCount % 10) * panelOffsetX;
                                    const panelY = panelStartY + (openPanelCount % 10) * panelOffsetY;
                                    console.log("Tworzę panel na pozycji:", panelX, panelY);
                                    const panel = createCountryPanel(clickedCountryId, panelX, panelY);
                                    openPanelCount++;
                                    loadMarketIndexes(clickedCountryId, panel.querySelector('.country-content'));
                                    saveOpenPanelsState();
                                }
                            } else {
                                alert(`Brak skonfigurowanych indeksów dla kraju: ${clickedName}`);
                            }
                        });
                    }
                    colorIndex = (colorIndex + 1) % GhibliPalette.length; // Użyj długości palety
                });
                console.log("Zainicjalizowano " + Object.keys(regions).length + " regionów");
            });
            
            chart.animate({ key: "rotationX", from: 0, to: 360, duration: 30000, loops: Infinity });

            // --- Zarządzanie Stanem Paneli ---
            const saveOpenPanelsState = () => {
                try {
                    const openPanels = [];
                    document.querySelectorAll('.country-panel').forEach(panel => {
                        if (panel.style.display !== 'none') {
                            openPanels.push({ country: panel.dataset.country, left: panel.style.left, top: panel.style.top });
                        }
                    });
                    localStorage.setItem('openPanels', JSON.stringify(openPanels));
                    console.log('Zapisano stan paneli:', openPanels.length, 'otwartych paneli');
                } catch (error) { console.error('Błąd podczas zapisywania stanu paneli:', error); }
            };
            
            const loadOpenPanelsState = () => {
                try {
                    const savedPanels = localStorage.getItem('openPanels');
                    if (!savedPanels) return;
                    const panelsData = JSON.parse(savedPanels);
                    console.log('Wczytano dane o panelach:', panelsData.length, 'do odtworzenia');
                    panelsData.forEach(panelData => {
                        if (ExtendedMarketIndexes[panelData.country]) {
                            const panel = createCountryPanel(panelData.country, parseInt(panelData.left) || panelStartX, parseInt(panelData.top) || panelStartY);
                            loadMarketIndexes(panelData.country, panel.querySelector('.country-content'));
                            openPanelCount++;
                        }
                    });
                } catch (error) { console.error('Błąd podczas odtwarzania paneli:', error); }
            };
            
            const createCountryPanel = (countryId, x, y) => {
                if (!countryPanelTemplate) return null; // Zabezpieczenie
                const panelNode = document.importNode(countryPanelTemplate.content, true);
                const panel = panelNode.querySelector('.country-panel');
                
                panel.style.left = `${x}px`;
                panel.style.top = `${y}px`;
                panel.style.display = 'block';
                panel.id = `panel-${countryId}`;
                panel.dataset.country = countryId;
                const countryName = regions[countryId]?.name || `Kraj: ${countryId}`;
                panel.querySelector('.panel-title').textContent = regions[countryId]?.name || countryId;
                
                document.body.appendChild(panel);
                makeDraggable(panel); // Użyj globalnej funkcji
                
                panel.querySelector('.panel-close').addEventListener('click', () => {
                    console.log("Zamykanie panelu:", countryId);
                    panel.remove();
                    saveOpenPanelsState();
                });
                VanillaTilt.init(panel, { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
                return panel;
            };
            
            // --- Funkcja Przeciągania --- 
            const makeDraggable = (elmnt) => {
                const header = elmnt.querySelector('.panel-header') || elmnt;
                let dragStartX, dragStartY, initialX, initialY;
                let active = false;
                
                const dragStart = (e) => {
                    active = true;
                    elmnt.style.zIndex = "1000"; // Na wierzch podczas przeciągania
                    initialX = elmnt.offsetLeft;
                    initialY = elmnt.offsetTop;
                    if (e.type === "touchstart") {
                        dragStartX = e.touches[0].clientX;
                        dragStartY = e.touches[0].clientY;
                        document.addEventListener("touchmove", drag, { passive: false });
                        document.addEventListener("touchend", dragEnd, { passive: false });
                    } else {
                        dragStartX = e.clientX;
                        dragStartY = e.clientY;
                        document.addEventListener("mousemove", drag);
                        document.addEventListener("mouseup", dragEnd);
                    }
                     if (e.cancelable) e.preventDefault(); // Zapobiegaj przewijaniu strony na dotykowych
                };
                
                const drag = (e) => {
                    if (!active) return;
                    if (e.cancelable) e.preventDefault();
                    let currentX, currentY;
                    if (e.type === "touchmove") {
                        currentX = e.touches[0].clientX;
                        currentY = e.touches[0].clientY;
                    } else {
                        currentX = e.clientX;
                        currentY = e.clientY;
                    }
                    const dx = currentX - dragStartX;
                    const dy = currentY - dragStartY;
                    requestAnimationFrame(() => { // Płynniejsza animacja
                        elmnt.style.left = (initialX + dx) + "px";
                        elmnt.style.top = (initialY + dy) + "px";
                    });
                };
                
                const dragEnd = () => {
                    if (!active) return; // Zapobiegaj wielokrotnemu wywołaniu
                    active = false;
                    document.removeEventListener("mousemove", drag);
                    document.removeEventListener("mouseup", dragEnd);
                    document.removeEventListener("touchmove", drag);
                    document.removeEventListener("touchend", dragEnd);
                    saveOpenPanelsState();
                };
                
                header.addEventListener("mousedown", dragStart);
                header.addEventListener("touchstart", dragStart, { passive: false });
            };

            // --- Wyszukiwarka --- 
             searchTabsElements.forEach(tab => {
                tab.addEventListener('click', function() { // Używamy function() dla `this`
                    searchTabsElements.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const engine = this.dataset.engine;
                    if (searchForm) { // Sprawdź czy formularz istnieje
                        if (engine === 'google') {
                            searchForm.action = 'https://www.google.com/search';
                            if (searchInputElement) searchInputElement.placeholder = 'Wyszukaj w Google...';
                        } else if (engine === 'perplexity') {
                            searchForm.action = 'https://www.perplexity.ai/search';
                             if (searchInputElement) searchInputElement.placeholder = 'Zapytaj Perplexity...';
                        }
                    }
                });
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    if (searchInputElement) searchInputElement.focus();
                }
            });
            
            // --- API Bitcoin - Przełącznik i Główna logika pobierania ---
             const fetchBitcoinData = async () => {
                 // Krok 1: Zawsze próbuj pobrać dominację z CoinGecko
                 const dominanceSuccess = await fetchBitcoinDataCoinGecko(false); // false = nie aktualizuj ceny/zmian
 
                 // Krok 2: Pobierz resztę danych (cena, zmiany, opłaty) z aktywnego API
                 let priceUpdateSuccess;
                 if (config.bitcoin.currentApi === 'primary') {
                     // Jeśli CoinGecko jest aktywne, ale pobranie dominacji się nie udało, spróbuj ponownie całe zapytanie
                     // Lub jeśli się udało, to po prostu reszta danych (w tym przypadku funkcja zwróci true bez ponownego fetch)
                     // Ta logika jest wewnątrz fetchBitcoinDataCoinGecko(true)
                     priceUpdateSuccess = await fetchBitcoinDataCoinGecko(true); 
                 } else {
                     // Jeśli CoinPaprika jest aktywne, wywołaj ją
                     priceUpdateSuccess = await fetchBitcoinDataCoinPaprika(); 
                 }
                 
                 // Zwróć true jeśli aktualizacja ceny się powiodła (dominacja jest obsługiwana osobno)
                 return priceUpdateSuccess;
             };
             
            if (bitcoinApiToggleElement) {
                 bitcoinApiToggleElement.addEventListener('change', function() { // function() dla `this`
                     config.bitcoin.currentApi = this.checked ? 'secondary' : 'primary';
                     // Aktualizuj etykietę w UI
                     const currentSourceName = config.bitcoin.currentApi === 'primary' ? config.bitcoin.primary.name : config.bitcoin.secondary.name;
                     if (bitcoinApiSourceElement) bitcoinApiSourceElement.textContent = currentSourceName;
                     // Aktualizuj nazwę źródła w config, jeśli jeszcze nie zrobione
                     config.bitcoin.secondary.name = 'CoinPaprika'; // Upewnij się, że nazwa jest aktualna
                    fetchBitcoinData(); // Natychmiastowe odświeżenie po przełączeniu
                 });
                  // Ustaw początkowy stan przełącznika i etykiety, jeśli trzeba
                 const initialSourceName = config.bitcoin.currentApi === 'primary' ? config.bitcoin.primary.name : config.bitcoin.secondary.name;
                 if (bitcoinApiSourceElement) bitcoinApiSourceElement.textContent = initialSourceName;
             }
             
            // --- Animacje i Efekty --- 
            const flashElement = (element, className) => {
                 if (!element) return;
                element.classList.add(className);
                setTimeout(() => { element.classList.remove(className); }, 800); // Skrócono czas animacji
            };

            const monitorPriceChanges = () => {
                if (!btcPriceElement) return;
                const currentPriceText = btcPriceElement.textContent;
                if (currentPriceText.includes("Błąd") || currentPriceText.includes("Ładowanie")) {
                    lastBtcPrice = null;
                    return;
                }
                const currentPrice = parseFloat(currentPriceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
                if (lastBtcPrice !== null && !isNaN(currentPrice)) {
                    if (currentPrice > lastBtcPrice) flashElement(btcPriceElement, 'price-flash-up');
                    else if (currentPrice < lastBtcPrice) flashElement(btcPriceElement, 'price-flash-down');
                }
                lastBtcPrice = currentPrice;
            };
            
            if (bitcoinPanelElement) makeDraggable(bitcoinPanelElement);
            if (searchWrapperElement) VanillaTilt.init(searchWrapperElement, { max: 3, speed: 400, glare: true, "max-glare": 0.1 });
            if (bitcoinPanelElement) VanillaTilt.init(bitcoinPanelElement, { max: 5, speed: 400, glare: true, "max-glare": 0.2, scale: 1.02 });

            // Easter Egg
            document.addEventListener('keydown', (e) => {
                if (e.key === konamiCodeSequence[konamiCodeIndex]) {
                    konamiCodeIndex++;
                    if (konamiCodeIndex === konamiCodeSequence.length) {
                        document.body.classList.add('bitcoin-rain');
                        for (let i = 0; i < 20; i++) {
                            let bitcoin = document.createElement('div');
                            bitcoin.className = 'bitcoin-rain-coin';
                            bitcoin.style.left = `${Math.random() * 100}%`;
                            bitcoin.style.animationDelay = `${Math.random() * 5}s`;
                            document.body.appendChild(bitcoin);
                        }
                        setTimeout(() => {
                            document.body.classList.remove('bitcoin-rain');
                            document.querySelectorAll('.bitcoin-rain-coin').forEach(coin => coin.remove());
                        }, 10000);
                        konamiCodeIndex = 0;
                    }
                } else konamiCodeIndex = 0;
            });

            // --- Inicjalizacja danych i interwałów ---
            fetchBitcoinData();
            fetchFearGreedIndex();
            // Główny interwał odpytuje aktywne API co 30 sekund
            setInterval(fetchBitcoinData, 30000); 
            setInterval(fetchFearGreedIndex, config.fearGreed.refreshInterval);
            setInterval(monitorPriceChanges, 1000);
            loadOpenPanelsState(); // Odtwórz panele po inicjalizacji mapy i reszty
            
        } catch (error) { 
            console.error("Błąd krytyczny podczas inicjalizacji aplikacji:", error);
            document.body.innerHTML += `<div style="color: red; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px;">Wystąpił krytyczny błąd. Spróbuj odświeżyć stronę.</div>`;
        } 
    }); 
}); 