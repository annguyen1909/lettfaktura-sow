import './style.css'
import apiClient from './api.js'

// Application state
const app = {
  data: [],
  filteredData: [],
  selectedRowId: null,
  loading: false,
  error: null,
  searchFilters: {
    articleNo: '',
    product: ''
  }
};

// Initialize the application
async function init() {
  console.log('Initializing app...');
  try {
    app.loading = true;
    app.error = null;
    console.log('Setting loading state...');
    renderApp(); // Show loading state
    
    console.log('About to load products...');
    await loadProducts();
    console.log('Products loaded, rendering app...');
    app.loading = false;
    renderApp(); // Re-render with data
    setupEventListeners();
    console.log('App initialized successfully');
  } catch (error) {
    app.loading = false;
    app.error = 'Failed to load products. Please try again.';
    console.error('Init error:', error);
    renderApp();
  }
}

// Load products from API
async function loadProducts() {
  try {
    console.log('Starting to load products...');
    console.log('Search filters:', app.searchFilters);
    
    const response = await apiClient.getProducts({
      articleNo: app.searchFilters.articleNo,
      product: app.searchFilters.product,
      limit: 50
    });
    
    console.log('API response:', response);
    
    app.data = response.products || [];
    app.filteredData = [...app.data];
    
    console.log('Loaded products:', app.data.length);
  } catch (error) {
    console.error('Failed to load products:', error);
    app.error = 'Failed to load products from server';
    throw error;
  }
}

// Render the complete application
function renderApp() {
  const appElement = document.querySelector('#app');
  
  if (app.loading) {
    appElement.innerHTML = `
      ${renderHeader()}
      <div style="text-align: center; padding: 2rem;">
        <div>Loading products...</div>
      </div>
    `;
    return;
  }
  
  if (app.error) {
    appElement.innerHTML = `
      ${renderHeader()}
      <div style="text-align: center; padding: 2rem; color: red;">
        <div>${app.error}</div>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem;">
          Retry
        </button>
      </div>
    `;
    return;
  }
  
  appElement.innerHTML = `
    ${renderHeader()}
    ${renderSearchSection()}
    ${renderTable()}
  `;
}

// Render header component
function renderHeader() {
  return `
    <header class="header">
      <div class="header-container">
        <button class="hamburger-menu">☰</button>
        <div class="language-toggle">
          <span>English</span>
          <span class="flag">🇬🇧</span>
        </div>
      </div>
    </header>
  `;
}

// Render search section
function renderSearchSection() {
  return `
    <section class="search-section">
      <div class="search-container">
        <div class="search-row">
          <div class="search-field">
            <input 
              type="text" 
              placeholder="Search Article No ..." 
              id="search-article"
              value="${app.searchFilters.articleNo}"
            >
            <span class="search-icon">🔍</span>
          </div>
          <div class="search-field">
            <input 
              type="text" 
              placeholder="Search Product ..." 
              id="search-product"
              value="${app.searchFilters.product}"
            >
            <span class="search-icon">🔍</span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="btn btn-primary">
            <span>+</span>
            Add New
          </button>
          <button class="btn btn-secondary">
            <span>💾</span>
            Import
          </button>
          <button class="btn btn-info">
            <span>📊</span>
            Export
          </button>
        </div>
      </div>
    </section>
  `;
}

// Render table component
function renderTable() {
  return `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Article No.</th>
            <th>Product/Service</th>
            <th class="hide-mobile">Price</th>
            <th class="hide-tablet">In Stock</th>
            <th class="hide-mobile-portrait">Unit</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${app.filteredData.map(item => renderTableRow(item)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Render individual table row
function renderTableRow(item) {
  const isSelected = item.id === app.selectedRowId;
  return `
    <tr class="${isSelected ? 'selected' : ''}" data-id="${item.id}">
      <td>
        <input 
          type="text" 
          class="editable-field article-no" 
          value="${item.articleNo}"
          data-field="articleNo"
          data-id="${item.id}"
        >
      </td>
      <td>
        <input 
          type="text" 
          class="editable-field" 
          value="${item.product}"
          data-field="product"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-mobile">
        <input 
          type="number" 
          class="editable-field price-field" 
          value="${item.price}"
          data-field="price"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-tablet">
        <input 
          type="number" 
          class="editable-field price-field" 
          value="${item.inStock}"
          data-field="inStock"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-mobile-portrait">
        <input 
          type="text" 
          class="editable-field unit-field" 
          value="${item.unit}"
          data-field="unit"
          data-id="${item.id}"
        >
      </td>
      <td class="actions-cell">
        <button class="menu-dots" data-id="${item.id}">⋯</button>
      </td>
    </tr>
  `;
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality with debouncing
  let searchTimeout;
  const searchArticle = document.getElementById('search-article');
  const searchProduct = document.getElementById('search-product');
  
  const debouncedSearch = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleSearch, 500); // 500ms delay
  };
  
  if (searchArticle) {
    searchArticle.addEventListener('input', debouncedSearch);
  }
  
  if (searchProduct) {
    searchProduct.addEventListener('input', debouncedSearch);
  }

  // Row selection
  document.addEventListener('click', (e) => {
    const row = e.target.closest('tr[data-id]');
    if (row && !e.target.classList.contains('editable-field') && !e.target.classList.contains('menu-dots')) {
      const rowId = parseInt(row.dataset.id);
      if (app.selectedRowId === rowId) {
        app.selectedRowId = null;
      } else {
        app.selectedRowId = rowId;
      }
      updateTableRows();
    }
  });

  // Editable fields
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('editable-field')) {
      handleFieldChange(e);
    }
  });

  // Menu dots (placeholder for now)
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-dots')) {
      e.stopPropagation();
      const id = parseInt(e.target.dataset.id);
      console.log('Menu clicked for item:', id);
      // TODO: Implement dropdown menu
    }
  });

  // Action buttons
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.btn-primary')) {
      // Add New button
      await handleAddNew();
    } else if (e.target.closest('.btn-secondary')) {
      // Import button
      console.log('Import clicked');
      // TODO: Implement import functionality
    } else if (e.target.closest('.btn-info')) {
      // Export button
      console.log('Export clicked');
      // TODO: Implement export functionality
    }
  });
}

// Handle add new product
async function handleAddNew() {
  try {
    const newProduct = {
      articleNo: `NEW${Date.now()}`,
      product: 'New Product',
      price: 0,
      inStock: 0,
      unit: 'pieces'
    };
    
    const response = await apiClient.createProduct(newProduct);
    
    if (response && response.product) {
      // Reload products to get the new one
      await loadProducts();
      updateTable();
      
      // Select the new product
      app.selectedRowId = response.product.id;
      updateTableRows();
    }
  } catch (error) {
    console.error('Failed to create new product:', error);
    alert('Failed to create new product. Please try again.');
  }
}

// Handle search functionality
async function handleSearch() {
  const searchArticle = document.getElementById('search-article');
  const searchProduct = document.getElementById('search-product');
  
  app.searchFilters.articleNo = searchArticle ? searchArticle.value : '';
  app.searchFilters.product = searchProduct ? searchProduct.value : '';
  
  try {
    app.loading = true;
    updateLoadingState();
    
    await loadProducts();
    updateTable();
  } catch (error) {
    console.error('Search failed:', error);
    app.error = 'Search failed. Please try again.';
    renderApp();
  } finally {
    app.loading = false;
  }
}

// Show loading state for table only
function updateLoadingState() {
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div>Searching...</div>
      </div>
    `;
  }
}

// Handle field changes
async function handleFieldChange(e) {
  const field = e.target.dataset.field;
  const id = parseInt(e.target.dataset.id);
  const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
  
  try {
    // Update local data immediately for responsiveness
    const item = app.data.find(item => item.id === id);
    if (item) {
      item[field] = value;
    }
    
    const filteredItem = app.filteredData.find(item => item.id === id);
    if (filteredItem) {
      filteredItem[field] = value;
    }
    
    // Save to backend
    await apiClient.updateProductField(id, field, value);
    console.log(`Updated ${field} for item ${id}:`, value);
    
    // Show success feedback (optional)
    showSuccessFeedback(e.target);
    
  } catch (error) {
    console.error('Failed to save to backend:', error);
    
    // Revert local changes on error
    await loadProducts();
    updateTable();
    
    // Show error feedback
    showErrorFeedback(e.target, 'Failed to save changes');
  }
}

// Show success feedback
function showSuccessFeedback(element) {
  const originalBg = element.style.backgroundColor;
  element.style.backgroundColor = '#d4edda';
  element.style.borderColor = '#28a745';
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    element.style.borderColor = '';
  }, 1000);
}

// Show error feedback
function showErrorFeedback(element, message) {
  const originalBg = element.style.backgroundColor;
  element.style.backgroundColor = '#f8d7da';
  element.style.borderColor = '#dc3545';
  
  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    element.style.borderColor = '';
  }, 2000);
  
  // Could also show a toast notification here
  console.error(message);
}

// Placeholder for backend save functionality
async function saveToBackend(id, field, value) {
  // This function is no longer needed as we use apiClient.updateProductField directly
  console.log('saveToBackend is deprecated, using apiClient.updateProductField instead');
}

// Update only table rows (for selection changes)
function updateTableRows() {
  const tbody = document.querySelector('.data-table tbody');
  if (tbody) {
    tbody.innerHTML = app.filteredData.map(item => renderTableRow(item)).join('');
  }
}

// Update entire table (for data changes)
function updateTable() {
  const tableContainer = document.querySelector('.table-container');
  if (tableContainer) {
    tableContainer.innerHTML = renderTable().match(/<table[\s\S]*<\/table>/)[0];
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
