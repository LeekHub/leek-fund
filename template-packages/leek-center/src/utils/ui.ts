import isString from 'lodash/isString';

export function classes(...args: string[]) {
  return args.join(' ');
}

/**
 * 根据最大值和值，计算出HSL的红绿色
 * @param v 值
 * @param m 最大值
 */
export function calcRGColorStyleValue(v: number | string, m: number) {
  const GH = 141;
  const GS = 44.3;
  const GL = 62;
  const RH = 9;
  const RS = 56;
  const RL = 50.2;

  if (isString(v)) {
    v = parseFloat(v);
  }

  const ratio = Math.max((m - v) / m, 0);

  const marginH = GH - RH;
  const appendH = marginH * ratio;
  const marginS = GS - RS;
  const appendS = marginS * ratio;
  const marginL = GL - RL;
  const appendL = marginL * ratio;

  return `hsl(${RH + appendH},${RS + appendS}%,${RL + appendL}%)`;
}
