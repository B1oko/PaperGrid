// Dimensions in millimetres of A4 size
const PAGE_SIZES = {
    'A1': [594, 841],
    'A2': [420, 594],
    'A3': [297, 420],
    'A4': [210, 297],
    'A5': [148, 210]
}
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// Convert mm to pixels (96 dpi = 96 pixels per inch)
const MM_TO_PX = 96 / 25.4;  // 1 pulgada = 25.4 mm

// Get DOM elements
const canvas = document.getElementById('gridCanvas');
const ctx = canvas.getContext('2d');

// Controls
const pageSize = document.getElementById('pageSize');
const portrait = document.getElementById('portrait');
const landscape = document.getElementById('landscape');
const gridType = document.getElementById('gridType');
const gridSize = document.getElementById('gridSize');
const gridSizeValueSpan = document.getElementById('gridSizeValueSpan');
const gridMargin = document.getElementById('gridMargin');
const gridMarginValueSpan = document.getElementById('gridMarginValueSpan');
const backgroundColor = document.getElementById('backgroundColor');
const lineColor = document.getElementById('lineColor');
const lineThickness = document.getElementById('lineThickness');
const lineThicknessValueSpan = document.getElementById('lineThicknessValueSpan');
const PDFDownloadBtn = document.getElementById('PDFDownloadBtn');
const PNGDownloadBtn = document.getElementById('PNGDownloadBtn');

// Function to draw grid
function drawGrid(gridType, gridSize, gridMargin, backgroundColor, lineColor, lineThickness) {
    const width = canvas.width;
    const height = canvas.height;
    const gridSizePx = gridSize * MM_TO_PX;
    const gridMarginPx = gridMargin * MM_TO_PX;

    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw borders
    if (gridMargin != 0 && gridType != 'lines' && gridType != 'dots') {
        
        ctx.lineCap = 'round';
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = Number(lineThickness)+1;
    
        ctx.beginPath();
        ctx.moveTo(gridMarginPx, gridMarginPx);
        ctx.lineTo((width - gridMarginPx), gridMarginPx);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(gridMarginPx, (height - gridMarginPx));
        ctx.lineTo((width - gridMarginPx), (height - gridMarginPx));
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(gridMarginPx, gridMarginPx);
        ctx.lineTo(gridMarginPx, (height - gridMarginPx));
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo((width - gridMarginPx), gridMarginPx);
        ctx.lineTo((width - gridMarginPx), (height - gridMarginPx));
        ctx.stroke();
    
    }

    // Draw grid
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;

    if (gridType === 'squares') {
        ctx.lineCap = 'square';
        
        // Vertical
        for (let x = gridMarginPx; x <= (width - gridMarginPx +1); x += gridSizePx) {
            ctx.beginPath();
            ctx.moveTo(x, gridMarginPx);
            ctx.lineTo(x, (height - gridMarginPx));
            ctx.stroke();
        }

        // Horizontal
        for (let y = gridMarginPx; y <= (height - gridMarginPx +1); y += gridSizePx) {
            ctx.beginPath();
            ctx.moveTo(gridMarginPx, y);
            ctx.lineTo((width - gridMarginPx), y);
            ctx.stroke();
        }

    } else if (gridType === 'dots') {
        ctx.fillStyle = lineColor;
        for (let x = gridMarginPx; x <= (width - gridMarginPx +1); x += gridSizePx) {
            for (let y = gridMarginPx; y <= (height - gridMarginPx +1); y += gridSizePx) {
                ctx.beginPath();
                ctx.arc(x, y, lineThickness, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    // } else if (gridType === 'isometric') {
    //     const triHeight = gridSizePx;
    //     const triSide = 2 * triHeight / Math.sqrt(3);
        
    //     for (let x = gridMarginPx; x <= (width - gridMarginPx); x += triHeight) {
    //         ctx.beginPath();
    //         ctx.moveTo(x, gridMarginPx);
    //         ctx.lineTo((width - gridMarginPx), (width - gridMarginPx - x) * triSide / (2*triHeight) + gridMarginPx);
    //         ctx.stroke();
    //     }
        
    //     for (let y = gridMarginPx; y <= (height - gridMarginPx); y += triSide) {
    //         ctx.beginPath();
    //         ctx.moveTo(gridMarginPx, y);
    //         ctx.lineTo((width - gridMarginPx), y + (width - gridMarginPx - y) * triSide / (2*triHeight) + gridMarginPx);
    //         ctx.stroke();
    //     }

    } else if (gridType === 'lines') {
        ctx.lineCap = 'round';
        for (let y = gridMarginPx; y <= (height - gridMarginPx +1); y += gridSizePx) {
            ctx.beginPath();
            ctx.moveTo(gridMarginPx, y);
            ctx.lineTo((width - gridMarginPx), y);
            ctx.stroke();
        }
    }

}


function downloadPNG() {
    const orientationValue = document.querySelector('input[name="orientation"]:checked').value.toLowerCase();
    const gridTypeValue = gridType.value.toLowerCase();
    const gridSizeValue = gridSize.value.toLowerCase();
    const pageSizeValue = pageSize.value.toLowerCase();

    const link = document.createElement('a');
    link.download = `${orientationValue}_${gridTypeValue}_${pageSizeValue}_${gridSizeValue}mm.png`
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function downloadPDF() {
    const orientationValue = document.querySelector('input[name="orientation"]:checked').value.toLowerCase();
    const pageSizeValue = pageSize.value.toLowerCase();
    const gridTypeValue = gridType.value.toLowerCase();
    const gridSizeValue = gridSize.value.toLowerCase();

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF(orientationValue, 'pt', pageSizeValue);
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate the ratio to adjust the canvas size to the page size
    const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);

    // Scaling canvas size with the ratio
    const canvasScaledWidth = canvasWidth * ratio;
    const canvasScaledHeight = canvasHeight * ratio;
   
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvasScaledWidth, canvasScaledHeight);
    pdf.save(`${orientationValue}_${gridTypeValue}_${gridSizeValue}_${pageSizeValue}.pdf`);
}


// Función para actualizar la cuadrícula cuando se cambian los controles
function updateGrid() {
    const gridSizeValue = gridSize.value;
    const gridMarginValue = gridMargin.value;
    const lineThicknessValue = lineThickness.value;
    const backgroundColorValue = backgroundColor.value;
    const lineColorValue = lineColor.value;
    const gridTypeValue = gridType.value;

    gridSizeValueSpan.textContent = gridSizeValue + " mm";
    gridMarginValueSpan.textContent = gridMarginValue + " mm";
    lineThicknessValueSpan.textContent = lineThicknessValue + " px";

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(gridTypeValue, gridSizeValue, gridMarginValue, backgroundColorValue, lineColorValue, lineThicknessValue);
}

function updateCanvas() {
    const orientationValue = document.querySelector('input[name="orientation"]:checked').value;
    const pageSizeValue = pageSize.value
    const WIDTH_MM = PAGE_SIZES[pageSizeValue][0]
    const HEIGHT_MM = PAGE_SIZES[pageSizeValue][1]

    if (orientationValue == 'portrait') {
        canvas.width = WIDTH_MM * MM_TO_PX;
        canvas.height = HEIGHT_MM * MM_TO_PX;
    } else {
        canvas.width = HEIGHT_MM * MM_TO_PX;
        canvas.height = WIDTH_MM * MM_TO_PX;
    }

    updateGrid()
}


// Events to update the grid when controls change
pageSize.addEventListener('input', updateCanvas);
portrait.addEventListener('input', updateCanvas);
landscape.addEventListener('input', updateCanvas);
gridType.addEventListener('input', updateGrid);
gridSize.addEventListener('input', updateGrid);
gridMargin.addEventListener('input', updateGrid);
backgroundColor.addEventListener('input', updateGrid);
lineColor.addEventListener('input', updateGrid);
lineThickness.addEventListener('input', updateGrid);
PNGDownloadBtn.addEventListener('click', downloadPNG);
PDFDownloadBtn.addEventListener('click', downloadPDF);


// Function for color picking

function setBackgroundColor(color) {
    document.getElementById('backgroundColor').value = color;
    updateGrid()
}

function setLineColor(color) {
    document.getElementById('lineColor').value = color;
    updateGrid()
}

// Intial canvas draw
updateCanvas()