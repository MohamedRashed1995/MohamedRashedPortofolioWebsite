/**
 * Robust CV Download & Preview Utility
 * Handles sandboxed iframe constraints, blob conversion, and safe file downloading.
 */

export async function downloadCvPdf(filename = 'Mohamed_Rashed_CV.pdf'): Promise<boolean> {
  const pdfUrl = `/Mohamed_Rashed_CV.pdf`;

  try {
    const response = await fetch(pdfUrl, {
      headers: {
        'Accept': 'application/pdf',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    // Ensure correct MIME type
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    }, 500);

    return true;
  } catch (error) {
    console.warn('Direct blob download failed, falling back to window.open:', error);
    try {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
      return true;
    } catch {
      return false;
    }
  }
}
