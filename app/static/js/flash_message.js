
! function(e) {
  "use strict";

  function t(e) {
    return u.text(e).html()
  }

  function n(t) {
    var n = f.typesDefault[t.type];
    n && e.extend(t, e.extend({}, n, t)), d.forEach(function(e) {
      var n = t[e];
      t[e] = void 0 === n ? f["default"][e] : n
    }), f.convert && f.convert(t)
  }

  function o(o, a) {
    a = a || {}, n(a), a.html || (o = t(o));
    var s = e(f.message.replace("{message}", o).replace("{type}", a.type)).appendTo(i),
      c = function() {
        s.remove()
      };
    if (a.sticky || s.delay(a.time).fadeOut(a.fadeOut, c), a.closable ? s.find(f.closeHandler).addBack(f.closeHandler).bind("click", c) : s.addClass("nonclosable"), a.scrollTo) {
      var d = s[0].getBoundingClientRect();
      (d.top < 0 || d.top > l) && s[0].scrollIntoView()
    }
  }

  function a() {
    l = window.innerHeight || document.documentElement.clientHeight, c = window.innerWidth || document.documentElement.clientWidth
  }

  function s() {
    i || (i = e(f.container)), e(f.appendTo).append(i), f.window && (window.flash = f.window.flash)
  }
  var i, l, c, d = ["type", "time", "sticky", "fadeOut", "closable", "scrollTo", "html"],
    r = ["error", "danger", "info", "notice", "success", "warning", "alert"],
    f = {
      appendTo: "body",
      container: '<div class="flash-messages"></div>',
      message: '<div class="flash-message {type}">{message}<span class="flash-message-close"> X </span></div>', //&#10006
      closeHandler: ".flash-message-close",
      "default": {
        type: "success",
        time: 3e3,
        sticky: !1,
        fadeOut: 1e3,
        closable: !0,
        scrollTo: !0,
        html: !1
      },
      typesDefault: {
        error: {
          sticky: !1
        },
        danger: {
          sticky: !0
        }
      }
    },
    u = e("<div/>"),
    p = function() {
      f.method.apply(this, arguments)
    };
  p.setting = f, p.formatOptions = n, f.method = p.defaultMethod = o, window.flash = p, r.forEach(function(e) {
    p[e] = function(t, n) {
      n = n || {}, n.type = e, p(t, n)
    }
  }), e(window).resize(a), e(document).ready(a).ready(s).bind("page:load turbolinks:load", s)
}(jQuery);
