// Mock Active Directory users — 21 corporate IT/Cloud team members (includes admin)
import { ADUser } from "@/types";

export const AD_USERS: ADUser[] = [
  {
    id: "u0",
    displayName: "Administrador Sistema",
    email: "admin@corp.com",
    department: "IT Administration",
    title: "System Administrator",
    isAdmin: true,
    phone: "+1 (555) 000-0000",
  },
  {
    id: "u1",
    displayName: "Carlos Mendoza",
    email: "c.mendoza@corp.com",
    department: "Cloud Engineering",
    title: "Senior Cloud Architect",
    phone: "+1 (555) 001-0001",
  },
  {
    id: "u2",
    displayName: "Valentina Torres",
    email: "v.torres@corp.com",
    department: "DevOps",
    title: "DevOps Engineer",
    phone: "+1 (555) 001-0002",
  },
  {
    id: "u3",
    displayName: "Andrés Ramírez",
    email: "a.ramirez@corp.com",
    department: "Cloud Engineering",
    title: "Cloud Analyst",
    phone: "+1 (555) 001-0003",
  },
  {
    id: "u4",
    displayName: "Sofia Herrera",
    email: "s.herrera@corp.com",
    department: "Security",
    title: "Cloud Security Engineer",
    phone: "+1 (555) 001-0004",
  },
  {
    id: "u5",
    displayName: "Miguel Ángel Vega",
    email: "m.vega@corp.com",
    department: "DevOps",
    title: "Senior DevOps Engineer",
    phone: "+1 (555) 001-0005",
  },
  {
    id: "u6",
    displayName: "Isabela Castillo",
    email: "i.castillo@corp.com",
    department: "QA",
    title: "QA Lead",
    phone: "+1 (555) 001-0006",
  },
  {
    id: "u7",
    displayName: "Diego Morales",
    email: "d.morales@corp.com",
    department: "Cloud Engineering",
    title: "Cloud Infrastructure Engineer",
    phone: "+1 (555) 001-0007",
  },
  {
    id: "u8",
    displayName: "Camila Rodríguez",
    email: "c.rodriguez@corp.com",
    department: "Project Management",
    title: "IT Project Manager",
    phone: "+1 (555) 001-0008",
  },
  {
    id: "u9",
    displayName: "Juan Pablo Ortiz",
    email: "jp.ortiz@corp.com",
    department: "Security",
    title: "Information Security Analyst",
    phone: "+1 (555) 001-0009",
  },
  {
    id: "u10",
    displayName: "Lucía Fernández",
    email: "l.fernandez@corp.com",
    department: "Cloud Engineering",
    title: "FinOps Engineer",
    phone: "+1 (555) 001-0010",
  },
  {
    id: "u11",
    displayName: "Roberto Guzmán",
    email: "r.guzman@corp.com",
    department: "DevOps",
    title: "Site Reliability Engineer",
    phone: "+1 (555) 001-0011",
  },
  {
    id: "u12",
    displayName: "Martina López",
    email: "m.lopez@corp.com",
    department: "QA",
    title: "Automation QA Engineer",
    phone: "+1 (555) 001-0012",
  },
  {
    id: "u13",
    displayName: "Felipe Jiménez",
    email: "f.jimenez@corp.com",
    department: "Cloud Engineering",
    title: "Data Engineer",
    phone: "+1 (555) 001-0013",
  },
  {
    id: "u14",
    displayName: "Ana Lucía Vargas",
    email: "al.vargas@corp.com",
    department: "Security",
    title: "IAM Specialist",
    phone: "+1 (555) 001-0014",
  },
  {
    id: "u15",
    displayName: "Sebastián Navarro",
    email: "s.navarro@corp.com",
    department: "Cloud Engineering",
    title: "Cloud Solutions Architect",
    phone: "+1 (555) 001-0015",
  },
  {
    id: "u16",
    displayName: "Daniela Aguilar",
    email: "d.aguilar@corp.com",
    department: "Project Management",
    title: "Scrum Master",
    phone: "+1 (555) 001-0016",
  },
  {
    id: "u17",
    displayName: "Tomás Reyes",
    email: "t.reyes@corp.com",
    department: "DevOps",
    title: "Kubernetes Engineer",
    phone: "+1 (555) 001-0017",
  },
  {
    id: "u18",
    displayName: "Gabriela Soto",
    email: "g.soto@corp.com",
    department: "Security",
    title: "Compliance Analyst",
    phone: "+1 (555) 001-0018",
  },
  {
    id: "u19",
    displayName: "Nicolás Pinto",
    email: "n.pinto@corp.com",
    department: "Cloud Engineering",
    title: "Cloud Database Administrator",
    phone: "+1 (555) 001-0019",
  },
  {
    id: "u20",
    displayName: "Alejandra Mora",
    email: "a.mora@corp.com",
    department: "Project Management",
    title: "IT Director",
    phone: "+1 (555) 001-0020",
  },
];

// Deterministic status from user ID number
export function getUserStatus(id: string): "online" | "away" | "offline" {
  const n = parseInt(id.replace(/\D/g, "")) || 0;
  const statuses: ("online" | "away" | "offline")[] = ["online", "online", "away", "online", "away", "online", "offline", "away", "online", "online", "away", "offline", "online", "online", "away", "online", "offline", "online", "away", "online", "online"];
  return statuses[n % statuses.length] ?? "offline";
}

export const CURRENT_AD_USER = AD_USERS[3]; // Andrés Ramírez — Cloud Analyst (u3)
export const ADMIN_USER = AD_USERS[0]; // System Administrator (u0)
