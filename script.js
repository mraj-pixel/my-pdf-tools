const pdfInput = document.createElement("input");
pdfInput.type = "file";
pdfInput.accept = ".pdf";

document.querySelectorAll(".tool button")[0].addEventListener("click", () => {
    pdfInput.click();
});

pdfInput.addEventListener("change", () => {
    if (pdfInput.files.length > 0) {
        alert("PDF selected: " + pdfInput.files[0].name);
    }
});
