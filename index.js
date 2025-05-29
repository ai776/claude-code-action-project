/**
 * 🧮 Calculator クラス
 *
 * 【初心者向け解説】
 * このファイルは「電卓」の機能を実装したJavaScriptクラスです。
 * クラスは「設計図」のようなもので、同じ機能を持つオブジェクトを
 * 何個でも作ることができます。
 *
 * 📚 学習ポイント：
 * - クラスの定義方法
 * - メソッド（関数）の作り方
 * - エラーハンドリング（エラー処理）
 * - JSDoc（コメント記法）
 */

/**
 * 基本的な算術演算を行うCalculatorクラス
 *
 * 【使用例】
 * const calc = new Calculator();
 * console.log(calc.add(5, 3)); // 8
 * console.log(calc.subtract(10, 4)); // 6
 */
class Calculator {
    /**
     * 🔢 足し算を行うメソッド
     *
     * 【初心者向け解説】
     * メソッドは「クラスの中にある関数」のことです。
     * この関数は2つの数字を受け取って、足し算の結果を返します。
     *
     * @param {number} a - 1つ目の数値（引数aと呼びます）
     * @param {number} b - 2つ目の数値（引数bと呼びます）
     * @returns {number} - 足し算の結果
     *
     * 📝 ポイント：
     * - 引数：関数に渡すデータのこと
     * - 戻り値：関数が計算して返すデータのこと
     * - number型：数値を表すJavaScriptのデータ型
     */
    add(a, b) {
        // 引数が数値かどうかをチェック（エラー防止）
        this._validateNumbers(a, b);

        // + 演算子で足し算を実行し、結果を返す
        return a + b;
    }

    /**
     * ➖ 引き算を行うメソッド
     *
     * 【初心者向け解説】
     * 引き算も足し算と同じ仕組みです。
     * aからbを引いた結果を返します。
     *
     * @param {number} a - 引かれる数（大きい方の数）
     * @param {number} b - 引く数（小さい方の数）
     * @returns {number} - 引き算の結果
     */
    subtract(a, b) {
        this._validateNumbers(a, b);

        // - 演算子で引き算を実行
        return a - b;
    }

    /**
     * ✖️ 掛け算を行うメソッド
     *
     * @param {number} a - 1つ目の数値
     * @param {number} b - 2つ目の数値
     * @returns {number} - 掛け算の結果
     */
    multiply(a, b) {
        this._validateNumbers(a, b);

        // * 演算子で掛け算を実行
        return a * b;
    }

    /**
     * ➗ 割り算を行うメソッド
     *
     * 【初心者向け解説】
     * 割り算では「0で割る」ことはできません（数学的にエラー）。
     * そのため、特別なチェックを行っています。
     *
     * @param {number} a - 割られる数（分子）
     * @param {number} b - 割る数（分母） ※0は不可
     * @returns {number} - 割り算の結果
     * @throws {Error} - bが0の場合はエラーを投げる
     *
     * 📝 重要：throws {Error} は「エラーが起きる可能性がある」という意味
     */
    divide(a, b) {
        this._validateNumbers(a, b);

        // 0で割ろうとした場合はエラーを投げる
        if (b === 0) {
            throw new Error('0で割ることはできません');
        }

        // / 演算子で割り算を実行
        return a / b;
    }

    /**
     * 🔍 入力値検証（バリデーション）メソッド
     *
     * 【初心者向け解説】
     * このメソッドは「プライベートメソッド」です（名前が_で始まる）。
     * クラスの外からは使えない「内部専用」の関数です。
     *
     * 💡 なぜ必要？
     * ユーザーが間違った値（文字列など）を入力した時に、
     * エラーメッセージを出して問題を知らせるためです。
     *
     * @param {number} a - 検証する1つ目の値
     * @param {number} b - 検証する2つ目の値
     * @throws {Error} - 数値でない場合はエラーを投げる
     *
     * 📚 学習ポイント：
     * - プライベートメソッド（_で始まる）
     * - typeof演算子：データ型をチェック
     * - isNaN()関数：「数値でない」をチェック
     */
    _validateNumbers(a, b) {
        // typeof演算子で引数aのデータ型をチェック
        if (typeof a !== 'number' || typeof b !== 'number') {
            throw new Error('引数は数値である必要があります');
        }

        // isNaN()で「数値でない」かどうかをチェック
        // NaN = "Not a Number"（数値でない）の略
        if (isNaN(a) || isNaN(b)) {
            throw new Error('有効な数値を入力してください');
        }
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

// 📤 モジュールのエクスポート（他のファイルで使えるようにする）
// 【初心者向け解説】
// この行により、他のJavaScriptファイルで
//「const Calculator = require('./index.js')」として
// このクラスを読み込んで使うことができます。
module.exports = Calculator;

// 💡 使用例（このファイルを直接実行した場合のみ動作）
if (require.main === module) {
    // 新しい計算機インスタンス（実体）を作成
    const calc = new Calculator();

    console.log('🧮 Calculator クラスのテスト実行');
    console.log('5 + 3 =', calc.add(5, 3));           // 8
    console.log('10 - 4 =', calc.subtract(10, 4));    // 6
    console.log('6 × 7 =', calc.multiply(6, 7));      // 42
    console.log('15 ÷ 3 =', calc.divide(15, 3));      // 5

    // エラーのテスト
    try {
        console.log('10 ÷ 0 =', calc.divide(10, 0));  // エラーが発生
    } catch (error) {
        console.log('❌ エラー:', error.message);
    }
}
