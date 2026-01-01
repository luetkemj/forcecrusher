import { compact } from "lodash";

type Prefab = {
  name: string;
  template: string;
  w?: number;
  h?: number;
};

const jail = {
  name: "jail",
  template: `
#########
#  + +  #
#### ####
#  + +  #
#### ####
#  + +  #
#### ####
#  + +  #
#### ####
#       #
#       #
####+####
`,
};

const buildPrefabs = (prefabs: Prefab[]) => {
  const builtPrefabs = [];

  for (const prefab of prefabs) {
    const splitTemplate = compact(
      prefab.template.split("\n").filter((x) => x !== "\n"),
    );

    const height = splitTemplate.length;
    const width = splitTemplate[0].length;

    prefab.w = width;
    prefab.h = height;
    prefab.splitTemplate = splitTemplate;

    builtPrefabs.push(prefab);
  }

  return builtPrefabs;
};

export const roomPrefabs = buildPrefabs([jail]);
