
export class ColorUtil {
  static getContrastYIQ(hexColor: string): string {
    const color = this.hexToRgb(hexColor);
    if (!color) return '';
    const { r, g, b } = color;

    // Fórmula de brilho YIQ
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? 'black' : 'white';
  }

  static hexToRgb(hex: string): {r: number, g: number, b: number} | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
}
