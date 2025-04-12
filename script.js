document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form'); 
    am5.ready(function() { 
        try { 
            // Obsługa wyszukiwarki i przełączania między Google a Perplexity
            const searchInput = document.getElementById('search-input');
            const searchTabs = document.querySelectorAll('.search-tab');
            
            searchTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    searchTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    const engine = this.dataset.engine;
                    if (engine === 'google') {
                        searchForm.action = 'https://www.google.com/search';
                        searchInput.placeholder = 'Wyszukaj w Google...';
                    } else if (engine === 'perplexity') {
                        searchForm.action = 'https://www.perplexity.ai/search';
                        searchInput.placeholder = 'Zapytaj Perplexity...';
                    }
                });
            });

            // Inicjalizacja mapy i logiki aplikacji...
            // Nowa, uproszczona funkcja do obsługi przeciągania paneli
            function makeDraggable(elmnt) {
                const header = elmnt.querySelector('.panel-header') || elmnt;
                let dragStartX, dragStartY, initialX, initialY;
                let active = false;
                
                const dragStart = function(e) {
                    if (e.type === "touchstart") {
                        dragStartX = e.touches[0].clientX;
                        dragStartY = e.touches[0].clientY;
                    } else {
                        dragStartX = e.clientX;
                        dragStartY = e.clientY;
                    }
                    initialX = elmnt.offsetLeft;
                    initialY = elmnt.offsetTop;
                    active = true;
                    elmnt.style.zIndex = "1000";
                    if (e.type === "touchstart") {
                        document.addEventListener("touchmove", drag, { passive: false });
                        document.addEventListener("touchend", dragEnd, { passive: false });
                    } else {
                        document.addEventListener("mousemove", drag);
                        document.addEventListener("mouseup", dragEnd);
                    }
                    if (e.cancelable) e.preventDefault();
                };
                
                const drag = function(e) {
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
                    requestAnimationFrame(() => {
                        elmnt.style.left = (initialX + dx) + "px";
                        elmnt.style.top = (initialY + dy) + "px";
                    });
                };
                
                const dragEnd = function() {
                    document.removeEventListener("mousemove", drag);
                    document.removeEventListener("mouseup", dragEnd);
                    document.removeEventListener("touchmove", drag);
                    document.removeEventListener("touchend", dragEnd);
                    active = false;
                    saveOpenPanelsState();
                };
                
                header.addEventListener("mousedown", dragStart);
                header.addEventListener("touchstart", dragStart, { passive: false });
            }

            function getGhibliColor(index) {
                const ghibliPalette = [
                    '#8EC0E4', '#94C9B3', '#D8A76A', '#F3C45F', '#D69A9C',
                    '#8D7357', '#95A78D', '#C1B5A3', '#DBC376', '#A2C0D9',
                    '#E1AD9B', '#7B8881', '#CEB888', '#93AAC5', '#B5BDAF'
                ];
                return index < ghibliPalette.length ? ghibliPalette[index] : ghibliPalette[Math.floor(Math.random() * ghibliPalette.length)];
            }

            let root = am5.Root.new("chartdiv");
            root.setThemes([
                am5themes_Animated.new(root),
                am5themes_Dark.new(root)
            ]);

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

            polygonSeries.mapPolygons.template.setAll({
                tooltipText: "{name}", toggleKey: "active", interactive: true, fill: am5.color(0x3b3b3b)
            });

            polygonSeries.mapPolygons.template.states.create("hover", { fill: am5.color(0x546c8c) });

            const extendedMarketIndexes = {
                US: [{ symbol: '^DJI', name: 'Dow Jones', flag: '🇺🇸' }, { symbol: '^SPX', name: 'S&P 500', flag: '🇺🇸' }, { symbol: '^IXIC', name: 'NASDAQ', flag: '🇺🇸' }, { symbol: '^RUT', name: 'Russell 2000', flag: '🇺🇸' }, { symbol: '^NYA', name: 'NYSE Composite', flag: '🇺🇸' }],
                GB: [{ symbol: '^FTSE', name: 'FTSE 100', flag: '🇬🇧' }, { symbol: '^FTMC', name: 'FTSE 250', flag: '🇬🇧' }, { symbol: '^FTAI', name: 'FTSE AIM All-Share', flag: '🇬🇧' }],
                DE: [{ symbol: '^GDAXI', name: 'DAX', flag: '🇩🇪' }, { symbol: '^MDAXI', name: 'MDAX', flag: '🇩🇪' }, { symbol: '^SDAXI', name: 'SDAX', flag: '🇩🇪' }],
                JP: [{ symbol: '^N225', name: 'Nikkei 225', flag: '🇯🇵' }, { symbol: '^TOPX', name: 'TOPIX', flag: '🇯🇵' }, { symbol: '^JPN', name: 'JPX Nikkei 400', flag: '🇯🇵' }],
                CN: [{ symbol: '000001.SS', name: 'Shanghai Composite', flag: '🇨🇳' }, { symbol: '399001.SZ', name: 'Shenzhen Component', flag: '🇨🇳' }, { symbol: '000300.SS', name: 'CSI 300', flag: '🇨🇳' }],
                RU: [{ symbol: 'IMOEX.ME', name: 'MOEX Russia', flag: '🇷🇺' }, { symbol: 'RTS.ME', name: 'RTS Index', flag: '🇷🇺' }],
                AU: [{ symbol: '^AXJO', name: 'ASX 200', flag: '🇦🇺' }, { symbol: '^AXAT', name: 'ALL ORDINARIES', flag: '🇦🇺' }],
                FR: [{ symbol: '^FCHI', name: 'CAC 40', flag: '🇫🇷' }], IN: [{ symbol: '^BSESN', name: 'BSE SENSEX', flag: '🇮🇳' }], HK: [{ symbol: '^HSI', name: 'Hang Seng', flag: '🇭🇰' }],
                KR: [{ symbol: '^KS11', name: 'KOSPI', flag: '🇰🇷' }], BR: [{ symbol: '^BVSP', name: 'BOVESPA', flag: '🇧🇷' }], CA: [{ symbol: '^GSPTSE', name: 'S&P/TSX', flag: '🇨🇦' }],
                ZA: [{ symbol: 'JSE.JO', name: 'JSE Top 40', flag: '🇿🇦' }], EG: [{ symbol: '^CASE30', name: 'EGX 30', flag: '🇪🇬' }], NG: [{ symbol: 'NGSE.NI', name: 'NSE All Share', flag: '🇳🇬' }],
                KE: [{ symbol: 'NSE20.NR', name: 'NSE 20', flag: '🇰🇪' }], IL: [{ symbol: 'TA35.TA', name: 'TA-35', flag: '🇮🇱' }], TR: [{ symbol: 'XU100.IS', name: 'BIST 100', flag: '🇹🇷' }],
                PL: [{ symbol: 'WIG20.WA', name: 'WIG20', flag: '🇵🇱' }], CH: [{ symbol: '^SSMI', name: 'SMI', flag: '🇨🇭' }], NL: [{ symbol: '^AEX', name: 'AEX', flag: '🇳🇱' }],
                SE: [{ symbol: '^OMX', name: 'OMX Stockholm 30', flag: '🇸🇪' }], MX: [{ symbol: '^MXX', name: 'IPC MEXICO', flag: '🇲🇽' }], SG: [{ symbol: '^STI', name: 'Straits Times Index', flag: '🇸🇬' }],
                TW: [{ symbol: '^TWII', name: 'TSEC Weighted Index', flag: '🇹🇼' }], NZ: [{ symbol: '^NZ50', name: 'NZX 50', flag: '🇳🇿' }], AR: [{ symbol: '^MERV', name: 'MERVAL', flag: '🇦🇷' }],
                CL: [{ symbol: '^IPSA', name: 'S&P CLX IPSA', flag: '🇨🇱' }], ID: [{ symbol: '^JKSE', name: 'Jakarta Composite', flag: '🇮🇩' }], MY: [{ symbol: '^KLSE', name: 'FTSE Bursa Malaysia KLCI', flag: '🇲🇾' }],
                TH: [{ symbol: '^SET.BK', name: 'SET Index', flag: '🇹🇭' }], SA: [{ symbol: '^TASI.SR', name: 'Tadawul All Share', flag: '🇸🇦' }], AE: [{ symbol: '^DFMGI.AE', name: 'DFM General Index', flag: '🇦🇪' }],
                PT: [{ symbol: '^PSI20.LS', name: 'PSI 20', flag: '🇵🇹' }]
            };

            const regions = {};
            let colorIndex = 0;

            polygonSeries.events.on("datavalidated", function() {
                console.log("Mapa została w pełni załadowana - inicjalizuję regiony");
                am5.array.each(polygonSeries.dataItems, function(dataItem) {
                    const country = dataItem.get("id");
                    const name = dataItem.get("name");
                    regions[country] = { name: name, color: getGhibliColor(colorIndex) };
                    const polygon = dataItem.get("mapPolygon");
                    if (polygon) {
                        polygon.set("fill", am5.color(getGhibliColor(colorIndex)));
                        if (["US", "GB", "DE", "RU", "CN", "JP", "AU"].includes(country)) {
                            polygon.set("strokeWidth", 0.5);
                            polygon.set("stroke", am5.color(0xFFFFFF, 0.5));
                        }
                        polygon.set("tooltipText", name);
                        polygon.set("toggleKey", "active");
                        polygon.set("interactive", true);
                        polygon.events.on("click", function(ev) {
                            const clickedCountryId = ev.target.dataItem.get("id"); 
                            const clickedName = regions[clickedCountryId]?.name || `Kraj: ${clickedCountryId}`;
                            console.log("Kliknięto kraj (pojedynczy handler):", clickedCountryId, clickedName); 
                            if (extendedMarketIndexes[clickedCountryId]) { 
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
                                alert(`Brak danych indeksów dla kraju: ${clickedName}`);
                            }
                        });
                    }
                    colorIndex = (colorIndex + 1) % 15;
                });
                console.log("Zainicjalizowano " + Object.keys(regions).length + " regionów");
            });

            function saveOpenPanelsState() {
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
            }
            
            function loadOpenPanelsState() {
                try {
                    const savedPanels = localStorage.getItem('openPanels');
                    if (!savedPanels) return;
                    const panelsData = JSON.parse(savedPanels);
                    console.log('Wczytano dane o panelach:', panelsData.length, 'do odtworzenia');
                    panelsData.forEach(panelData => {
                        if (extendedMarketIndexes[panelData.country]) {
                            const panel = createCountryPanel(panelData.country, parseInt(panelData.left) || panelStartX, parseInt(panelData.top) || panelStartY);
                            loadMarketIndexes(panelData.country, panel.querySelector('.country-content'));
                            openPanelCount++;
                        }
                    });
                } catch (error) { console.error('Błąd podczas odtwarzania paneli:', error); }
            }
            
            function createCountryPanel(country, x, y) {
                const template = document.getElementById('country-panel-template');
                const panel = document.importNode(template.content, true).querySelector('.country-panel');
                panel.style.left = `${x}px`;
                panel.style.top = `${y}px`;
                panel.style.display = 'block';
                panel.id = `panel-${country}`;
                panel.dataset.country = country;
                const countryName = regions[country]?.name || `Kraj: ${country}`;
                panel.querySelector('.panel-title').textContent = countryName;
                document.body.appendChild(panel);
                makeDraggable(panel);
                panel.querySelector('.panel-close').addEventListener('click', function() {
                    console.log("Zamykanie panelu:", country);
                    panel.remove();
                    saveOpenPanelsState();
                });
                VanillaTilt.init(panel, { max: 5, speed: 400, glare: true, "max-glare": 0.2 });
                return panel;
            }

            let openPanelCount = 0;
            const panelStartX = 50;
            const panelStartY = 100;
            const panelOffsetX = 25;
            const panelOffsetY = 25;

            chart.animate({ key: "rotationX", from: 0, to: 360, duration: 30000, loops: Infinity });

            const config = {
                bitcoin: {
                    primary: { name: 'CoinGecko', endpoint: 'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false', refreshInterval: 30000 },
                    secondary: { name: 'CoinCap', endpoint: 'https://api.coincap.io/v2/assets/bitcoin', refreshInterval: 10000 }, // CoinCap ma mniej danych, ale zostawiamy interwał
                    currentApi: 'primary'
                },
                markets: { /* Konfiguracja API rynków (obecnie nieużywana aktywnie z powodu CORS) */ },
                fearGreed: { endpoint: 'https://api.alternative.me/fng/', refreshInterval: 600000 }
            };

            const btcPrice = document.querySelector('.btc-price');
            const priceChange = document.querySelector('.price-change');
            const dataValues = document.querySelectorAll('.data-value');
            const fearGreedValue = document.querySelector('.fear-greed-value');
            const fearGreedIndicator = document.querySelector('.fear-greed-indicator');
            const bitcoinApiSource = document.getElementById('bitcoin-api-source');
            const bitcoinApiToggle = document.getElementById('bitcoin-api-toggle');
            const dataSource = document.querySelector('.data-source');

            function formatPrice(price) {
                return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
            }

            function formatChange(change) {
                const formatted = change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`;
                return { text: formatted, class: change >= 0 ? 'positive' : 'negative' };
            }

            async function fetchBitcoinDataCoinGecko() {
                const endpoint = config.bitcoin.primary.endpoint;
                console.log("Próba połączenia z głównym API Bitcoin:", endpoint);
                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    const price = data.market_data?.current_price?.usd;
                    const change1h = data.market_data?.price_change_percentage_1h_in_currency?.usd;
                    const change24h = data.market_data?.price_change_percentage_24h_in_currency?.usd;
                    const change7d = data.market_data?.price_change_percentage_7d_in_currency?.usd;
                    const change30d = data.market_data?.price_change_percentage_30d_in_currency?.usd;
                    const dominance = data.market_data?.market_cap_percentage?.btc;
                    if (price === undefined || change24h === undefined) throw new Error('Niekompletne dane z CoinGecko');
                    btcPrice.textContent = formatPrice(price);
                    const changeFormatted24h = formatChange(change24h);
                    priceChange.textContent = `${changeFormatted24h.text} (24h)`;
                    priceChange.className = `price-change ${changeFormatted24h.class}`;
                    const intervals = [change1h, change7d, change30d];
                    intervals.forEach((change, index) => {
                        if (change !== undefined && change !== null) {
                            const formatted = formatChange(change);
                            dataValues[index].textContent = formatted.text;
                            dataValues[index].className = `data-value ${formatted.class}`;
                        } else {
                            dataValues[index].textContent = "N/A";
                            dataValues[index].className = "data-value";
                        }
                    });
                    if (dominance !== undefined && dominance !== null) dataValues[3].textContent = `${dominance.toFixed(2)}%`;
                    else dataValues[3].textContent = "N/A";
                    fetchTransactionFees(price);
                    updateLastRefreshTime();
                    return true;
                } catch (error) {
                    console.error('Błąd pobierania danych Bitcoin (CoinGecko):', error);
                    btcPrice.textContent = "Błąd API";
                    priceChange.textContent = "N/A";
                    priceChange.className = "price-change";
                    [0, 1, 2, 3, 4].forEach(i => { dataValues[i].textContent = "N/A"; dataValues[i].className = "data-value"; });
                    updateLastRefreshTime("Błąd API Bitcoin");
                    return false;
                }
            }

            async function fetchBitcoinDataCoinCap() {
                const endpoint = config.bitcoin.secondary.endpoint;
                console.log("Próba połączenia z zapasowym API Bitcoin:", endpoint);
                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const result = await response.json();
                    const data = result.data;
                    const price = parseFloat(data?.priceUsd);
                    const change24h = parseFloat(data?.changePercent24Hr);
                    if (isNaN(price) || isNaN(change24h)) throw new Error('Niekompletne dane z CoinCap');
                    btcPrice.textContent = formatPrice(price);
                    const changeFormatted24h = formatChange(change24h);
                    priceChange.textContent = `${changeFormatted24h.text} (24h)`;
                    priceChange.className = `price-change ${changeFormatted24h.class}`;
                    [0, 1, 2, 3].forEach(i => { dataValues[i].textContent = "N/A"; dataValues[i].className = "data-value"; });
                    fetchTransactionFees(price);
                    updateLastRefreshTime();
                    return true;
                } catch (error) {
                    console.error('Błąd pobierania danych Bitcoin (CoinCap):', error);
                    btcPrice.textContent = "Błąd API";
                    priceChange.textContent = "N/A";
                    priceChange.className = "price-change";
                    [0, 1, 2, 3, 4].forEach(i => { dataValues[i].textContent = "N/A"; dataValues[i].className = "data-value"; });
                    updateLastRefreshTime("Błąd API Bitcoin");
                    return false;
                }
            }
            
            async function fetchTransactionFees(currentBtcPrice) {
                 const endpoint = 'https://mempool.space/api/v1/fees/recommended';
                 try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error('Mempool API error');
                    const fees = await response.json();
                    const feeRate = fees.halfHourFee;
                    if (feeRate && !isNaN(feeRate) && currentBtcPrice && !isNaN(currentBtcPrice)) {
                        const costUSD = (feeRate / 100000000) * currentBtcPrice * 140;
                        dataValues[4].textContent = `${feeRate.toFixed(0)} sat/vB ($${costUSD.toFixed(2)})`;
                    } else dataValues[4].textContent = "N/A";
                 } catch (error) {
                     console.error('Błąd pobierania opłat transakcyjnych:', error);
                     dataValues[4].textContent = "Błąd API Feerate";
                 }
            }

            async function fetchFearGreedIndex() {
                const endpoint = config.fearGreed.endpoint;
                console.log("Próba pobierania danych Fear & Greed Index:", endpoint);
                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();
                    const value = parseInt(data?.data?.[0]?.value);
                    const valueClassification = data?.data?.[0]?.value_classification;
                    if (isNaN(value) || !valueClassification) throw new Error('Niekompletne dane Fear & Greed');
                    fearGreedValue.textContent = `${value} (${valueClassification})`;
                    const position = Math.max(0, Math.min(100, value));
                    fearGreedIndicator.style.left = `${position}%`;
                     if (value <= 25) fearGreedValue.style.color = '#FF3B30';
                     else if (value <= 45) fearGreedValue.style.color = '#FF9500';
                     else if (value <= 55) fearGreedValue.style.color = '#FFCC00';
                     else if (value <= 75) fearGreedValue.style.color = '#9BDB1D';
                     else fearGreedValue.style.color = '#4CD964';
                    return true;
                } catch (error) {
                    console.error('Błąd pobierania danych Fear & Greed:', error);
                    fearGreedValue.textContent = 'Błąd API';
                    fearGreedValue.style.color = 'var(--text-secondary)';
                    fearGreedIndicator.style.left = "50%";
                    fearGreedIndicator.style.background = "gray";
                    return false;
                }
            }

            function updateLastRefreshTime(errorMessage = null) {
                const sourceName = config.bitcoin.currentApi === 'primary' ? config.bitcoin.primary.name : config.bitcoin.secondary.name;
                if (errorMessage) dataSource.textContent = `${errorMessage} | ${getCurrentTime()}`;
                else dataSource.textContent = `Źródło: ${sourceName} | Ostatnia aktualizacja: ${getCurrentTime()}`;
            }

            function getCurrentTime() {
                return new Date().toLocaleTimeString('pl-PL');
            }

            bitcoinApiToggle.addEventListener('change', function() {
                config.bitcoin.currentApi = this.checked ? 'secondary' : 'primary';
                fetchBitcoinData(); // Natychmiastowe odświeżenie po przełączeniu
            });

            VanillaTilt.init(document.querySelector(".bitcoin-panel"), { max: 5, speed: 400, glare: true, "max-glare": 0.2, scale: 1.02 });
            VanillaTilt.init(document.querySelector(".search-wrapper"), { max: 3, speed: 400, glare: true, "max-glare": 0.1 });

            async function fetchBitcoinData() {
                let success;
                if (config.bitcoin.currentApi === 'primary') {
                    success = await fetchBitcoinDataCoinGecko();
                } else {
                    success = await fetchBitcoinDataCoinCap();
                }
                 // Aktualizuj nazwę źródła w UI PO próbie pobrania
                const sourceName = config.bitcoin.currentApi === 'primary' ? config.bitcoin.primary.name : config.bitcoin.secondary.name;
                bitcoinApiSource.textContent = sourceName;
                return success;
            }

            const flashElement = (element, className) => {
                element.classList.add(className);
                setTimeout(() => { element.classList.remove(className); }, 1000);
            };

            let lastPrice = null;
            const monitorPriceChanges = () => {
                const currentPriceText = btcPrice.textContent;
                // Upewnij się, że nie próbujesz parsować "Błąd API"
                if (currentPriceText.includes("Błąd")) {
                    lastPrice = null; // Zresetuj, jeśli jest błąd
                    return;
                }
                const currentPrice = parseFloat(currentPriceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
                if (lastPrice !== null && !isNaN(currentPrice)) {
                    if (currentPrice > lastPrice) flashElement(btcPrice, 'price-flash-up');
                    else if (currentPrice < lastPrice) flashElement(btcPrice, 'price-flash-down');
                }
                lastPrice = currentPrice;
            };

            document.addEventListener('keydown', function(e) {
                if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    document.querySelector('.search-input').focus();
                }
            });

            makeDraggable(document.querySelector('.bitcoin-panel'));

            let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
            let konamiIndex = 0;
            document.addEventListener('keydown', function(e) {
                if (e.key === konamiCode[konamiIndex]) {
                    konamiIndex++;
                    if (konamiIndex === konamiCode.length) {
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
                        konamiIndex = 0;
                    }
                } else konamiIndex = 0;
            });

            fetchBitcoinData();
            fetchFearGreedIndex();
            setInterval(fetchBitcoinData, config.bitcoin.primary.refreshInterval);
            setInterval(fetchFearGreedIndex, config.fearGreed.refreshInterval);
            setInterval(monitorPriceChanges, 1000);
            loadOpenPanelsState();

            async function loadMarketIndexes(country, contentElement) {
                const indexes = extendedMarketIndexes[country] || [];
                if (!contentElement) { console.error('Brak elementu docelowego dla indeksów'); return; }
                if (indexes.length === 0) { contentElement.innerHTML = `<p>Brak skonfigurowanych indeksów dla ${country}</p>`; return; }
                contentElement.innerHTML = `<div class="loading"></div><p>Ładowanie danych indeksów...</p>`;
                const symbolList = indexes.map(index => index.symbol).join(',');
                const endpoint = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}`;
                try {
                    console.log("Pobieranie danych indeksów dla:", country, "z", endpoint);
                    const response = await fetch(endpoint);
                    if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
                        throw new Error(`Problem z API Yahoo Finance: Status ${response.status}`);
                    }
                    const data = await response.json();
                    if (!data?.quoteResponse?.result) throw new Error('Nieprawidłowa odpowiedź z API Yahoo Finance');
                    const results = data.quoteResponse.result;
                    let html = `<div class="index-list">`;
                    indexes.forEach((index, idx) => {
                        const marketData = results.find(r => r.symbol === index.symbol);
                        let price = "Błąd danych";
                        let change1D = { text: "N/A", class: "" };
                        if (marketData && marketData.regularMarketPrice !== undefined && marketData.regularMarketPrice !== null) {
                            price = formatPrice(marketData.regularMarketPrice);
                            if (marketData.regularMarketChangePercent !== undefined && marketData.regularMarketChangePercent !== null) {
                                change1D = formatChange(marketData.regularMarketChangePercent);
                            } else change1D = { text: "N/A", class: "" };
                        } else {
                             price = "Brak danych";
                             change1D = { text: "N/A", class: "" };
                        }
                        html += `<div class="index-item">
                                     <div class="index-header"><span class="index-flag">${index.flag}</span><span class="index-name">${index.name}</span></div>
                                     <div class="index-price">${price}</div>
                                     <div class="index-intervals"><div class="interval-grid" style="grid-template-columns: 1fr;"><div class="interval-item"><span class="interval-label">Zmiana (1D):</span><span class="interval-value ${change1D.class}">${change1D.text}</span></div></div></div>
                                 </div>`;
                    });
                    html += `</div><div class="data-source">Dane: Yahoo Finance | ${getCurrentTime()}</div>`;
                    contentElement.innerHTML = html;
                } catch (error) {
                    console.error(`Błąd pobierania danych indeksów (${country}):`, error);
                    let html = `<div class="index-list">`;
                    indexes.forEach((index) => {
                        html += `<div class="index-item">
                                     <div class="index-header"><span class="index-flag">${index.flag}</span><span class="index-name">${index.name}</span></div>
                                     <div class="index-price">Błąd API</div>
                                     <div class="index-intervals"><div class="interval-grid" style="grid-template-columns: 1fr;"><div class="interval-item"><span class="interval-label">Zmiana (1D):</span><span class="interval-value">N/A</span></div></div></div>
                                 </div>`;
                    });
                    html += `</div><div class="data-source">Błąd API Indeksów | ${getCurrentTime()}</div>`;
                    contentElement.innerHTML = html;
                }
            }
        } catch (error) { 
            console.error("Błąd krytyczny podczas inicjalizacji amCharts i logiki aplikacji:", error);
            document.body.innerHTML += `<div style="color: red; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); padding: 20px; border-radius: 10px;">Wystąpił krytyczny błąd podczas ładowania mapy. Spróbuj odświeżyć stronę.</div>`;
        } 
    }); 
}); 