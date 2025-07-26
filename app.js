         class TranslationApp {
            constructor() {
                this.isEnglishToSpanish = true;
                this.initializeElements();
                this.bindEvents();
                this.updateUI();
            }

            initializeElements() {
                this.sourceText = document.getElementById('source-text');
                this.targetText = document.getElementById('target-text');
                this.translateBtn = document.getElementById('translate-btn');
                this.swapBtn = document.getElementById('swap-btn');
                this.clearBtn = document.getElementById('clear-btn');
                this.loading = document.getElementById('loading');
                this.error = document.getElementById('error');
                this.errorMessage = document.getElementById('error-message');
                this.charCount = document.getElementById('char-count');
                this.sourceLang = document.getElementById('source-lang');
                this.targetLang = document.getElementById('target-lang');
                this.sourceFlag = document.getElementById('source-flag');
                this.targetFlag = document.getElementById('target-flag');
            }

            bindEvents() {
                this.translateBtn.addEventListener('click', () => this.translate());
                this.swapBtn.addEventListener('click', () => this.swapLanguages());
                this.clearBtn.addEventListener('click', () => this.clearText());
                this.sourceText.addEventListener('input', () => this.updateCharCount());
                this.sourceText.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                        this.translate();
                    }
                });
            }

            updateCharCount() {
                const count = this.sourceText.value.length;
                this.charCount.textContent = count;
            }

            updateUI() {
                if (this.isEnglishToSpanish) {
                    this.sourceLang.textContent = 'English';
                    this.targetLang.textContent = 'Spanish';
                    this.sourceFlag.textContent = '🇺🇸';
                    this.targetFlag.textContent = '🇪🇸';
                    this.sourceText.placeholder = 'Enter English text to translate...';
                } else {
                    this.sourceLang.textContent = 'Spanish';
                    this.targetLang.textContent = 'English';
                    this.sourceFlag.textContent = '🇪🇸';
                    this.targetFlag.textContent = '🇺🇸';
                    this.sourceText.placeholder = 'Ingrese texto en español para traducir...';
                }
            }

            swapLanguages() {
                this.isEnglishToSpanish = !this.isEnglishToSpanish;
                
                // Swap the text content
                const sourceValue = this.sourceText.value;
                const targetValue = this.targetText.textContent;
                
                if (targetValue && targetValue !== 'Translation will appear here...') {
                    this.sourceText.value = targetValue;
                    this.targetText.textContent = sourceValue || 'Translation will appear here...';
                }
                
                this.updateUI();
                this.updateCharCount();
                this.hideError();
            }

            clearText() {
                this.sourceText.value = '';
                this.targetText.textContent = 'Translation will appear here...';
                this.updateCharCount();
                this.hideError();
                this.sourceText.focus();
            }

            showLoading() {
                this.loading.classList.add('show');
                this.translateBtn.disabled = true;
                this.translateBtn.innerHTML = '⏳ Translating...';
            }

            hideLoading() {
                this.loading.classList.remove('show');
                this.translateBtn.disabled = false;
                this.translateBtn.innerHTML = '🔄 Translate';
            }

            showError(message) {
                this.errorMessage.textContent = message;
                this.error.classList.add('show');
            }

            hideError() {
                this.error.classList.remove('show');
            }

            async translate() {
                const text = this.sourceText.value.trim();
                
                if (!text) {
                    this.showError('Please enter some text to translate.');
                    return;
                }

                this.hideError();
                this.showLoading();

                try {
                    const translatedText = await this.callRealTranslationAPI(text);
                    this.targetText.textContent = translatedText;
                    
                } catch (error) {
                    this.showError('Translation failed. Please try again.');
                    console.error('Translation error:', error);
                } finally {
                    this.hideLoading();
                }
            }

            async callRealTranslationAPI(text) {
                // 🆓 LibreTranslate - NO API KEY NEEDED!
                
                // Figure out what languages we're using
                const sourceLang = this.isEnglishToSpanish ? 'en' : 'es';
                const targetLang = this.isEnglishToSpanish ? 'es' : 'en';
                
                // LibreTranslate free public API endpoint
                const apiUrl = 'https://libretranslate.com/translate';
                
                // Create the request body
                const requestBody = {
                    q: text,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text',
                    api_key: '' // Empty for free usage
                };
                
                try {
                    // Make the API call
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody)
                    });
                    
                    // Check if it worked
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    // Get the translation
                    const data = await response.json();
                    return data.translatedText;
                    
                } catch (error) {
                    // Fallback to alternative free service if LibreTranslate fails
                    console.log('LibreTranslate failed, trying backup...');
                    return await this.fallbackTranslation(text, sourceLang, targetLang);
                }
            }

            async fallbackTranslation(text, sourceLang, targetLang) {
                // 🔄 Backup: MyMemory Translation API (also free, no key needed)
                try {
                    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
                    
                    const response = await fetch(apiUrl, {
                        method: 'GET',
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.responseStatus === 200) {
                        return data.responseData.translatedText;
                    } else {
                        throw new Error('Translation failed');
                    }
                    
                } catch (error) {
                    // Final fallback - basic word replacement for common phrases
                    console.log('All APIs failed, using offline backup...');
                    return this.offlineBackup(text);
                }
            }

            offlineBackup(text) {
                // 📚 Offline backup with expanded vocabulary
                const translations = {
                    // English to Spanish
                    'hello': 'hola', 'hi': 'hola', 'goodbye': 'adiós', 'bye': 'adiós',
                    'thank you': 'gracias', 'thanks': 'gracias', 'please': 'por favor',
                    'yes': 'sí', 'no': 'no', 'sorry': 'lo siento', 'excuse me': 'disculpe',
                    'how are you': 'cómo estás', 'i am fine': 'estoy bien',
                    'good morning': 'buenos días', 'good afternoon': 'buenas tardes',
                    'good evening': 'buenas tardes', 'good night': 'buenas noches',
                    'i love you': 'te amo', 'i like': 'me gusta', 'beautiful': 'hermoso',
                    'friend': 'amigo', 'family': 'familia', 'house': 'casa',
                    'water': 'agua', 'food': 'comida', 'help': 'ayuda',
                    'welcome': 'bienvenido', 'congratulations': 'felicidades',
                    
                    // Spanish to English (reverse)
                    'hola': 'hello', 'adiós': 'goodbye', 'gracias': 'thank you',
                    'por favor': 'please', 'sí': 'yes', 'lo siento': 'sorry',
                    'disculpe': 'excuse me', 'cómo estás': 'how are you',
                    'estoy bien': 'i am fine', 'buenos días': 'good morning',
                    'buenas tardes': 'good afternoon', 'buenas noches': 'good night',
                    'te amo': 'i love you', 'me gusta': 'i like', 'hermoso': 'beautiful',
                    'amigo': 'friend', 'familia': 'family', 'casa': 'house',
                    'agua': 'water', 'comida': 'food', 'ayuda': 'help',
                    'bienvenido': 'welcome', 'felicidades': 'congratulations'
                };

                const lowerText = text.toLowerCase().trim();
                
                // Check for exact matches first
                if (translations[lowerText]) {
                    return translations[lowerText];
                }

                // Try partial matches for longer sentences
                let translated = text;
                Object.keys(translations).forEach(key => {
                    const regex = new RegExp('\\b' + key + '\\b', 'gi');
                    translated = translated.replace(regex, translations[key]);
                });

                // If no translation found, provide helpful message
                if (translated === text) {
                    if (this.isEnglishToSpanish) {
                        return `[Sin conexión] No se pudo traducir: "${text}". Verifique su conexión a internet.`;
                    } else {
                        return `[Offline] Could not translate: "${text}". Please check your internet connection.`;
                    }
                }

                return translated;
            }
        }

        // Initialize the application when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new TranslationApp();
        });
