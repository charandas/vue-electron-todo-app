import map from 'lodash/map';

export function mapToTodos (tasks, updateOrder = false) {
  return map(tasks, (task, index) => ({
    id: task.id,
    title: task.title,
    completed: false,
    system: task.system,
    order: updateOrder ? index : task.order
  }));
}
