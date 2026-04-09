
export interface ColorsBy {
  "school": ColorsMap,
  "class": ColorsMap,
  "curricularComponent": ColorsMap
}

export type ColoringBy = "school" | "class" | "curricularComponent" | null;
export interface ColorBy {
  id: number;
  userId: number;
  schoolId: number;
  classId: number;
  curricularComponentId: number;
  color: string;
  coloringBy: ColoringBy;
}

export type ColorsMap = Map<number, ColorBy[]>;

export function newColorBy(partial?: Partial<ColorBy>): ColorBy {
  return {
    id: 0,
    userId: 0,
    schoolId: 0,
    classId: 0,
    curricularComponentId: 0,
    color: "#FFFFFF",
    coloringBy: null,
    ...(partial || {})
  };
}

export function newColorsBy(partial?: Partial<ColorBy>): ColorsBy {
  return {
    school: {},
    class: {},
    curricularComponent: {},
    ...(partial || {})
  } as ColorsBy;
}
