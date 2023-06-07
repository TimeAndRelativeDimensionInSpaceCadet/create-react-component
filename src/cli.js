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
    componentType:
      args[componentTypeFlag] && args[componentTypeFlag].toLowerCase(),
    styleType: args[styleFileTypeFlag] && args[styleFileTypeFlag].toLowerCase(),
    componentName: args._[0],
    directory: args._[1],
  };
};

const promptForMissingOptions = async (options) => {
  const validComponentTypes = ["functional", "class"];
  const validStyleTypes = ["css", "sass"];
  //const defaultComponentDir = "./src/components";
  const potentialQuestions = [];

  if (
    !options.componentName ||
    (options.componentName && options.componentName.length < 1)
  ) {
    potentialQuestions.push({
      type: "string",
      name: "componentName",
      message: "Please enter a component name?",
      default: "",
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
      default: validComponentTypes[0],
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

  /* if (!options.directory || !isValidDirectory(options.directory)) {
    potentialQuestions.push({
      type: "string",
      name: "directory",
      message: "Which directory should the component be generatede in?",
      default: defaultComponentDir,
    });
  } */

  return await inquirer.prompt(potentialQuestions).then((answers) => ({
    ...options,
    ...answers,
  }));
};

const isValidOption = (inputValue, optionsArr) => {
  return inputValue && optionsArr.includes(inputValue.toLowerCase());
};

/* const isValidDirectory = (directory) => {
  
}; */

const generateComponent = async () => {};

export const cli = async (args) => {
  const options = parseArgumentsIntoOptions(args);
  const optionsAfterPrompt = await promptForMissingOptions(options);

  console.log(optionsAfterPrompt);
};
