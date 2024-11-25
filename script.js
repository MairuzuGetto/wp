async function processImage(imageSrc) {
    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
        // Resize image for mobile (max width 1024px)
        const maxWidth = 1024;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Load OpenCV.js Mat
        const src = cv.imread(canvas);
        const gray = new cv.Mat();
        const gammaCorrected = new cv.Mat();

        // Convert to grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

        // Apply gamma correction
        const gamma = 0.3;
        const lookupTable = new cv.Mat(1, 256, cv.CV_8U);
        for (let i = 0; i < 256; i++) {
            lookupTable.data[i] = Math.min(255, Math.pow(i / 255, gamma) * 255);
        }
        cv.LUT(gray, lookupTable, gammaCorrected);
        lookupTable.delete();

        // Thresholding
        const thresh = new cv.Mat();
        cv.threshold(gammaCorrected, thresh, 60, 255, cv.THRESH_BINARY);

        // Find contours
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
        cv.findContours(thresh, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

        // Find largest contour
        let maxArea = 0;
        let largestContour = null;
        for (let i = 0; i < contours.size(); i++) {
            const area = cv.contourArea(contours.get(i));
            if (area > maxArea) {
                maxArea = area;
                largestContour = contours.get(i);
            }
        }

        // Mask and crop
        if (largestContour) {
            const mask = new cv.Mat.zeros(thresh.rows, thresh.cols, cv.CV_8UC1);
            cv.drawContours(mask, contours, contours.indexOf(largestContour), new cv.Scalar(255), -1);

            const boundingRect = cv.boundingRect(largestContour);
            const cropped = gammaCorrected.roi(boundingRect);

            // Draw the cropped image
            const newCanvas = document.createElement('canvas');
            newCanvas.width = cropped.cols;
            newCanvas.height = cropped.rows;
            cv.imshow(newCanvas, cropped);
            document.body.appendChild(newCanvas);

            // OCR using Tesseract.js
            const croppedImageData = newCanvas.toDataURL();
            const worker = Tesseract.createWorker();
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(croppedImageData);
            output.textContent = text;
            await worker.terminate();
        }

        // Clean up
        src.delete();
        gray.delete();
        gammaCorrected.delete();
        thresh.delete();
        contours.delete();
        hierarchy.delete();
    };
}
