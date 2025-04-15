// Main app logic
document.addEventListener('DOMContentLoaded', () => {
  // Get elements
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const imagePreview = document.getElementById('imagePreview');
  const captionInput = document.getElementById('caption');
  const processButton = document.getElementById('processButton');
  const resultDiv = document.getElementById('result');
  
  let imageFile = null;
  
  // Open file dialog when clicking on drop zone
  dropZone.addEventListener('click', () => fileInput.click());
  
  // Handle file selection
  fileInput.addEventListener('change', handleFile);
  
  // Drag and drop events
  ['dragover', 'dragenter'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropZone.classList.add('active');
    });
  });
  
  ['dragleave', 'dragend'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('active');
    });
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('active');
    
    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      handleFile(e);
    }
  });
  
  function handleFile(e) {
    const file = (e.dataTransfer?.files || fileInput.files)[0];
    
    if (file && file.type.match('image.*')) {
      imageFile = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = 'block';
        processButton.disabled = false;
      };
      reader.readAsDataURL(file);
    }
  }
  
  // Process image
  processButton.addEventListener('click', async () => {
    if (!imageFile || !captionInput.value.trim()) {
      alert('Please provide both an image and a caption');
      return;
    }
    
    resultDiv.innerHTML = '<div class="loading"><div></div><div></div><div></div><div></div></div>';
    
    try {
      // Convert image to data URI
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target.result;
        const payload = {
          caption: captionInput.value.trim(),
          imageUrl
        };
        
        const response = await fetch('/api/process-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        // Format the location data
        if (data.text && data.text.value) {
          const location = data.text.value;
          let formattedResult = `<h3>Location Analysis</h3>`;
          
          if (location.briefExplanation) {
            formattedResult += `<p>${location.briefExplanation}</p>`;
          }
          
          if (location.location) {
            formattedResult += `<p><strong>Location:</strong> ${location.location}</p>`;
          }
          
          if (location.latitude && location.longitude) {
            formattedResult += `<p><strong>Coordinates:</strong> ${location.latitude}, ${location.longitude}</p>`;
            
            // Add map link
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
            formattedResult += `<p><a href="${mapUrl}" target="_blank" rel="noopener noreferrer">View on Google Maps</a></p>`;
          }
          
          resultDiv.innerHTML = formattedResult;
        } else {
          resultDiv.textContent = JSON.stringify(data, null, 2);
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      resultDiv.textContent = `Error: ${error.message}`;
    }
  });
});