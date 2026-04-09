import { Pipe, PipeTransform } from '@angular/core';
import { ColorsBy, ColorBy, newColorBy } from '@models/colors-by';
import { LessonEvent } from '@models';


function colorById(event?: LessonEvent, coloringBy?: string | null) {
  if (!event || ! coloringBy) return 0;
  let id = 0;
  switch (coloringBy) {
    case 'curricularComponent':
      id = event.curricularComponent.id;
      break;
    case 'class':
      id = event.schoolClass.id || 0;
      break;
    case 'school':
      id = event.school.id;
      break;
  }
  return id;
}

export function getColorBy(colorsBy: ColorsBy, event?: LessonEvent, coloringBy?: string | null): ColorBy {
  if (!colorsBy || !coloringBy || !event) {
    return newColorBy();
  }
  const id = colorById(event, coloringBy);
  return (colorsBy as any)[coloringBy]?.[id] || newColorBy();
}

@Pipe({
  name: 'colorBy',
})
export class ColorByPipe implements PipeTransform {
  transform(colorsBy: ColorsBy, event?: LessonEvent, coloringBy?: string | null): ColorBy {
    return getColorBy(colorsBy, event, coloringBy);
  }
}

@Pipe({
  name: 'coloringBy',
})
export class ColoringByPipe implements PipeTransform {

  transform(colorsBy: ColorsBy, event?: LessonEvent, coloringBy?: string | null): string {
    if (!colorsBy || !coloringBy || !event) {
      return newColorBy().color;
    }
    const colorsByItem = getColorBy(colorsBy, event, coloringBy);
    return colorsByItem.color;
  }

}
