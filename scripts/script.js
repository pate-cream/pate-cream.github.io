document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-container');
    const collectionNavSidebar = document.getElementById('collection-nav-sidebar');
    const collectionNavHorizontal = document.getElementById('collection-nav-horizontal');
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const closeMenu = document.querySelector('.close-menu');
    const sidebarMenu = document.getElementById('sidebar-menu');

    let allMenuData = [];
    let currentView = 'all'; // Keep track of the currently selected view

    function toggleSidebar() {
        sidebarMenu.classList.toggle('open');
    }

    hamburgerMenu.addEventListener('click', toggleSidebar);
    closeMenu.addEventListener('click', toggleSidebar);

    // Event listener for navigation clicks (delegated to parent ul)
    function handleNavigationClick(event) {
        event.preventDefault();
        const clickedLink = event.target.closest('a');

        if (!clickedLink) return;

        // Remove 'active' class from all links in BOTH navs
        document.querySelectorAll('#collection-nav-sidebar a, #collection-nav-horizontal a').forEach(link => {
            link.classList.remove('active');
        });

        const selectedCollectionName = clickedLink.dataset.collection;
        const normalizedSelectedCollectionName = selectedCollectionName.toLowerCase();

        currentView = selectedCollectionName;

        // Add 'active' class to the clicked link in BOTH navs
        document.querySelectorAll(`[data-collection="${selectedCollectionName}"]`).forEach(link => {
            link.classList.add('active');
        });

        // Close sidebar if clicked from sidebar on mobile
        if (event.currentTarget.id === 'collection-nav-sidebar') {
            toggleSidebar();
        }

        if (normalizedSelectedCollectionName === 'all items') {
            console.log('--- Handling "All Items" click (normalized) ---');
            console.log('Passing allMenuData:', allMenuData);
            displayMenu(allMenuData, 'all');
        } else {
            console.log(`--- Handling "${selectedCollectionName}" click ---`);
            const filteredCollection = allMenuData.filter(
                collection => collection.collectionName === selectedCollectionName
            );
            console.log('Filtered data:', filteredCollection);
            displayMenu(filteredCollection, selectedCollectionName);
        }
    }

    collectionNavSidebar.addEventListener('click', handleNavigationClick);
    collectionNavHorizontal.addEventListener('click', handleNavigationClick);


    async function fetchMenuData() {
        try {
            const response = await fetch('data/menu.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allMenuData = await response.json();
            console.log('Data fetched successfully:', allMenuData);
            populateNavigation(allMenuData); // Populate navs initially
            displayMenu(allMenuData, 'all'); // Display all items (collapsed) on initial load
        } catch (error) {
            console.error('Error fetching menu data:', error);
            menuContainer.innerHTML = '<p>Sorry, we could not load the menu at this time. Please try again later.</p>';
        }
    }

    function populateNavigation(menuData) {
        collectionNavSidebar.innerHTML = '';
        collectionNavHorizontal.innerHTML = '';

        // Helper function to create a navigation link
        // أضفنا الآن وسيط "collectionIconPath" لتمرير مسار الأيقونة
        function createNavLink(collectionName, isMobileHorizontal = false, collectionIconPath = '') {
            const li = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = collectionName;
            link.dataset.collection = collectionName;

            if (isMobileHorizontal) {
                let iconSrc = collectionIconPath; // استخدم المسار الذي تم تمريره مباشرة

                // معالجة حالة "All Items" بشكل خاص لأنها ليست جزءًا من بيانات JSON
                if (collectionName === 'All Items') {
                    iconSrc = 'images/col1.png'; // أيقونة افتراضية لـ "All categories"
                    link.textContent = 'All categories'; // تغيير النص إلى "All categories"
                }

                if (iconSrc) {
                    const iconImg = document.createElement('img');
                    iconImg.src = iconSrc;
                    iconImg.alt = collectionName + ' icon';
                    iconImg.classList.add('icon'); // أضف فئة لتطبيق الأنماط
                    link.prepend(iconImg); // أضف الأيقونة قبل النص
                }
            }

            // Set 'active' class based on the currentView
            if (collectionName === 'All Items' && currentView === 'all') {
                link.classList.add('active');
            } else if (collectionName === currentView) {
                link.classList.add('active');
            }
            li.appendChild(link);
            return li;
        }

        // Add "All Items" to both navigation lists
        // لا توجد أيقونة من JSON لـ "All Items"، لذا نمرر المسار يدوياً أو نتركه فارغاً ليعالجه الشرط الداخلي
        collectionNavSidebar.appendChild(createNavLink('All Items'));
        collectionNavHorizontal.appendChild(createNavLink('All Items', true));


        // Add links for each collection to both navigation lists
        menuData.forEach(collection => {
            collectionNavSidebar.appendChild(createNavLink(collection.collectionName));
            // هنا نمرر collection.icon الذي يأتي من ملف JSON
            collectionNavHorizontal.appendChild(createNavLink(collection.collectionName, true, collection.icon));
        });
    }

    function displayMenu(menuData, viewType) {
        menuContainer.innerHTML = '';
        console.log('Displaying menu. Received menuData:', menuData, 'View type:', viewType);
        if (!menuData || menuData.length === 0) {
            console.warn("No menu data to display or filtered data is empty.", menuData);
            menuContainer.innerHTML = '<p>No menu items available at the moment.</p>';
            return;
        }

        menuData.forEach(collection => {
            let isExpandedInitially = false;

            if (viewType === 'all') {
                isExpandedInitially = false; // All collections collapsed in 'All Items' view
            } else if (collection.collectionName === viewType) {
                isExpandedInitially = true; // The selected specific collection is expanded
            }

            createCollectionSection(collection, menuContainer, isExpandedInitially, viewType);
        });
    }

    function createCollectionSection(collection, parentElement, isExpandedInitially, viewType) {
        const collectionDiv = document.createElement('section');
        collectionDiv.classList.add('collection');

        const collectionHeader = document.createElement('div');
        collectionHeader.classList.add('collection-header');
        collectionHeader.innerHTML = `<h2>${collection.collectionName}</h2>`;

        const dishesGridWrapper = document.createElement('div');
        dishesGridWrapper.classList.add('dishes-grid-wrapper');

        if (viewType === 'all') {
            const toggleIcon = document.createElement('span');
            toggleIcon.classList.add('toggle-icon');
            toggleIcon.innerHTML = '&#9660;'; // Down arrow

            collectionHeader.appendChild(toggleIcon);

            collectionHeader.addEventListener('click', () => {
                dishesGridWrapper.classList.toggle('expanded');
                toggleIcon.classList.toggle('rotated');
            });

            if (isExpandedInitially) {
                dishesGridWrapper.classList.add('expanded');
                toggleIcon.classList.add('rotated');
            }

        } else {
            dishesGridWrapper.classList.add('expanded');
        }

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
        collectionDiv.appendChild(collectionHeader);
        collectionDiv.appendChild(dishesGridWrapper);
        parentElement.appendChild(collectionDiv);
    }

    fetchMenuData();
	const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        const currentYear = new Date().getFullYear();
        currentYearSpan.textContent = currentYear;
    }
});
