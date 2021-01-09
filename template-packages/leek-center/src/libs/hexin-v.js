/* eslint-disable */

var TOKEN_SERVER_TIME = Date.now() / 1000;
setTimeout(() => {
  TOKEN_SERVER_TIME = Date.now() / 1000;
}, 600000);
let getHexinToken;
var time, BROWSER_LIST, plugin_num;
!(function (n, t, r, e, a, u, c) {
  !(function () {
    var s = a[0],
      v = e[0],
      f = u[0],
      l = st(e[1], r[0]),
      d = a[1],
      p = n[0],
      h = a[2],
      g = n[1],
      w = a[2],
      m = Zn(a[3], u[1], a[4]),
      I = a[5],
      _ = r[1],
      y = e[2],
      E = a[6],
      A = at(n[2], u[2], n[3], e[3]),
      C = u[3],
      b = t[0],
      B = a[7],
      R = u[4],
      k = u[5],
      T = e[4],
      O = Zn(a[8], a[9], c[0]),
      S = Zn(r[2], t[1], t[2], c[1]),
      x = n[4],
      L = r[3],
      M = e[5],
      N = u[6],
      P = st(e[6], a[10]),
      D = r[4],
      j = Zn(r[5], a[11], t[3]),
      V = c[2],
      W = e[7],
      X = r[6],
      $ = n[5],
      F = st(u[7], a[12], a[13]),
      H = st(r[7], u[8], u[9]),
      Y = u[10],
      U = c[3],
      K = a[14],
      z = c[4],
      G = r[8],
      Q = n[6],
      Z = n[7],
      J = u[11],
      q = Gn(a[15], t[4]),
      nn = a[16],
      tn = n[8],
      rn = a[17],
      en = r[9],
      an = e[8],
      on = Gn(u[12], r[10]),
      un = a[18],
      cn = r[11],
      sn = at(e[9], t[5], n[9]),
      vn = e[10],
      fn = at(n[10], e[3], r[12]),
      ln = e[11],
      dn = e[12],
      pn = r[13],
      hn = r[14],
      gn = n[11],
      wn = n[12],
      mn = r[15],
      In = n[13],
      _n = e[13],
      yn = r[16],
      En = e[14],
      An = e[15],
      Cn = Gn(n[14]),
      bn = t[6],
      Bn = a[19],
      Rn = e[16],
      kn = r[17],
      Tn = c[5],
      On = n[15],
      Sn = Zn(n[16], t[7], n[17]),
      xn = st(t[8], u[13]),
      Ln = t[9],
      Mn = e[17],
      Nn = u[14],
      Pn = r[3],
      Dn = t[10],
      jn = a[20],
      Vn = at(c[6], t[11], c[7], t[12]),
      Wn = c[8],
      Xn = c[9],
      $n = u[15],
      Fn = e[18],
      Hn = e[18],
      Yn = c[10],
      Un = s + v,
      Kn = c[11],
      zn = n[18];
    function Gn() {
      var e = arguments[r[18]];
      if (!e) return n[19];
      for (var o = t[13], i = a[21], u = n[18]; u < e.length; u++) {
        var s = e.charCodeAt(u),
          v = s ^ i;
        (i = ((i * u) % a[22]) + c[12]), (o += t[14].fromCharCode(v));
      }
      return o;
    }
    // var Qn = [new a[23](n[20]), new e[3](f + l + d + p)];
    function Zn() {
      return arguments[t[15]].split(n[19]).reverse().join(t[13]);
    }
    var Jn = [new t[16](c[13]), new u[9](e[19])],
      // qn = a[24][u[16]] || a[24].getElementsByTagName(st(r[19], r[20]))[a[25]],
      nt;
    !(function (o) {
      var i = n[21],
        s = c[14],
        v = at(e[20], n[22], n[23]),
        f = a[26];
      o[i + s] = n[24];
      function l() {
        var t = c[15];
        this.setCookie(t, a[27]),
          this.getCookie(t) || (o[u[17]] = n[25]),
          this.delCookie(t);
      }
      o[c[16]] = l;
      function d(t, e, a) {
        var o, i, c;
        o = i = c = r;
        var s, f, l;
        s = f = l = n;
        var d, p, h;
        d = p = h = u;
        var g = Gn(p[18], f[26]);
        this.setCookie(t, o[21], v + g, e, a);
      }
      o[n[27]] = p;
      function p(r) {
        var a = t[17][e[21]],
          o = f + h + r + t[18],
          i = a.indexOf(o);
        if (i == -n[28]) {
          if (((o = r + n[29]), a.substr(e[22], o.length) != o)) return;
          i = u[19];
        }
        var s = i + o[c[17]],
          v = a.indexOf(g + w, s);
        return v == -e[23] && (v = a[n[30]]), a.substring(s, v);
      }
      o[e[24]] = m;
      function m(e, o, i, u, s) {
        var v = e + c[18] + o;
        u && (v += n[31] + u),
          s && (v += Zn(t[19], a[28], n[32], c[19]) + s),
          i && (v += r[22] + i),
          (c[20][c[21]] = v);
      }
      o[a[29]] = d;
    })(nt || (nt = {}));
    var tt;

    var rt = (function () {
        var o = En,
          i = e[28],
          s = a[39];
        function v(t) {
          var r = at(Yn, ut, a[40], c[27]),
            o = a[41];
          this[r + y + E + o] = t;
          for (var u = e[22], v = t[i + s + A]; u < v; u++) this[u] = n[18];
        }
        return (
          (v[e[29]][Zn(n[37], t[26], n[38], n[39])] = function () {
            for (
              var r = this[a[42]], e = [], o = -u[22], i = t[25], s = r[u[23]];
              i < s;
              i++
            )
              for (
                var v = this[i], f = r[i], l = (o += f);
                (e[l] = v & parseInt(st(a[43], u[24], u[25]), c[28])),
                  --f != t[25];

              )
                --l, (v >>= n[40]);
            return e;
          }),
          (o = F),
          (v[e[29]][n[41]] = function (o) {
            var i, s, v;
            i = s = v = t;
            var f, l, d;
            f = l = d = e;
            var p, h, g;
            p = h = g = r;
            var w, m, I;
            w = m = I = c;
            var _, y, E;
            _ = y = E = n;
            var A, C, b;
            A = C = b = a;
            var B, R, k;
            B = R = k = u;
            for (
              var T = this[R[26]], O = C[25], S = y[18], x = T[I[17]];
              S < x;
              S++
            ) {
              var L = T[S],
                M = g[18];
              do {
                M = (M << A[44]) + o[O++];
              } while (--L > f[22]);
              this[S] = M >>> s[25];
            }
          }),
          v
        );
      })(),
      et;
    !(function (o) {
      var i = a[45],
        s = e[15],
        v = Gn(u[27], jn),
        l = Zn(c[29], a[46], e[30], t[27]),
        d = t[28],
        p = a[47],
        h = n[42],
        g = n[43],
        w = c[11];
      function m(o) {
        for (
          var s = Zn(sn, nn, n[44]), v = u[19], f = o[c[17]], l = [];
          v < f;

        ) {
          var d =
            (A[o.charAt(v++)] << parseInt(C + s, r[26])) |
            (A[o.charAt(v++)] << parseInt(r[27], c[30])) |
            (A[o.charAt(v++)] << a[48]) |
            A[o.charAt(v++)];
          l.push(
            d >> parseInt(a[49], c[31]),
            (d >> u[28]) & parseInt(Gn(e[31]), t[15]),
            d & parseInt(i + b, r[28])
          );
        }
        return l;
      }
      function I(e) {
        var a = (L, _, m(e));
        if (a[c[26]] != w) return (error = u[29]), void 0;
        var o = a[n[28]],
          i = [];
        return S(a, +r[29], i, +t[25], o), x(i) == o ? i : void 0;
      }
      for (
        var y = Zn(Jn, r[30], a[50]), A = {}, O = r[18];
        O < parseInt(B + s + R, c[31]);
        O++
      )
        A[y.charAt(O)] = O;
      function S(n, e, a, o, i) {
        for (var c = n[u[23]]; e < c; )
          (a[o++] = n[e++] ^ (i & parseInt(st(f, u[24], E), t[29]))),
            (i = ~(i * parseInt(Gn(u[30]), r[29])));
      }
      function x(t) {
        for (var r = n[45], e = c[26], o = n[18], i = t[n[30]]; o < i; o++)
          e = (e << u[31]) - e + t[o];
        return e & parseInt(v + r, a[44]);
      }
      function L(n) {
        var t = x(n),
          e = [w, t];
        return S(n, +c[26], e, +r[29], t), M(e);
      }
      function M(o) {
        for (var i = t[28], s = n[18], v = o[r[31]], f = []; s < v; ) {
          var p =
            (o[s++] << parseInt(at(n[46], c[32], t[30]), r[28])) |
            (o[s++] << parseInt(u[32], c[31])) |
            o[s++];
          f.push(
            y.charAt(p >> parseInt(e[32], a[11])),
            y.charAt((p >> parseInt(t[31], c[28])) & parseInt(k + l, n[47])),
            y.charAt((p >> a[48]) & parseInt(i + d, n[40])),
            y.charAt(p & parseInt(a[51], a[52]))
          );
        }
        return f.join(t[13]);
      }
      (o[p + h + T + g] = M),
        (o[u[33]] = m),
        (o[r[32]] = L),
        (o[Zn(r[33], u[34], u[35], zn)] = I);
    })(et || (et = {}));
    function at() {
      var n = arguments[t[15]];
      if (!n) return a[53];
      for (var r = e[33], o = a[54], i = a[55], u = a[25]; u < n.length; u++) {
        var s = n.charCodeAt(u);
        (i = (i + c[33]) % o.length),
          (s ^= o.charCodeAt(i)),
          (r += a[3].fromCharCode(s));
      }
      return r;
    }
    var ot;
    !(function (o) {
      var i = n[48],
        s = u[36],
        v = u[37],
        f = c[34],
        l = n[49],
        d = u[38],
        p = a[56];
      function h(n) {
        for (var t = [], e = r[18]; e < n[c[17]]; e++) t.push(n.charCodeAt(e));
        return t;
      }
      /*  function g(o) {
        var v = a[57],
          f = at(e[34], n[50], t[32], a[58]);
        if (!(o > t[33])) {
          o = o || c[26];
          var l = parseInt(n[51], u[39]),
            d = a[24].createElement(i + O);
          (d[a[59]] =
            location[v + S + f] +
            a[60] +
            parseInt(new c[35]().getTime() / l) +
            u[40]),
            (d[t[34]] = function () {
              (zn = a[61]),
                setTimeout((function () {
                  g(++o);
                }), o * parseInt(r[34], t[15]));
            }),
            (d[at(t[35], b, a[62])] = d[a[63]] = function () {
              (this[n[52]] &&
                this[r[35]] !== u[41] &&
                this[r[35]] !== c[36] &&
                this[e[35]] !== c[37]) ||
                ((zn = c[26]),
                (d[e[36]] = d[at(e[37], u[42], u[43], B)] = e[38]));
            }),
            r[36][x + s].appendChild(d);
        }
      } */
      /* function w(o) {
        var i = c[38],
          u = t[36],
          s = r[37],
          v = r[38];
        if (typeof o === r[39] && o[e[39]])
          try {
            switch (parseInt(o[e[39]])) {
              case parseInt(Gn(c[39]), r[29]):
                break;
              case parseInt(a[64], r[29]):
                top[L + i + u + M][Gn(n[53])] = o[N + s + P + v];
                break;
              case parseInt(n[54], e[40]):
                top[a[65]][r[40]] = o[c[40]];
                break;
              default:
                break;
            }
          } catch (f) {}
      } */
      /* function m(t) {
        var r = new n[33](u[44], a[66]);
        if (t) {
          return t.match(r);
        }
      } */
      function I() {
        var t = a[67],
          o = Gn(c[41]),
          i = u[45],
          s = new c[35]();
        try {
          return (
            (time = a[68].now()), (time / parseInt(t + o + i, r[41])) >>> e[22]
          );
        } catch (v) {
          return (
            (time = s.getTime()), (time / parseInt(n[55], n[40])) >>> u[19]
          );
        }
      }
      /* function _(t, r, e) {
        var a, o, i;
        (a = o = i = n),
          T ? t.addEventListener(r, e) : t.attachEvent(a[56] + r, e);
      } */
      function y() {
        var n = H,
          r = new t[37]();
        return (
          (n = x),
          typeof TOKEN_SERVER_TIME == e[41]
            ? a[25]
            : ((time = parseInt(TOKEN_SERVER_TIME)), time)
        );
      }
      function E(o) {
        var i = (Jn, Y, Gn(t[38])),
          s = at(ft, p, a[69]),
          l = {},
          d = function (o, l) {
            var d = r[42],
              p,
              h,
              g,
              w;
            for (
              l = l.replace(t[39], st(rn, u[46], c[42])),
                l = l.substring(r[43], l[a[70]] - n[28]),
                p = l.split(Gn(r[44])),
                g = r[18];
              g < p[i + d];
              g++
            )
              if (((h = p[g].split(r[45])), h && !(h[u[23]] < t[15]))) {
                for (w = parseInt(r[46], n[57]); w < h[e[42]]; w++)
                  h[u[22]] = h[u[22]] + Gn(c[43]) + h[w];
                (h[a[25]] = new n[33](v + s + D).test(h[c[26]])
                  ? h[t[25]].substring(c[33], h[t[25]][c[17]] - a[61])
                  : h[a[25]]),
                  (h[n[28]] = new r[47](j + V + f).test(h[t[40]])
                    ? h[e[23]].substring(r[43], h[t[40]][e[42]] - t[40])
                    : h[r[43]]),
                  (o[h[a[25]]] = h[u[22]]);
              }
            return o;
          };
        return new u[9](Gn(r[48])).test(o) && (l = d(l, o)), l;
      }
      function A(a) {
        for (
          var o = r[18], i = a[at(c[44], r[49], t[41])] - n[28];
          i >= c[26];
          i--
        )
          o = (o << e[23]) | +a[i];
        return o;
      }
      function C() {
        return (Math.random() * parseInt(Gn(c[45], e[43]), e[44])) >>> n[18];
      }
      function B(t) {
        var e = V;
        e = Tn;
        for (var o = n[58], i = c[26], s = u[19], v = t[o + l + W]; s < v; s++)
          (i = (i << r[50]) - i + t.charCodeAt(s)), (i >>>= a[25]);
        return i;
      }
      function R(n) {
        return new u[9](r[51]).test(n);
      }
      function k(o, i) {
        var c = new e[3](Gn(a[71]), n[59]),
          s = new n[33](t[42]);
        if (o) {
          var v = o.match(c);
          if (v) {
            var f = v[e[23]];
            return (
              i &&
                s.test(f) &&
                (f = f.split(u[47]).pop().split(at(n[40], r[52], n[60]))[
                  u[19]
                ]),
              f
            );
          }
        }
      }
      (o[u[48]] = E),
        (o[t[43]] = g),
        (o[r[53]] = w),
        (o[X + $ + F] = h),
        (o[c[46]] = B),
        (o[at(Hn, t[44], u[49])] = C),
        (o[d + H] = R),
        (o[c[47]] = U),
        (o[Gn(e[45])] = k),
        (o[r[54]] = m),
        (o[a[72]] = A),
        (o[n[61]] = I),
        (o[u[50]] = y);
      var T = !!a[30][r[55]];
      function U(n) {
        var a = new e[3](c[48]);
        if (R(n)) return n;
        var o = a.test(n) ? -r[56] : -c[30];
        return n.split(Zn(nt, c[49], c[50], t[45])).slice(o).join(t[46]);
      }
      o[p + Y] = _;
    })(ot || (ot = {}));
    var it;
    !(function (o) {
      var i = a[66],
        s = c[51],
        v = Gn(n[62]),
        f = st(c[52], a[73]),
        l = t[47],
        d = n[18],
        p = a[25],
        h = r[18],
        g = r[18],
        w = u[19],
        m = c[26],
        I = t[48],
        _ =
          r[57] in r[36].createElement(U + i + s)
            ? n[63]
            : e[46] in e[47]
            ? u[51]
            : a[74];
      // ot.eventBind(a[24], _, C),
      //   ot.eventBind(c[20], st(z, a[75], dn), b),
      //   ot.eventBind(u[52], K + v + z, b),
      //   ot.eventBind(c[20], n[64], B),
      //   ot.eventBind(e[47], c[53], y);
      // function y(n) {
      //   g++;
      // }
      function E() {
        var n = Fn;
        return (n = C), g;
      }
      function A() {
        return h;
      }
      function C(n) {
        p++;
      }
      // function b(n) {
      //   d++;
      // }
      // function B(n) {
      //   var r = gn,
      //     e = a[76];
      //   h++,
      //     (I = void 0 == n[t[49]] || n[e + G]),
      //     (r = o),
      //     (w = n[c[54]]),
      //     (m = n[a[77]]);
      // }
      function R() {
        return p;
      }
      function k() {
        return d;
      }
      function T() {
        return {
          x: w,
          y: m,
          trusted: I,
        };
      }
      (o[e[48]] = k),
        (o[r[58]] = R),
        (o[e[49]] = A),
        (o[Q + Z + J + q] = E),
        (o[f + nn + l + tn] = T);
    })(it || (it = {}));
    var ut;
    !(function (s) {
      var v = u[53],
        p = a[78],
        g = n[65],
        w = r[59],
        m = Zn(t[50], l, u[54]),
        I = u[55],
        _ = c[55],
        A = e[50],
        C = a[79];
      BROWSER_LIST = {
        _1: function () {
          return st(e[51], e[52]) in t[51];
        },
        _2: function () {
          var n = e[53];
          return rn + n + en in c[56];
        },
        _3: function () {
          return u[56] in u[21];
        },
        _4: function () {
          return (
            t[52] in r[60] &&
            !(a[80] in n[66].getElementsByTagName(r[61])[n[18]])
          );
        },
        _5: function () {
          return a[81] in r[60] && !(Zn(u[57], d, r[62]) in n[67]);
        },
        _6: function () {
          return Zn(Hn, an, n[68], e[54]) in t[51] && !i;
        },
        _7: function () {
          var t = a[82];
          return a[81] in n[67] && !a[30][an + on + t];
        },
        _8: function () {
          return u[58] in t[51] && !a[30][Gn(e[55])];
        },
        _9: function () {
          var t = f;
          t = it;
          var o = Zn(c[57], b, e[56], h),
            i = n[69];
          return o + un + cn in a[30] && r[60][i + sn];
        },
        _10: function () {
          var n = u[59];
          return vn + fn + n + ln === navigator[a[83]];
        },
        _11: function () {
          return n[70] === navigator[t[53]];
        },
        _12: function () {
          var t = D;
          return (t = Vn), at(B, e[57], n[71]) in e[58];
        },
        _13: function () {
          return v + p + dn in a[30];
        },
        _14: function () {
          var t, a, o;
          t = a = o = u;
          var i, s, v;
          i = s = v = n;
          var f, l, d;
          f = l = d = r;
          var p, h, g;
          p = h = g = e;
          var w, m, I;
          return (
            (w = m = I = c),
            new m[23](at(h[59], K, d[63], i[72]), a[60]).test(
              navigator.appVersion
            )
          );
        },
        _15: function () {
          return r[64] in navigator;
        },
        _16: function () {
          return new r[47](r[65], t[54]).test(navigator.vendor);
        },
        _17: function () {
          return e[60] in u[21];
        },
        _18: function () {
          var n = ot;
          return (n = q), c[58] in c[56] && new e[3](g + pn, Gn(t[55])).test(o);
        },
        _19: function () {
          return (
            hn + w in n[67] &&
            new r[47](Zn(e[61], r[66], n[73], c[59]), t[54]).test(o)
          );
        },
        _20: function () {
          return Gn(u[61]) in r[60] && new n[33](a[84]).test(o);
        },
        _21: function () {
          var n, e, i;
          n = e = i = r;
          var c, s, v;
          c = s = v = u;
          var f, l, d;
          f = l = d = a;
          var p, h, g;
          return (
            (p = h = g = t),
            h[56] + gn + m in l[30] && new s[9](e[67], i[68]).test(o)
          );
        },
        _22: function () {
          var r = n[74],
            a = c[60],
            i = e[62];
          return r + a in t[51] && new c[23](wn + i).test(o);
        },
        _23: function () {
          return u[62] in a[30] && new u[9](c[61]).test(o);
        },
        _24: function () {
          return Gn(c[62]) in n[67] && r[69] in u[21];
        },
        _25: function () {
          var n, r, a;
          n = r = a = t;
          var o, i, u;
          o = i = u = e;
          var c = wn;
          return (c = O), o[63] in r[51];
        },
      };
      function b() {
        return a[30][t[57]][Zn(r[70], r[71], e[64], c[63])];
      }
      function B() {
        return (
          a[7] ==
          (navigator[at(e[37], n[75], c[64], a[85])] ||
            navigator[at(a[86], V, e[65], e[66])])
        );
      }
      var R = navigator[c[65]];
      function k() {
        var n, t, r;
        return (n = t = r = a), r[87];
      }
      function T() {
        for (
          var e = a[39], o = a[88], i = navigator[r[72]], u = t[25];
          u < Z[I + e + o];
          u++
        )
          if (Z[u].test(i)) return u + t[40];
        return n[18];
      }
      function S() {
        var n = Nn;
        return (
          (n = F),
          (plugin_num = c[26]),
          navigator[mn + _] && (plugin_num = navigator[a[89]][t[58]]),
          plugin_num
        );
      }
      function x() {
        var n = u[63],
          r;
        try {
          r = e[47].createElement(Zn(t[59], y, t[60])).getContext(In + n + _n);
        } catch (a) {}
        return !!r;
      }
      function L(a) {
        for (var o = r[18]; o < R[at(C, c[66], e[67], r[73])]; o++) {
          var i = R[o][t[61]];
          if (a.test(i)) return !n[18];
        }
        return !u[22];
      }
      function M() {
        return e[68] in r[36];
      }
      function N() {
        return L(new r[47](a[90], n[59]));
      }
      function P() {
        var n = C;
        n = E;
        try {
          return a[91] in r[60];
        } catch (t) {
          return c[67];
        }
      }
      function D() {
        var r = Gn(c[68], c[69]),
          e = t[62];
        return yn + En + r + e === n[66][u[64]];
      }
      function j() {
        return L(new u[9](a[92]));
      }
      function W() {
        return e[27];
      }
      function X() {
        var n = navigator[at(t[63], t[64], a[93], e[69])];
        return n && n[u[23]] > r[18];
      }
      function $() {
        return -parseInt(u[65], t[65]) === new e[70]().getTimezoneOffset();
      }
      function F() {
        return new t[16](u[66], at(u[67], Jn, n[76])).test(
          navigator[r[74]] || navigator[Gn(n[77], n[78])]
        );
      }
      function Y() {
        for (var n in BROWSER_LIST)
          if (BROWSER_LIST.hasOwnProperty(n)) {
            var t = BROWSER_LIST[n];
            if (t()) return +n.substr(r[43]);
          }
        return c[26];
      }
      function U() {
        var n, t, e;
        n = t = e = a;
        var o, i, u;
        o = i = u = r;
        for (var c = [], s = i[18]; s < parseInt(t[94], t[11]); s++)
          c[s] = G[s]();
        return ot.booleanToDecimal(c);
      }
      function K(t) {
        if (!n[67][e[71]]) return !e[23];
        var r;
        try {
          r = new u[21][u[58]](t);
        } catch (a) {
          return !n[28];
        }
        return !!r;
      }
      function z() {
        return a[87];
      }
      var G = [J, Q, N, j, b, P, B, F, M, $, x, X, D, k, z, W];
      function Q() {
        return L(new r[47](e[72], n[59])) || K(t[66]);
      }
      var Z = [
        new n[33](st(t[67], t[68], ot)),
        new r[47](a[95]),
        new e[3](a[96]),
        new n[33](Gn(c[70], r[70])),
        new n[33](c[71]),
        new e[3](r[75]),
        new u[9](n[79]),
        new u[9](A + C),
        new n[33](Gn(e[73], H)),
        new e[3](r[76]),
        new r[47](u[68]),
      ];
      function J() {
        return navigator.javaEnabled();
      }
      (s[a[97]] = T),
        (s[r[77]] = Y),
        (s[e[74]] = S),
        (s[at(Mn, Wn, n[80], a[98])] = U);
    })(ut || (ut = {}));
    var ct;
    !(function (o) {
      var i = t[62],
        s = at(En, et, a[99]),
        v = u[19],
        f = c[33],
        l = e[44],
        d = r[56],
        p = parseInt(i + An + s, c[30]),
        g = a[100],
        m = parseInt(u[69], a[11]),
        I = e[75],
        _ = e[76],
        y = (h, R, e[77]),
        E = parseInt(Gn(n[81], cn), a[101]),
        A = parseInt(r[78], t[29]),
        C = parseInt(t[31], c[28]),
        b = parseInt(c[72], u[70]),
        B = parseInt(a[102], c[31]),
        k = t[69],
        T = parseInt(r[79], t[29]),
        O = parseInt(t[70], e[76]),
        S;
      function x() {
        var n = w,
          t = N();
        return (n = vn), t;
      }
      function L() {
        // var n = (tn, J, nt.getCookie($n) || tt.get(Hn));
        if (n && n[r[31]] == parseInt(c[73], r[41])) {
          var t = et.decode(n);
          if (t && (S.decodeBuffer(t), S[v] != r[18])) return;
        }
        S[v] = ot.random();
      }
      function M() {
        var n = c[33],
          t = parseInt(a[103], e[44]),
          o = a[104],
          i = r[80];
        (S = new rt([i, i, i, i, n, n, n, o, t, t, t, t, t, t, t, i, t, n])),
          (S[f] = ot.serverTimeNow()),
          L(),
          (S[k] = zn),
          (S[O] = Kn),
          (S[T] = e[22]),
          (S[d] = ot.strhash(navigator.userAgent)),
          (S[b] = ut.getBrowserFeature()),
          (S[p] = ut.getPlatform()),
          (S[g] = ut.getBrowserIndex()),
          (S[m] = ut.getPluginNum());
      }
      o[a[105]] = M;
      function N() {
        S[T]++,
          (S[f] = ot.serverTimeNow()),
          (S[l] = ot.timeNow()),
          (S[k] = zn),
          (S[I] = it.getMouseMove()),
          (S[_] = it.getMouseClick()),
          (S[y] = it.getMouseWhell()),
          (S[E] = it.getKeyDown()),
          (S[A] = it.getClickPos().x),
          (S[C] = it.getClickPos().y);
        var n = S.toBuffer();
        return et.encode(n);
      }
      o[r[81]] = x;
    })(ct || (ct = {}));
    function st() {
      var t = arguments[c[33]];
      if (!t) return r[21];
      for (var e = n[19], o = a[21], i = r[18]; i < t.length; i++) {
        var u = t.charCodeAt(i),
          s = u ^ o;
        (o = u), (e += r[82].fromCharCode(s));
      }
      return e;
    }
    var vt;
    !(function (o) {
      var i = r[83],
        s = t[71],
        v = t[72],
        f = e[78],
        l = u[71],
        p = r[84],
        m = Zn(tn, d, n[82]),
        I = a[106],
        _ = t[73],
        y = st(u[72], r[85], r[86]),
        A = c[74],
        b = c[75],
        k = r[87],
        T = u[73],
        x = !!r[60][i + s + v + Cn],
        L,
        M,
        N,
        P,
        D,
        j;
      function V(o) {
        var i = n[83],
          s = t[74],
          v = r[88],
          d = r[89],
          h;
        K(o, u[74], function (n) {
          var r, a, o;
          r = a = o = e;
          var s, v, f;
          s = v = f = c;
          var l, d, p;
          l = d = p = u;
          var g, w, m;
          return (
            (g = w = m = t),
            function () {
              var t, r, e;
              t = r = e = o;
              var a, u, c;
              a = u = c = v;
              var s, f, d;
              s = f = d = l;
              var p, g, w;
              p = g = w = m;
              var I = at(B, rt, p[75]);
              try {
                G(arguments[s[22]]) && !nn(arguments[p[40]])
                  ? (arguments[u[33]] = rn(arguments[c[33]]))
                  : (h = z()),
                  n.apply(this, arguments),
                  G(arguments[r[23]]) ||
                    (nt[s[17]] || (h = ct.update()),
                    this.setRequestHeader(Hn, h));
              } catch (_) {
                return I + i;
              }
            }
          );
        }),
          K(o, bn + s + v + f, function (t) {
            var o = i;
            return (
              (o = rn),
              function () {
                try {
                  if (parseInt(this.status) === parseInt(d + l + p, e[44])) {
                    for (
                      var o = t.apply(this, arguments),
                        i = new e[3](at(On, r[90], e[79], n[84]), n[85]),
                        u,
                        c,
                        s = {};
                      (u = i.exec(o));

                    )
                      s[u[r[43]].toLowerCase()] = u[a[11]];
                    ot.analysisRst(ot.parse(s[Un.toLowerCase()]));
                  }
                } catch (v) {
                  return e[80];
                }
                return t.apply(this, arguments);
              }
            );
          });
      }
      function W(n) {
        var r = ot.getHostFromUrl(n, t[48]);
        return r ? j.test(r) : a[27];
      }
      window.getHeXinToken = getHexinToken = function H() {
        var o = S,
          i = a[112];
        (L = location[Gn(n[53])].split(u[79])[a[25]]),
          (M = location[Zn(r[95], n[88], e[85], X)]),
          (P = location[n[89]]),
          (o = k),
          (D = location[Zn(a[113], u[80], r[96], t[81])]),
          (N = ot.getRootDomain(M)),
          (j = new n[33](
            n[90] + N.replace(new u[9](i + y, n[91]), c[81]) + c[82],
            n[59]
          ));
        return z();
      };
      // keep
      function z() {
        var n = Gn(r[98], o),
          t = ct.update();
        return t;
      }
      function G(n) {
        var o = ot.getOriginFromUrl(n);
        return o
          ? !new r[47](Gn(t[82]) + P).test(o[a[11]]) ||
              !new c[23](D).test(o[e[23]])
          : e[27];
      }
      function nn(n) {
        var t = at(Sn, r[103], r[104]),
          a = e[88];
        return W(n) && nt[t + Pn + a];
      }
      function rn(n) {
        for (var o = ct.update(), i = Jn, c = u[19]; c < i[a[70]]; c++)
          if (i[c].test(n)) return n;
        return (
          n +
          (new r[47](e[89]).test(n) ? r[105] : Gn(t[84], a[120])) +
          Fn +
          a[121] +
          e[90](o)
        );
      }
      o[e[91]] = H;
    })(vt || (vt = {}));
    var ft;
    !(function (r) {
      // var o, i, s;
      // o = i = s = t;
      // var v, f, l;
      // v = f = l = e;
      // var d, p, h;
      // d = p = h = c;
      // var g, w, m;
      // g = w = m = a;
      // var I, _, y;
      // I = _ = y = u;
      // var E, A, C;
      // E = A = C = n;
      // var b = C[96],
      //   B = I[86],
      //   R = E[97],
      //   k = m[122];
      ct.Init();
      // keep
      // function T() {
      //   /*nt.Init(),  tt.Init(), */ ct.Init()/* , vt.Init(), S() */;
      // }
      // function O() {
      //   try {
      //     T();
      //   } catch (n) {
      //     return n;
      //   }
      // }
      /* function S() {
        var n = (J, gn, parseInt(Zn(E[98], d[89], h[90]), h[28]));
        setInterval(function () {
          ot.getServerTime();
        }, n);
      } */
      // I[21][b + Dn + B + R] || (O(), (v[58][k + jn + Vn + Wn] = s[48]));
    })(ft || (ft = {}));
  })();
})(
  [
    '.',
    ';',
    Array,
    'L_',
    'bo',
    'oByt',
    'get',
    'Key',
    'os',
    'uV&',
    '!O',
    'ro',
    '2345Ex',
    'we',
    '\u2552\u0973\u095f\u09e3',
    'e',
    '=:',
    'f',
    0,
    '',
    'thsi.cn',
    'all',
    86,
    'l_#\x19\x18\x07g\x15rV8\x15\t\x0ea',
    !0,
    !1,
    "'Vd$;",
    'getCookie',
    1,
    '=',
    'length',
    '; domain=',
    '=htap ;',
    RegExp,
    '___',
    'body',
    'documentElement',
    'F[)',
    'reffuBot',
    '.c\x1e',
    8,
    'decodeBuffer',
    'e64',
    'ode',
    '2',
    '7',
    '\\S[',
    16,
    'scr',
    'ng',
    'l?+',
    '124f80',
    'readyState',
    '\u255f\u096f\u095f\u09f7',
    '1002',
    '1750',
    'on',
    2,
    'le',
    'i',
    '\x02',
    'timeNow',
    '\u2554\u0975\u0957',
    'wheel',
    'click',
    'BIDUBr',
    document,
    window,
    'tcejbOXevitcA',
    'Weak',
    'Apple Computer, Inc.',
    'yT"\\NR\x0ezZ]3VL',
    '&o&6d',
    'RESWORBBL',
    'chr',
    53,
    'Q',
    '\u2544\u0964\u0949\u09e5\u09b5\u0930\u09a2\u09d0\u099a\u09da\u09b7\u09d0\u09df\u09d8',
    'Ldz]',
    '^MacIntel',
    '_R"wJX!F]E\x10PYC#G]',
    '\u2506\u092d',
    's',
    'or',
    'ej',
    'gm',
    'hY*%_',
    '^https?\\:',
    33,
    'host',
    '\\.?',
    'g',
    'analys',
    'isRst',
    'headers',
    'prototype',
    'CHAM',
    'ADED',
    51,
  ],
  [
    '5',
    Object,
    'cot',
    '"^',
    '@s',
    'O7N',
    'getAll',
    'pbE(\x1b',
    Boolean,
    'h',
    'ELEO',
    '&]^',
    71,
    '',
    String,
    2,
    RegExp,
    document,
    '=',
    ' P',
    '$&',
    '<script>document.w=window</script><iframe src="/favicon.icon"></iframe>',
    'frames',
    79,
    'Init',
    0,
    ',x',
    82,
    '7',
    10,
    '\t\x01',
    '12',
    'W[',
    7,
    'onerror',
    85,
    'ti',
    Date,
    '\u255b\u0978\u0954',
    / /g,
    1,
    'TR8RL_',
    '[@:]',
    'getServerTime',
    'y7',
    '\x17[\x16->',
    '.',
    'ckP',
    !0,
    'isTrusted',
    'R\x1d',
    window,
    'ActiveXObject',
    'vendor',
    'i',
    '\u255e',
    'ch',
    'navigator',
    'length',
    50,
    'savnac',
    'name',
    '1',
    'H\x1e/',
    '\x1e ',
    16,
    'ShockwaveFlash.ShockwaveFlash',
    95,
    '\u2569\u253e\u2557\u2539\u250a\u2538',
    15,
    '21',
    'vent',
    'List',
    'et',
    'Respon',
    ']E$',
    !1,
    '^_self$',
    'KE5pTR;PVC',
    'A',
    '\u2576\u097e\u094e\u09f8\u09a6\u0938\u09b6\u09fe\u0996\u09d7\u09a7\u09d2\u09cc',
    26,
    '\u2569',
    'jsonp_ignore',
    '\u2508',
  ],
  [
    '\u2556\u253f',
    'ume',
    29,
    'lo',
    '"$',
    '*`or',
    'strT',
    Date,
    'sted',
    'vent',
    'D:jt',
    'ect',
    '_[3',
    'owser',
    'chr',
    'plug',
    'iso',
    'get',
    0,
    'bt39M',
    '\u255f\u253a\u255b\u253f',
    '',
    '; expires=',
    28,
    '[!"#$%&\'()*+,/\\\\:;<=>?@[\\]^`{|}~]',
    'htmlfile',
    8,
    '1100',
    10,
    2,
    'tV',
    'length',
    'encode',
    92,
    '11111010000',
    'readyState',
    document,
    'ire',
    'url',
    'object',
    'href',
    16,
    'gth',
    1,
    '\u251b',
    ':',
    '10',
    RegExp,
    '\u2569\u0966\u0914\u09bb\u09ad\u0979',
    'i$G$',
    5,
    '^(\\d+\\.)+\\d+$',
    'kal',
    'analysisRst',
    'getOriginFromUrl',
    'addEventListener',
    3,
    'onwheel',
    'getMouseWhell',
    'ome',
    window,
    'head',
    'egasseMtsop',
    'HN"]WY',
    'sgAppName',
    'Maxthon',
    71,
    'UBrowser',
    'i',
    'MSGesture',
    30,
    'J\x1a0',
    'platform',
    '\x16~4x',
    'language',
    '^iPad',
    '^iPod',
    'getBrowserIndex',
    '11',
    '16',
    4,
    'update',
    String,
    'addE',
    '011',
    '\u2519',
    'Z|A',
    ' 00:00:0',
    'seHead',
    '110',
    27,
    'Cl',
    'target',
    'parentNode',
    'unload',
    '&;',
    'locotorp',
    '\u2544\u2536\u2555',
    '\u2507\u093d\u097d\u09dc\u0984',
    '\u2556\u0971\u0956\u09fe\u09a7',
    'headers',
    81,
    'PR7Q]E%',
    77,
    'Y[',
    '&',
  ],
  [
    'er-Message',
    Boolean,
    'e_f',
    RegExp,
    'Enc',
    'on',
    Array,
    'th',
    'Uint',
    '\x1e~)',
    'Goo',
    'c.',
    'me',
    'l2',
    '-88',
    '0',
    'e',
    '_r',
    'hexin-v',
    'so.thsi.cn',
    20,
    'cookie',
    0,
    1,
    'setCookie',
    'localStorage',
    'head',
    !1,
    'le',
    'prototype',
    'f',
    '\u2506\u092c\u090b\u09a0\u09e1\u096c\u09df\u0980',
    '10010',
    '',
    '#\x1aA}t',
    'readyState',
    'onload',
    96,
    null,
    'status_code',
    10,
    'undefined',
    'length',
    'Ogd[',
    2,
    '\u2550\u0978\u094e\u09d9\u09bf\u092e\u099a\u09f7\u0986\u09d2\u09af\u09e4\u09ca\u09d1',
    'onmousewheel',
    document,
    'getMouseMove',
    'getMouseClick',
    '^Linux ',
    "8*'",
    '\u2554\u2535\u2559\u2535\u2565\u250d\u256c\u2502\u2576\u2519\u2574',
    'tingsE',
    '\x16Gb',
    '\u2560\u0978\u095b\u09fa\u099d\u093c\u099e',
    'vitcA',
    'MY5',
    window,
    'k:',
    'opr',
    'W(Nv',
    'plorer',
    'aef',
    'revirdbew',
    '\\X\x18ZLc$T[\\',
    'xK}',
    'TR8RL_',
    'ontouchstart',
    'dy',
    Date,
    'ActiveXObject',
    'Shockwave',
    '\u2569\u095c\u0968\u09dc',
    'getPluginNum',
    7,
    8,
    9,
    'ers',
    'f\x1fx\x1f\x07\x1eln\x18k"h\x12\x1f\rkdE\n[e\x1d\x7fiJ\br',
    'error',
    'LV',
    !0,
    'click',
    'tagName',
    'emantsoh',
    'insertBefore',
    '\\y$g"',
    'w',
    '\\?',
    encodeURIComponent,
    'Init',
  ],
  [
    'X-Antispid',
    'du',
    ' ',
    String,
    '___',
    'duc',
    'ile',
    '1',
    'Ez@"',
    '"rQ@X',
    '\u2554\u2520\u257f',
    2,
    '\u2552\u2521',
    47,
    'tou',
    '\u2559',
    'Cli',
    'MozSet',
    'eXObj',
    'b',
    'ELEO',
    9527,
    256,
    RegExp,
    document,
    0,
    ';',
    !0,
    33,
    'delCookie',
    window,
    74,
    '\\X5@UR8A',
    '\u2550',
    'addBehavior',
    '&d?\x1ep',
    'set',
    '#default#userData',
    'del',
    'ng',
    'ZV%',
    'ds',
    'base_fileds',
    71,
    8,
    '25',
    78,
    'bas',
    6,
    '20',
    '_-9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA',
    '3f',
    16,
    '',
    'V587',
    2333,
    'event',
    'pro',
    '\x1c0i]',
    'src',
    '//s.thsi.cn/js/chameleon/time.1',
    1,
    'WY:ZYS',
    'onreadystatechange',
    '1111101001',
    'location',
    'i',
    '3',
    Date,
    '\x16\x1d',
    'length',
    '\u2569\u0941\u0949\u09bb\u09f8\u0962\u09d4\u09d9\u0980\u09c9\u09b2\u09c2\u0987\u0987\u099f\u0a2e\u0a40\u09f2\u09b1\u0963\u090c\u09e0\u09d6\u09aa\u099a\u0921\u097d\u092d\u0a37\u09a1\u09e5\u090d\u09b0\u09c0\u0971\u0a38',
    'booleanToDecimal',
    '\u2550\u2535\u2541',
    'DOMMouseScroll',
    '\u255a\u2535\u2540\u2533\u2556\u253b\u2554\u2522\u2547',
    'isTru',
    'clientY',
    'ro',
    '[ix]\\d+',
    'maxHeight',
    'ActiveXObject',
    'ay',
    'vendor',
    'QQBrowser',
    '0`L',
    12,
    !1,
    'th',
    'plugins',
    'PDF|Acrobat',
    'localStorage',
    'Native Client',
    'TV8RMV1PK',
    '10000',
    '^Win64',
    '^Linux armv|Android',
    'getPlatform',
    36,
    '\b',
    5,
    10,
    '16',
    '10',
    3,
    'Init',
    'h',
    35,
    'tar',
    'Gg',
    44,
    84,
    '\\',
    ')`7\x1e',
    '11',
    '\u2564\u2527\u2575\u253c\u256c\u2538',
    '\u2544\u2536\u2555',
    'appendChild',
    '_str',
    'C[Q\x1f',
    98,
    '=',
    'CHAM',
  ],
  [
    '.b',
    73,
    Array,
    '2',
    '0',
    '3',
    'red',
    Error,
    '\u2576\u2512\u2576\u2504',
    RegExp,
    'Bind',
    'Dow',
    '\u250f\u095c\u0948\u09e3',
    '\u2544',
    'aw',
    'v',
    'head',
    'allow',
    '\u2507\u093d\u090a\u09a1\u09ea\u096d\u09de\u098b\u09c4\u098d\u09e2\u09f6\u09f5\u09e9',
    0,
    '\\^ ',
    window,
    1,
    'length',
    '\u2505\u2530\u2505',
    49,
    'base_fileds',
    '\u2504\u092a',
    8,
    'error',
    '\u2506\u092d\u090a\u09a1\u09e0\u096d\u09df\u0980',
    5,
    '10',
    'base64Decode',
    '\x16C',
    'edoced',
    'dy',
    '^"',
    'isIP',
    16,
    '.js',
    'loaded',
    13,
    'WY$PYS/FLV"P[_7[_R',
    '^\\s*(?:(https?:))?\\/{2,}([^\\/\\?\\#\\\\]+)',
    '8',
    '',
    '@',
    'parse',
    'JV8QWZ',
    'serverTimeNow',
    'mousewheel',
    document,
    'ch',
    'em',
    'le',
    'safari',
    'U`N',
    'ActiveXObject',
    ' In',
    'i',
    '\u2554\u0975\u0948\u09fe\u09bd\u0938',
    'chrome',
    'bg',
    'defaultCharset',
    '1e0',
    'zh-cn',
    '}Y6n',
    '^BlackBerry',
    '110',
    10,
    '010',
    'V\x17^',
    'th',
    'open',
    'a',
    'rg',
    'submit',
    'XMLHTTP',
    '#',
    36,
    2,
    'M]J',
    '/s',
    'ng',
    'Window',
    'N_LO',
  ],
  [
    'tpi',
    '=sB4',
    '.*',
    'd',
    'ove',
    'r',
    Boolean,
    'vh\x1az',
    'ADED',
    !0,
    'CHAMELEON_CALLBACK',
    3,
    2333,
    's.thsi.cn',
    'ow',
    'checkcookie',
    'Init',
    'length',
    '=',
    'Nq',
    document,
    'cookie',
    'nt',
    RegExp,
    '^d',
    'documentElement',
    0,
    48,
    10,
    '8ixl',
    2,
    8,
    5,
    1,
    '"$',
    Date,
    'complete',
    'interactive',
    'ca',
    '\u2506\u092c\u090b\u09a0\u09e1\u096d\u09df\u0981\u09c4\u098d',
    'redirect_url',
    '\u2552',
    49,
    '\u250d',
    'W\x15G\x168',
    '\u2506\u092c\u090b\u09a0\u09e1\u096c\u09df\u0980\u09c5\u098c\u09f3\u0980\u0989\u098c\u0987\u0a20\u0a2d\u09ec\u09fb\u0960\u0911\u09ac\u09cf\u09c0\u09f5\u094c\u0963\u0940\u0a39\u09cc\u09f7\u0960',
    'strhash',
    'getRootDomain',
    '\\.com\\.cn$|\\.com\\.hk$',
    45,
    '.',
    'v',
    44,
    'keydown',
    'clientX',
    'ins',
    window,
    'u!',
    'chrome',
    '\x1f=',
    'ome',
    'TheWorld',
    '\u2554\u0975\u0948\u09fe\u09bd\u0938',
    30,
    'UD\x12ZvX"aJV5^',
    'plugins',
    ':0A8h',
    !1,
    '\u2502\u0924\u0917',
    93,
    '\u2569\u095c\u0954\u09f5\u09a2\u0932\u0987\u09d5',
    '^iPhone',
    '13',
    '3c',
    'Fri, 01 ',
    'Feb 2050',
    'a',
    'i',
    '#',
    20,
    'error',
    '\\.',
    '$',
    'apply',
    69,
    '/',
    '\u256f\u2522\u256e\u2526\u2552\u2526\u2556\u2504\u2561\u2510\u2565\u2500\u2573\u2507',
    'fetch',
    'headers',
    71,
    '0000021',
  ]
);

export { getHexinToken };
