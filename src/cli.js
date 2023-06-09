import arg from "arg";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";

const parseArgumentsIntoOptions = (rawArgs) => {
  const componentTypeFlag = "--component";
  const styleFileTypeFlag = "--style";
  const shorthandTypeFlag = "-c";
  const styleShorthandFlag = "-s";

  const args = arg(
    {
      [componentTypeFlag]: String,
      [styleFileTypeFlag]: String,
      [styleShorthandFlag]: styleFileTypeFlag,
      [shorthandTypeFlag]: componentTypeFlag,
    },
    {
      argv: rawArgs.slice(2),
    }
  );

  return {
    componentType: args[componentTypeFlag]?.toLowerCase(),
    styleType: args[styleFileTypeFlag]?.toLowerCase(),
    componentName: args._[0],
    directory: args._[1],
  };
};

const promptForMissingOptions = async (options) => {
  const validComponentTypes = ["functional", "class"];
  const validStyleTypes = ["css", "sass"];
  const defaultComponentDir = "./src/components";
  const potentialQuestions = [];

  if (!options.componentName) {
    potentialQuestions.push({
      type: "input",
      name: "componentName",
      message: "What should the component name be?",
      validate: (e) => {
        const errorMessage = "Please enter a name.";
        const isValidName = /^[^\W]+$/i.test(e) && e.length > 0;

        return new Promise((resolve) =>
          isValidName ? resolve(isValidName) : resolve(errorMessage)
        );
      },
    });
  }

  if (
    !options.componentType ||
    !isValidOption(options.componentType, validComponentTypes)
  ) {
    potentialQuestions.push({
      type: "list",
      name: "componentType",
      message: "Which type of react component would you like to create?",
      choices: validComponentTypes,
    });
  }

  if (
    !options.styleType ||
    !isValidOption(options.styleType, validStyleTypes)
  ) {
    potentialQuestions.push({
      type: "list",
      name: "styleType",
      message: "Which format would you like the stylesheet to use?",
      choices: validStyleTypes,
    });
  }

  if (!options.directory) {
    potentialQuestions.push({
      type: "input",
      name: "directory",
      message: "Which directory should the component be generated in?",
      filter: (e) => path.join(path.resolve(), e),
      default: defaultComponentDir,
    });
  }

  return await inquirer.prompt(potentialQuestions).then((answers) => ({
    ...options,
    ...answers,
  }));
};

const isValidOption = (inputValue, optionsArr) => {
  return optionsArr?.includes?.(inputValue?.toLowerCase());
};

const generateComponent = async ({
  syleType,
  componentType,
  componentName,
  directory,
}) => {
  const fileToCopy =
    componentType === "functional"
      ? "functionComponentTemplate"
      : "classComponentTemplate";
  const template = path.join(__dirname, "../templates", fileToCopy);
  const writeTo = path.join(directory, `${componentName}.jsx`);
  await fs.promises.copyFile(template, writeTo);
};

const validateDirectory = async (answers) => {
  const dirExists = await fs.promises
    .access(answers.directory)
    .then(() => true)
    .catch(({ code }) => {
      if (code === "ENOENT") {
        return false;
      }
      process.exit(code);
    });

  return { ...answers, directoryExists: dirExists };
};

const promptCreateDirectory = async ({ directoryExists, ...rest }) => {
  if (!directoryExists) {
    await inquirer
      .prompt({
        type: "confirm",
        message: "Directory does not exist, would you like to create it?",
        name: "createDir",
      })
      .then(async ({ createDir }) => {
        if (createDir) {
          const { directory } = rest;
          return await fs.promises
            .mkdir(directory, { recursive: true })
            .catch(({ code }) => process.exit(code));
        }
      });
  }
  return { ...rest };
};

export const cli = async (args) => {
  const options = parseArgumentsIntoOptions(args);
  await promptForMissingOptions(options)
    .then(validateDirectory)
    .then(promptCreateDirectory)
    .then(generateComponent);
};
