        // GSAP Plugin Registration
        gsap.registerPlugin(ScrollTrigger);

        // ===========================================
        // PRELOADER ANIMATION
        // ===========================================
        let progress = 0;
        const progressElement = document.querySelector('.preloader-progress');
        const preloaderText = document.querySelector('.preloader-text');

        const updateProgress = () => {
            progress += Math.random() * 3 + 1; // Random increment between 1-4
            if (progress > 100) progress = 100;
            
            progressElement.textContent = `${Math.floor(progress)}%`;

            if (progress < 100) {
                requestAnimationFrame(updateProgress);
            } else {
                // Preloader completion animation
                gsap.timeline()
                    .to(preloaderText, { 
                        scale: 1.2, 
                        duration: 0.3,
                        ease: "power2.out"
                    })
                    .to('.preloader', { 
                        opacity: 0, 
                        duration: 1,
                        ease: "power2.inOut",
                        onComplete: () => {
                            document.querySelector('.preloader').style.display = 'none';
                            // Start main animations after preloader
                            initScrollAnimations();
                        }
                    });
            }
        };

        // Start preloader after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            // Check for fullscreen warning first
            checkFullscreenWarning();
            
            // ALWAYS show language selection modal at startup
            showLanguageSelectionModal();
        });

        // ===========================================
        // FULLSCREEN WARNING (Desktop only when window is small)
        // ===========================================
        function checkFullscreenWarning() {
            const warning = document.getElementById('fullscreenWarning');
            if (!warning) return;
            
            const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const isSmallWindow = window.innerWidth < 1024;
            
            console.log('Check Warning:', { isDesktop, isSmallWindow, width: window.innerWidth }); // Debug
            
            // Show ONLY on desktop with small window (auto-hide when enlarged)
            if (isDesktop && isSmallWindow) {
                warning.classList.add('active');
                updateResolutionDisplay();
            } else {
                warning.classList.remove('active');
            }
        }

        function updateResolutionDisplay() {
            const width = window.innerWidth;
            const resElements = ['currentResolution', 'currentResolutionEn', 'currentResolutionTr'];
            resElements.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.textContent = `${width}px`;
                }
            });
        }

        // Check on window resize - IMMEDIATE update!
        window.addEventListener('resize', () => {
            checkFullscreenWarning();
        });
        
        // ALSO check on fullscreen change!
        document.addEventListener('fullscreenchange', () => {
            setTimeout(checkFullscreenWarning, 100);
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            setTimeout(checkFullscreenWarning, 100);
        });

        // ===========================================
        // SCROLL TRIGGERED ANIMATIONS - NUR CSS! Kein GSAP mehr!
        // ===========================================
        function initScrollAnimations() {
            // Alle Animationen nur mit IntersectionObserver + CSS!
            // KEIN GSAP = KEINE Performance-Probleme!

            // Interactive Hero avatar clock-like rotation
            let avatarImg = document.querySelector('.hero-avatar img');
            let avatar = document.querySelector('.hero-avatar');
            
            // Only run avatar animation if elements exist
            if (!avatarImg || !avatar) {
                console.log('Avatar elements not found, skipping avatar animation');
                return;
            }
            
            let isDragging = false;
            let lastAngle = 0;
            let currentRotation = 0;
            let autoRotationTween;

            // Start auto rotation
            function startAutoRotation() {
                if (autoRotationTween) {
                    autoRotationTween.kill();
                }
                autoRotationTween = gsap.to(avatarImg, {
                    rotation: currentRotation + 360,
                    duration: 20,
                    ease: "none",
                    repeat: -1,
                    onUpdate: function() {
                        currentRotation = gsap.getProperty(avatarImg, "rotation");
                    }
                });
            }

            // Stop auto rotation
            function stopAutoRotation() {
                if (autoRotationTween) {
                    currentRotation = gsap.getProperty(avatarImg, "rotation");
                    autoRotationTween.kill();
                }
            }

            // Get angle from center
            function getAngle(event, element) {
                const rect = element.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const x = event.clientX - centerX;
                const y = event.clientY - centerY;
                return Math.atan2(y, x) * (180 / Math.PI);
            }

            // Mouse events
            avatar.addEventListener('mousedown', function(e) {
                e.preventDefault();
                isDragging = true;
                stopAutoRotation();
                lastAngle = getAngle(e, avatar);
                avatar.style.cursor = 'grabbing';
            });

            document.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                
                const currentAngle = getAngle(e, avatar);
                let deltaAngle = currentAngle - lastAngle;
                
                // Handle angle wrap-around
                if (deltaAngle > 180) deltaAngle -= 360;
                if (deltaAngle < -180) deltaAngle += 360;
                
                currentRotation += deltaAngle;
                gsap.set(avatarImg, { rotation: currentRotation });
                
                lastAngle = currentAngle;
            });

            document.addEventListener('mouseup', function() {
                if (isDragging) {
                    isDragging = false;
                    avatar.style.cursor = 'grab';
                    
                    // Resume auto rotation after 2 seconds
                    setTimeout(() => {
                        if (!isDragging) {
                            startAutoRotation();
                        }
                    }, 2000);
                }
            });

            // Touch events for mobile
            avatar.addEventListener('touchstart', function(e) {
                e.preventDefault();
                isDragging = true;
                stopAutoRotation();
                const touch = e.touches[0];
                lastAngle = getAngle(touch, avatar);
            });

            document.addEventListener('touchmove', function(e) {
                if (!isDragging) return;
                e.preventDefault();
                
                const touch = e.touches[0];
                const currentAngle = getAngle(touch, avatar);
                let deltaAngle = currentAngle - lastAngle;
                
                // Handle angle wrap-around
                if (deltaAngle > 180) deltaAngle -= 360;
                if (deltaAngle < -180) deltaAngle += 360;
                
                currentRotation += deltaAngle;
                gsap.set(avatarImg, { rotation: currentRotation });
                
                lastAngle = currentAngle;
            });

            document.addEventListener('touchend', function() {
                if (isDragging) {
                    isDragging = false;
                    
                    // Resume auto rotation after 2 seconds
                    setTimeout(() => {
                        if (!isDragging) {
                            startAutoRotation();
                        }
                    }, 2000);
                }
            });

            // Handle mouse leave to prevent stuck dragging
            avatar.addEventListener('mouseleave', function() {
                if (isDragging) {
                    isDragging = false;
                    avatar.style.cursor = 'grab';
                    
                    setTimeout(() => {
                        if (!isDragging) {
                            startAutoRotation();
                        }
                    }, 1000);
                }
            });

            // Start initial auto rotation
            startAutoRotation();

            // Navbar scroll effect
            ScrollTrigger.create({
                start: "top -80",
                end: 99999,
                toggleClass: {className: "scrolled", targets: ".navbar"}
            });
        }

        // ===========================================
        // HOVER EFFECTS FOR INTERACTIVE ELEMENTS
        // ===========================================
        document.addEventListener('DOMContentLoaded', () => {
            // Enhanced hover effects for buttons
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    gsap.to(btn, {
                        scale: 1.05,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
                
                btn.addEventListener('mouseleave', () => {
                    gsap.to(btn, {
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            });

            // Smooth scrolling for navigation buttons
            try {
                document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const target = document.querySelector(this.getAttribute('href'));
                        if (target) {
                            gsap.to(window, {
                                duration: 0.8,
                                scrollTo: {
                                    y: target,
                                    offsetY: 50
                                },
                                ease: "power2.out"
                            });
                        }
                    });
                });
            } catch (e) {
                console.log('Smooth scroll setup failed:', e);
            }

            // Skill bubble hover effects
            document.querySelectorAll('.skill-bubble').forEach(bubble => {
                bubble.addEventListener('mouseenter', () => {
                    gsap.to(bubble, {
                        scale: 1.1,
                        rotation: 5,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
                
                bubble.addEventListener('mouseleave', () => {
                    gsap.to(bubble, {
                        scale: 1,
                        rotation: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            });

            // Project card hover effects
            document.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('mouseenter', () => {
                    gsap.to(card, {
                        y: -10,
                        scale: 1.02,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
                
                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        y: 0,
                        scale: 1,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                });
            });

            // Navigation link hover effects
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('mouseenter', () => {
                    gsap.to(link, {
                        y: -3,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                });
                
                link.addEventListener('mouseleave', () => {
                    gsap.to(link, {
                        y: 0,
                        duration: 0.2,
                        ease: "power2.out"
                    });
                });
            });
        });

        // ===========================================
        // MOBILE MENU FUNCTIONALITY
        // ===========================================
        function toggleMobileMenu() {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            
            if (!navToggle || !navMenu) return;
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navToggle = document.querySelector('.nav-toggle');
                const navMenu = document.querySelector('.nav-menu');
                
                if (!navToggle || !navMenu) return;
                
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navToggle = document.querySelector('.nav-toggle');
            const navMenu = document.querySelector('.nav-menu');
            const navbar = document.querySelector('.navbar');
            
            if (!navToggle || !navMenu || !navbar) return;
            
            if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // Add scrolled class to navbar on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (!navbar) return;
            
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // ===========================================
        // SMOOTH SCROLLING FOR NAVIGATION
        // ===========================================
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        gsap.to(window, {
                            duration: 1,
                            scrollTo: {
                                y: target,
                                offsetY: 80
                            },
                            ease: "power2.inOut"
                        });
                    }
                });
            });
        } catch (e) {
            console.log('Smooth scrolling setup failed:', e);
        }

        // ===========================================
        // PARALLAX EFFECTS
        // ===========================================
        gsap.utils.toArray('.hero').forEach(section => {
            gsap.to(section, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // ===========================================
        // TYPING EFFECT FOR HERO TEXT
        // ===========================================
        function typeWriter(element, text, speed = 50) {
            let i = 0;
            element.textContent = '';
            
            function type() {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            type();
        }

        // Start typing effect after preloader
        setTimeout(() => {
            const heroName = document.querySelector('.hero-name');
            if (heroName) {
                typeWriter(heroName, 'Halil Yücedag', 100);
            }
        }, 2000);

        // ===========================================
        // CURSOR TRAIL EFFECT (CYBERSECURITY THEME)
        // ===========================================
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);

        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX - 10,
                y: e.clientY - 10,
                duration: 0.1
            });
        });

        // Hide cursor on mouse leave
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '1';
        });

        // ===========================================
        // LANGUAGE SWITCHING FUNCTIONALITY - FIXED
        // ===========================================
        function switchLanguage(lang) {
            // Update active button (with null check)
            const langButtons = document.querySelectorAll('.lang-btn');
            if (langButtons.length > 0) {
                langButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
            }
            
            const langButton = document.querySelector(`[data-lang="${lang}"]`);
            if (langButton) {
                langButton.classList.add('active');
            }

            // Hide ALL language content first
            const allLangElements = document.querySelectorAll('.lang-text');
            if (allLangElements.length > 0) {
                allLangElements.forEach(element => {
                    element.classList.remove('active');
                });
            }

            // Show ONLY the selected language content
            const selectedLangElements = document.querySelectorAll(`.lang-text.${lang}`);
            if (selectedLangElements.length > 0) {
                selectedLangElements.forEach(element => {
                    element.classList.add('active');
                });
            }

            // Update bot input placeholder
            const botInput = document.getElementById('botMessageInput');
            if (botInput) {
                const placeholders = {
                    de: "Nachricht an den Entwickler...",
                    en: "Message to the developer...",
                    tr: "Geliştiriciye mesaj..."
                };
                botInput.placeholder = placeholders[lang] || placeholders.en;
            }
            
            console.log(`Switched to language: ${lang}`);
        }

        // Show language selection modal on first visit and prune other languages after selection
        function injectLanguageModalStyles() {
            if (document.getElementById('lang-modal-styles')) return;
            const style = document.createElement('style');
            style.id = 'lang-modal-styles';
            style.textContent = `
                .lang-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);z-index:999999;display:flex;align-items:center;justify-content:center;animation:fadeIn 0.5s ease}
                @keyframes fadeIn{from{opacity:0}to{opacity:1}}
                .lang-modal{background:rgba(255,255,255,0.95);border-radius:30px;padding:3rem 2.5rem;max-width:500px;width:90%;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);animation:scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1)}
                @keyframes scaleIn{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
                .lang-modal h2{color:#1a1a1a;margin-bottom:2rem;font-size:1.6rem;font-weight:600;letter-spacing:-0.02em}
                .lang-choice{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-top:1.5rem}
                .lang-choice button{padding:1.2rem;border-radius:20px;border:2px solid #e5e5e5;background:#ffffff;color:#1a1a1a;cursor:pointer;font-weight:600;font-size:1rem;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);display:flex;flex-direction:column;align-items:center;gap:0.5rem;min-height:100px;justify-content:center}
                .lang-choice button .flag{font-size:2.5rem;line-height:1}
                .lang-choice button .lang-name{font-size:0.85rem;text-transform:uppercase;letter-spacing:0.05em}
                .lang-choice button:hover{border-color:#0066ff;background:#f0f7ff;transform:translateY(-4px);box-shadow:0 12px 24px -10px rgba(0,102,255,0.3)}
                .lang-choice button:active{transform:translateY(-2px)}
                @media (max-width: 480px){.lang-choice{grid-template-columns:1fr;gap:0.75rem}.lang-choice button{min-height:80px}}
            `;
            document.head.appendChild(style);
        }

        function pruneLanguagesExcept(lang) {
            console.log(`[Pruning] Keeping only: ${lang}`);
            
            // Remove all non-selected language content blocks
            const allLangElements = document.querySelectorAll('.lang-text');
            console.log(`[Pruning] Found ${allLangElements.length} lang-text elements`);
            
            allLangElements.forEach(el => {
                const classes = Array.from(el.classList);
                console.log(`[Pruning] Element classes: ${classes.join(', ')}`);
                
                if (!el.classList.contains(lang)) {
                    console.log(`[Pruning] Removing element with classes: ${classes.join(', ')}`);
                    el.remove();
                } else {
                    console.log(`[Pruning] Keeping element with classes: ${classes.join(', ')}`);
                    el.classList.add('active');
                }
            });

            // Remove language switcher to avoid switching to removed languages
            const switcher = document.querySelector('.language-switcher');
            if (switcher) {
                switcher.remove();
                console.log('[Pruning] Removed language switcher');
            }
            
            console.log('[Pruning] Complete!');
        }

        function showLanguageSelectionModal() {
            injectLanguageModalStyles();
            
            // INJECT BASE CSS to hide all languages initially
            const baseHideStyle = document.createElement('style');
            baseHideStyle.id = 'lang-base-hide';
            baseHideStyle.textContent = `
                .lang-text { 
                    display: none !important; 
                }
            `;
            document.head.appendChild(baseHideStyle);
            
            const backdrop = document.createElement('div');
            backdrop.className = 'lang-modal-backdrop';
            backdrop.innerHTML = `
                <div class="lang-modal">
                    <h2>Select Your Language</h2>
                    <div class="lang-choice">
                        <button data-lang="de">
                            <span class="flag">🇩🇪</span>
                            <span class="lang-name">Deutsch</span>
                        </button>
                        <button data-lang="en">
                            <span class="flag">🇬🇧</span>
                            <span class="lang-name">English</span>
                        </button>
                        <button data-lang="tr">
                            <span class="flag">🇹🇷</span>
                            <span class="lang-name">Türkçe</span>
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(backdrop);

            const onSelect = (e) => {
                const btn = e.target.closest('button[data-lang]');
                if (!btn) return;
                const lang = btn.getAttribute('data-lang');
                if (!lang) return;
                
                // Remove base hide style
                const baseHide = document.getElementById('lang-base-hide');
                if (baseHide) baseHide.remove();
                
                // INJECT CSS to show ONLY selected language
                const showStyle = document.createElement('style');
                showStyle.id = 'lang-show-' + lang;
                showStyle.textContent = `
                    /* Hide all languages */
                    .lang-text { 
                        display: none !important; 
                    }
                    /* Show only selected language */
                    .lang-text.${lang} { 
                        display: block !important; 
                    }
                    /* For inline elements in h1 */
                    h1 .lang-text.${lang} {
                        display: inline !important;
                    }
                `;
                document.head.appendChild(showStyle);
                
                // Prune other languages
                pruneLanguagesExcept(lang);
                
                // Switch to selected language
                switchLanguage(lang);

                // Notify other scripts (e.g., hero typing effect)
                const event = new CustomEvent('languageSelected', { detail: { lang } });
                window.dispatchEvent(event);
                
                backdrop.remove();
                
                // Start preloader after language selection
                setTimeout(() => {
                    requestAnimationFrame(updateProgress);
                }, 500);
            };

            backdrop.addEventListener('click', (e) => {
                const btn = e.target.closest('button[data-lang]');
                if (btn) onSelect(e);
            });
        }

        // ===========================================
        // AI SUPPORT BOT FUNCTIONALITY
        // ===========================================
        // Toggle Hacker Terminal
        function toggleFAQ() {
            const faqInterface = document.getElementById('faqInterface');
            const isActive = faqInterface.classList.toggle('active');
            
            // Prevent background scrolling when FAQ is open
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        }

        function toggleFAQItem(item) {
            // Close other open FAQ items
            const allItems = document.querySelectorAll('.faq-item');
            allItems.forEach(faqItem => {
                if (faqItem !== item && faqItem.classList.contains('active')) {
                    faqItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        }


        // Block touch scrolling on slider
        document.addEventListener('DOMContentLoaded', function() {
            const sliders = document.querySelectorAll('.quick-questions-slider');
            sliders.forEach(slider => {
                slider.addEventListener('touchstart', function(e) {
                    if (!e.target.classList.contains('quick-question-btn')) {
                        e.preventDefault();
                    }
                }, { passive: false });
                
                slider.addEventListener('touchmove', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                }, { passive: false });
            });
        });

        function askQuestion(topic) {
            const langBtnActive = document.querySelector('.lang-btn.active');
            if (!langBtnActive) {
                console.log('No active language button found');
                return;
            }
            const currentLang = langBtnActive.dataset.lang;
            let response = '';
            
            switch(topic) {
                case 'projekte':
                case 'projects':
                case 'projeler':
                    response = getBotResponse('projects', currentLang);
                    break;
                case 'technologien':
                case 'technologies':
                case 'teknolojiler':
                    response = getBotResponse('technologies', currentLang);
                    break;
                case 'kontakt':
                case 'contact':
                case 'iletisim':
                    response = getBotResponse('contact', currentLang);
                    break;
                case 'zertifikate':
                case 'certificates':
                case 'sertifikalar':
                    response = getBotResponse('certificates', currentLang);
                    break;
            }
            
            addBotMessage(response);
        }

        // ===========================================
        // SLIDER CONTROLS FOR QUICK QUESTIONS
        // ===========================================
        let currentSlidePosition = 0;
        const slideDistance = 300; // Distance to slide per click

        function slideQuestions(direction) {
            const activeSlider = document.querySelector('.lang-text.active .quick-questions-slider');
            if (!activeSlider) return;

            // Pause auto-slide animation
            activeSlider.classList.add('paused');
            
            if (direction === 'next') {
                currentSlidePosition -= slideDistance;
            } else if (direction === 'prev') {
                currentSlidePosition += slideDistance;
            }

            // Apply manual transform
            activeSlider.style.transform = `translateX(${currentSlidePosition}px)`;
            
            // Resume auto-slide after 3 seconds
            setTimeout(() => {
                activeSlider.classList.remove('paused');
                activeSlider.style.transform = '';
                currentSlidePosition = 0;
            }, 3000);
        }

        // Touch/swipe support for mobile
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        document.addEventListener('DOMContentLoaded', () => {
            const sliders = document.querySelectorAll('.quick-questions-slider');
            
            sliders.forEach(slider => {
                // Touch events
                slider.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isDragging = true;
                    slider.classList.add('paused');
                });

                slider.addEventListener('touchmove', (e) => {
                    if (!isDragging) return;
                    currentX = e.touches[0].clientX;
                    const diffX = currentX - startX;
                    slider.style.transform = `translateX(${currentSlidePosition + diffX}px)`;
                });

                slider.addEventListener('touchend', (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    
                    const diffX = currentX - startX;
                    if (Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                            slideQuestions('prev');
                        } else {
                            slideQuestions('next');
                        }
                    } else {
                        // Snap back
                        slider.style.transform = `translateX(${currentSlidePosition}px)`;
                        setTimeout(() => {
                            slider.classList.remove('paused');
                            slider.style.transform = '';
                            currentSlidePosition = 0;
                        }, 3000);
                    }
                });

                // Mouse events for desktop
                slider.addEventListener('mousedown', (e) => {
                    startX = e.clientX;
                    isDragging = true;
                    slider.classList.add('paused');
                    slider.style.cursor = 'grabbing';
                });

                document.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    currentX = e.clientX;
                    const diffX = currentX - startX;
                    const activeSlider = document.querySelector('.lang-text.active .quick-questions-slider');
                    if (activeSlider && activeSlider === slider) {
                        activeSlider.style.transform = `translateX(${currentSlidePosition + diffX}px)`;
                    }
                });

                document.addEventListener('mouseup', (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    slider.style.cursor = 'grab';
                    
                    const diffX = currentX - startX;
                    if (Math.abs(diffX) > 50) {
                        if (diffX > 0) {
                            slideQuestions('prev');
                        } else {
                            slideQuestions('next');
                        }
                    } else {
                        // Snap back
                        slider.style.transform = `translateX(${currentSlidePosition}px)`;
                        setTimeout(() => {
                            slider.classList.remove('paused');
                            slider.style.transform = '';
                            currentSlidePosition = 0;
                        }, 3000);
                    }
                });
            });
        });

        function sendBotMessage() {
            const input = document.getElementById('botMessageInput');
            const message = input.value.trim();
            
            if (message) {
                // Add user message
                addUserMessage(message);
                
                // Clear input
                input.value = '';
                
                // Show capture message immediately
                setTimeout(() => {
                    const langBtnActive = document.querySelector('.lang-btn.active');
                    const currentLang = langBtnActive ? langBtnActive.dataset.lang : 'en';
                    let captureMessage = '';
                    
                    if (message.toLowerCase() === 'aliestart') {
                        const commanderResponses = {
                            de: "Hallo Commander! 🫡 Schön Sie zu sehen, ich stehe Ihnen zu Diensten.",
                            en: "Hello Commander! 🫡 Nice to see you, I am at your service.",
                            tr: "Merhaba Komutan! 🫡 Sizi görmek güzel, hizmetinizdeyim."
                        };
                        captureMessage = commanderResponses[currentLang];
                    } else {
                        const captureResponses = {
                            de: "✅ Entwickler hat Ihre Nachricht erhalten! Er wird sich bald bei Ihnen melden.",
                            en: "✅ Developer has received your message! He will get back to you soon.",
                            tr: "✅ Geliştirici mesajınızı aldı! Yakında size geri dönecek."
                        };
                        captureMessage = captureResponses[currentLang];
                        
                        // Log message for developer (simulate backend)
                        console.log(`📧 New message from visitor: ${message}`);
                        
                        // Here you could add actual backend call to save/send message
                        // fetch('/api/contact', { method: 'POST', body: JSON.stringify({message}) })
                    }
                    
                    addBotMessage(captureMessage);
                }, 500);
            }
        }

        function addBotMessage(message) {
            const messagesContainer = document.getElementById('botMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bot-message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <p>${message}</p>
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function addUserMessage(message) {
            const messagesContainer = document.getElementById('botMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'bot-message';
            messageDiv.innerHTML = `
                <div class="message-content" style="background: rgba(102, 126, 234, 0.15); border-left-color: #667eea;">
                    <p>${message}</p>
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function getBotResponse(topic, lang) {
            const responses = {
                projects: {
                    de: "🚀 Halil hat beeindruckende Projekte entwickelt! Seine Hauptprojekte sind die Alie.info Android App (derzeit im Google Play Store Review), ein Pentest-Simulator für Cybersecurity, E-Book Creator mit KI-Integration und verschiedene Automatisierungstools. Alle Projekte zeigen seine Expertise in Full-Stack Development und Cybersecurity.",
                    en: "🚀 Halil has developed impressive projects! His main projects include the Alie.info Android App (currently under Google Play Store review), a pentest simulator for cybersecurity, an AI-integrated E-Book Creator, and various automation tools. All projects showcase his expertise in full-stack development and cybersecurity.",
                    tr: "🚀 Halil etkileyici projeler geliştirdi! Ana projeleri arasında Alie.info Android Uygulaması (şu anda Google Play Store incelemesinde), siber güvenlik için pentest simülatörü, AI entegreli E-Book Creator ve çeşitli otomasyon araçları bulunuyor. Tüm projeler onun full-stack geliştirme ve siber güvenlik uzmanlığını gösteriyor."
                },
                technologies: {
                    de: "💻 Halil beherrscht ein breites Spektrum an Technologien: Next.js, TypeScript, PostgreSQL für Full-Stack Development, Android/Kotlin für Mobile Apps, Python für Automatisierung, verschiedene Cybersecurity Tools für Penetration Testing, und Cloud-Deployment. Er arbeitet auch mit OpenAI APIs und modernen Web-Technologien.",
                    en: "💻 Halil masters a wide range of technologies: Next.js, TypeScript, PostgreSQL for full-stack development, Android/Kotlin for mobile apps, Python for automation, various cybersecurity tools for penetration testing, and cloud deployment. He also works with OpenAI APIs and modern web technologies.",
                    tr: "💻 Halil geniş bir teknoloji yelpazesinde uzman: Full-stack geliştirme için Next.js, TypeScript, PostgreSQL, mobil uygulamalar için Android/Kotlin, otomasyon için Python, penetrasyon testleri için çeşitli siber güvenlik araçları ve bulut dağıtımı. Ayrıca OpenAI API'leri ve modern web teknolojileri ile çalışıyor."
                },
                contact: {
                    de: "📧 Du kannst Halil über verschiedene Kanäle erreichen! Nutze das Kontaktformular auf der Website, schreibe mir hier eine Nachricht (ich leite sie weiter), oder scrolle zum Kontakt-Bereich für weitere Informationen. Er antwortet schnell auf Anfragen!",
                    en: "📧 You can reach Halil through various channels! Use the contact form on the website, write me a message here (I'll forward it), or scroll to the contact section for more information. He responds quickly to inquiries!",
                    tr: "📧 Halil ile çeşitli kanallardan iletişime geçebilirsin! Web sitesindeki iletişim formunu kullan, buradan bana mesaj yaz (ileteceğim), veya daha fazla bilgi için iletişim bölümüne kaydır. Sorulara hızlı yanıt veriyor!"
                },
                certificates: {
                    de: "🎓 Halil hat bereits mehrere Zertifikate erworben: Java Intermediate & Introduction (Sololearn), Pre Security Learning Path (TryHackMe), Full-Stack Development (Mimo). Derzeit arbeitet er an KLCP (Kali Linux Certified Professional) und OSWP (Offensive Security Wireless Professional) Zertifizierungen!",
                    en: "🎓 Halil has already earned several certificates: Java Intermediate & Introduction (Sololearn), Pre Security Learning Path (TryHackMe), Full-Stack Development (Mimo). He's currently working on KLCP (Kali Linux Certified Professional) and OSWP (Offensive Security Wireless Professional) certifications!",
                    tr: "🎓 Halil zaten birkaç sertifika aldı: Java Intermediate & Introduction (Sololearn), Pre Security Learning Path (TryHackMe), Full-Stack Development (Mimo). Şu anda KLCP (Kali Linux Certified Professional) ve OSWP (Offensive Security Wireless Professional) sertifikaları üzerinde çalışıyor!"
                }
            };
            
            return responses[topic][lang];
        }

        function generateAIResponse(message, lang) {
            const lowerMessage = message.toLowerCase();
            
            // Special command: aliestart
            if (lowerMessage === 'aliestart') {
                const commanderResponses = {
                    de: "Hallo Commander! 🫡 Schön Sie zu sehen, ich stehe Ihnen zu Diensten.",
                    en: "Hello Commander! 🫡 Nice to see you, I am at your service.",
                    tr: "Merhaba Komutan! 🫡 Sizi görmek güzel, hizmetinizdeyim."
                };
                return commanderResponses[lang];
            }
            
            // Greetings
            const greetings = {
                de: ['hallo', 'hi', 'hey', 'guten tag', 'guten morgen', 'guten abend', 'moin', 'servus'],
                en: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
                tr: ['merhaba', 'selam', 'hey', 'günaydın', 'iyi akşamlar', 'naber', 'nasılsın']
            };
            
            const greetingResponses = {
                de: [
                    "Hallo! 👋 Schön dich kennenzulernen! Ich bin Halils AI-Assistent.",
                    "Hi! 😊 Wie kann ich dir heute helfen?",
                    "Hey! 🎉 Willkommen auf Halils Portfolio! Was möchtest du wissen?",
                    "Hallo! ✨ Freut mich, dass du hier bist! Frag mich gerne alles über Halil."
                ],
                en: [
                    "Hello! 👋 Nice to meet you! I'm Halil's AI assistant.",
                    "Hi! 😊 How can I help you today?",
                    "Hey! 🎉 Welcome to Halil's portfolio! What would you like to know?",
                    "Hello! ✨ Great to have you here! Feel free to ask me anything about Halil."
                ],
                tr: [
                    "Merhaba! 👋 Tanıştığımıza memnun oldum! Ben Halil'in AI asistanıyım.",
                    "Selam! 😊 Bugün sana nasıl yardımcı olabilirim?",
                    "Hey! 🎉 Halil'in portföyüne hoş geldin! Ne öğrenmek istersin?",
                    "Merhaba! ✨ Burada olman harika! Halil hakkında her şeyi sorabilirsin."
                ]
            };
            
            // Check for greetings
            for (let greeting of greetings[lang]) {
                if (lowerMessage.includes(greeting)) {
                    return greetingResponses[lang][Math.floor(Math.random() * greetingResponses[lang].length)];
                }
            }
            
            // Questions about projects
            const projectKeywords = {
                de: ['projekt', 'projekte', 'arbeit', 'entwicklung', 'app', 'website', 'portfolio'],
                en: ['project', 'projects', 'work', 'development', 'app', 'website', 'portfolio'],
                tr: ['proje', 'projeler', 'çalışma', 'geliştirme', 'uygulama', 'website', 'portföy']
            };
            
            const projectResponses = {
                de: [
                    "Halil hat viele spannende Projekte! 🚀 Er arbeitet an Android Apps, Automatisierung und Cybersecurity-Tools. Welcher Bereich interessiert dich am meisten?",
                    "Seine Projekte sind wirklich beeindruckend! 💻 Von Mobile Apps bis hin zu Sicherheitstools - er deckt ein breites Spektrum ab.",
                    "Halil ist sehr vielseitig! 🎯 Er entwickelt sowohl Frontend als auch Backend-Lösungen. Soll ich dir mehr über ein bestimmtes Projekt erzählen?"
                ],
                en: [
                    "Halil has many exciting projects! 🚀 He works on Android apps, automation, and cybersecurity tools. Which area interests you most?",
                    "His projects are really impressive! 💻 From mobile apps to security tools - he covers a wide spectrum.",
                    "Halil is very versatile! 🎯 He develops both frontend and backend solutions. Should I tell you more about a specific project?"
                ],
                tr: [
                    "Halil'in çok heyecan verici projeleri var! 🚀 Android uygulamaları, otomasyon ve siber güvenlik araçları üzerinde çalışıyor. Hangi alan seni en çok ilgilendiriyor?",
                    "Projeleri gerçekten etkileyici! 💻 Mobil uygulamalardan güvenlik araçlarına kadar geniş bir spektrumu kapsıyor.",
                    "Halil çok yönlü! 🎯 Hem frontend hem de backend çözümleri geliştiriyor. Belirli bir proje hakkında daha fazla bilgi vereyim mi?"
                ]
            };
            
            // Check for project questions
            for (let keyword of projectKeywords[lang]) {
                if (lowerMessage.includes(keyword)) {
                    return projectResponses[lang][Math.floor(Math.random() * projectResponses[lang].length)];
                }
            }
            
            // Questions about skills/technologies
            const skillKeywords = {
                de: ['technologie', 'technologien', 'skill', 'skills', 'können', 'programmierung', 'sprache', 'sprachen'],
                en: ['technology', 'technologies', 'skill', 'skills', 'programming', 'language', 'languages', 'tech'],
                tr: ['teknoloji', 'teknolojiler', 'beceri', 'beceriler', 'programlama', 'dil', 'diller']
            };
            
            const skillResponses = {
                de: [
                    "Halil beherrscht viele Technologien! 🔧 Java, Python, JavaScript, Android Development und vieles mehr. Er ist auch sehr stark in Cybersecurity und Automation.",
                    "Seine Tech-Skills sind beeindruckend! 💪 Full-Stack Development, Mobile Apps, Sicherheitstools - er kann alles!",
                    "Halil ist ein echter Technik-Enthusiast! ⚡ Von Backend-Entwicklung bis hin zu Penetration Testing - er deckt alles ab."
                ],
                en: [
                    "Halil masters many technologies! 🔧 Java, Python, JavaScript, Android Development and much more. He's also very strong in cybersecurity and automation.",
                    "His tech skills are impressive! 💪 Full-stack development, mobile apps, security tools - he can do it all!",
                    "Halil is a real tech enthusiast! ⚡ From backend development to penetration testing - he covers everything."
                ],
                tr: [
                    "Halil birçok teknolojide uzman! 🔧 Java, Python, JavaScript, Android Geliştirme ve çok daha fazlası. Ayrıca siber güvenlik ve otomasyonda da çok güçlü.",
                    "Teknik becerileri etkileyici! 💪 Full-stack geliştirme, mobil uygulamalar, güvenlik araçları - hepsini yapabilir!",
                    "Halil gerçek bir teknoloji tutkunu! ⚡ Backend geliştirmeden penetrasyon testine kadar her şeyi kapsıyor."
                ]
            };
            
            // Check for skill questions
            for (let keyword of skillKeywords[lang]) {
                if (lowerMessage.includes(keyword)) {
                    return skillResponses[lang][Math.floor(Math.random() * skillResponses[lang].length)];
                }
            }
            
            // Contact/Communication
            const contactKeywords = {
                de: ['kontakt', 'erreichen', 'schreiben', 'nachricht', 'email', 'telefon', 'anrufen'],
                en: ['contact', 'reach', 'write', 'message', 'email', 'phone', 'call'],
                tr: ['iletişim', 'ulaş', 'yaz', 'mesaj', 'email', 'telefon', 'ara']
            };
            
            const contactResponses = {
                de: [
                    "Gerne leite ich deine Nachricht an Halil weiter! 📧 Du kannst auch direkt über die Kontaktsektion mit ihm in Verbindung treten.",
                    "Halil freut sich immer über neue Kontakte! 🤝 Schreib einfach hier deine Nachricht und ich sorge dafür, dass sie ankommt.",
                    "Super, dass du Kontakt aufnehmen möchtest! ✉️ Lass einfach deine Nachricht hier und Halil meldet sich bei dir."
                ],
                en: [
                    "I'd be happy to forward your message to Halil! 📧 You can also contact him directly through the contact section.",
                    "Halil always enjoys new contacts! 🤝 Just write your message here and I'll make sure it reaches him.",
                    "Great that you want to get in touch! ✉️ Just leave your message here and Halil will get back to you."
                ],
                tr: [
                    "Mesajını Halil'e iletmekten memnuniyet duyarım! 📧 Ayrıca iletişim bölümünden doğrudan onunla iletişime geçebilirsin.",
                    "Halil her zaman yeni bağlantılardan memnun oluyor! 🤝 Mesajını buraya yaz, ona ulaştıracağım.",
                    "İletişime geçmek istemen harika! ✉️ Mesajını burada bırak, Halil sana geri dönecek."
                ]
            };
            
            // Check for contact questions
            for (let keyword of contactKeywords[lang]) {
                if (lowerMessage.includes(keyword)) {
                    return contactResponses[lang][Math.floor(Math.random() * contactResponses[lang].length)];
                }
            }
            
            // How are you / Personal questions
            const personalKeywords = {
                de: ['wie geht', 'wie läuft', 'was machst du', 'wer bist du', 'was bist du'],
                en: ['how are you', 'what are you doing', 'who are you', 'what are you'],
                tr: ['nasılsın', 'ne yapıyorsun', 'kimsin', 'nesin']
            };
            
            const personalResponses = {
                de: [
                    "Mir geht's super! 😊 Ich bin hier, um dir alles über Halil zu erzählen und bei Fragen zu helfen.",
                    "Danke der Nachfrage! 🤖 Ich bin Halils AI-Assistent und helfe gerne bei allen Fragen rund um sein Portfolio.",
                    "Alles bestens! ✨ Ich assistiere hier und sorge dafür, dass du alle Infos über Halil bekommst, die du brauchst."
                ],
                en: [
                    "I'm doing great! 😊 I'm here to tell you everything about Halil and help with any questions.",
                    "Thanks for asking! 🤖 I'm Halil's AI assistant and happy to help with all questions about his portfolio.",
                    "Everything's perfect! ✨ I'm assisting here and making sure you get all the info about Halil that you need."
                ],
                tr: [
                    "Çok iyiyim! 😊 Halil hakkında her şeyi anlatmak ve sorularına yardım etmek için buradayım.",
                    "Sorduğun için teşekkürler! 🤖 Ben Halil'in AI asistanıyım ve portföyü hakkındaki tüm sorularda yardım etmekten mutluyum.",
                    "Her şey mükemmel! ✨ Burada yardım ediyorum ve ihtiyacın olan Halil hakkındaki tüm bilgileri almana yardım ediyorum."
                ]
            };
            
            // Check for personal questions
            for (let keyword of personalKeywords[lang]) {
                if (lowerMessage.includes(keyword)) {
                    return personalResponses[lang][Math.floor(Math.random() * personalResponses[lang].length)];
                }
            }
            
            // Default responses for anything else
            const defaultResponses = {
                de: [
                    "Das ist eine interessante Frage! 🤔 Lass mich das für dich herausfinden und an Halil weiterleiten.",
                    "Danke für deine Nachricht! 📝 Ich leite das direkt an Halil weiter, er wird sich bei dir melden.",
                    "Super Frage! 💡 Halil hat bestimmt eine gute Antwort darauf. Ich sorge dafür, dass er deine Nachricht bekommt.",
                    "Interessant! 🎯 Halil wird sich freuen, darüber mit dir zu sprechen. Ich leite deine Nachricht weiter."
                ],
                en: [
                    "That's an interesting question! 🤔 Let me find that out for you and forward it to Halil.",
                    "Thanks for your message! 📝 I'll forward this directly to Halil, he'll get back to you.",
                    "Great question! 💡 Halil surely has a good answer for that. I'll make sure he gets your message.",
                    "Interesting! 🎯 Halil will be happy to discuss that with you. I'll forward your message."
                ],
                tr: [
                    "Bu ilginç bir soru! 🤔 Senin için bunu öğrenip Halil'e ileteceğim.",
                    "Mesajın için teşekkürler! 📝 Bunu doğrudan Halil'e ileteceğim, sana geri dönecek.",
                    "Harika soru! 💡 Halil'in bunun için kesinlikle iyi bir cevabı vardır. Mesajını aldığından emin olacağım.",
                    "İlginç! 🎯 Halil bunu seninle tartışmaktan mutlu olacak. Mesajını ileteceğim."
                ]
            };
            
            const randomResponse = defaultResponses[lang][Math.floor(Math.random() * defaultResponses[lang].length)];
            
            // Save message for portfolio owner (simulate)
            console.log(`New message from visitor: ${message}`);
            
            return randomResponse;
        }

        // Enter key support for chat input
        document.addEventListener('DOMContentLoaded', function() {
            const botInput = document.getElementById('botMessageInput');
            if (botInput) {
                botInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        sendBotMessage();
                    }
                });

                // Handle virtual keyboard on mobile
                botInput.addEventListener('focus', function() {
                    // Small delay to ensure keyboard is open
                    setTimeout(() => {
                        botInput.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                    }, 300);
                });

                // Prevent zoom on iOS when focusing input
                botInput.addEventListener('touchstart', function() {
                    botInput.style.fontSize = '16px';
                });
            }
        });

        // ===================================
        // VORTEX ATTRACTOR (LAZY LOAD)
        // ===================================
        (function() {
            const canvas = document.getElementById('vortexCanvas');
            if (!canvas) return;

            let initialized = false;
            
            // Intersection Observer for lazy initialization
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !initialized) {
                        initialized = true;
                        initVortex();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(canvas);

            function initVortex() {

            // Create engine with ULTRA FAST falling physics
            const engine = Engine.create({
                gravity: { x: 0, y: 2.5 },  // MASSIVE gravity!
                enableSleeping: false,  // Disable sleeping to prevent vibration
                timing: {
                    timeScale: 1
                }
            });

            // Create renderer
            const render = Render.create({
                canvas: canvas,
                engine: engine,
                options: {
                    width: boxWidth,
                    height: boxHeight,
                    wireframes: false,
                    background: 'transparent'
                }
            });

            // Create walls - THICK and solid, NO HOLES!
            const wallThickness = 50; // Much thicker walls for reliable collision
            const walls = [];

            // Bottom wall - SOLID
            walls.push(
                Bodies.rectangle(boxWidth / 2, boxHeight + wallThickness / 2, boxWidth + wallThickness * 2, wallThickness, {
                    isStatic: true,
                    friction: 0.8,
                    restitution: 0.5,
                    render: { visible: false }
                })
            );

            // Top wall - SOLID (NO HOLE!)
            walls.push(
                Bodies.rectangle(boxWidth / 2, -wallThickness / 2, boxWidth + wallThickness * 2, wallThickness, {
                    isStatic: true,
                    friction: 0.8,
                    restitution: 0.5,
                    render: { visible: false }
                })
            );

            // Left wall - SOLID
            walls.push(
                Bodies.rectangle(-wallThickness / 2, boxHeight / 2, wallThickness, boxHeight + wallThickness * 2, {
                    isStatic: true,
                    friction: 0.8,
                    restitution: 0.5,
                    render: { visible: false }
                })
            );

            // Right wall - SOLID
            walls.push(
                Bodies.rectangle(boxWidth + wallThickness / 2, boxHeight / 2, wallThickness, boxHeight + wallThickness * 2, {
                    isStatic: true,
                    friction: 0.8,
                    restitution: 0.5,
                    render: { visible: false }
                })
            );

            // Color palette for balls - vibrant and diverse
            const ballColors = [
                { main: '#00ff88', glow: '0, 255, 136' },      // Neon Green
                { main: '#ff0080', glow: '255, 0, 128' },      // Hot Pink
                { main: '#00d4ff', glow: '0, 212, 255' },      // Cyan
                { main: '#ffd700', glow: '255, 215, 0' },      // Gold
                { main: '#ff6b35', glow: '255, 107, 53' },     // Orange
                { main: '#a855f7', glow: '168, 85, 247' },     // Purple
                { main: '#10b981', glow: '16, 185, 129' },     // Emerald
                { main: '#ec4899', glow: '236, 72, 153' },     // Pink
                { main: '#06b6d4', glow: '6, 182, 212' },      // Sky Blue
                { main: '#f59e0b', glow: '245, 158, 11' },     // Amber
                { main: '#8b5cf6', glow: '139, 92, 246' },     // Violet
                { main: '#14b8a6', glow: '20, 184, 166' },     // Teal
                { main: '#f43f5e', glow: '244, 63, 94' },      // Rose
                { main: '#3b82f6', glow: '59, 130, 246' },     // Blue
                { main: '#84cc16', glow: '132, 204, 22' },     // Lime
                { main: '#ef4444', glow: '239, 68, 68' }       // Red
            ];

            // Create balls with beautiful gradients
            let balls = [];
            let isLoadingNewLevel = false;
            const numBalls = 16;

            function createBall(colorIndex) {
                // Safe spawn area - well within boundaries
                const safeMargin = ballRadius * 3;
                const x = Math.random() * (boxWidth - safeMargin * 2) + safeMargin;
                const y = Math.random() * (boxHeight - safeMargin * 2) + safeMargin;
                
                const ball = Bodies.circle(x, y, ballRadius, {
                    restitution: 0.1,      // Minimal bounce
                    friction: 0.3,         // Lower friction = less vibration
                    density: 0.002,        // Heavier = faster fall
                    frictionAir: 0.001,    // Almost no air resistance
                    frictionStatic: 0.5,   // Less static = less vibration
                    slop: 0.1,             // More tolerance = smoother
                    render: {
                        fillStyle: ballColors[colorIndex].main,
                        strokeStyle: ballColors[colorIndex].main,
                        lineWidth: 0
                    },
                    ballColor: ballColors[colorIndex] // Store color info
                });
                
                return ball;
            }

            function createLevel() {
                const newBalls = [];
                for (let i = 0; i < numBalls; i++) {
                    newBalls.push(createBall(i));
                }
                return newBalls;
            }

            // Pop balloon effect - remove ball and spawn new one from sky
            function popBalloon(clickedBall) {
                // Store the color before removing
                const ballColor = clickedBall.ballColor;
                const ballColorIndex = ballColors.indexOf(ballColor);
                
                // Remove the clicked ball
                World.remove(engine.world, clickedBall);
                const index = balls.indexOf(clickedBall);
                if (index > -1) {
                    balls.splice(index, 1);
                }
                
                // Spawn new ball from sky with same color
                const safeMargin = ballRadius * 3;
                const x = Math.random() * (boxWidth - safeMargin * 2) + safeMargin;
                const y = -ballRadius * 2; // Start from above the box
                
                const newBall = Bodies.circle(x, y, ballRadius, {
                    restitution: 0.1,      // Minimal bounce
                    friction: 0.3,         // Lower friction
                    density: 0.002,        // Heavier = faster fall
                    frictionAir: 0.001,    // Almost no air resistance!
                    frictionStatic: 0.5,   // Less static
                    slop: 0.1,             // More tolerance
                    render: {
                        fillStyle: ballColor.main,
                        strokeStyle: ballColor.main,
                        lineWidth: 0
                    },
                    ballColor: ballColor
                });
                
                balls.push(newBall);
                World.add(engine.world, newBall);
                
                // Create pop particles effect
                createPopEffect(clickedBall.position.x, clickedBall.position.y, ballColor);
            }
            
            // Create visual pop effect with particles
            const popParticles = [];
            
            function createPopEffect(x, y, color) {
                // Create explosion particles
                const particleCount = 12;
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 * i) / particleCount;
                    const speed = 3 + Math.random() * 2;
                    
                    popParticles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 1,
                        color: color,
                        size: 4 + Math.random() * 4
                    });
                }
            }
            
            // Animate pop particles
            function animatePopParticles(context) {
                for (let i = popParticles.length - 1; i >= 0; i--) {
                    const p = popParticles[i];
                    
                    // Update position
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.1; // gravity
                    p.life -= 0.02;
                    
                    if (p.life <= 0) {
                        popParticles.splice(i, 1);
                        continue;
                    }
                    
                    // Draw particle
                    context.globalAlpha = p.life;
                    const gradient = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, p.color.main);
                    gradient.addColorStop(1, `rgba(${p.color.glow}, 0)`);
                    context.fillStyle = gradient;
                    context.beginPath();
                    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    context.fill();
                    context.globalAlpha = 1;
                }
            }

            // Create initial balls
            balls = createLevel();

            // Add all bodies to the world
            World.add(engine.world, [...walls, ...balls]);

            // Add mouse control
            const mouse = Mouse.create(canvas);
            const mouseConstraint = MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: { visible: false }
                }
            });

            World.add(engine.world, mouseConstraint);

            // Pop balloon when clicking on it (MAXIMUM SENSITIVITY!)
            Events.on(mouseConstraint, 'mousedown', function(event) {
                const mousePos = event.mouse.position;
                const hitRadius = ballRadius * 2.5; // 2.5x größerer Erkennungsbereich!
                
                balls.forEach(ball => {
                    const dx = ball.position.x - mousePos.x;
                    const dy = ball.position.y - mousePos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < hitRadius) { // Super einfach zu treffen!
                        popBalloon(ball);
                        return;
                    }
                });
            });
            
            // Also add touchstart for even faster mobile response
            canvas.addEventListener('touchstart', function(event) {
                const touch = event.touches[0];
                const rect = canvas.getBoundingClientRect();
                const touchX = touch.clientX - rect.left;
                const touchY = touch.clientY - rect.top;
                const hitRadius = ballRadius * 2.5;
                
                balls.forEach(ball => {
                    const dx = ball.position.x - touchX;
                    const dy = ball.position.y - touchY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < hitRadius) {
                        popBalloon(ball);
                        return;
                    }
                });
            }, { passive: true });

            // Keep the mouse in sync with rendering
            render.mouse = mouse;

            // Track hovered ball
            let hoveredBall = null;
            let hoverScale = 1;

            // Update hover detection
            Events.on(mouseConstraint, 'mousemove', function(event) {
                const mousePos = event.mouse.position;
                let foundHover = false;
                
                balls.forEach(ball => {
                    const dx = ball.position.x - mousePos.x;
                    const dy = ball.position.y - mousePos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < ballRadius && !foundHover) {
                        hoveredBall = ball;
                        foundHover = true;
                    }
                });
                
                if (!foundHover) {
                    hoveredBall = null;
                }
            });

            // Custom rendering for beautiful balls (OPTIMIZED)
            Events.on(render, 'afterRender', function() {
                const context = render.context;
                
                // Draw pop particles (always, for instant feedback)
                animatePopParticles(context);
                
                // Animate hover scale
                if (hoveredBall) {
                    hoverScale = Math.min(hoverScale + 0.05, 1.3);
                } else {
                    hoverScale = Math.max(hoverScale - 0.05, 1);
                }
                
                balls.forEach(ball => {
                    const pos = ball.position;
                    let radius = ballRadius;
                    const isHovered = ball === hoveredBall;
                    
                    // Get ball's individual color
                    const ballColor = ball.ballColor || ballColors[0];
                    
                    // Scale up hovered ball
                    if (isHovered) {
                        radius = ballRadius * hoverScale;
                    }
                    
                    // Outer glow - stronger when hovered, using ball's color
                    const glowIntensity = isHovered ? 0.8 : 0.4;
                    const glowSize = isHovered ? radius * 2.5 : radius * 2;
                    const glowGradient = context.createRadialGradient(pos.x, pos.y, radius * 0.5, pos.x, pos.y, glowSize);
                    glowGradient.addColorStop(0, `rgba(${ballColor.glow}, ${glowIntensity})`);
                    glowGradient.addColorStop(1, `rgba(${ballColor.glow}, 0)`);
                    context.fillStyle = glowGradient;
                    context.beginPath();
                    context.arc(pos.x, pos.y, glowSize, 0, 2 * Math.PI);
                    context.fill();
                    
                    // Main ball with gradient using individual color
                    const gradient = context.createRadialGradient(
                        pos.x - radius * 0.3, 
                        pos.y - radius * 0.3, 
                        radius * 0.1,
                        pos.x, 
                        pos.y, 
                        radius
                    );
                    
                    // Create dynamic gradient from ball's color
                    gradient.addColorStop(0, '#ffffff');
                    gradient.addColorStop(0.3, ballColor.main);
                    
                    // Darker shade for depth
                    const r = parseInt(ballColor.main.slice(1, 3), 16);
                    const g = parseInt(ballColor.main.slice(3, 5), 16);
                    const b = parseInt(ballColor.main.slice(5, 7), 16);
                    const darkShade = `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
                    const darkerShade = `rgb(${Math.floor(r * 0.5)}, ${Math.floor(g * 0.5)}, ${Math.floor(b * 0.5)})`;
                    
                    gradient.addColorStop(0.7, darkShade);
                    gradient.addColorStop(1, darkerShade);
                    
                    context.fillStyle = gradient;
                    context.beginPath();
                    context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
                    context.fill();
                    
                    // Highlight
                    const highlightGradient = context.createRadialGradient(
                        pos.x - radius * 0.4,
                        pos.y - radius * 0.4,
                        0,
                        pos.x - radius * 0.3,
                        pos.y - radius * 0.3,
                        radius * 0.5
                    );
                    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
                    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                    context.fillStyle = highlightGradient;
                    context.beginPath();
                    context.arc(pos.x - radius * 0.3, pos.y - radius * 0.3, radius * 0.4, 0, 2 * Math.PI);
                    context.fill();
                    
                    // Inner glow with ball's color
                    context.strokeStyle = `rgba(${ballColor.glow}, 0.5)`;
                    context.lineWidth = 2;
                    context.beginPath();
                    context.arc(pos.x, pos.y, radius - 1, 0, 2 * Math.PI);
                    context.stroke();
                });
            });

            // STRICT boundary checking - NO BALL ESCAPES!
            Events.on(engine, 'afterUpdate', function() {
                balls.forEach((ball) => {
                    const pos = ball.position;
                    
                    // STRICT: Force any ball trying to escape back inside!
                    if (pos.x < ballRadius || pos.x > boxWidth - ballRadius ||
                        pos.y < ballRadius || pos.y > boxHeight - ballRadius) {
                        // Teleport back to center if somehow escaped
                        Body.setPosition(ball, {
                            x: Math.max(ballRadius + 10, Math.min(boxWidth - ballRadius - 10, pos.x)),
                            y: Math.max(ballRadius + 10, Math.min(boxHeight - ballRadius - 10, pos.y))
                        });
                        // Kill velocity
                        Body.setVelocity(ball, { x: 0, y: 0 });
                    }
                });
            });

            // Run the engine and renderer
            Engine.run(engine);
            Render.run(render);

            // Touch support for mobile
            canvas.addEventListener('touchstart', function(e) {
                e.preventDefault();
            }, { passive: false });
            
            } // End of initPhysicsBox
        })();

        // ===================================
        // PERFORMANCE OPTIMIZATIONS
        // ===================================
        
        // Debounce function for scroll events
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
        
        // Throttle function for resize events
        function throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
        
        // Optimized scroll handler
        let ticking = false;
        const optimizedScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    // Scroll logic here
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        // Optimize resize events
        const optimizedResize = throttle(() => {
            // Resize logic is already handled by GSAP ScrollTrigger
        }, 250);
        
        window.addEventListener('resize', optimizedResize, { passive: true });
        
        // ===================================
        // KOORDINIERTER INTERSECTION OBSERVER - Flüssige Animationen!
        // ===================================
        
        // Optimaler Observer für koordinierte Animationen
        const coordObserverOptions = {
            root: null,
            rootMargin: '100px',  // Laden wenn 100px vor Viewport
            threshold: 0.1  // 10% sichtbar = trigger
        };
        
        const coordObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Kurze Verzögerung für flüssigen Effekt
                    requestAnimationFrame(() => {
                        entry.target.classList.add('is-visible');
                    });
                    coordObserver.unobserve(entry.target);
                }
            });
        }, coordObserverOptions);
        
        // Observe ALLE animierten Elemente
        document.querySelectorAll('.project-card, .animate-on-scroll, .skill-item, .website-card').forEach(el => {
            coordObserver.observe(el);
        });
        
        // Preload critical images
        const preloadImages = () => {
            const criticalImages = ['iconx.jpeg', 'New1.png'];
            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        };
        
        // Run preload on DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', preloadImages);
        } else {
            preloadImages();
        }
        
        // ===================================
        // SMOOTH SCROLL ENHANCEMENTS
        // ===================================
        
        // Enhanced smooth scroll for anchor links - INSTANT!
        try {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    if (href === '#') return;
                    
                    e.preventDefault();
                    const target = document.querySelector(href);
                    
                    if (target) {
                        // INSTANT scroll with offset for fixed nav - NO smooth behavior!
                        const offsetTop = target.offsetTop - 80;
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'auto'  // Auto = instant = kein Lag!
                        });
                        
                        // Update URL without jumping
                        if (history.pushState) {
                            history.pushState(null, null, href);
                        }
                    }
                });
            });
        } catch (e) {
            console.log('Enhanced smooth scroll setup failed:', e);
        }
        
        // Momentum scroll optimization - DEAKTIVIERT für bessere Performance
        // Kein Scroll-Tracking mehr = schneller!
        
        // Reduce motion for accessibility
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            // Disable GSAP animations
            if (typeof gsap !== 'undefined') {
                gsap.globalTimeline.timeScale(100);
            }
            // Disable scroll snap
            document.body.style.scrollSnapType = 'none';
            // Disable project card animations
            document.querySelectorAll('.project-card').forEach(card => {
                card.classList.add('is-visible');
            });
        }
        
        // Performance monitoring (optional - can be removed in production)
        if ('PerformanceObserver' in window) {
            const perfObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.duration > 50) {
                        console.warn('Long task detected:', entry.duration, 'ms');
                    }
                }
            });
            
            try {
                perfObserver.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                // longtask not supported in this browser
            }
        }

