import map from 'lodash/map';

export function mapToTodos (tasks) {
  return map(tasks, (task, index) => ({
    id: task.id,
    title: task.title,
    completed: false,
    system: task.system
  }));
}
