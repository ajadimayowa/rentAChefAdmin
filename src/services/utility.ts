import { api, type ApiListResponse } from '../config/api';

export interface State {
  id: string;
  name: string;
}

export interface Lga {
  id: string;
  name: string;
  stateId: string;
}

export function getStates(): Promise<ApiListResponse<State>> {
  return api.get<ApiListResponse<State>>('/states/get-states');
}

export function getStateLgas(stateId: string): Promise<ApiListResponse<Lga>> {
  return api.get<ApiListResponse<Lga>>(`/states/lga/${stateId}`);
}
