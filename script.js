// Load required libraries
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

async function loadLibraries() {
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
    await loadScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

loadLibraries().then(() => {
    console.log("Libraries loaded successfully");

    const buttons = document.querySelectorAll(".tool button");

    // -------------------------------
    // 1. PDF TO EXCEL
    // -------------------------------
    buttons[0].addEventListener("click", async () => {

        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";

        input.onchange = async () => {
            const file = input.files[0];

            if (!file) return;

            try {
                alert("Reading PDF... Please wait.");

                const arrayBuffer = await file.arrayBuffer();

                const pdf = await pdfjsLib.getDocument({
                    data: arrayBuffer
                }).promise;

                const rows = [];

                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

                    const page = await pdf.getPage(pageNumber);
                    const textContent = await page.getTextContent();

                    let pageText = "";

                    textContent.items.forEach(item => {
                        pageText += item.str + " ";
                    });

                    rows.push([`Page ${pageNumber}`]);
                    rows.push([pageText.trim()]);
                    rows.push([""]);
                }

                const worksheet = XLSX.utils.aoa_to_sheet(rows);
                const workbook = XLSX.utils.book_new();

                XLSX.utils.book_append_sheet(
                    workbook,
                    worksheet,
                    "PDF Data"
                );

                XLSX.writeFile(workbook, "converted-pdf.xlsx");

                alert("PDF converted to Excel successfully!");

            } catch (error) {
                console.error(error);
                alert("Could not convert this PDF.");
            }
        };

        input.click();
    });


    // -------------------------------
    // 2. IMAGE TO PDF
    // -------------------------------
    buttons[1].addEventListener("click", () => {

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

                    const { jsPDF } = window.jspdf;

                    const pdf = new jsPDF({
                        orientation: image.width > image.height
                            ? "landscape"
                            : "portrait",
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
        };

        input.click();
    });


    // -------------------------------
    // 3. RESIZE IMAGE
    // -------------------------------
    buttons[2].addEventListener("click", () => {

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

                    const newWidth = prompt(
                        `Current width: ${image.width}px\n\nEnter new width in pixels:`,
                        image.width
                    );

                    if (!newWidth || isNaN(newWidth)) {
                        return;
                    }

                    const width = Number(newWidth);

                    const height =
                        Math.round(image.height * (width / image.width));

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

                    canvas.toBlob(blob => {

                        const url = URL.createObjectURL(blob);

                        const link = document.createElement("a");

                        link.href = url;
                        link.download = "resized-image.jpg";

                        link.click();

                        URL.revokeObjectURL(url);

                        alert("Image resized successfully!");

                    }, "image/jpeg", 0.9);
                };

                image.src = event.target.result;
            };

            reader.readAsDataURL(file);
        };

        input.click();
    });

}).catch(error => {
    console.error(error);
    alert("Some tools could not be loaded.");
});
