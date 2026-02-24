import React, { useState } from 'react';
import { Button } from './ui/button';
import { Download, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = title ? `${title}.pdf` : 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleViewInNewTab = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Read Book</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewInNewTab}
            className="min-h-[44px]"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="min-h-[44px]"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        </div>
      </div>

      <div className="w-full bg-muted rounded-lg overflow-hidden">
        <iframe
          src={pdfUrl}
          className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] border-0"
          title={title || 'PDF Document'}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center">
        If the PDF doesn't display, try opening it in a new tab or downloading it.
      </p>
    </div>
  );
}
