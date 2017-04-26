import cls from 'continuation-local-storage';

// Ensure namespace is only created once within application
let namespace = cls.getNamespace('humanflow.correlation');
if (!namespace) {
  namespace = cls.createNamespace('humanflow.correlation');
}

const exportedNamespace = namespace;
export default exportedNamespace;
