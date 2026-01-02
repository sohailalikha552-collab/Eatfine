

document.addEventListener('DOMContentLoaded', function() {
    

    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
            

            if (navMenu.classList.contains('open')) {
                menuToggle.innerHTML = '✕';
            } else {
                menuToggle.innerHTML = '☰';
            }
        });


        const navLinks = navMenu.querySelectorAll('.navi');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.innerHTML = '☰';
            });
        });


        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('open');
                menuToggle.innerHTML = '☰';
            }
        });
    }


    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    updateNavButtons();

    async function updateNavButtons() {
        const navButtons = document.querySelector('.nav-buttons');
        if (!navButtons) return;
        
        try {
            const response = await fetch('/api/check-auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const data = await response.json();
            const isAuthenticated = data.isAuthenticated;
            
            if (isAuthenticated) {
                navButtons.innerHTML = `
                    <a href="orders.html" class="btn-orders">
                        <i class="fas fa-history"></i>
                    </a>
                    <a href="cart.html" class="btn-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count" id="cartCount">0</span>
                    </a>
                    <a href="#" class="btn-logout">Logout</a>
                `;
                
                
                loadCartCount();
                
                
                const logoutBtn = document.querySelector('.btn-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        try {
                            const response = await fetch('/api/logout', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });
                            
                            if (response.ok) {
                                localStorage.removeItem('isAuthenticated');
                                window.location.href = '/';
                            }
                        } catch (error) {
                            console.error('Logout error:', error);
                            localStorage.removeItem('isAuthenticated');
                            window.location.href = '/';
                        }
                    });
                }
            } else {
                navButtons.innerHTML = `
                    <a href="login.html" class="btn-login">Login</a>
                    <a href="signup.html" class="btn-signup">Sign Up</a>
                `;
                

                localStorage.removeItem('isAuthenticated');
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            

            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            
            if (isAuthenticated) {
                navButtons.innerHTML = `
                    <a href="orders.html" class="btn-orders">
                        <i class="fas fa-history"></i>
                    </a>
                    <a href="cart.html" class="btn-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span class="cart-count" id="cartCount">0</span>
                    </a>
                    <a href="#" class="btn-logout">Logout</a>
                `;
                
                
                loadCartCount();
                
                
                const logoutBtn = document.querySelector('.btn-logout');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        
                        try {
                            const response = await fetch('/api/logout', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                credentials: 'include'
                            });
                            
                            if (response.ok) {
                                localStorage.removeItem('isAuthenticated');
                                window.location.href = '/';
                            }
                        } catch (error) {
                            console.error('Logout error:', error);
                            localStorage.removeItem('isAuthenticated');
                            window.location.href = '/';
                        }
                    });
                }
            } else {
                navButtons.innerHTML = `
                    <a href="login.html" class="btn-login">Login</a>
                    <a href="signup.html" class="btn-signup">Sign Up</a>
                `;
            }
        }
    }


    const revealElements = document.querySelectorAll('.scroll-reveal');
    
    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };

    if (revealElements.length > 0) {
        window.addEventListener('scroll', revealOnScroll);

    }


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });


    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinksAll = document.querySelectorAll('.navi');
    
    navLinksAll.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });


    const pageContent = document.querySelector('.page-content, main');
    if (pageContent) {
        pageContent.classList.add('fade-in');
    }


    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#28A745' : type === 'error' ? '#DC3545' : '#17A2B8'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }


    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    
    window.showNotification = showNotification;


    async function loadCartCount() {
        try {
            const response = await fetch('/api/cart', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const cartCountElement = document.getElementById('cartCount');
                
                if (cartCountElement) {
                    
                    const totalItems = data.items.reduce((sum, item) => sum + item.quantity, 0);
                    cartCountElement.textContent = totalItems;
                    
                    
                    cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
                }
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
        }
    }


    async function addToCart(productId, name, price, image, category) {
        try {
            const authResponse = await fetch('/api/check-auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });
            
            const authData = await authResponse.json();
            
            if (!authData.isAuthenticated) {
                showNotification('Please log in to add items to cart', 'error');
                
                window.location.href = 'login.html';
                return null;
            }
            
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    productId: productId,
                    name: name,
                    price: price,
                    image: image,
                    category: category,
                    quantity: 1
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                showNotification('Item added to cart!', 'success');
                

                loadCartCount();
                
                return data;
            } else {
                const errorData = await response.json();
                showNotification(errorData.error || 'Failed to add item to cart', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotification('Error adding item to cart', 'error');
            return null;
        }
    }


    const menuFilterButtons = document.querySelectorAll('.menu-filters .filter-btn');
    const menuCategories = document.querySelectorAll('.menu-category');

    if (menuFilterButtons.length > 0) {
        menuFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-category');

                menuFilterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                if (filterValue === 'all') {
                    menuCategories.forEach(category => {
                        category.style.display = 'block';
                        category.classList.add('fade-in');
                    });
                } else {
                    menuCategories.forEach(category => {
                        const categoryType = category.getAttribute('data-category');
                        
                        if (categoryType === filterValue) {
                            category.style.display = 'block';
                            category.classList.add('fade-in');
                        } else {
                            category.style.display = 'none';
                        }
                    });
                }

                setTimeout(() => {
                    const firstVisible = document.querySelector('.menu-category[style="display: block;"]');
                    if (firstVisible && filterValue !== 'all') {
                        firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            });
        });


        const menuObserverOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const menuObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(20px)';
                    
                    setTimeout(() => {
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);
                    
                    menuObserver.unobserve(entry.target);
                }
            });
        }, menuObserverOptions);

        const menuCards = document.querySelectorAll('.menu-card');
        menuCards.forEach(card => menuObserver.observe(card));


        menuCards.forEach(card => {
            const cardImage = card.querySelector('.menu-card-image');
            
            if (cardImage) {
                cardImage.addEventListener('click', function() {
                    const title = card.querySelector('.menu-card-title').textContent;
                    const desc = card.querySelector('.menu-card-desc').textContent;
                    const price = card.querySelector('.menu-price').textContent;
                    const imgSrc = card.querySelector('img').src;

                    showQuickView(title, desc, price, imgSrc);
                });
            }
        });

        function showQuickView(title, desc, price, imgSrc) {
            const modal = document.createElement('div');
            modal.className = 'quick-view-modal';
            modal.innerHTML = `
                <div class="quick-view-content">
                    <span class="quick-view-close">&times;</span>
                    <div class="quick-view-grid">
                        <div class="quick-view-image">
                            <img src="${imgSrc}" alt="${title}">
                        </div>
                        <div class="quick-view-info">
                            <h2>${title}</h2>
                            <p class="quick-view-desc">${desc}</p>
                            <div class="quick-view-price">${price}</div>
                            <button class="add-to-cart-btn-large">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const quickViewStyle = document.createElement('style');
            quickViewStyle.textContent = `
                .quick-view-modal {
                    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8); display: flex; align-items: center;
                    justify-content: center; z-index: 10000; animation: fadeIn 0.3s ease;
                }
                .quick-view-content {
                    background: white; border-radius: 20px; padding: 40px;
                    max-width: 800px; width: 90%; position: relative;
                    animation: slideUp 0.3s ease;
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .quick-view-close {
                    position: absolute; top: 20px; right: 30px; font-size: 30px;
                    cursor: pointer; color: #C8102E; transition: all 0.3s ease;
                }
                .quick-view-close:hover { transform: scale(1.2); }
                .quick-view-grid {
                    display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
                }
                .quick-view-image img {
                    width: 100%; border-radius: 15px;
                }
                .quick-view-info h2 {
                    color: #C8102E; margin-bottom: 20px; font-size: 2rem;
                }
                .quick-view-desc {
                    color: #6C757D; line-height: 1.8; margin-bottom: 30px;
                }
                .quick-view-price {
                    font-size: 2rem; color: #F77F00; font-weight: bold; margin-bottom: 30px;
                }
                .add-to-cart-btn-large {
                    width: 100%; padding: 15px; background: linear-gradient(135deg, #C8102E, #E63946);
                    color: white; border: none; border-radius: 10px; font-size: 1.1rem;
                    font-weight: 600; cursor: pointer; transition: all 0.3s ease;
                }
                .add-to-cart-btn-large:hover {
                    transform: translateY(-3px); box-shadow: 0 10px 20px rgba(200,16,46,0.3);
                }
                @media (max-width: 768px) {
                    .quick-view-grid { grid-template-columns: 1fr; }
                    .quick-view-content { padding: 30px 20px; }
                }
            `;
            
            if (!document.querySelector('#quick-view-styles')) {
                quickViewStyle.id = 'quick-view-styles';
                document.head.appendChild(quickViewStyle);
            }

            const closeBtn = modal.querySelector('.quick-view-close');
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            const addToCartBtn = modal.querySelector('.add-to-cart-btn-large');
            addToCartBtn.addEventListener('click', async () => {
                // Get product details from the modal
                const title = modal.querySelector('.quick-view-info h2').textContent;
                const priceText = modal.querySelector('.quick-view-price').textContent;
                const price = parseFloat(priceText.replace('AED ', '').replace('AED', '').trim());
                const image = modal.querySelector('.quick-view-image img').src;
                
                // Generate a unique product ID (using title as a simple ID)
                const productId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                
                // Add to cart
                await addToCart(productId, title, price, image, 'general');
                modal.remove();
            });
        }
    }


    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function() {
            // Get product details from the menu card
            const card = this.closest('.menu-card');
            const title = card.querySelector('.menu-card-title').textContent;
            const priceText = card.querySelector('.menu-price').textContent;
            const price = parseFloat(priceText.replace('AED ', '').replace('AED', '').trim());
            const image = card.querySelector('img') ? card.querySelector('img').src : '';
            
            // Generate a unique product ID (using title as a simple ID)
            const productId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
            
            // Get category from parent section
            const categorySection = card.closest('.menu-category');
            const category = categorySection ? categorySection.getAttribute('data-category') : 'general';
            
            // Add to cart
            await addToCart(productId, title, price, image, category);
            
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });


    const galleryFilterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item-modern');
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let currentImageIndex = 0;
    let visibleImages = [];

    if (galleryFilterButtons.length > 0) {

        galleryFilterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filterValue = this.getAttribute('data-filter');

                galleryFilterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                galleryItems.forEach((item, index) => {
                    const category = item.getAttribute('data-category');
                    
                    if (filterValue === 'all' || category === filterValue) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, index * 50);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'scale(0.8)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });

                updateVisibleImages();
            });
        });

        function updateVisibleImages() {
            visibleImages = Array.from(galleryItems).filter(item => {
                return window.getComputedStyle(item).display !== 'none';
            });
        }

        updateVisibleImages();

        
        galleryItems.forEach((item, index) => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                const overlay = this.querySelector('.gallery-overlay');
                
                if (modal) {
                    modal.style.display = 'block';
                    modalImg.src = img.src;
                    
                    if (overlay) {
                        const title = overlay.querySelector('h3').textContent;
                        const subtitle = overlay.querySelector('p').textContent;
                        modalCaption.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
                    }
                    
                    currentImageIndex = visibleImages.indexOf(this);
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        function closeModal() {
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateImage(-1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateImage(1);
            });
        }

        function navigateImage(direction) {
            currentImageIndex += direction;
            
            if (currentImageIndex < 0) {
                currentImageIndex = visibleImages.length - 1;
            } else if (currentImageIndex >= visibleImages.length) {
                currentImageIndex = 0;
            }
            
            const currentItem = visibleImages[currentImageIndex];
            const img = currentItem.querySelector('img');
            const overlay = currentItem.querySelector('.gallery-overlay');
            
            modalImg.style.opacity = '0';
            
            setTimeout(() => {
                modalImg.src = img.src;
                
                if (overlay) {
                    const title = overlay.querySelector('h3').textContent;
                    const subtitle = overlay.querySelector('p').textContent;
                    modalCaption.innerHTML = `<h3>${title}</h3><p>${subtitle}</p>`;
                }
                
                modalImg.style.opacity = '1';
            }, 200);
        }

        
        document.addEventListener('keydown', function(e) {
            if (modal && modal.style.display === 'block') {
                if (e.key === 'Escape') {
                    closeModal();
                } else if (e.key === 'ArrowLeft') {
                    navigateImage(-1);
                } else if (e.key === 'ArrowRight') {
                    navigateImage(1);
                }
            }
        });

        
        let touchStartX = 0;
        let touchEndX = 0;

        if (modalImg) {
            modalImg.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            });

            modalImg.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
        }

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    navigateImage(1);
                } else {
                    navigateImage(-1);
                }
            }
        }

        
        const galleryObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'scale(1)';
                    }, index * 50);
                    
                    galleryObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -100px 0px' });

        galleryItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            galleryObserver.observe(item);
        });
    }


    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            const isActive = faqItem.classList.contains('active');

            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-question').classList.remove('active');
            });

            if (!isActive) {
                faqItem.classList.add('active');
                this.classList.add('active');
            }
        });
    });

    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = {
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('contactEmail').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim()
            };

            if (!validateForm(formData)) {
                return;
            }

            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                await simulateAPICall(formData);
                showFormMessage('Thank you for contacting us! We\'ll get back to you soon.', 'success');
                contactForm.reset();
            } catch (error) {
                console.error('Error:', error);
                showFormMessage('Something went wrong. Please try again later.', 'error');
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function validateForm(data) {
        clearFormMessage();

        if (data.firstName.length < 2) {
            showFormMessage('First name must be at least 2 characters long.', 'error');
            document.getElementById('firstName').focus();
            return false;
        }

        if (data.lastName.length < 2) {
            showFormMessage('Last name must be at least 2 characters long.', 'error');
            document.getElementById('lastName').focus();
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFormMessage('Please enter a valid email address.', 'error');
            document.getElementById('contactEmail').focus();
            return false;
        }

        if (data.phone && data.phone.length > 0) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(data.phone) || data.phone.length < 8) {
                showFormMessage('Please enter a valid phone number.', 'error');
                document.getElementById('phone').focus();
                return false;
            }
        }

        if (!data.subject) {
            showFormMessage('Please select a subject.', 'error');
            document.getElementById('subject').focus();
            return false;
        }

        if (data.message.length < 10) {
            showFormMessage('Message must be at least 10 characters long.', 'error');
            document.getElementById('message').focus();
            return false;
        }

        return true;
    }

    function showFormMessage(message, type) {
        if (formMessage) {
            formMessage.textContent = message;
            formMessage.className = `form-message ${type}`;
            formMessage.style.display = 'block';
            formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            if (type === 'success') {
                setTimeout(() => {
                    clearFormMessage();
                }, 5000);
            }
        }
    }

    function clearFormMessage() {
        if (formMessage) {
            formMessage.textContent = '';
            formMessage.className = 'form-message';
            formMessage.style.display = 'none';
        }
    }

    function simulateAPICall(data) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submitted:', data);
                resolve();
            }, 1500);
        });
    }

    
    const inputs = contactForm ? contactForm.querySelectorAll('input, textarea, select') : [];
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            this.style.borderColor = '';
        });
    });

    function validateField(field) {
        let isValid = true;
        let message = '';

        switch(field.id) {
            case 'firstName':
            case 'lastName':
                if (field.value.trim().length < 2) {
                    isValid = false;
                    message = 'Must be at least 2 characters';
                }
                break;

            case 'contactEmail':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value.trim())) {
                    isValid = false;
                    message = 'Invalid email address';
                }
                break;

            case 'phone':
                if (field.value.trim().length > 0) {
                    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                    if (!phoneRegex.test(field.value) || field.value.length < 8) {
                        isValid = false;
                        message = 'Invalid phone number';
                    }
                }
                break;

            case 'subject':
                if (!field.value) {
                    isValid = false;
                    message = 'Please select a subject';
                }
                break;

            case 'message':
                if (field.value.trim().length < 10) {
                    isValid = false;
                    message = 'Must be at least 10 characters';
                }
                break;
        }

        if (!isValid) {
            field.style.borderColor = '#DC3545';
            showFieldError(field, message);
        } else {
            field.style.borderColor = '#28A745';
            removeFieldError(field);
        }

        return isValid;
    }

    function showFieldError(field, message) {
        removeFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #DC3545; font-size: 0.85rem; margin-top: 5px;';

        field.parentElement.appendChild(errorDiv);
    }

    function removeFieldError(field) {
        const existingError = field.parentElement.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }


    const messageField = document.getElementById('message');
    if (messageField) {
        const counterDiv = document.createElement('div');
        counterDiv.className = 'char-counter';
        counterDiv.style.cssText = 'text-align: right; font-size: 0.85rem; color: #6C757D; margin-top: 5px;';
        messageField.parentElement.appendChild(counterDiv);

        messageField.addEventListener('input', function() {
            const count = this.value.length;
            const minCount = 10;
            counterDiv.textContent = `${count} characters (minimum ${minCount})`;
            
            counterDiv.style.color = count >= minCount ? '#28A745' : '#6C757D';
        });
    }


    const contactCards = document.querySelectorAll('.contact-info-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    contactCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        cardObserver.observe(card);
    });


    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value.startsWith('971')) {
                    value = value.substring(3);
                }
                
                if (value.length <= 2) {
                    e.target.value = value;
                } else if (value.length <= 5) {
                    e.target.value = value.substring(0, 2) + ' ' + value.substring(2);
                } else if (value.length <= 8) {
                    e.target.value = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5);
                } else {
                    e.target.value = value.substring(0, 2) + ' ' + value.substring(2, 5) + ' ' + value.substring(5, 9);
                }
            }
        });
    }

});