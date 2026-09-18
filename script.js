// ================================
// My PDF Tools - Main Script
// ================================

// Load a JavaScript library only when needed
function loadLibrary(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src = url;

        script.onload = () => resolve();
        script.onerror = () => reject();

        document.head.appendChild(script);
    });
}


// ================================
// 1. PDF TO EXCEL
// ================================

document.querySelectorAll(".tool button")[0].addEventListener("click", async () => {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".pdf";

    input.onchange = async () => {

        const file = input.files[0];

        if (!file) return;

        try {

            alert("Reading PDF... Please wait.");

            await loadLibrary(
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
            );

            await loadLibrary(
                "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
            );

            pdfjsLib.GlobalWorkerOptions.workerSrc =
                "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


            const data = await file.arrayBuffer();

            const pdf = await pdfjsLib.getDocument({
                data: data
            }).promise;


            const rows = [];

            for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                const page = await pdf.getPage(pageNumber);

                const textContent = await page.getTextContent();

                const text = textContent.items
                    .map(item => item.str)
                    .join(" ");

                rows.push([`Page ${pageNumber}`]);

                rows.push([text]);

                rows.push([""]);
            }


            const worksheet = XLSX.utils.aoa_to_sheet(rows);

            const workbook = XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "PDF Data"
            );


            XLSX.writeFile(
                workbook,
                "converted-pdf.xlsx"
            );


            alert("PDF converted to Excel successfully!");


        } catch (error) {

            console.error(error);

            alert("PDF conversion failed. Please try another PDF.");

        }

    };

    input.click();

});



// ================================
// 2. IMAGE TO PDF
// ================================

document.querySelectorAll(".tool button")[1].addEventListener("click", async () => {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";


    input.onchange = async () => {

        const file = input.files[0];

        if (!file) return;


        try {

            alert("Creating PDF... Please wait.");


            await loadLibrary(
                "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
            );


            const reader = new FileReader();


            reader.onload = function(event) {

                const image = new Image();


                image.onload = function() {

                    const { jsPDF } = window.jspdf;


                    const orientation =
                        image.width > image.height
                            ? "landscape"
                            : "portrait";


                    const pdf = new jsPDF({
                        orientation: orientation,
                        unit: "px",
                        format: [image.width, image.height]
                    });


                    pdf.addImage(
                        image,
                        "JPEG",
                        0,
                        0,
                        image.width,
                        image.height
                    );


                    pdf.save("image-to-pdf.pdf");


                    alert("Image converted to PDF successfully!");

                };


                image.src = event.target.result;

            };


            reader.readAsDataURL(file);


        } catch (error) {

            console.error(error);

            alert("Image to PDF failed.");

        }

    };


    input.click();

});



// ================================
// 3. RESIZE IMAGE
// ================================
// 3. RESIZE IMAGE
const resizeInput = document.getElementById("resizeInput");
const resizeControls = document.getElementById("resizeControls");
const resizeWidth = document.getElementById("resizeWidth");
const resizeHeight = document.getElementById("resizeHeight");
const keepRatio = document.getElementById("keepRatio");
const targetSize = document.getElementById("targetSize");
const targetUnit = document.getElementById("targetUnit");
const outputFormat = document.getElementById("outputFormat");
const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const resizeBtn = document.getElementById("resizeBtn");
const resizeInfo = document.getElementById("resizeInfo");
const resizeStatus = document.getElementById("resizeStatus");

let resizeImage = null;
let originalWidth = 0;
let originalHeight = 0;

// Select image
resizeInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {

        const image = new Image();

        image.onload = function () {

            resizeImage = image;

            originalWidth = image.width;
            originalHeight = image.height;

            resizeWidth.value = image.width;
            resizeHeight.value = image.height;

            resizeControls.style.display = "block";

            resizeInfo.innerHTML =
                "Original Size: " +
                (file.size / 1024).toFixed(1) +
                " KB<br>" +
                "Original Dimensions: " +
                image.width +
                " × " +
                image.height +
                " px";

            resizeStatus.innerHTML = "";

        };

        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
});


// Keep aspect ratio
resizeWidth.addEventListener("input", function () {

    if (!keepRatio.checked || !resizeImage) return;

    const width = Number(this.value);

    if (width > 0) {
        resizeHeight.value = Math.round(
            width * originalHeight / originalWidth
        );
    }
});


resizeHeight.addEventListener("input", function () {

    if (!keepRatio.checked || !resizeImage) return;

    const height = Number(this.value);

    if (height > 0) {
        resizeWidth.value = Math.round(
            height * originalWidth / originalHeight
        );
    }
});


// Quality slider
quality.addEventListener("input", function () {

    qualityValue.textContent = this.value;

});


// PNG does not use JPEG/WebP quality
outputFormat.addEventListener("change", function () {

    if (this.value === "image/png") {

        quality.disabled = true;

        qualityValue.textContent = "N/A";

    } else {

        quality.disabled = false;

        qualityValue.textContent = quality.value;

    }
});


// Convert canvas to Blob
function canvasToBlob(canvas, format, qualityValue) {

    return new Promise(function (resolve) {

        canvas.toBlob(
            function (blob) {
                resolve(blob);
            },
            format,
            qualityValue
        );

    });
}


// Resize & Download
resizeBtn.addEventListener("click", async function () {

    if (!resizeImage) {
        alert("Please select an image first.");
        return;
    }

    const width = Number(resizeWidth.value);
    const height = Number(resizeHeight.value);

    if (!width || !height || width < 1 || height < 1) {
        alert("Please enter valid width and height.");
        return;
    }

    const format = outputFormat.value;

    let targetBytes = 0;

    if (targetSize.value) {

        const size = Number(targetSize.value);

        if (size > 0) {

            if (targetUnit.value === "KB") {
                targetBytes = size * 1024;
            } else {
                targetBytes = size * 1024 * 1024;
            }

        }
    }

    resizeStatus.innerHTML = "⏳ Processing image... Please wait.";

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    // White background for JPG
    if (format === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(
        resizeImage,
        0,
        0,
        width,
        height
    );

    let finalBlob = null;

    // JPG / WebP
    if (format !== "image/png") {

        let low = 0.05;
        let high = Number(quality.value) / 100;

        finalBlob = await canvasToBlob(
            canvas,
            format,
            high
        );

        // Try to reach target size
        if (targetBytes > 0 && finalBlob.size > targetBytes) {

            for (let i = 0; i < 10; i++) {

                const middle = (low + high) / 2;

                const blob = await canvasToBlob(
                    canvas,
                    format,
                    middle
                );

                if (blob.size > targetBytes) {

                    high = middle;

                } else {

                    low = middle;
                    finalBlob = blob;
                }
            }
        }

    } else {

        finalBlob = await canvasToBlob(
            canvas,
            format
        );
    }


    if (!finalBlob) {

        resizeStatus.innerHTML =
            "❌ Image processing failed.";

        return;
    }


    // File extension
    let extension = "jpg";

    if (format === "image/png") {
        extension = "png";
    }

    if (format === "image/webp") {
        extension = "webp";
    }


    // Download
    const url = URL.createObjectURL(finalBlob);

    const link = document.createElement("a");

    link.href = url;

    link.download = "resized-image." + extension;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    resizeStatus.innerHTML =
        "✅ Done!<br>" +
        "Dimensions: " +
        width +
        " × " +
        height +
        " px<br>" +
        "Output Size: " +
        (finalBlob.size / 1024).toFixed(1) +
        " KB";

});

console.log("My PDF Tools is ready!");

console.log("My PDF Tools is ready!");
