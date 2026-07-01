export interface TaskAssignedPayload {
  taskId: string;
  taskTitle: string;
  taskDescription?: string;
  dueDate?: string;
  priority?: string;
  column: string;
  assigneeName: string;
  assigneeEmail: string;
  assignedByName: string;
  assignedByEmail: string;
}

export async function notifyTaskAssigned(payload: TaskAssignedPayload) {
  const url = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "task.assigned",
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
  } catch {
    // Webhook failures are non-fatal
  }
}
