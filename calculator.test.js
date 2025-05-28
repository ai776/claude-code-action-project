const Calculator = require('./index');

describe('Calculator', () => {
  let calc;

  beforeEach(() => {
    calc = new Calculator();
  });

  describe('add', () => {
    test('正の数の足し算', () => {
      expect(calc.add(2, 3)).toBe(5);
    });

    test('負の数の足し算', () => {
      expect(calc.add(-2, -3)).toBe(-5);
    });

    test('ゼロとの足し算', () => {
      expect(calc.add(5, 0)).toBe(5);
    });

    test('小数点の足し算', () => {
      expect(calc.add(0.1, 0.2)).toBeCloseTo(0.3);
    });
  });

  describe('subtract', () => {
    test('正の数の引き算', () => {
      expect(calc.subtract(5, 3)).toBe(2);
    });

    test('負の数の引き算', () => {
      expect(calc.subtract(-2, -3)).toBe(1);
    });
  });

  describe('multiply', () => {
    test('正の数の掛け算', () => {
      expect(calc.multiply(4, 5)).toBe(20);
    });

    test('ゼロとの掛け算', () => {
      expect(calc.multiply(5, 0)).toBe(0);
    });
  });

  describe('divide', () => {
    test('正の数の割り算', () => {
      expect(calc.divide(10, 2)).toBe(5);
    });

    test('ゼロで割るとエラーが発生', () => {
      expect(() => calc.divide(10, 0)).toThrow('ゼロで割ることはできません');
    });
  });
});
