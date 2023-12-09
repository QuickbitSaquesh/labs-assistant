import { existsSync, outputFileSync } from "fs-extra";
import inquirer from "inquirer";
import { rpcPath } from "../../common/constants";

export const setRpc = () => {
  if (existsSync(rpcPath)) {
    return Promise.resolve();
  }

  return inquirer.prompt([
    {
      type: "input",
      name: "rpcUrl",
      message: "Enter your rpc url:",
      validate: (input) => {
        try {
          const rpc = new URL(input);
          outputFileSync(rpcPath, rpc.toString());
          return true;
        } catch (e) {
          return "Wrong rpc url, please retry again";
        }
      },
    },
  ]);
};
