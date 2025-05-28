/**
 * Claude Code Action サンプルプロジェクト
 * シンプルな計算機能を提供します
 */

class Calculator {
  /**
   * 二つの数値を足し算します
   * @param {number} a - 最初の数値
   * @param {number} b - 二番目の数値
   * @returns {number} 足し算の結果
   */
  add(a, b) {
    return a + b;
  }

  /**
   * 二つの数値を引き算します
   * @param {number} a - 最初の数値
   * @param {number} b - 二番目の数値
   * @returns {number} 引き算の結果
   */
  subtract(a, b) {
    return a - b;
  }

  /**
   * 二つの数値を掛け算します
   * @param {number} a - 最初の数値
   * @param {number} b - 二番目の数値
   * @returns {number} 掛け算の結果
   */
  multiply(a, b) {
    return a * b;
  }

  /**
   * 二つの数値を割り算します
   * @param {number} a - 最初の数値
   * @param {number} b - 二番目の数値
   * @returns {number} 割り算の結果
   * @throws {Error} ゼロで割ろうとした場合
   */
  divide(a, b) {
    if (b === 0) {
      throw new Error('ゼロで割ることはできません');
    }
    return a / b;
  }

  /**
   * 数値の平方根を計算します
   * @param {number} a - 平方根を求める数値
   * @returns {number} 平方根の結果
   * @throws {Error} 負の数の場合
   */
  sqrt(a) {
    if (a < 0) {
      throw new Error('負の数の平方根は計算できません');
    }
    return Math.sqrt(a);
  }
}

// 使用例
const calc = new Calculator();
console.log('足し算: 5 + 3 =', calc.add(5, 3));
console.log('引き算: 10 - 4 =', calc.subtract(10, 4));
console.log('掛け算: 6 * 7 =', calc.multiply(6, 7));
console.log('割り算: 15 / 3 =', calc.divide(15, 3));
console.log('平方根: √16 =', calc.sqrt(16));

module.exports = Calculator;
