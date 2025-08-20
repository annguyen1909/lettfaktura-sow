import './style.css'
import apiClient from './api.js'

// Application state
const app = {
  data: [],
  filteredData: [],
  loading: false,
  error: null
};

// Initialize the application
async function init() {
  console.log('Initializing app...');
  try {
    app.loading = true;
    app.error = null;
    renderApp(); // Show loading state
    
    await loadProducts();
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
    
    const response = await apiClient.getProducts({
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
      <div class="loading">
        Loading products...
      </div>
    `;
    return;
  }
  
  if (app.error) {
    appElement.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #dc3545;">
        <div>${app.error}</div>
        <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
          Retry
        </button>
      </div>
    `;
    return;
  }
  
  appElement.innerHTML = renderTable();
}

// Render table component
function renderTable() {
  return `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th class="hide-mobile-landscape">Article No.<i class="fa-solid fa-arrow-down" style="color: #63E6BE; margin-left: 4px;"></i></th>
            <th>Product/Service <i class="fa-solid fa-arrow-down" style="color: #74C0FC; margin-left: 4px;"></i></th>
            <th class="hide-tablet">In Price</th>
            <th>Price</th>
            <th class="hide-mobile-landscape">Unit</th>
            <th class="hide-mobile-landscape">In Stock</th>
            <th class="hide-tablet">Description</th>
            <th class="actions-column"></th>
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
  return `
    <tr data-id="${item.id}">
      <td class="hide-mobile-landscape">
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
      <td class="hide-tablet">
        <input 
          type="number" 
          class="editable-field price-field" 
          value="${item.inPrice ? Math.round(item.inPrice) : ''}"
          data-field="inPrice"
          data-id="${item.id}"
        >
      </td>
      <td>
        <input 
          type="number" 
          class="editable-field price-field" 
          value="${item.price ? Math.round(item.price) : ''}"
          data-field="price"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-mobile-landscape">
        <input 
          type="text" 
          class="editable-field unit-field" 
          value="${item.unit}"
          data-field="unit"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-mobile-landscape">
        <input 
          type="number" 
          class="editable-field price-field" 
          value="${item.inStock ? Math.round(item.inStock) : ''}"
          data-field="inStock"
          data-id="${item.id}"
        >
      </td>
      <td class="hide-tablet">
        <input 
          type="text" 
          class="editable-field" 
          value="${item.description || ''}"
          data-field="description"
          data-id="${item.id}"
        >
      </td>
      <td class="actions-cell">
        <button class="row-actions-btn" data-id="${item.id}">
          <i class="fas fa-ellipsis-h" style="color: #16cde5;"></i>
        </button>
      </td>
    </tr>
  `;
}

// Setup event listeners - only for field changes
function setupEventListeners() {
  // Editable fields
  document.addEventListener('change', (e) => {
    if (e.target.classList.contains('editable-field')) {
      handleFieldChange(e);
    }
  });

  // Focus and blur events for row highlighting
  document.addEventListener('focus', (e) => {
    if (e.target.classList.contains('editable-field')) {
      highlightRow(e.target, true);
    }
  }, true);

  document.addEventListener('blur', (e) => {
    if (e.target.classList.contains('editable-field')) {
      highlightRow(e.target, false);
    }
  }, true);

  // Disable "New Product" button functionality (keep it visible but non-functional)
  document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-new')) {
      e.preventDefault();
      console.log('New Product button clicked (disabled for this demo)');
      // Button is visible but does nothing
    }
  });
}

// Highlight row when any field is focused
function highlightRow(input, isFocused) {
  const row = input.closest('tr');
  if (!row) return;

  if (isFocused) {
    // Add focused class to row
    row.classList.add('row-focused');
    
    // Add right arrow indicator on the left side
    if (!row.querySelector('.row-focus-arrow')) {
      const arrow = document.createElement('div');
      arrow.className = 'row-focus-arrow';
      arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
      arrow.style.cssText = `
        position: absolute;
        left: 2px;
        top: 50%;
        transform: translateY(-50%);
        color: #74C0FC;
        font-size: 12px;
        width: 16px;
        height: 16px;
        display: flex;
        justify-content: center;
      `;
      
      // Make sure the row container is positioned relatively
      row.style.position = 'relative';
      row.appendChild(arrow);
    }
  } else {
    // Remove focused class from row
    row.classList.remove('row-focused');
    
    // Remove arrow indicator
    const arrow = row.querySelector('.row-focus-arrow');
    if (arrow) {
      arrow.remove();
    }
    
    // Reset position if no other arrows in row
    if (!row.querySelector('.row-focus-arrow')) {
      row.style.position = '';
    }
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
    
    // Show success feedback
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
  
  console.error(message);
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
