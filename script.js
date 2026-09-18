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

document.querySelectorAll(".tool button")[2].addEventListener("click", () => {

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {

        const file = input.files[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(event) {

            const image = new Image();

            image.onload = function() {

                const originalWidth = image.width;
                const originalHeight = image.height;

                const newWidth = prompt(
                    "Enter new width in pixels:",
                    originalWidth
                );

                if (!newWidth || isNaN(newWidth) || Number(newWidth) <= 0) {
                    alert("Please enter a valid width.");
                    return;
                }

                const width = Number(newWidth);

                const newHeight = prompt(
                    "Enter new height in pixels (Cancel = keep ratio):",
                    Math.round(originalHeight * (width / originalWidth))
                );

                let height;

                if (newHeight === null || newHeight === "") {
                    height = Math.round(
                        originalHeight * (width / originalWidth)
                    );
                } else {

                    if (isNaN(newHeight) || Number(newHeight) <= 0) {
                        alert("Please enter a valid height.");
                        return;
                    }

                    height = Number(newHeight);
                }

                const canvas = document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(
                    image,
                    0,
                    0,
                    width,
                    height
                );

                const quality = prompt(
                    "Enter image quality (1-100):",
                    "85"
                );

                let imageQuality = Number(quality);

                if (isNaN(imageQuality) || imageQuality < 1 || imageQuality > 100) {
                    imageQuality = 85;
                }

                canvas.toBlob((blob) => {

                    const url = URL.createObjectURL(blob);

                    const link = document.createElement("a");

                    link.href = url;

                    link.download = "resized-image.jpg";

                    link.click();

                    URL.revokeObjectURL(url);

                    const sizeKB = (blob.size / 1024).toFixed(2);
                    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);

                    alert(
                        "Image resized successfully!\n\n" +
                        "Width: " + width + " px\n" +
                        "Height: " + height + " px\n" +
                        "Size: " + sizeKB + " KB (" + sizeMB + " MB)"
                    );

                }, "image/jpeg", imageQuality / 100);

            };

            image.src = event.target.result;

        };

        reader.readAsDataURL(file);

    };

    input.click();

});
console.log("My PDF Tools is ready!");
