document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const collectionNav = document.getElementById('collection-nav');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const sidebarMenu = document.getElementById('sidebar-menu');

    let allMenuData = []; // Store the full menu data globally
    let currentView = 'all'; // Track the currently selected view ('all' or specific collection name)

    // Function to toggle the sidebar menu visibility
    function toggleSidebar() {
        sidebarMenu.classList.toggle('open');
    }

    // Event listeners for hamburger and close buttons
    hamburgerMenu.addEventListener('click', toggleSidebar);
    closeMenu.addEventListener('click', toggleSidebar);

    // Close sidebar when a navigation link is clicked (for mobile)
    collectionNav.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            toggleSidebar(); // Close the sidebar after a link is clicked
        }
    });

    async function fetchMenuData() {
        try {
            const response = await fetch('data/menu.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMenuData = await response.json(); // Store fetched data
            populateNavigation(allMenuData);
            displayMenu(allMenuData, 'all'); // Initially display all items, collapsed by default
        } catch (error) {
            console.error('Error fetching menu data:', error);
            menuContainer.innerHTML = '<p>Sorry, we could not load the menu at this time. Please try again later.</p>';
        }
    }

    function populateNavigation(menuData) {
        collectionNav.innerHTML = ''; // Clear existing nav items

        // Add "All Items" link
        const allItemsLi = document.createElement('li');
        const allItemsLink = document.createElement('a');
        allItemsLink.href = '#';
        allItemsLink.textContent = 'All Items';
        allItemsLink.classList.add('active'); // Set 'All Items' as active by default
        allItemsLink.dataset.collection = 'all'; // Custom data attribute to identify
        allItemsLi.appendChild(allItemsLink);
        collectionNav.appendChild(allItemsLi);

        // Add links for each collection
        menuData.forEach(collection => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = collection.collectionName;
            link.dataset.collection = collection.collectionName; // Store collection name in data attribute
            li.appendChild(link);
            collectionNav.appendChild(li);
        });

        // Add event listener for navigation clicks
        collectionNav.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior (page refresh)
            const clickedLink = event.target;

            // Ensure a link was clicked, not whitespace in the ul
            if (clickedLink.tagName !== 'A') return;

            // Remove 'active' class from all links
            document.querySelectorAll('#collection-nav a').forEach(link => {
                link.classList.remove('active');
            });

            // Add 'active' class to the clicked link
            clickedLink.classList.add('active');

            const selectedCollectionName = clickedLink.dataset.collection;
            currentView = selectedCollectionName; // Update current view

            if (selectedCollectionName === 'all') {
                // For "All Items", all collections will be displayed and collapsed initially
                displayMenu(allMenuData, 'all');
            } else {
                // For specific collection, display only that one and it should be expanded
                const filteredCollection = allMenuData.filter(
                    collection => collection.collectionName === selectedCollectionName
                );
                displayMenu(filteredCollection, selectedCollectionName);
            }
        });
    }

    // Pass 'viewType' to control the display behavior
    function displayMenu(menuData, viewType) {
        menuContainer.innerHTML = ''; // Clear current menu display

        if (!menuData || menuData.length === 0) {
            menuContainer.innerHTML = '<p>No menu items available at the moment.</p>';
            return;
        }

        menuData.forEach(collection => {
            let isExpandedInitially = false; // Default to collapsed

            // If we are in 'all items' view, all collections should be collapsed
            // If we are in a specific collection view, that single collection should be expanded
            if (viewType === 'all') {
                isExpandedInitially = false; // All collections collapsed in 'All Items' view
            } else if (collection.collectionName === viewType) {
                isExpandedInitially = true; // The selected specific collection is expanded
            }

            createCollectionSection(collection, menuContainer, isExpandedInitially, viewType);
        });
    }

    // Added viewType parameter to createCollectionSection to conditionally add toggle behavior
    function createCollectionSection(collection, parentElement, isExpandedInitially, viewType) {
        const collectionDiv = document.createElement('section');
        collectionDiv.classList.add('collection');

        // Create a header for the collection
        const collectionHeader = document.createElement('div');
        collectionHeader.classList.add('collection-header');
        collectionHeader.innerHTML = `<h2>${collection.collectionName}</h2>`;

        // Wrapper for the dishes grid
        const dishesGridWrapper = document.createElement('div');
        dishesGridWrapper.classList.add('dishes-grid-wrapper');

        // Add toggle icon and behavior ONLY if it's the 'all items' view, or a specific collapsed view
        if (viewType === 'all') { // Only add toggle behavior for 'All Items' view
            const toggleIcon = document.createElement('span');
            toggleIcon.classList.add('toggle-icon');
            toggleIcon.innerHTML = '&#9660;'; // Down arrow

            collectionHeader.appendChild(toggleIcon); // Add toggle icon to header

            // Add click listener to the header to toggle the dropdown
            collectionHeader.addEventListener('click', () => {
                dishesGridWrapper.classList.toggle('expanded');
                toggleIcon.classList.toggle('rotated');
            });

            // Set initial state for all collections in 'all items' view
            if (!isExpandedInitially) { // If not expanded initially (which is the case for 'all items' view)
                // Nothing needed here, as max-height:0 and no rotated class are default
            } else {
                dishesGridWrapper.classList.add('expanded');
                toggleIcon.classList.add('rotated');
            }

        } else { // For specific collection view, it's always expanded and no toggle icon needed
            dishesGridWrapper.classList.add('expanded');
            // No toggle icon or event listener needed for specific collection view
        }


        // Common part for creating dishes grid (same as before)
        const dishesGrid = document.createElement('div');
        dishesGrid.classList.add('dishes-grid');

        if (collection.items && collection.items.length > 0) {
            collection.items.forEach(dish => {
                const dishItemDiv = document.createElement('div');
                dishItemDiv.classList.add('dish-item');

                const dishImageWrapper = document.createElement('div');
                dishImageWrapper.classList.add('dish-image-wrapper');

                const dishImage = document.createElement('img');
                dishImage.src = dish.image;
                dishImage.alt = dish.name;
                dishImageWrapper.appendChild(dishImage);
                dishItemDiv.appendChild(dishImageWrapper);

                const dishName = document.createElement('h3');
                dishName.textContent = dish.name;
                dishItemDiv.appendChild(dishName);

                const dishDescription = document.createElement('p');
                dishDescription.textContent = dish.description;
                dishItemDiv.appendChild(dishDescription);

                const dishPrice = document.createElement('span');
                dishPrice.classList.add('price');
                dishPrice.textContent = `$${dish.price}`;
                dishItemDiv.appendChild(dishPrice);

                dishesGrid.appendChild(dishItemDiv);
            });
        } else {
            const noItemsMessage = document.createElement('p');
            noItemsMessage.textContent = 'No dishes in this section currently.';
            dishesGrid.appendChild(noItemsMessage);
        }

        dishesGridWrapper.appendChild(dishesGrid);
        collectionDiv.appendChild(collectionHeader); // Add header first
        collectionDiv.appendChild(dishesGridWrapper); // Then content wrapper
        parentElement.appendChild(collectionDiv);
    }

    // Call the function to fetch and display data when the page loads
    fetchMenuData();
});
