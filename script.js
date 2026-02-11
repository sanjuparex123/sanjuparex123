const addForm = document.querySelector('#addForm');
const purchaseForm = document.querySelector('#purchaseForm');
const inventoryBody = document.querySelector('#inventoryBody');
const vegetableSelect = document.querySelector('#vegetableSelect');
const salesSummary = document.querySelector('#salesSummary');
const salesList = document.querySelector('#salesList');
const refreshBtn = document.querySelector('#refreshBtn');
const messageBar = document.querySelector('#messageBar');

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

let vegetables = [];

const setMessage = (text, kind = 'info') => {
  messageBar.textContent = text;
  messageBar.dataset.kind = kind;
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const renderInventory = () => {
  inventoryBody.innerHTML = '';

  if (!vegetables.length) {
    inventoryBody.innerHTML = '<tr><td colspan="5">No vegetables found.</td></tr>';
    return;
  }

  vegetables.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.category}</td>
      <td>${currency.format(item.price)}</td>
      <td>${item.stock}</td>
      <td>
        <button class="btn btn--small" data-action="restock" data-id="${item.id}">+10 Stock</button>
        <button class="btn btn--small btn--danger" data-action="delete" data-id="${item.id}">Delete</button>
      </td>
    `;
    inventoryBody.appendChild(row);
  });
};

const renderSelect = () => {
  vegetableSelect.innerHTML = '';
  vegetables.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.name} (Stock: ${item.stock})`;
    option.disabled = item.stock <= 0;
    vegetableSelect.appendChild(option);
  });
};

const renderSales = (salesData) => {
  const { summary, rows } = salesData;
  salesSummary.innerHTML = `
    <p><strong>Units Sold:</strong> ${summary.unitsSold}</p>
    <p><strong>Total Revenue:</strong> ${currency.format(summary.revenue)}</p>
  `;

  salesList.innerHTML = '';
  if (!rows.length) {
    salesList.innerHTML = '<li>No sales yet.</li>';
    return;
  }

  rows.forEach((sale) => {
    const item = document.createElement('li');
    item.textContent = `${sale.vegetable_name} × ${sale.quantity} = ${currency.format(sale.total_price)}`;
    salesList.appendChild(item);
  });
};

const refreshData = async () => {
  try {
    const [veggieData, salesData] = await Promise.all([
      request('/api/vegetables'),
      request('/api/sales'),
    ]);

    vegetables = veggieData;
    renderInventory();
    renderSelect();
    renderSales(salesData);
    setMessage('Data loaded successfully.', 'success');
  } catch (error) {
    setMessage(error.message, 'error');
  }
};

addForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(addForm);
  const payload = Object.fromEntries(formData.entries());

  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);

  try {
    await request('/api/vegetables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    addForm.reset();
    await refreshData();
    setMessage('Vegetable added.', 'success');
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

purchaseForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(purchaseForm);

  const payload = {
    vegetableId: Number(formData.get('vegetableId')),
    quantity: Number(formData.get('quantity')),
  };

  try {
    await request('/api/purchase', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    purchaseForm.reset();
    await refreshData();
    setMessage('Purchase recorded.', 'success');
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

inventoryBody.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  try {
    if (action === 'delete') {
      await request(`/api/vegetables/${id}`, { method: 'DELETE' });
      setMessage('Vegetable deleted.', 'success');
    }

    if (action === 'restock') {
      const item = vegetables.find((vegetable) => vegetable.id === id);
      if (!item) {
        return;
      }

      await request(`/api/vegetables/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: item.stock + 10 }),
      });
      setMessage(`${item.name} restocked by 10.`, 'success');
    }

    await refreshData();
  } catch (error) {
    setMessage(error.message, 'error');
  }
});

refreshBtn.addEventListener('click', refreshData);

refreshData();
