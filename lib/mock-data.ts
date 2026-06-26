// Default Kanban cards — cloud analyst tasks with realistic corporate data
import { addDays, subDays } from "date-fns";
import { CardType } from "@/types";
import { AD_USERS, CURRENT_AD_USER } from "./ad-mock";

// AD_USERS indices: 0=Admin,1=Carlos,2=Valentina,3=Andrés(CURRENT),4=Sofia,5=Miguel,
// 6=Isabela,7=Diego,8=Camila,9=JuanPablo,10=Lucía,11=Roberto,12=Martina,
// 13=Felipe,14=AnaLucía,15=Sebastián,16=Daniela,17=Tomás,18=Gabriela,
// 19=Nicolás,20=Alejandra

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const DEFAULT_CARDS: CardType[] = [
  {
    id: "card-1",
    title: "Calcular precios de copias de seguridad de datos",
    column: "todo",
    priority: "high",
    description:
      "Evaluar los costos actuales de almacenamiento de backups en GCP Cloud Storage y proponer un plan de optimización para reducir el gasto mensual.",
    labels: [
      { id: "l1", name: "GCP", color: "#4285F4" },
      { id: "l2", name: "Storage", color: "#7b8d1c" },
      { id: "l3", name: "FinOps", color: "#073c81" },
    ],
    dueDate: iso(addDays(now, 5)),
    checklists: [
      {
        id: "cl-1",
        title: "Tareas de análisis",
        items: [
          { id: "ci-1", text: "Exportar informe de costos de GCS del último trimestre", completed: true },
          { id: "ci-2", text: "Identificar buckets con datos sin acceso > 90 días", completed: true },
          { id: "ci-3", text: "Comparar precios de Nearline vs Coldline vs Archive", completed: false },
          { id: "ci-4", text: "Calcular ahorro potencial con lifecycle policies", completed: false },
          { id: "ci-5", text: "Presentar propuesta al equipo de FinOps", completed: false },
        ],
      },
    ],
    assignees: [CURRENT_AD_USER, AD_USERS[10]], // Andrés + Lucía
    createdAt: iso(subDays(now, 10)),
    updatedAt: iso(subDays(now, 2)),
  },
  {
    id: "card-2",
    title: "Revisión mensual de infraestructura cloud",
    column: "doing",
    priority: "medium",
    description:
      "Revisión integral de todos los recursos cloud activos en AWS y GCP para detectar recursos huérfanos, configuraciones incorrectas y oportunidades de ahorro.",
    labels: [
      { id: "l4", name: "AWS", color: "#FF9900" },
      { id: "l5", name: "Review", color: "#073c81" },
    ],
    dueDate: iso(addDays(now, 2)),
    checklists: [
      {
        id: "cl-2",
        title: "Checklist de revisión",
        items: [
          { id: "ci-6", text: "Revisar instancias EC2 sin etiquetas de proyecto", completed: true },
          { id: "ci-7", text: "Verificar Security Groups con reglas demasiado permisivas", completed: true },
          { id: "ci-8", text: "Auditar IAM roles no utilizados en los últimos 30 días", completed: false },
          { id: "ci-9", text: "Generar reporte de Trusted Advisor", completed: false },
        ],
      },
    ],
    assignees: [CURRENT_AD_USER, AD_USERS[1]], // Andrés + Carlos
    createdAt: iso(subDays(now, 5)),
    updatedAt: iso(subDays(now, 1)),
  },
  {
    id: "card-3",
    title: "Auditoría de facturación de GCP — Q2",
    column: "todo",
    priority: "critical",
    description:
      "Análisis exhaustivo de la facturación de Google Cloud Platform del segundo trimestre. Identificar anomalías de gasto y reconciliar con los presupuestos aprobados.",
    labels: [
      { id: "l6", name: "GCP", color: "#4285F4" },
      { id: "l7", name: "Billing", color: "#dc2626" },
    ],
    dueDate: iso(subDays(now, 3)), // overdue
    assignees: [CURRENT_AD_USER, AD_USERS[10]], // Andrés + Lucía
    createdAt: iso(subDays(now, 15)),
    updatedAt: iso(subDays(now, 3)),
  },
  {
    id: "card-4",
    title: "Despliegue de scripts de automatización Terraform",
    column: "doing",
    priority: "high",
    description:
      "Implementar y desplegar los módulos Terraform para la creación automatizada de entornos de desarrollo y staging en AWS, siguiendo las políticas de IaC del equipo.",
    labels: [
      { id: "l8", name: "Terraform", color: "#7B42BC" },
      { id: "l9", name: "IaC", color: "#073c81" },
    ],
    dueDate: iso(addDays(now, 8)),
    checklists: [
      {
        id: "cl-3",
        title: "Módulos Terraform",
        items: [
          { id: "ci-10", text: "Módulo VPC con subnets públicas y privadas", completed: true },
          { id: "ci-11", text: "Módulo EKS cluster con node groups", completed: true },
          { id: "ci-12", text: "Módulo RDS Multi-AZ con réplicas de lectura", completed: false },
          { id: "ci-13", text: "Módulo de roles IAM y políticas", completed: false },
          { id: "ci-14", text: "Pipeline CI/CD para validación de Terraform", completed: false },
        ],
      },
    ],
    assignees: [AD_USERS[5], AD_USERS[2]], // Miguel + Valentina
    createdAt: iso(subDays(now, 8)),
    updatedAt: iso(subDays(now, 1)),
  },
  {
    id: "card-5",
    title: "Migrar workloads legacy a contenedores",
    column: "backlog",
    priority: "medium",
    description:
      "Análisis y planificación para la migración de las aplicaciones monolíticas legacy a arquitectura de microservicios en contenedores Docker orquestados con Kubernetes.",
    labels: [
      { id: "l10", name: "Docker", color: "#2496ED" },
      { id: "l11", name: "K8s", color: "#326CE5" },
    ],
    dueDate: iso(addDays(now, 30)),
    checklists: [
      {
        id: "cl-4",
        title: "Fases de migración",
        items: [
          { id: "ci-15", text: "Inventariar aplicaciones candidatas para containerización", completed: true },
          { id: "ci-16", text: "Definir arquitectura de microservicios objetivo", completed: false },
          { id: "ci-17", text: "Crear Dockerfiles y validar en local", completed: false },
          { id: "ci-18", text: "Desplegar en cluster de staging de K8s", completed: false },
        ],
      },
    ],
    assignees: [AD_USERS[17], AD_USERS[7]], // Tomás + Diego
    createdAt: iso(subDays(now, 20)),
    updatedAt: iso(subDays(now, 5)),
  },
  {
    id: "card-6",
    title: "Configurar alertas de presupuesto en AWS",
    column: "todo",
    priority: "high",
    description:
      "Configurar AWS Budgets con alertas automáticas por email y SNS cuando el gasto supere el 80% y el 100% del presupuesto mensual asignado por equipo.",
    labels: [
      { id: "l12", name: "AWS", color: "#FF9900" },
      { id: "l13", name: "Cost", color: "#7b8d1c" },
    ],
    dueDate: iso(addDays(now, 3)),
    assignees: [CURRENT_AD_USER],
    createdAt: iso(subDays(now, 3)),
    updatedAt: iso(subDays(now, 1)),
  },
  {
    id: "card-7",
    title: "Revisar SLAs de proveedores de nube",
    column: "backlog",
    priority: "low",
    description:
      "Revisar y documentar los SLAs actuales de AWS, GCP y Azure para los servicios críticos de la organización y comparar con los compromisos de disponibilidad requeridos.",
    labels: [{ id: "l14", name: "Governance", color: "#7b8d1c" }],
    dueDate: iso(addDays(now, 45)),
    assignees: [CURRENT_AD_USER, AD_USERS[8]], // Andrés + Camila
    createdAt: iso(subDays(now, 30)),
    updatedAt: iso(subDays(now, 10)),
  },
  {
    id: "card-8",
    title: "Documentar arquitectura multi-cloud",
    column: "backlog",
    priority: "medium",
    description:
      "Crear diagramas de arquitectura actualizados de la infraestructura multi-cloud usando draw.io y documentar los flujos de datos entre AWS, GCP y sistemas on-premise.",
    labels: [{ id: "l15", name: "Docs", color: "#6366F1" }],
    dueDate: iso(addDays(now, 20)),
    assignees: [CURRENT_AD_USER, AD_USERS[15]], // Andrés + Sebastián
    createdAt: iso(subDays(now, 12)),
    updatedAt: iso(subDays(now, 4)),
  },
  {
    id: "card-9",
    title: "Optimizar instancias EC2 subutilizadas",
    column: "doing",
    priority: "medium",
    description:
      "Analizar métricas de CloudWatch de las últimas 4 semanas para identificar instancias con uso promedio de CPU < 10% y proponer right-sizing o terminación.",
    labels: [
      { id: "l16", name: "AWS", color: "#FF9900" },
      { id: "l17", name: "Cost", color: "#7b8d1c" },
    ],
    dueDate: iso(addDays(now, 7)),
    checklists: [
      {
        id: "cl-5",
        title: "Proceso de optimización",
        items: [
          { id: "ci-19", text: "Exportar métricas de uso de CPU de las últimas 4 semanas", completed: true },
          { id: "ci-20", text: "Identificar instancias con CPU < 10% promedio", completed: true },
          { id: "ci-21", text: "Validar con dueños de aplicación antes de modificar", completed: false },
          { id: "ci-22", text: "Aplicar right-sizing en instancias aprobadas", completed: false },
        ],
      },
    ],
    assignees: [CURRENT_AD_USER, AD_USERS[10]], // Andrés + Lucía
    createdAt: iso(subDays(now, 6)),
    updatedAt: iso(subDays(now, 1)),
  },
  {
    id: "card-10",
    title: "Validar backup diario de bases de datos RDS",
    column: "done",
    priority: "high",
    description:
      "Verificar que los snapshots automáticos de RDS se están generando correctamente y que el proceso de restauración puede completarse dentro del RTO definido de 4 horas.",
    labels: [
      { id: "l18", name: "AWS", color: "#FF9900" },
      { id: "l19", name: "Backup", color: "#7b8d1c" },
    ],
    dueDate: iso(subDays(now, 1)),
    assignees: [AD_USERS[19]], // Nicolás (DBA)
    createdAt: iso(subDays(now, 7)),
    updatedAt: iso(subDays(now, 1)),
  },
  {
    id: "card-11",
    title: "Presentar reporte de costos cloud — Dirección",
    column: "done",
    priority: "critical",
    description:
      "Preparar y presentar el informe ejecutivo de costos cloud del semestre ante la Dirección, incluyendo comparativa vs presupuesto, tendencias y plan de optimización.",
    labels: [
      { id: "l20", name: "GCP", color: "#4285F4" },
      { id: "l21", name: "AWS", color: "#FF9900" },
    ],
    dueDate: iso(subDays(now, 5)),
    assignees: [CURRENT_AD_USER, AD_USERS[20]], // Andrés + Alejandra
    createdAt: iso(subDays(now, 14)),
    updatedAt: iso(subDays(now, 5)),
  },
  {
    id: "card-12",
    title: "Implementar políticas IAM mínimo privilegio",
    column: "todo",
    priority: "high",
    description:
      "Revisar y reconfigurar todas las políticas IAM de AWS y GCP para adherirse al principio de mínimo privilegio, eliminando permisos wildcard y accesos innecesarios.",
    labels: [
      { id: "l22", name: "Security", color: "#dc2626" },
      { id: "l23", name: "IAM", color: "#073c81" },
    ],
    dueDate: iso(addDays(now, 14)),
    checklists: [
      {
        id: "cl-6",
        title: "Hardening IAM",
        items: [
          { id: "ci-23", text: "Auditar políticas con permisos *:* en AWS", completed: true },
          { id: "ci-24", text: "Identificar service accounts con roles de Editor en GCP", completed: false },
          { id: "ci-25", text: "Crear políticas granulares por función de trabajo", completed: false },
          { id: "ci-26", text: "Validar con el equipo de Security antes de aplicar", completed: false },
          { id: "ci-27", text: "Desplegar cambios con ventana de mantenimiento", completed: false },
        ],
      },
    ],
    assignees: [CURRENT_AD_USER, AD_USERS[4], AD_USERS[14]], // Andrés + Sofia + AnaLucía
    createdAt: iso(subDays(now, 4)),
    updatedAt: iso(subDays(now, 1)),
  },
];
