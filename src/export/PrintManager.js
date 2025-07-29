export class PrintManager {
  constructor(chartInstance, exportManager) {
    this.chart = chartInstance;
    this.exportManager = exportManager;
  }

  // Print current chart
  print(options = {}) {
    const defaultOptions = {
      scale: 2,
      backgroundColor: "#FFFFFF",
      title: "Organization Chart"
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.exportManager.getImageDataURL(finalOptions)
      .then(dataURL => {
        this.printImage(dataURL, finalOptions.title);
      });
  }

  // Print full chart (fit to page)
  printFull(options = {}) {
    return this.print({ ...options, full: true });
  }

  // Internal method to handle image printing
  printImage(dataURL, title = "Chart") {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            @media print {
              body { padding: 0; }
              img { 
                width: 100vw; 
                height: 100vh; 
                object-fit: contain; 
              }
            }
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="${title}" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for image to load before printing
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }

  // Print with custom CSS
  printWithStyles(customCSS = '', options = {}) {
    const defaultOptions = {
      scale: 2,
      backgroundColor: "#FFFFFF",
      title: "Organization Chart"
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    this.exportManager.getImageDataURL(finalOptions)
      .then(dataURL => {
        this.printImageWithStyles(dataURL, customCSS, finalOptions.title);
      });
  }

  printImageWithStyles(dataURL, customCSS, title) {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            img {
              max-width: 100%;
              max-height: 100%;
              object-fit: contain;
            }
            ${customCSS}
          </style>
        </head>
        <body>
          <img src="${dataURL}" alt="${title}" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }
}