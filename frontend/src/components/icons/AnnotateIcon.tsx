import { createLucideIcon } from "lucide-react";

const AnnotateIcon = createLucideIcon("annotate", [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "box" }],
  ["path", { d: "M9 8h6", key: "line-1" }],
  ["path", { d: "M9 12h6", key: "line-2" }],
  ["path", { d: "M9 16h4", key: "line-3" }],
]);

export default AnnotateIcon;
