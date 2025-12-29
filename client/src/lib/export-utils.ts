import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import type { Athlete, Skill, Practice, Goal, Routine, Curriculum } from "@shared/schema";

type ExportFormat = "pdf" | "csv" | "word";

interface ExportOptions {
  title: string;
  filename: string;
  headers: string[];
  data: string[][];
}

function generateCSV(options: ExportOptions): void {
  const { headers, data, filename } = options;
  const csvContent = [
    headers.join(","),
    ...data.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
}

function generatePDF(options: ExportOptions): void {
  const { title, headers, data, filename } = options;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
  
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 40,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });
  
  doc.save(`${filename}.pdf`);
}

async function generateWord(options: ExportOptions): Promise<void> {
  const { title, headers, data, filename } = options;
  
  const tableRows = [
    new TableRow({
      children: headers.map(header => new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
        shading: { fill: "3B82F6" },
      })),
    }),
    ...data.map(row => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph({ text: cell || "" })],
      })),
    })),
  ];
  
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: `Generated on ${new Date().toLocaleDateString()}`,
          spacing: { after: 300 },
        }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
      ],
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}

export async function exportData(format: ExportFormat, options: ExportOptions): Promise<void> {
  switch (format) {
    case "csv":
      generateCSV(options);
      break;
    case "pdf":
      generatePDF(options);
      break;
    case "word":
      await generateWord(options);
      break;
  }
}

export function exportAthletes(athletes: Athlete[], format: ExportFormat): Promise<void> {
  const options: ExportOptions = {
    title: "Athletes",
    filename: "athletes",
    headers: ["Name", "Level", "Competitive System"],
    data: athletes.map(a => [a.name, a.level, a.competitiveSystem]),
  };
  return exportData(format, options);
}

export function exportSkills(skills: Skill[], format: ExportFormat): Promise<void> {
  const options: ExportOptions = {
    title: "Skills",
    filename: "skills",
    headers: ["Name", "Event", "Value", "Group", "Description"],
    data: skills.map(s => [
      s.name,
      s.event,
      s.event === "Vault" ? (s.vaultValue?.toString() || "") : (s.value || ""),
      s.skillGroup || "",
      s.description || ""
    ]),
  };
  return exportData(format, options);
}

export function exportPractices(practices: Practice[], athletes: Athlete[], format: ExportFormat): Promise<void> {
  const getTarget = (p: Practice) => {
    switch (p.targetType) {
      case "athletes":
        return p.athleteIds?.map(id => athletes.find(a => a.id === id)?.name || "Unknown").join(", ") || "";
      case "level":
        return p.levels?.join(", ") || "";
      case "group":
        return p.groupName || "";
      default:
        return "All Athletes";
    }
  };
  
  const options: ExportOptions = {
    title: "Practice Plans",
    filename: "practices",
    headers: ["Title", "Day", "Target Type", "Target", "Vault (min)", "Bars (min)", "Beam (min)", "Floor (min)", "Description"],
    data: practices.map(p => [
      p.title,
      p.dayOfWeek,
      p.targetType || "all",
      getTarget(p),
      (p.vaultMinutes || 0).toString(),
      (p.barsMinutes || 0).toString(),
      (p.beamMinutes || 0).toString(),
      (p.floorMinutes || 0).toString(),
      p.description || ""
    ]),
  };
  return exportData(format, options);
}

export function exportGoals(goals: Goal[], athletes: Athlete[], format: ExportFormat): Promise<void> {
  const options: ExportOptions = {
    title: "Goals",
    filename: "goals",
    headers: ["Title", "Athlete", "Event", "Timeframe", "Progress", "Description"],
    data: goals.map(g => [
      g.title,
      g.athleteId ? (athletes.find(a => a.id === g.athleteId)?.name || "Unknown") : "Team",
      g.linkedEvent || "General",
      g.timeframe,
      `${g.progress || 0}%`,
      g.description || ""
    ]),
  };
  return exportData(format, options);
}

export function exportRoutines(routines: Routine[], athletes: Athlete[], skills: Skill[], format: ExportFormat): Promise<void> {
  const options: ExportOptions = {
    title: "Routines",
    filename: "routines",
    headers: ["Name", "Athlete", "Event", "Skills Count", "Start Value", "Skills"],
    data: routines.map(r => {
      const routineSkills = (r.skillIds || [])
        .map(id => skills.find(s => s.id === id)?.name || "Unknown")
        .join(", ");
      return [
        r.name,
        athletes.find(a => a.id === r.athleteId)?.name || "Unknown",
        r.event,
        (r.skillIds?.length || 0).toString(),
        r.startValue?.toFixed(1) || "0.0",
        routineSkills
      ];
    }),
  };
  return exportData(format, options);
}

export function exportCurriculum(curriculum: Curriculum[], skills: Skill[], format: ExportFormat): Promise<void> {
  const options: ExportOptions = {
    title: "Curriculum",
    filename: "curriculum",
    headers: ["Program", "Level", "Event", "Skill", "Status", "Progress", "Intro Date", "Checkpoint", "Mastery Target", "Notes"],
    data: curriculum.map(c => [
      c.program,
      c.level,
      c.event,
      skills.find(s => s.id === c.skillId)?.name || "Unknown",
      c.status || "Not Started",
      `${c.progress || 0}%`,
      c.introDate || "",
      c.checkpointDate || "",
      c.masteryTargetDate || "",
      c.notes || ""
    ]),
  };
  return exportData(format, options);
}

export function exportAll(
  athletes: Athlete[],
  skills: Skill[],
  practices: Practice[],
  goals: Goal[],
  routines: Routine[],
  curriculum: Curriculum[],
  format: ExportFormat
): Promise<void> {
  const allData: string[][] = [];
  
  allData.push(["=== ATHLETES ===", "", "", "", "", ""]);
  allData.push(["Name", "Level", "System", "", "", ""]);
  athletes.forEach(a => allData.push([a.name, a.level, a.competitiveSystem, "", "", ""]));
  allData.push(["", "", "", "", "", ""]);
  
  allData.push(["=== SKILLS ===", "", "", "", "", ""]);
  allData.push(["Name", "Event", "Value", "Group", "", ""]);
  skills.forEach(s => allData.push([
    s.name,
    s.event,
    s.event === "Vault" ? (s.vaultValue?.toString() || "") : (s.value || ""),
    s.skillGroup || "",
    "",
    ""
  ]));
  allData.push(["", "", "", "", "", ""]);
  
  allData.push(["=== PRACTICES ===", "", "", "", "", ""]);
  allData.push(["Title", "Day", "Target", "Total Time", "", ""]);
  practices.forEach(p => {
    const total = (p.vaultMinutes || 0) + (p.barsMinutes || 0) + (p.beamMinutes || 0) + (p.floorMinutes || 0);
    allData.push([p.title, p.dayOfWeek, p.targetType || "all", `${total} min`, "", ""]);
  });
  allData.push(["", "", "", "", "", ""]);
  
  allData.push(["=== GOALS ===", "", "", "", "", ""]);
  allData.push(["Title", "Timeframe", "Progress", "", "", ""]);
  goals.forEach(g => allData.push([g.title, g.timeframe, `${g.progress}%`, "", "", ""]));
  allData.push(["", "", "", "", "", ""]);
  
  allData.push(["=== ROUTINES ===", "", "", "", "", ""]);
  allData.push(["Name", "Event", "Start Value", "", "", ""]);
  routines.forEach(r => allData.push([r.name, r.event, r.startValue?.toFixed(1) || "0.0", "", "", ""]));
  allData.push(["", "", "", "", "", ""]);
  
  allData.push(["=== CURRICULUM ===", "", "", "", "", ""]);
  allData.push(["Program", "Level", "Event", "Skill", "Status", "Progress"]);
  curriculum.forEach(c => {
    const skill = skills.find(s => s.id === c.skillId);
    allData.push([c.program, c.level, c.event, skill?.name || "Unknown", c.status || "Not Started", `${c.progress || 0}%`]);
  });
  
  const options: ExportOptions = {
    title: "Complete Export - Gymnastics Planner",
    filename: "gymnastics-planner-complete",
    headers: ["Col 1", "Col 2", "Col 3", "Col 4", "Col 5", "Col 6"],
    data: allData,
  };
  
  return exportData(format, options);
}
