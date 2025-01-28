document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const httpMethodSelect = document.getElementById('httpMethod');
  const urlInput = document.getElementById('urlInput');
  const sendButton = document.getElementById('sendRequest');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const addHeaderButton = document.getElementById('addHeader');
  const addParamButton = document.getElementById('addParam');
  const responseData = document.getElementById('responseData');
  const statusCode = document.getElementById('statusCode');
  const responseTime = document.getElementById('responseTime');

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab;
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.style.display = 'none');
      
      button.classList.add('active');
      document.getElementById(tabId).style.display = 'block';
    });
  });

  // Add header row
  addHeaderButton.addEventListener('click', () => {
    const headerRow = document.createElement('div');
    headerRow.className = 'header-row';
    headerRow.innerHTML = `
      <input type="text" placeholder="Key" />
      <input type="text" placeholder="Value" />
      <button class="remove-header">×</button>
    `;
    document.querySelector('.headers-container').insertBefore(
      headerRow,
      addHeaderButton
    );
  });

  // Add param row
  addParamButton.addEventListener('click', () => {
    const paramRow = document.createElement('div');
    paramRow.className = 'param-row';
    paramRow.innerHTML = `
      <input type="text" placeholder="Key" />
      <input type="text" placeholder="Value" />
      <button class="remove-param">×</button>
    `;
    document.querySelector('.params-container').insertBefore(
      paramRow,
      addParamButton
    );
  });

  // Remove header/param row
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-header')) {
      e.target.closest('.header-row').remove();
    }
    if (e.target.classList.contains('remove-param')) {
      e.target.closest('.param-row').remove();
    }
  });

  // Send request
  sendButton.addEventListener('click', async () => {
    try {
      // Show loading state
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';
      responseData.textContent = 'Loading...';
      statusCode.textContent = '';
      responseTime.textContent = '';

      const startTime = performance.now();

      // Validate URL
      let url = urlInput.value.trim();
      if (!url) {
        throw new Error('Please enter a URL');
      }

      // Remove multiple forward slashes except after protocol
      url = url.replace(/([^:]\/)\/+/g, '$1');

      // Collect headers
      const headers = {};
      document.querySelectorAll('.header-row').forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
          headers[keyInput.value] = valueInput.value;
        }
      });

      // Collect query parameters
      const params = {};
      document.querySelectorAll('.param-row').forEach(row => {
        const [keyInput, valueInput] = row.querySelectorAll('input');
        if (keyInput.value && valueInput.value) {
          params[keyInput.value] = valueInput.value;
        }
      });

      // Get request body
      let body = null;
      const bodyText = document.getElementById('requestBody').value;
      if (bodyText) {
        try {
          body = JSON.parse(bodyText);
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
      }

      // Send request
      const response = await window.api.sendRequest(
        httpMethodSelect.value,
        url,
        headers,
        body,
        params
      );

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      // Display response
      statusCode.textContent = `Status: ${response.status}`;
      responseTime.textContent = `Time: ${duration}ms`;
      responseData.textContent = JSON.stringify(response.data, null, 2);

      // Apply syntax highlighting
      responseData.className = 'language-json';
      if (window.Prism) {
        Prism.highlightElement(responseData);
      }
      
    } catch (error) {
      console.error('Error:', error); // Debug log
      responseData.textContent = `Error: ${error.message}`;
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Send';
    }
  });
});