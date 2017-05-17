import map from 'lodash/map';

export function mapToTodos (tasks) {
  return map(tasks, task => ({
    id: task.id,
    title: task.title,
    completed: false,
    system: task.system
  }));
}
