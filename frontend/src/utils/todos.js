import map from 'lodash/map';
import endsWith from 'lodash/endsWith';

export function mapToTodos (tasks, options = {}) {
  return map(tasks, (task, index) => ({
    id: task.id,
    title: task.title,
    completed: options.updateOrder ? task.completed : false,
    system: task.system,
    order: options.updateOrder ? index : task.order
  }));
}

export function isSeparatorLabel (todo) {
  return endsWith(todo.title, ':');
}
