import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export async function exportPdf(container, filename) {
  const pages = container.querySelectorAll("[data-pdf-page]");
  const W = 210, M = 8;
  const bg = getComputedStyle(document.body).backgroundColor;
  const [br, bgc, bb] = bg.match(/\d+/g).map(Number);
  let pdf = null;
  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: bg, useCORS: true, logging: false });
    const img = canvas.toDataURL("image/jpeg", 0.92);
    const w = W - M * 2;
    const h = (canvas.height * w) / canvas.width;
    const H = h + M * 2;
    const orient = H >= W ? "portrait" : "landscape";
    if (!pdf) pdf = new jsPDF({ unit: "mm", format: [W, H], orientation: orient });
    else pdf.addPage([W, H], orient);
    pdf.setFillColor(br, bgc, bb);
    pdf.rect(0, 0, W, H, "F");
    pdf.addImage(img, "JPEG", M, M, w, h);
  }
  pdf.save(filename);
}
