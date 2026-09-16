function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// PDF to Excel
const pdfInput = document.createElement("input");
pdfInput.type = "file";
pdfInput.accept = ".pdf";

document.querySelectorAll(".tool button")[0].addEventListener("click", () => {
  pdfInput.click();
});

pdfInput.addEventListener("change", async () => {
  if (!pdfInput.files.length) return;

  try {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs"
    );

    const pdfjsLib = globalThis.pdfjsLib;

    if (!pdfjsLib) {
      alert("PDF library load nohoi. Internet connection check kora.");
      return;
    }

    const file = pdfInput.files[0];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let csv = "Page,Text\n";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const text = content.items
        .map(item => item.str)
        .join(" ")
        .replace(/"/g, '""');

      csv += `${pageNum},"${text}"\n`;
    }

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, "") + ".csv";
    a.click();

    URL.revokeObjectURL(url);

    alert("PDF converted successfully! Excel/CSV file download hoi gol.");
  } catch (error) {
    console.error(error);
    alert("PDF convert koribo nuwarilu. PDF-tu check kora.");
  }
});


// Image to PDF
const imageInput = document.createElement("input");
imageInput.type = "file";
imageInput.accept = "image/*";

document.querySelectorAll(".tool button")[1].addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", async () => {
  if (!imageInput.files.length) return;

  try {
    await loadScript(
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
    );

    const { jsPDF } = window.jspdf;

    const file = imageInput.files[0];
    const imageURL = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
      const pdf = new jsPDF({
        orientation: img.width > img.height ? "landscape" : "portrait",
        unit: "px",
        format: [img.width, img.height]
      });

      pdf.addImage(img, "JPEG", 0, 0, img.width, img.height);
      pdf.save(file.name.replace(/\.[^/.]+$/, "") + ".pdf");

      URL.revokeObjectURL(imageURL);

      alert("Image PDF successfully created!");
    };

    img.src = imageURL;
  } catch (error) {
    console.error(error);
    alert("Image to PDF failed.");
  }
});


// Resize Image
const resizeInput = document.createElement("input");
resizeInput.type = "file";
resizeInput.accept = "image/*";

document.querySelectorAll(".tool button")[2].addEventListener("click", () => {
  resizeInput.click();
});

resizeInput.addEventListener("change", () => {
  if (!resizeInput.files.length) return;

  const file = resizeInput.files[0];

  const width = prompt("Enter new width in pixels:", "800");

  if (!width || isNaN(width)) return;

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const ratio = img.height / img.width;

    canvas.width = Number(width);
    canvas.height = Math.round(Number(width) * ratio);

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const downloadURL = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = downloadURL;
      a.download = "resized-" + file.name;
      a.click();

      URL.revokeObjectURL(downloadURL);
      URL.revokeObjectURL(url);

      alert("Image resized successfully!");
    }, "image/jpeg", 0.9);
  };

  img.src = url;
});
