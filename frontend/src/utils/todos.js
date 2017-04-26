import map from 'lodash/map';

export function mapToTodos (tasks) {
  return map(tasks, (task, index) => ({
    id: index,
    title: task,
    completed: false
  }));
}
