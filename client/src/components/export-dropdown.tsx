import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet, FileType } from "lucide-react";

interface ExportDropdownProps {
  onExport: (format: "pdf" | "csv" | "word") => void;
  disabled?: boolean;
}

export function ExportDropdown({ onExport, disabled }: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={disabled} data-testid="button-export">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onExport("pdf")} data-testid="button-export-pdf">
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("csv")} data-testid="button-export-csv">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport("word")} data-testid="button-export-word">
          <FileType className="h-4 w-4 mr-2" />
          Export as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
