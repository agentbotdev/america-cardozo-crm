import { CRMTask } from '../types';

let mockTasks: CRMTask[] = [
  {
    id: '1',
    titulo: 'Llamar a Juan Pérez',
    descripcion: 'Recordatorio para continuar seguimiento por la cochera en Almagro.',
    estado: 'pendiente',
    asignados: ['Vendedor 1', 'Admin'],
    fecha_vencimiento: '2025-01-20'
  },
  {
    id: '2',
    titulo: 'Enviar contrato alquiler',
    descripcion: 'Preparar y enviar borrador del contrato de alquiler en Palermo.',
    estado: 'en_proceso',
    asignados: ['Vendedor 2'],
    fecha_vencimiento: '2025-01-22'
  }
];

export const tasksService = {
  fetchTasks: async (): Promise<CRMTask[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockTasks]);
      }, 300);
    });
  },

  saveTask: async (task: CRMTask): Promise<CRMTask> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockTasks.findIndex(t => t.id === task.id);
        if (index >= 0) {
          mockTasks[index] = task;
        } else {
          mockTasks.push(task);
        }
        resolve(task);
      }, 300);
    });
  },

  deleteTask: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockTasks = mockTasks.filter(t => t.id !== id);
        resolve();
      }, 300);
    });
  }
};
