import map from 'lodash/map';
import endsWith from 'lodash/endsWith';

export function mapToTodos (tasks, options = {}) {
  return map(tasks, (task, index) => ({
    id: task.id,
    title: task.title,
    completed: options.updateOrder ? task.completed : false,
    system: task.system,
    base: task.templateId === 'base',
    order: options.updateOrder ? index : task.order,
    templateId: task.templateId
  }));
}

export function isSeparatorLabel (todo) {
  return endsWith(todo.title, ':');
}
