import arg from 'arg';
import inquirer from 'inquirer';
import path from 'node:path';
import fs from 'node:fs';
import { open } from 'node:fs/promises';
import { fileURLToPath } from 'url';

const parseArgumentsIntoOptions = rawArgs => {
  const componentTypeFlag = '--component';
  const styleFileTypeFlag = '--style';
  const shorthandTypeFlag = '-c';
  const styleShorthandFlag = '-s';
  const helpFlag = '--help';
  const helpShorthand = '-h';

  const args = arg(
    {
      [componentTypeFlag]: String,
      [styleFileTypeFlag]: String,
      [helpFlag]: Boolean,
      [styleShorthandFlag]: styleFileTypeFlag,
      [shorthandTypeFlag]: componentTypeFlag,
      [helpShorthand]: helpFlag,
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    showHelp: args[helpFlag] || false,
    componentType: args[componentTypeFlag]?.toLowerCase(),
    styleType: args[styleFileTypeFlag]?.toLowerCase(),
    componentName: args._[0],
    directory: args._[1],
  };
};

const isValidOption = (inputValue, optionsArr) => {
  return optionsArr?.includes?.(inputValue?.toLowerCase());
};

const promptForMissingOptions = async options => {
  const { componentName, componentType, styleType, directory } = options;
  const validComponentTypes = ['functional', 'class'];
  const validStyleTypes = ['css', 'scss'];
  const defaultComponentDir = './src/components';
  const potentialQuestions = [];

  if (!componentName) {
    potentialQuestions.push({
      type: 'input',
      name: 'componentName',
      message: 'What should the component name be?',
      validate: e => {
        const errorMessage = 'Please enter a name.';
        const isValidName = /^[^\W]+$/i.test(e) && e.length > 0;

        return new Promise(resolve =>
          isValidName ? resolve(isValidName) : resolve(errorMessage)
        );
      },
    });
  }

  if (!componentType || !isValidOption(componentType, validComponentTypes)) {
    potentialQuestions.push({
      type: 'list',
      name: 'componentType',
      message: 'Which type of react component would you like to create?',
      choices: validComponentTypes,
    });
  }

  if (!styleType || !isValidOption(styleType, validStyleTypes)) {
    potentialQuestions.push({
      type: 'list',
      name: 'styleType',
      message: 'Which format would you like the stylesheet to use?',
      choices: validStyleTypes,
    });
  }

  if (!directory) {
    potentialQuestions.push({
      type: 'input',
      name: 'directory',
      message: 'Which directory should the component be generated in?',
      filter: directoryInput => path.join(path.resolve(), directoryInput),
      default: defaultComponentDir,
    });
  }

  return await inquirer.prompt(potentialQuestions).then(answers => ({
    ...options,
    ...answers,
  }));
};

const mapComponentTypeToTemplateName = componentType => {
  return componentType === 'functional'
    ? 'functionComponentTemplate.js'
    : 'classComponentTemplate.js';
};

const copyTemplateFile = async (inputFile, outputFile) => {
  return await fs.promises.copyFile(inputFile, outputFile);
};

const getTemplateFilepath = name => {
  return path.join(
    fileURLToPath(new URL('.', import.meta.url)),
    '../templates',
    name
  );
};

const validateDirectory = async answers => {
  const dirExists = await fs.promises
    .access(answers.directory)
    .then(() => true)
    .catch(({ code }) => {
      if (code === 'ENOENT') {
        return false;
      }
      throw error;
    });

  return { ...answers, directoryExists: dirExists };
};

const promptCreateDirectory = async ({ directoryExists, ...rest }) => {
  if (!directoryExists) {
    await inquirer
      .prompt({
        type: 'confirm',
        message: 'Directory does not exist, would you like to create it?',
        name: 'createDir',
      })
      .then(async ({ createDir }) => {
        if (createDir) {
          const { directory } = rest;
          return await fs.promises
            .mkdir(directory, { recursive: true })
            .catch(e => {
              throw e;
            });
        }
      });
  }
  return rest;
};

const generateComponent = async answers => {
  const { componentType, componentName, directory } = answers;
  const reactComponentFileName = mapComponentTypeToTemplateName(componentType);
  const componentTemplate = getTemplateFilepath(reactComponentFileName);
  const componentTemplateOutputFullPath = path.join(
    directory,
    `${componentName}.jsx`
  );
  const updatedTemplate = await fs.promises
    .readFile(componentTemplate)
    .then(buffer => buffer.toString())
    .then(dataStr => dataStr.replace(/componentname/i, componentName));

  await fs.promises.writeFile(componentTemplateOutputFullPath, updatedTemplate);

  return answers;
};

const displayHelpFile = async () => {
  const helpFile = await open('./src/help.txt');

  for await (const line of helpFile.readLines()) {
    console.log(line);
  }
};

const generateComponentStylesheet = async ({
  componentName,
  styleType,
  directory,
}) => {
  const fileName = `${componentName}.${styleType}`;
  const stylesheetTemplatePath = getTemplateFilepath('styleTemplate');
  const stylesheetTemplateOutput = path.join(directory, fileName);

  await copyTemplateFile(stylesheetTemplatePath, stylesheetTemplateOutput);
};

export const cli = async args => {
  const options = parseArgumentsIntoOptions(args);

  if (options.showHelp) {
    return await displayHelpFile();
  }

  await promptForMissingOptions(options)
    .then(validateDirectory)
    .then(promptCreateDirectory)
    .then(generateComponent)
    .then(generateComponentStylesheet)
    .catch(error => {
      console.error(error.message);
      process.exit(error.code);
    });
};
