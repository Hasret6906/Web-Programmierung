class Router {
    constructor(routes) {
        this.routes = routes;
        this.started = false;

        window.addEventListener('hashchange', () => this.handleRouting());
    }

    start() {
        this.started = true;
        this.handleRouting();
    }

    stop() {
        this.started = false;
    }

    handleRouting() {
        let url = location.hash.slice(1) || '/';
        let route = this.routes.find(route => url.match(new RegExp(route.url)));
        if (!route) {
            console.error(`Keine Route zur URL ${url} gefunden!`);
            return;
        }

        route.show();
    }
}

const routes = [
    
    {
        url: '^/ueberuns$',
        show: () => versteckeuberuns('ueberuns')
    },
    {
        url: '^/benutzer$',
        show: () => versteckebenutzer('benutzer')
    }
];

let router = new Router(routes);
router.start();

function sucheprodukt() {
    let searchTerm = document.getElementById('search-input').value.toLowerCase();

    fetch('https://dummyjson.com/products')
        .then(response => response.json())
        .then(data => {
            const results = data.products.filter(product => {
                return product.title.toLowerCase().includes(searchTerm) &&
                    (product.category === 'fragrances' || product.category === 'skincare');
            });

            ergebnisse(results);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function ergebnisse(products) {
    let resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (products.length === 0) {
        resultsContainer.innerHTML = 'Keine Produkte gefunden.';
    } else {
        products.forEach(product => {
            const productElement = produkte(product);
            resultsContainer.appendChild(productElement);
        });
    }
}

function produkte(product) {
    let productElement = document.createElement('div');
    productElement.classList.add('product-item');

    productElement.innerHTML = `
        <img class="product-thumbnail" src="${product.thumbnail}" alt="${product.title}">
        <p class="product-title">${product.title}</p>
        <p class="product-price">${product.price}</p>
    `;

   
    productElement.addEventListener('click', () => produktdetails(product));

    return productElement;
}

function produktdetails(product) {
    let resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    let productContainer = document.getElementById('product-details');
    productContainer.innerHTML = '';

    let productDetails = document.createElement('div');
    productDetails.innerHTML = `
        <h2 class="product-title">${product.title}</h2>
        <img class="product-thumbnail" src="${product.thumbnail}" alt="${product.title}">
        
        <p class="product-price">Preis: ${product.price}</p>
        <p class="product-description">Beschreibung: ${product.description}</p>
        <p class="product-category">Kategorie: ${product.category}</p>
        <p class="product-rate">Bewertung: ${product.rate}</p>
    `;

    productContainer.appendChild(productDetails);
}




function versteckeuberuns(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.style.display = 'block';
            if (pageId === 'ueberuns') {
                // Verstecke die Suchleiste, wenn "Über uns" ausgewählt ist
                document.getElementById('search-bar').classList.add('hide');
                document.getElementById('content-container').classList.add('hide');
                document.getElementById('results').classList.add('hide');
                document.getElementById('product-details').classList.add('hide');
                
            } 
        } else {
            page.style.display = 'none';
        }
    });
}

function versteckebenutzer(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.style.display = 'block';
            if (pageId === 'benutzer') {
                // Verstecke die Suchleiste, wenn "Über uns" ausgewählt ist
                document.getElementById('search-bar').classList.add('hide');
                document.getElementById('content-container').classList.add('hide');
                document.getElementById('results').classList.add('hide');
                document.getElementById('product-details').classList.add('hide');
                
            } 
        } else {
            page.style.display = 'none';
        }
    });
}

function benutzerladen() {
    fetch('https://dummyjson.com/users')
        .then(response => response.json())
        .then(data => {
            let userList = document.getElementById('user-list');
            userList.innerHTML = ''; // Leert die Benutzerliste

            data.users.forEach(user => {
                // Überprüfe, ob der Benutzer einen Warenkorb hat
                benutzerhatcart(user.id).then(hasCart => {
                    if (hasCart) {
                        let userItem = document.createElement('li');
                        userItem.className = 'user-item';
                        userItem.innerHTML = ` Benutzer: ${user.id},Geschlecht: ${user.gender}, Alter: ${user.age}`;

                        // Füge einen Button für den Warenkorb hinzu
                        let cartButton = document.createElement('button');
                        cartButton.className = 'cart-button';
                        cartButton.textContent = 'Warenkorb anzeigen';

                        // Erstelle eine Liste für die Warenkorb-Produkte
                        let cartList = document.createElement('ul');
                        cartList.className = 'cart-list';

                        cartButton.addEventListener('click', () => {
                            toggleCart(cartList);
                            warenkorbladen(user.id, cartList);
                        });

                        userItem.appendChild(cartButton);
                        userItem.appendChild(cartList);
                        userList.appendChild(userItem);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

// Funktion zum Laden des Warenkorbs eines Benutzers
function warenkorbladen(userId, cartList) {
    fetch('https://dummyjson.com/carts')
        .then(response => response.json())
        .then(data => {
            let cartItems = data.carts.filter(cart => cart.userId === userId);

            if (cartItems.length === 0) {
                alert('Kein Warenkorb für diesen Benutzer gefunden.');
                return;
            }

            let productNames = cartItems[0].products.map(product => product.title).join(', ');
            cartList.innerHTML = `<li>Produkte im Warenkorb: ${productNames}</li>`;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Warenkorbdaten:', error);
        });
}

// Funktion zum Überprüfen, ob ein Benutzer einen Warenkorb hat
function benutzerhatcart(userId) {
    return fetch('https://dummyjson.com/carts')
        .then(response => response.json())
        .then(data => {
            return data.carts.some(cart => cart.userId === userId);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Warenkorbdaten:', error);
            return false;
        });
}

// Funktion zum Ein-/Ausblenden des Warenkorbs
function toggleCart(cartList) {
    if (cartList.style.display === 'none') {
        cartList.style.display = 'block';
    } else {
        cartList.style.display = 'none';
    }
}

// Lade Benutzer mit Warenkörben beim Laden der Seite
benutzerladen();




function sucheprodukt() {
    let searchTerm = document.getElementById('search-input').value.toLowerCase();

    fetch('https://dummyjson.com/products')
        .then(response => response.json())
        .then(data => {
            const results = data.products.filter(product => {
                return product.title.toLowerCase().includes(searchTerm) &&
                    (product.category === 'fragrances' || product.category === 'skincare');
            });

            ergebnisse(results);
        })
        .catch(error => {
            console.error('Fehler beim Abrufen der Daten:', error);
        });
}

function ergebnisse(products) {
    let resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (products.length === 0) {
        resultsContainer.innerHTML = 'Keine Produkte gefunden.';
    } else {
        products.forEach(product => {
            const productElement = produkte(product);
            resultsContainer.appendChild(productElement);
        });
    }
}

function produkte(product) {
    let productElement = document.createElement('div');
    productElement.classList.add('product-item');

    productElement.innerHTML = `
        <img class="product-thumbnail" src="${product.thumbnail}" alt="${product.title}">
        <p class="product-title">${product.title}</p>
        <p class="product-price">${product.price}</p>
    `;

   
    productElement.addEventListener('click', () => produktdetails(product));

    return productElement;
}

function produktdetails(product) {
    let resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    let productContainer = document.getElementById('product-details');
    productContainer.innerHTML = '';

    let productDetails = document.createElement('div');
    productDetails.innerHTML = `
        <h2 class="product-title">${product.title}</h2>
        <img class="product-thumbnail" src="${product.thumbnail}" alt="${product.title}">
        
        <p class="product-price">Preis: ${product.price}</p>
        <p class="product-description">Beschreibung: ${product.description}</p>
        <p class="product-category">Kategorie: ${product.category}</p>
        <p class="product-rate">Bewertung: ${product.rate}</p>
    `;

    productContainer.appendChild(productDetails);
}




function versteckeuberuns(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.style.display = 'block';
            if (pageId === 'ueberuns') {
                // Verstecke die Suchleiste, wenn "Über uns" ausgewählt ist
                document.getElementById('search-bar').classList.add('hide');
                document.getElementById('content-container').classList.add('hide');
                document.getElementById('results').classList.add('hide');
                document.getElementById('product-details').classList.add('hide');
                
            } 
        } else {
            page.style.display = 'none';
        }
    });
}

function versteckebenutzer(pageId) {
    let pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        if (page.id === pageId) {
            page.style.display = 'block';
            if (pageId === 'benutzer') {
                // Verstecke die Suchleiste, wenn "Über uns" ausgewählt ist
                document.getElementById('search-bar').classList.add('hide');
                document.getElementById('content-container').classList.add('hide');
                document.getElementById('results').classList.add('hide');
                document.getElementById('product-details').classList.add('hide');
                
            } 
        } else {
            page.style.display = 'none';
        }
    });
}

function benutzerladen() {
    fetch('https://dummyjson.com/users')
        .then(response => response.json())
        .then(data => {
            let userList = document.getElementById('user-list');
            userList.innerHTML = ''; // Leert die Benutzerliste

            data.users.forEach(user => {
                // Überprüfe, ob der Benutzer einen Warenkorb hat
                benutzerhatcart(user.id).then(hasCart => {
                    if (hasCart) {
                        let userItem = document.createElement('li');
                        userItem.className = 'user-item';
                        userItem.innerHTML = ` Benutzer: ${user.id},Geschlecht: ${user.gender}, Alter: ${user.age}`;

                        // Füge einen Button für den Warenkorb hinzu
                        let cartButton = document.createElement('button');
                        cartButton.className = 'cart-button';
                        cartButton.textContent = 'Warenkorb anzeigen';

                        // Erstelle eine Liste für die Warenkorb-Produkte
                        let cartList = document.createElement('ul');
                        cartList.className = 'cart-list';

                        cartButton.addEventListener('click', () => {
                            toggleCart(cartList);
                            warenkorbladen(user.id, cartList);
                        });

                        userItem.appendChild(cartButton);
                        userItem.appendChild(cartList);
                        userList.appendChild(userItem);
                    }
                });
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der Benutzerdaten:', error);
        });
}

// Funktion zum Laden des Warenkorbs eines Benutzers
function warenkorbladen(userId, cartList) {
    fetch('https://dummyjson.com/carts')
        .then(response => response.json())
        .then(data => {
            let cartItems = data.carts.filter(cart => cart.userId === userId);

            if (cartItems.length === 0) {
                alert('Kein Warenkorb für diesen Benutzer gefunden.');
                return;
            }

            let productNames = cartItems[0].products.map(product => product.title).join(', ');
            cartList.innerHTML = `<li>Produkte im Warenkorb: ${productNames}</li>`;
        })
        .catch(error => {
            console.error('Fehler beim Laden der Warenkorbdaten:', error);
        });
}

// Funktion zum Überprüfen, ob ein Benutzer einen Warenkorb hat
function benutzerhatcart(userId) {
    return fetch('https://dummyjson.com/carts')
        .then(response => response.json())
        .then(data => {
            return data.carts.some(cart => cart.userId === userId);
        })
        .catch(error => {
            console.error('Fehler beim Laden der Warenkorbdaten:', error);
            return false;
        });
}

// Funktion zum Ein-/Ausblenden des Warenkorbs
function toggleCart(cartList) {
    if (cartList.style.display === 'none') {
        cartList.style.display = 'block';
    } else {
        cartList.style.display = 'none';
    }
}

// Lade Benutzer mit Warenkörben beim Laden der Seite
benutzerladen();



