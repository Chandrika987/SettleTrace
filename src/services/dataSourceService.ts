import type { DataSource } from '../types';
import { dataSources as seedDataSources, pipelineStages as seedPipelineStages } from '../data/sources';

export type PipelineStage = (typeof seedPipelineStages)[number];

export async function getDataSources(): Promise<DataSource[]> {
  return seedDataSources;
}

export async function getPipelineStages(): Promise<PipelineStage[]> {
  return seedPipelineStages;
}
