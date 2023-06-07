import arg from "arg";
import inquirer from "inquirer";
import path from "path";
import fs from "fs";
import { promisify } from "util";

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
      type: "string",
      name: "componentName",
      message: "Please enter a component name?",
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
      message: "Which type of component would you like to create?",
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
      type: "string",
      name: "directory",
      message: "Which directory should the component be generated in?",
      default: defaultComponentDir,
      validate: validateDirectory,
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

const validateDirectory = async (directoryInput) => {
  const access = promisify(fs.access);
  const fullPathName = new URL(import.meta.url).pathname;
  //const result = await access();
  console.log(fullPathName);
};

const generateComponent = async () => {};

export const cli = async (args) => {
  const options = parseArgumentsIntoOptions(args);
  const optionsAfterPrompt = await promptForMissingOptions(options);

  console.log(optionsAfterPrompt);
};
