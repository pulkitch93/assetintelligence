import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'png';

interface ExportButtonProps {
  data: any[];
  filename: string;
  formats?: ExportFormat[];
  className?: string;
}

export const ExportButton = ({ 
  data, 
  filename, 
  formats = ['csv', 'excel', 'pdf'], 
  className 
}: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would:
      // 1. Format the data according to the export type
      // 2. Generate the file (CSV, Excel, PDF, etc.)
      // 3. Trigger download
      
      const exportActions = {
        csv: () => exportToCSV(data, filename),
        excel: () => exportToExcel(data, filename),
        pdf: () => exportToPDF(data, filename),
        png: () => exportToPNG(filename)
      };

      await exportActions[format]();
      
      toast({
        title: "Export successful",
        description: `${filename}.${format} has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the data",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(','))
    ].join('\n');
    
    downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  };

  const exportToExcel = (data: any[], filename: string) => {
    // Simulate Excel export
    console.log('Exporting to Excel:', filename);
  };

  const exportToPDF = (data: any[], filename: string) => {
    // Simulate PDF export
    console.log('Exporting to PDF:', filename);
  };

  const exportToPNG = (filename: string) => {
    // Simulate PNG export (screenshot)
    console.log('Exporting to PNG:', filename);
  };

  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const formatIcons = {
    csv: FileSpreadsheet,
    excel: FileSpreadsheet,
    pdf: FileText,
    png: Image
  };

  const formatLabels = {
    csv: 'CSV',
    excel: 'Excel',
    pdf: 'PDF Report',
    png: 'PNG Image'
  };

  if (formats.length === 1) {
    const format = formats[0];
    const Icon = formatIcons[format];
    
    return (
      <Button
        onClick={() => handleExport(format)}
        disabled={isExporting}
        className={className}
      >
        <Icon className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : `Export ${formatLabels[format]}`}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button disabled={isExporting} className={className}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => {
          const Icon = formatIcons[format];
          return (
            <DropdownMenuItem
              key={format}
              onClick={() => handleExport(format)}
              className="flex items-center"
            >
              <Icon className="h-4 w-4 mr-2" />
              Export as {formatLabels[format]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};