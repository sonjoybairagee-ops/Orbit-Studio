import { WorkspaceRole } from "@/types/agency";

export function canManageWorkspace(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageMembers(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin";
}

export function canManageClients(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canEditProjects(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canUploadFiles(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canDeleteFiles(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin";
}

export function canAddComments(role: WorkspaceRole): boolean {
  return ["owner", "admin", "editor", "reviewer", "client"].includes(role);
}

export function canApproveDeliveries(role: WorkspaceRole): boolean {
  return role === "owner" || role === "admin" || role === "client";
}

