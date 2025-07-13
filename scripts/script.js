document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');

    async function fetchMenuData() {
        try {
            const response = await fetch('data/menu.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const menuData = await response.json();
            displayMenu(menuData);
        } catch (error) {
            console.error('Error fetching menu data:', error);
            menuContainer.innerHTML = '<p>Sorry, we could not load the menu at this time. Please try again later.</p>';
        }
    }

    function displayMenu(menuData) {
        if (!menuData || menuData.length === 0) {
            menuContainer.innerHTML = '<p>No menu items available at the moment.</p>';
            return;
        }

        menuData.forEach(collection => {
            const collectionDiv = document.createElement('section');
            collectionDiv.classList.add('collection');

            const collectionTitle = document.createElement('h2');
            collectionTitle.textContent = collection.collectionName;
            collectionDiv.appendChild(collectionTitle);

            const dishesGrid = document.createElement('div');
            dishesGrid.classList.add('dishes-grid');

            if (collection.items && collection.items.length > 0) {
                collection.items.forEach(dish => {
                    const dishItemDiv = document.createElement('div');
                    dishItemDiv.classList.add('dish-item');

                    const dishImage = document.createElement('img');
                    dishImage.src = dish.image;
                    dishImage.alt = dish.name;
                    dishItemDiv.appendChild(dishImage);

                    const dishName = document.createElement('h3');
                    dishName.textContent = dish.name;
                    dishItemDiv.appendChild(dishName);

                    const dishDescription = document.createElement('p');
                    dishDescription.textContent = dish.description;
                    dishItemDiv.appendChild(dishDescription);

                    const dishPrice = document.createElement('span');
                    dishPrice.classList.add('price');
                    dishPrice.textContent = `$${dish.price}`; // Display price with dollar sign
                    dishItemDiv.appendChild(dishPrice);

                    dishesGrid.appendChild(dishItemDiv);
                });
            } else {
                const noItemsMessage = document.createElement('p');
                noItemsMessage.textContent = 'No dishes in this section currently.';
                dishesGrid.appendChild(noItemsMessage);
            }

            collectionDiv.appendChild(dishesGrid);
            menuContainer.appendChild(collectionDiv);
        });
    }

    // Call the function to fetch and display data when the page loads
    fetchMenuData();
});