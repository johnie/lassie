const BRACE_REGEX = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

export const templateBuilder = (
  template: string,
  data: Record<string, any>,
  options: {
    ignoreMissing?: boolean;
    transform?: (params: { value: any; key: string }) => any;
  } = {},
): string => {
  const { ignoreMissing = false, transform = ({ value }) => value } = options;

  if (typeof template !== 'string') {
    throw new TypeError(`Expected a \`string\` in the first argument, got \`${typeof template}\``);
  }

  if (typeof data !== 'object') {
    throw new TypeError(`Expected an \`object\` or \`Array\` in the second argument, got \`${typeof data}\``);
  }

  const replace = (placeholder: string, key: string): string => {
    let value: any = data;
    for (const property of key.split('.')) {
      value = value ? value[property] : undefined;
    }

    const transformedValue = transform({ value, key });

    if (transformedValue === undefined) {
      if (ignoreMissing) {
        return placeholder;
      }
      throw new Error('No key found');
    }

    return String(transformedValue);
  };

  return template.replace(BRACE_REGEX, replace);
};
