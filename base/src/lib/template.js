const handlebars = require('handlebars');

const appendVariablesInTemplate = async (template, variables) => {
  const handlebarTemplate = await handlebars.compile(template);

  return handlebarTemplate(variables);
};

module.exports = {
  appendVariablesInTemplate
};
