import arg from "arg";
import inquirer from "inquirer";

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
    componentType: args[componentTypeFlag],
    styleType: args[styleFileTypeFlag],
    componentName: args._[0],
    directory: args._[1],
  };
};

const promptForMissingOptions = async (options) => {
  const questions = [];
  if (!options.componentName) {
    questions.push({
      type: "string",
      name: "componentName",
      message: "Please enter a component name",
      default: "",
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    ...options,
    ...answers,
  };
};

const validateOptions = (options) => {};

export const cli = async (args) => {
  const options = parseArgumentsIntoOptions(args);
  const optionsAfterPrompt = await promptForMissingOptions(options);
  console.log(optionsAfterPrompt);
};
