import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, FileText, ExternalLink } from 'lucide-react';
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <FileText className="h-5 w-5" />
            {title || 'PDF Document'}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewInNewTab}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/30 rounded-lg p-4">
          <iframe
            src={pdfUrl}
            className="w-full h-[600px] rounded border-0"
            title={title || 'PDF Document'}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          If the PDF doesn't display, try opening it in a new tab or downloading it.
        </p>
      </CardContent>
    </Card>
  );
}
