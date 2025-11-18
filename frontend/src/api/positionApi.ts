import http from "./http";

export interface CreatePositionRequest {
  name: string;
  level: number;
  description?: string;
}

export interface PositionResponse {
  id: string;
  name: string;
  seniorityLevel: number;
  level?: number;
  description?: string;
}

export async function createPosition(data: CreatePositionRequest): Promise<PositionResponse> {
  const response = await http.post<PositionResponse>("/api/orgadmin/structure/positions", {
    name: data.name,
    seniorityLevel: data.level,
    // Note: description will be added to backend later
  });
  return response.data;
}

export async function getPositions(): Promise<PositionResponse[]> {
  const response = await http.get<PositionResponse[]>("/api/orgadmin/structure/positions");
  return response.data;
}
