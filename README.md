# create-react-component

A node cli to scaffold react components

### Usage

#### Basic: `create-react-component`

This will run the cli and prompt you through its required arguments.

#### Advanced `create-react-component [arg0 [arg1 [flags]]`

You can also supply any of the arguments by way of providing them with the command through args and / or flags:

##### Args:

Arg | Description | Definition | Constraint
Arg 0 | Component Name | Desired name of component |
Arg 1 | Component Directory | The desired Component directory/subdirectory | Relative to execution directory, or absolute path

##### Flags:

Flag Value | Description | Constraints
`--component` or `-c` | Component type | Must provide a value of either 'functional' or 'class'
`--style` or `-s` | Stylesheet type | Must provide a value of either 'css' or 'scss'
