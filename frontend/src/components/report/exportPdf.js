import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportPdf(container, filename) {
  const pages = container.querySelectorAll("[data-pdf-page]");
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = 210, H = 297, M = 8;
  const bg = getComputedStyle(document.body).backgroundColor;
  const [br, bgc, bb] = bg.match(/\d+/g).map(Number);
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: bg, useCORS: true, logging: false });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    let w = W - M * 2;
    let h = (canvas.height * w) / canvas.width;
    if (h > H - M * 2) {
      h = H - M * 2;
      w = (canvas.width * h) / canvas.height;
    }
    if (i > 0) pdf.addPage();
    pdf.setFillColor(br, bgc, bb);
    pdf.rect(0, 0, W, H, "F");
    pdf.addImage(img, "JPEG", (W - w) / 2, M, w, h);
  }
  pdf.save(filename);
}
